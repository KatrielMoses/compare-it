import puppeteer from 'puppeteer';
import { Product, ScrapingResult } from '../types';

export class ScrapingService {
    private async initBrowser() {
        return await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    async scrapeZepto(searchTerm: string): Promise<Product[]> {
        const browser = await this.initBrowser();
        try {
            const page = await browser.newPage();
            await page.goto(`https://www.zeptonow.com/search?q=${encodeURIComponent(searchTerm)}`);
            await page.waitForSelector('.product-card', { timeout: 5000 }).catch(() => null);

            const products = await page.evaluate(() => {
                const items = document.querySelectorAll('.product-card');
                return Array.from(items, item => {
                    const name = item.querySelector('.product-title')?.textContent || '';
                    const priceText = item.querySelector('.product-price')?.textContent || '0';
                    const price = parseFloat(priceText.replace('₹', '').trim());
                    const image = item.querySelector('img')?.src || '';
                    const link = item.querySelector('a')?.href || '';

                    return {
                        id: `zepto-${Math.random().toString(36).substr(2, 9)}`,
                        name,
                        price,
                        image,
                        link,
                        source: 'zepto' as const
                    };
                });
            });

            return products;
        } catch (error) {
            console.error('Error scraping Zepto:', error);
            return [];
        } finally {
            await browser.close();
        }
    }

    async scrapeSwiggyMart(searchTerm: string): Promise<Product[]> {
        const browser = await this.initBrowser();
        try {
            const page = await browser.newPage();
            await page.goto(`https://www.swiggy.com/instamart-search?query=${encodeURIComponent(searchTerm)}`);
            await page.waitForSelector('[data-testid="product-card"]', { timeout: 5000 }).catch(() => null);

            const products = await page.evaluate(() => {
                const items = document.querySelectorAll('[data-testid="product-card"]');
                return Array.from(items, item => {
                    const name = item.querySelector('.product-name')?.textContent || '';
                    const priceText = item.querySelector('.price')?.textContent || '0';
                    const price = parseFloat(priceText.replace('₹', '').trim());
                    const image = item.querySelector('img')?.src || '';
                    const link = item.closest('a')?.href || '';

                    return {
                        id: `swiggymart-${Math.random().toString(36).substr(2, 9)}`,
                        name,
                        price,
                        image,
                        link,
                        source: 'swiggymart' as const
                    };
                });
            });

            return products;
        } catch (error) {
            console.error('Error scraping SwiggyMart:', error);
            return [];
        } finally {
            await browser.close();
        }
    }

    async scrapeBlinkit(searchTerm: string): Promise<Product[]> {
        const browser = await this.initBrowser();
        try {
            const page = await browser.newPage();
            await page.goto(`https://blinkit.com/search?q=${encodeURIComponent(searchTerm)}`);
            await page.waitForSelector('.product', { timeout: 5000 }).catch(() => null);

            const products = await page.evaluate(() => {
                const items = document.querySelectorAll('.product');
                return Array.from(items, item => {
                    const name = item.querySelector('.product-name')?.textContent || '';
                    const priceText = item.querySelector('.price')?.textContent || '0';
                    const price = parseFloat(priceText.replace('₹', '').trim());
                    const image = item.querySelector('img')?.src || '';
                    const link = item.querySelector('a')?.href || '';

                    return {
                        id: `blinkit-${Math.random().toString(36).substr(2, 9)}`,
                        name,
                        price,
                        image,
                        link,
                        source: 'blinkit' as const
                    };
                });
            });

            return products;
        } catch (error) {
            console.error('Error scraping Blinkit:', error);
            return [];
        } finally {
            await browser.close();
        }
    }

    async scrapeAll(searchTerm: string, sources: ('zepto' | 'blinkit' | 'swiggymart')[] = ['zepto', 'blinkit', 'swiggymart']): Promise<ScrapingResult> {
        try {
            const scrapingPromises = sources.map(source => {
                switch (source) {
                    case 'zepto':
                        return this.scrapeZepto(searchTerm);
                    case 'blinkit':
                        return this.scrapeBlinkit(searchTerm);
                    case 'swiggymart':
                        return this.scrapeSwiggyMart(searchTerm);
                    default:
                        return Promise.resolve([]);
                }
            });

            const results = await Promise.all(scrapingPromises);
            const products = results.flat();

            return {
                success: true,
                products
            };
        } catch (error) {
            console.error('Error in scrapeAll:', error);
            return {
                success: false,
                products: [],
                error: 'Failed to scrape products'
            };
        }
    }
} 