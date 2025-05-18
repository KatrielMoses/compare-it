import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import NodeCache from 'node-cache';
import { ScrapingService } from './services/scraping';
import { ScrapingRequest } from './types';

const app = express();
const port = process.env.PORT || 3001;
const CACHE_TTL = 3600; // Cache for 1 hour
const MAX_REQUESTS_PER_HOUR = 100;

// Initialize cache
const cache = new NodeCache({ stdTTL: CACHE_TTL });

// Simple rate limiting using in-memory storage
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour

    const current = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > current.resetTime) {
        current.count = 0;
        current.resetTime = now + windowMs;
    }

    if (current.count >= MAX_REQUESTS_PER_HOUR) {
        return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    current.count++;
    requestCounts.set(ip, current);
    next();
};

app.use(cors());
app.use(express.json());

const scrapingService = new ScrapingService();

// Root route handler - Updated to be more resilient
app.get('/', (_req: Request, res: Response) => {
    res.json({
        name: "Compare-It API",
        version: "1.0.0",
        status: "online",
        endpoints: [
            { path: "/api/health", method: "GET", description: "Health check endpoint" },
            { path: "/api/scrape", method: "POST", description: "Product scraping endpoint" },
            { path: "/api/search", method: "GET", description: "Product search endpoint" }
        ]
    });
});

// Health check endpoint
app.get('/api/health', rateLimiter, (_req: Request, res: Response) => {
    res.json({ status: 'healthy' });
});

// Main scraping endpoint
app.post('/api/scrape', rateLimiter, async (req: Request, res: Response) => {
    try {
        const { searchTerm, sources }: ScrapingRequest = req.body;

        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                error: 'Search term is required'
            });
        }

        // Check cache first
        const cacheKey = `${searchTerm}-${sources?.join('-') || 'all'}`;
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
            console.log('Returning cached result for:', searchTerm);
            return res.json(cachedResult);
        }

        const result = await scrapingService.scrapeAll(searchTerm, sources);

        // Cache the result if successful
        if (result.success) {
            cache.set(cacheKey, result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error in scrape endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy' });
});

app.get('/api/search', async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string;
        if (!searchTerm) {
            return res.status(400).json({ error: 'Search term is required' });
        }

        const sources = req.query.sources as ('zepto' | 'blinkit' | 'swiggymart')[] | undefined;
        const result = await scrapingService.scrapeAll(searchTerm, sources);
        res.json(result);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a catch-all route at the end
app.use('*', (req: Request, res: Response) => {
    res.json({
        message: "Welcome to Compare-It API",
        requested_path: req.originalUrl,
        available_endpoints: [
            "/",
            "/api/health",
            "/api/scrape",
            "/api/search"
        ]
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 