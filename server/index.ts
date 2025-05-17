import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import { ScrapedProduct } from '../src/types/Product';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const CACHE_TTL = 5 * 60; // 5 minutes cache
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});

app.use(limiter);

// Initialize cache
const cache = new NodeCache({ stdTTL: CACHE_TTL });

interface ScrapeConfig {
    url: string;
    selectors: {
        productContainer: string;
        name: string;
        price: string;
        originalPrice?: string;
        image: string;
        weight: string;
        outOfStock?: string;
        deliveryTime?: string;
    };
}

const platforms: { [key: string]: ScrapeConfig } = {
    'Zepto': {
        url: 'https://www.zeptonow.com/search?q=',
        selectors: {
            productContainer: '.product-card',
            name: '.product-title',
            price: '.discounted-price',
            originalPrice: '.original-price',
            image: '.product-image img',
            weight: '.product-weight',
            outOfStock: '.out-of-stock',
            deliveryTime: '.delivery-time'
        }
    },
    'Blinkit': {
        url: 'https://blinkit.com/search/',
        selectors: {
            productContainer: '.product-item',
            name: '.product-name',
            price: '.actual-price',
            originalPrice: '.strike-price',
            image: '.product-image img',
            weight: '.weight',
            outOfStock: '.sold-out',
            deliveryTime: '.delivery-info'
        }
    },
    'SwiggyMart': {
        url: 'https://www.swiggy.com/search?query=',
        selectors: {
            productContainer: '.product-card',
            name: '.item-name',
            price: '.item-price',
            originalPrice: '.strike-through',
            image: '.item-image img',
            weight: '.item-weight',
            outOfStock: '.not-available',
            deliveryTime: '.eta'
        }
    }
};

// Add validation schema
interface ProductValidation {
    name: { minLength: number; maxLength: number; };
    price: { min: number; max: number; };
    weight: { pattern: RegExp; };
}

const validation: ProductValidation = {
    name: { minLength: 3, maxLength: 200 },
    price: { min: 0, max: 100000 },
    weight: { pattern: /^\d+(\.\d+)?\s*(g|kg|ml|l)$/i }
};

async function scrapeProducts(query: string, platform: string, config: ScrapeConfig): Promise<ScrapedProduct[]> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Navigate to search page
        await page.goto(`${config.url}${encodeURIComponent(query)}`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for products to load
        await page.waitForSelector(config.selectors.productContainer, { timeout: 5000 });

        // Extract product information
        const products = await page.evaluate((selectors, platformName) => {
            const items = document.querySelectorAll(selectors.productContainer);
            return Array.from(items).map(item => {
                const name = item.querySelector(selectors.name)?.textContent?.trim() || '';
                const priceText = item.querySelector(selectors.price)?.textContent?.trim() || '0';
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                const originalPriceText = item.querySelector(selectors.originalPrice)?.textContent?.trim();
                const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace(/[^0-9.]/g, '')) : undefined;
                const image = item.querySelector(selectors.image)?.getAttribute('src') || '';
                const weight = item.querySelector(selectors.weight)?.textContent?.trim() || '';
                const isOutOfStock = !!item.querySelector(selectors.outOfStock);
                const deliveryTime = item.querySelector(selectors.deliveryTime)?.textContent?.trim();
                const productUrl = item.querySelector('a')?.href || '';

                return {
                    name,
                    price,
                    originalPrice,
                    image,
                    weight,
                    inStock: !isOutOfStock,
                    platform: platformName,
                    deliveryTime,
                    productUrl
                };
            });
        }, config.selectors, platform);

        return products.filter(p => p.name && p.price > 0);
    } catch (error) {
        console.error(`Error scraping ${platform}:`, error);
        return [];
    } finally {
        await browser.close();
    }
}

function validateProduct(product: ScrapedProduct): boolean {
    if (!product.name ||
        product.name.length < validation.name.minLength ||
        product.name.length > validation.name.maxLength) {
        return false;
    }

    if (product.price < validation.price.min ||
        product.price > validation.price.max) {
        return false;
    }

    if (!validation.weight.pattern.test(product.weight)) {
        return false;
    }

    return true;
}

function sanitizeProduct(product: ScrapedProduct): ScrapedProduct {
    return {
        ...product,
        name: product.name.trim().replace(/[<>]/g, ''),
        price: Math.round(product.price * 100) / 100,
        weight: product.weight.trim().toLowerCase(),
        image: product.image.trim(),
        platform: product.platform.trim(),
        deliveryTime: product.deliveryTime?.trim(),
        productUrl: product.productUrl.trim()
    };
}

async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeWithRetry(query: string, platform: string, config: ScrapeConfig): Promise<ScrapedProduct[]> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const products = await scrapeProducts(query, platform, config);
            return products;
        } catch (error) {
            lastError = error as Error;
            console.error(`Attempt ${attempt} failed for ${platform}:`, error);
            if (attempt < MAX_RETRIES) {
                await delay(RETRY_DELAY * attempt); // Exponential backoff
            }
        }
    }

    console.error(`All retry attempts failed for ${platform}:`, lastError);
    return [];
}

app.get('/search', async (req, res) => {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Invalid query parameter' });
    }

    // Check cache first
    const cacheKey = `search:${query.toLowerCase()}`;
    const cachedResults = cache.get<ScrapedProduct[]>(cacheKey);

    if (cachedResults) {
        console.log('Returning cached results for:', query);
        return res.json(cachedResults);
    }

    try {
        // Scrape from all platforms concurrently with retry mechanism
        const scrapePromises = Object.entries(platforms).map(([platform, config]) =>
            scrapeWithRetry(query, platform, config)
        );

        const results = await Promise.all(scrapePromises);
        const allProducts = results
            .flat()
            .map(sanitizeProduct)
            .filter(validateProduct);

        // Cache the results
        cache.set(cacheKey, allProducts);

        res.json(allProducts);
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ error: 'Failed to search products' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 