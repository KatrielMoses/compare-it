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
            const queryParams = new URLSearchParams({ q: searchTerm });
            if (sources) {
                sources.forEach(source => queryParams.append('sources', source));
            }

            const response = await fetch(`${this.baseUrl}/api/search?${queryParams}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch products');
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