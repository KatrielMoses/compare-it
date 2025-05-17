/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import express, { Request, Response } from "express";
import cors from "cors";
import * as puppeteer from "puppeteer";
import { ScrapedProduct } from "./types/Product";

const app = express();
app.use(cors());
app.use(express.json());

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
    "Zepto": {
        url: "https://www.zeptonow.com/search?q=",
        selectors: {
            productContainer: ".product-card",
            name: ".product-title",
            price: ".discounted-price",
            originalPrice: ".original-price",
            image: ".product-image img",
            weight: ".product-weight",
            outOfStock: ".out-of-stock",
            deliveryTime: ".delivery-time",
        },
    },
    "Blinkit": {
        url: "https://blinkit.com/search/",
        selectors: {
            productContainer: ".product-item",
            name: ".product-name",
            price: ".actual-price",
            originalPrice: ".strike-price",
            image: ".product-image img",
            weight: ".weight",
            outOfStock: ".sold-out",
            deliveryTime: ".delivery-info",
        },
    },
    "SwiggyMart": {
        url: "https://www.swiggy.com/search?query=",
        selectors: {
            productContainer: ".product-card",
            name: ".item-name",
            price: ".item-price",
            originalPrice: ".strike-through",
            image: ".item-image img",
            weight: ".item-weight",
            outOfStock: ".not-available",
            deliveryTime: ".eta",
        },
    },
};

async function scrapeProducts(query: string, platform: string, config: ScrapeConfig): Promise<ScrapedProduct[]> {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
        ],
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        );

        const url = `${config.url}${encodeURIComponent(query)}`;
        await page.goto(url, {
            waitUntil: "networkidle0",
            timeout: 30000,
        });

        await page.waitForSelector(config.selectors.productContainer, { timeout: 5000 });

        const products = await page.evaluate((selectors: ScrapeConfig["selectors"], platformName: string) => {
            const items = document.querySelectorAll(selectors.productContainer);
            return Array.from(items).map((item) => {
                const nameElement = item.querySelector(selectors.name);
                const name = nameElement?.textContent?.trim() || "";

                const priceElement = item.querySelector(selectors.price);
                const priceText = priceElement?.textContent?.trim() || "0";
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

                const originalPriceElement = selectors.originalPrice ? item.querySelector(selectors.originalPrice) : null;
                const originalPriceText = originalPriceElement?.textContent?.trim();
                const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace(/[^0-9.]/g, "")) : undefined;

                const imageElement = item.querySelector(selectors.image);
                const image = imageElement?.getAttribute("src") || "";

                const weightElement = item.querySelector(selectors.weight);
                const weight = weightElement?.textContent?.trim() || "";

                const isOutOfStock = selectors.outOfStock ? !!item.querySelector(selectors.outOfStock) : false;

                const deliveryTimeElement = selectors.deliveryTime ? item.querySelector(selectors.deliveryTime) : null;
                const deliveryTime = deliveryTimeElement?.textContent?.trim();

                const linkElement = item.querySelector("a");
                const productUrl = linkElement?.href || "";

                return {
                    name,
                    price,
                    originalPrice,
                    image,
                    weight,
                    inStock: !isOutOfStock,
                    platform: platformName,
                    deliveryTime,
                    productUrl,
                };
            });
        }, config.selectors, platform);

        return products.filter((p) => p.name && p.price > 0);
    } catch (error) {
        console.error(`Error scraping ${platform}:`, error);
        return [];
    } finally {
        await browser.close();
    }
}

const searchHandler = async (req: Request, res: Response): Promise<void> => {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
        res.status(400).json({ error: "Invalid query parameter" });
        return;
    }

    try {
        const scrapePromises = Object.entries(platforms).map(([platform, config]) =>
            scrapeProducts(query, platform, config)
        );

        const results = await Promise.all(scrapePromises);
        const allProducts = results.flat();

        res.json(allProducts);
    } catch (error) {
        console.error("Error during search:", error);
        res.status(500).json({ error: "Failed to search products" });
    }
};

app.get("/search", searchHandler);

export const api = onRequest({ memory: "1GiB", timeoutSeconds: 60 }, app);
