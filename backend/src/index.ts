import express, { Request, Response } from 'express';
import cors from 'cors';
import { ScrapingService } from './services/scraping';
import { ScrapingRequest } from './types';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const scrapingService = new ScrapingService();

app.post('/api/scrape', async (req: Request, res: Response) => {
    try {
        const { searchTerm, sources }: ScrapingRequest = req.body;

        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                error: 'Search term is required'
            });
        }

        const result = await scrapingService.scrapeAll(searchTerm, sources);
        res.json(result);
    } catch (error) {
        console.error('Error in scrape endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy' });
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 