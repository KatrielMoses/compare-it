export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    link: string;
    source: 'zepto' | 'blinkit' | 'swiggymart';
}

export interface ScrapingRequest {
    searchTerm: string;
    sources?: ('zepto' | 'blinkit' | 'swiggymart')[];
}

export interface ScrapingResult {
    success: boolean;
    products: Product[];
    error?: string;
} 