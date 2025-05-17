export interface PriceInfo {
    platform: string;
    price: number;
    originalPrice?: number;
    inStock: boolean;
    deliveryTime?: string;
    productUrl: string;
}

export interface Product {
    id: string;
    name: string;
    image: string;
    weight: string;
    category: string;
    prices: PriceInfo[];
}

export interface ScrapedProduct {
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    weight: string;
    inStock: boolean;
    platform: string;
    deliveryTime?: string;
    productUrl: string;
} 