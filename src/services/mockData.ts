import { Product } from '../types/Product';
import { getProductImage } from './imageService';

export const popularProducts: Product[] = [
    {
        id: '1',
        name: 'Tata Salt',
        image: getProductImage('Tata Salt'),
        category: 'Groceries',
        weight: '1kg',
        prices: [
            {
                platform: 'Zepto',
                price: 28,
                inStock: true,
                deliveryTime: '10-15 mins',
                originalPrice: 32
            },
            {
                platform: 'Blinkit',
                price: 25,
                inStock: true,
                deliveryTime: '8-10 mins',
                originalPrice: 32
            },
            {
                platform: 'SwiggyMart',
                price: 30,
                inStock: true,
                deliveryTime: '15-20 mins',
                originalPrice: 32
            }
        ]
    },
    {
        id: '2',
        name: 'Aashirvaad Atta',
        image: getProductImage('Aashirvaad Atta'),
        category: 'Groceries',
        weight: '5kg',
        prices: [
            {
                platform: 'Zepto',
                price: 245,
                inStock: true,
                deliveryTime: '10-15 mins',
                originalPrice: 270
            },
            {
                platform: 'Blinkit',
                price: 255,
                inStock: true,
                deliveryTime: '8-10 mins',
                originalPrice: 270
            },
            {
                platform: 'SwiggyMart',
                price: 270,
                inStock: false,
                deliveryTime: '15-20 mins'
            }
        ]
    },
    {
        id: '3',
        name: 'Amul Butter',
        image: getProductImage('Amul Butter'),
        category: 'Dairy',
        weight: '500g',
        prices: [
            {
                platform: 'Zepto',
                price: 275,
                inStock: true,
                deliveryTime: '10-15 mins',
                originalPrice: 290
            },
            {
                platform: 'Blinkit',
                price: 265,
                inStock: true,
                deliveryTime: '8-10 mins',
                originalPrice: 290
            },
            {
                platform: 'SwiggyMart',
                price: 280,
                inStock: true,
                deliveryTime: '15-20 mins',
                originalPrice: 290
            }
        ]
    },
    {
        id: '4',
        name: 'Fortune Sunflower Oil',
        image: getProductImage('Fortune Sunflower Oil'),
        category: 'Groceries',
        weight: '1L',
        prices: [
            {
                platform: 'Zepto',
                price: 155,
                inStock: true,
                deliveryTime: '10-15 mins',
                originalPrice: 180
            },
            {
                platform: 'Blinkit',
                price: 160,
                inStock: true,
                deliveryTime: '8-10 mins',
                originalPrice: 180
            },
            {
                platform: 'SwiggyMart',
                price: 150,
                inStock: true,
                deliveryTime: '15-20 mins',
                originalPrice: 180
            }
        ]
    },
    {
        id: '5',
        name: 'Maggi 2-Minute Noodles',
        image: getProductImage('Maggi 2-Minute Noodles'),
        category: 'Instant Food',
        weight: '280g',
        prices: [
            {
                platform: 'Zepto',
                price: 48,
                inStock: true,
                deliveryTime: '10-15 mins',
                originalPrice: 52
            },
            {
                platform: 'Blinkit',
                price: 45,
                inStock: true,
                deliveryTime: '8-10 mins',
                originalPrice: 52
            },
            {
                platform: 'SwiggyMart',
                price: 52,
                inStock: true,
                deliveryTime: '15-20 mins',
                originalPrice: 52
            }
        ]
    },
    {
        id: '6',
        name: 'Red Label Tea',
        image: getProductImage('Red Label Tea'),
        category: 'Beverages',
        weight: '500g',
        prices: [
            {
                platform: 'Zepto',
                price: 265,
                inStock: true,
                deliveryTime: '10-15 mins',
                originalPrice: 290
            },
            {
                platform: 'Blinkit',
                price: 275,
                inStock: true,
                deliveryTime: '8-10 mins',
                originalPrice: 290
            },
            {
                platform: 'SwiggyMart',
                price: 290,
                inStock: true,
                deliveryTime: '15-20 mins',
                originalPrice: 290
            }
        ]
    },
    {
        id: '7',
        name: 'Surf Excel Detergent',
        image: getProductImage('Surf Excel Detergent'),
        category: 'Household',
        weight: '2kg',
        prices: [
            {
                platform: 'Zepto',
                price: 345,
                inStock: true,
                deliveryTime: '10-15 mins',
                originalPrice: 380
            },
            {
                platform: 'Blinkit',
                price: 355,
                inStock: true,
                deliveryTime: '8-10 mins',
                originalPrice: 380
            },
            {
                platform: 'SwiggyMart',
                price: 380,
                inStock: true,
                deliveryTime: '15-20 mins',
                originalPrice: 380
            }
        ]
    },
    {
        id: '8',
        name: 'Colgate MaxFresh',
        image: getProductImage('Colgate MaxFresh'),
        category: 'Personal Care',
        weight: '150g',
        prices: [
            {
                platform: 'Zepto',
                price: 85,
                inStock: true,
                deliveryTime: '10-15 mins',
                originalPrice: 95
            },
            {
                platform: 'Blinkit',
                price: 90,
                inStock: true,
                deliveryTime: '8-10 mins',
                originalPrice: 95
            },
            {
                platform: 'SwiggyMart',
                price: 95,
                inStock: true,
                deliveryTime: '15-20 mins',
                originalPrice: 95
            }
        ]
    }
]; 