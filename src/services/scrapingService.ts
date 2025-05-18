import { Product, PriceInfo, ScrapedProduct } from '../types/Product';
import debounce from 'lodash/debounce';

interface SearchError extends Error {
    code?: string;
    status?: number;
}

class ScrapingService {
    private static instance: ScrapingService;
    private baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://compare-it-backend.onrender.com'  // Replace with your Firebase project ID
        : 'http://localhost:3001';  // Local development
    private pendingRequests: Map<string, Promise<Product[]>> = new Map();
    private cache: Map<string, { data: Product[], timestamp: number }> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    private constructor() {
        // Clear expired cache entries periodically
        setInterval(() => this.cleanCache(), this.CACHE_DURATION);
    }

    public static getInstance(): ScrapingService {
        if (!ScrapingService.instance) {
            ScrapingService.instance = new ScrapingService();
        }
        return ScrapingService.instance;
    }

    private cleanCache(): void {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.CACHE_DURATION) {
                this.cache.delete(key);
            }
        }
    }

    private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                }
            });
            clearTimeout(id);

            if (!response.ok) {
                const error: SearchError = new Error('Network response was not ok');
                error.status = response.status;
                throw error;
            }

            return response;
        } catch (error) {
            clearTimeout(id);
            if (error instanceof Error) {
                const searchError: SearchError = error;
                if (error.name === 'AbortError') {
                    searchError.code = 'TIMEOUT';
                }
                throw searchError;
            }
            throw error;
        }
    }

    private debouncedSearch = debounce(
        async (query: string): Promise<Product[]> => {
            try {
                const response = await this.fetchWithTimeout(
                    `${this.baseUrl}/api/scrape`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            searchTerm: query,
                            sources: ['zepto', 'blinkit', 'swiggymart']
                        })
                    }
                );

                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.error || 'Failed to fetch products');
                }

                return result.products;
            } catch (error) {
                console.error('Error searching products:', error);
                throw this.handleError(error);
            } finally {
                this.pendingRequests.delete(query);
            }
        },
        300 // Debounce delay in milliseconds
    ) as (query: string) => Promise<Product[]>;

    public async searchProducts(query: string): Promise<Product[]> {
        if (!query.trim()) {
            return [];
        }

        // Check cache first
        const cachedResult = this.cache.get(query);
        if (cachedResult && Date.now() - cachedResult.timestamp < this.CACHE_DURATION) {
            return cachedResult.data;
        }

        // Check if there's already a pending request for this query
        const pendingRequest = this.pendingRequests.get(query);
        if (pendingRequest) {
            return pendingRequest;
        }

        // Create new request
        const newRequest = this.debouncedSearch(query);
        this.pendingRequests.set(query, newRequest);

        return newRequest;
    }

    private handleError(error: unknown): Error {
        if (error instanceof Error) {
            const searchError = error as SearchError;
            switch (searchError.code) {
                case 'TIMEOUT':
                    return new Error('The search request timed out. Please try again.');
                default:
                    switch (searchError.status) {
                        case 429:
                            return new Error('Too many requests. Please wait a moment and try again.');
                        case 500:
                            return new Error('Server error. Please try again later.');
                        default:
                            return new Error('An error occurred while searching. Please try again.');
                    }
            }
        }
        return new Error('An unexpected error occurred.');
    }

    private transformScrapedProducts(scrapedProducts: ScrapedProduct[]): Product[] {
        // Group products by name and weight
        const groupedProducts = new Map<string, ScrapedProduct[]>();

        scrapedProducts.forEach(product => {
            const key = `${product.name}-${product.weight}`;
            if (!groupedProducts.has(key)) {
                groupedProducts.set(key, []);
            }
            const group = groupedProducts.get(key);
            if (group) {
                group.push(product);
            }
        });

        // Transform grouped products into our Product type
        return Array.from(groupedProducts.entries()).map(([key, products]) => {
            const baseProduct = products[0];
            const prices: PriceInfo[] = products
                .map(p => ({
                    platform: p.platform,
                    price: p.price,
                    originalPrice: p.originalPrice,
                    inStock: p.inStock,
                    deliveryTime: p.deliveryTime,
                    productUrl: p.productUrl
                }))
                .sort((a, b) => a.price - b.price); // Sort by price ascending

            return {
                id: key,
                name: baseProduct.name,
                image: baseProduct.image,
                weight: baseProduct.weight,
                category: this.inferCategory(baseProduct.name),
                prices: prices
            };
        });
    }

    private inferCategory(productName: string): string {
        const categories = {
            'Groceries': ['rice', 'dal', 'flour', 'atta', 'oil', 'ghee', 'spices'],
            'Dairy': ['milk', 'butter', 'cheese', 'curd', 'paneer', 'yogurt'],
            'Beverages': ['tea', 'coffee', 'juice', 'drink', 'soda', 'water'],
            'Snacks': ['chips', 'biscuits', 'cookies', 'namkeen', 'chocolate'],
            'Personal Care': ['soap', 'shampoo', 'toothpaste', 'lotion', 'cream'],
            'Household': ['cleaner', 'detergent', 'freshener', 'brush', 'mop'],
            'Instant Food': ['noodles', 'pasta', 'ready to eat', 'frozen']
        };

        const normalizedName = productName.toLowerCase();

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => normalizedName.includes(keyword))) {
                return category;
            }
        }

        return 'Others';
    }
}

export default ScrapingService; 