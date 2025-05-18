import config from '../config';
import { Product } from '../types/Product';

interface SearchResponse {
    success: boolean;
    products: Product[];
    error?: string;
}

export class ApiService {
    private static instance: ApiService;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = config.apiUrl;
        console.log('API Service initialized with URL:', this.baseUrl);
    }

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    public async searchProducts(
        searchTerm: string,
        sources?: ('zepto' | 'blinkit' | 'swiggymart')[]
    ): Promise<SearchResponse> {
        try {
            console.log(`Making API request to: ${this.baseUrl}/api/scrape`);

            // First check if the API is reachable at all
            try {
                const healthCheck = await fetch(`${this.baseUrl}/api/health`, {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'no-cache'
                });

                if (!healthCheck.ok) {
                    console.error('API health check failed:', healthCheck.status);
                    throw new Error(`API is not available (Status: ${healthCheck.status})`);
                }
            } catch (healthError) {
                console.error('API health check failed with error:', healthError);
                throw new Error('Cannot connect to the API server. Please check your internet connection.');
            }

            // If health check passed, continue with the actual request
            const response = await fetch(`${this.baseUrl}/api/scrape`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    searchTerm,
                    sources
                }),
                mode: 'cors',
                cache: 'no-cache'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Server error: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                products: [],
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
} 