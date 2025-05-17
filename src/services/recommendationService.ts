import { Product } from '../types/Product';

// Simulated user search history type
interface SearchHistory {
    query: string;
    category: string;
    timestamp: number;
}

// Common product categories and their related items
const categoryAffinities: { [key: string]: string[] } = {
    'Groceries': ['Staples', 'Cooking Oil', 'Rice', 'Pulses', 'Spices'],
    'Dairy': ['Milk', 'Butter', 'Cheese', 'Yogurt', 'Paneer'],
    'Beverages': ['Tea', 'Coffee', 'Soft Drinks', 'Health Drinks', 'Juices'],
    'Snacks': ['Biscuits', 'Chips', 'Namkeen', 'Chocolates', 'Nuts'],
    'Personal Care': ['Soap', 'Shampoo', 'Toothpaste', 'Deodorant', 'Lotion'],
    'Household': ['Detergent', 'Cleaners', 'Fresheners', 'Utensils', 'Storage'],
    'Instant Food': ['Noodles', 'Pasta', 'Ready to Eat', 'Soup', 'Frozen Food']
};

// Default popular categories when no user history exists
const defaultPopularCategories = ['Groceries', 'Snacks', 'Beverages', 'Dairy'];

export class RecommendationService {
    private static instance: RecommendationService;
    private previousRecommendations: Set<string> = new Set();

    private constructor() { }

    public static getInstance(): RecommendationService {
        if (!RecommendationService.instance) {
            RecommendationService.instance = new RecommendationService();
        }
        return RecommendationService.instance;
    }

    // Get user's search history from localStorage
    private getUserSearchHistory(): SearchHistory[] {
        const history = localStorage.getItem('userSearchHistory');
        return history ? JSON.parse(history) : [];
    }

    // Analyze user history to find preferred categories
    private analyzeUserPreferences(history: SearchHistory[]): string[] {
        if (history.length === 0) return defaultPopularCategories;

        // Count category frequencies
        const categoryCount: { [key: string]: number } = {};
        history.forEach(search => {
            categoryCount[search.category] = (categoryCount[search.category] || 0) + 1;
        });

        // Sort categories by frequency
        return Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)
            .map(([category]) => category)
            .slice(0, 4); // Get top 4 categories
    }

    // Filter products based on user preferences
    private filterRelevantProducts(
        allProducts: Product[],
        preferredCategories: string[]
    ): Product[] {
        return allProducts.filter(product =>
            preferredCategories.includes(product.category) &&
            !this.previousRecommendations.has(product.id)
        );
    }

    // Shuffle array using Fisher-Yates algorithm
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Get recommended products
    public getRecommendedProducts(allProducts: Product[], count: number = 8): Product[] {
        const history = this.getUserSearchHistory();
        const preferredCategories = this.analyzeUserPreferences(history);

        // Filter relevant products
        let relevantProducts = this.filterRelevantProducts(allProducts, preferredCategories);

        // If not enough products, include products from default categories
        if (relevantProducts.length < count) {
            const additionalProducts = this.filterRelevantProducts(
                allProducts,
                defaultPopularCategories
            );
            relevantProducts = [...new Set([...relevantProducts, ...additionalProducts])];
        }

        // Shuffle products and select required number
        const shuffled = this.shuffleArray(relevantProducts).slice(0, count);

        // Update previous recommendations
        this.previousRecommendations.clear();
        shuffled.forEach(product => this.previousRecommendations.add(product.id));

        return shuffled;
    }

    // Add a search to history
    public addSearchToHistory(query: string, category: string): void {
        const history = this.getUserSearchHistory();
        history.push({
            query,
            category,
            timestamp: Date.now()
        });

        // Keep only last 50 searches
        const recentHistory = history.slice(-50);
        localStorage.setItem('userSearchHistory', JSON.stringify(recentHistory));
    }
}

export default RecommendationService; 