// Using multiple reliable CDN sources for product images with fallbacks
const productImagesList = {
    'Tata Salt': [
        'https://www.jiomart.com/images/product/original/490001795/tata-salt-1-kg-product-images-o490001795-p490001795-0-202203150432.jpg',
        '/images/products/tata-salt.jpg',
        '/images/placeholder.svg'
    ],
    'Aashirvaad Atta': [
        'https://www.jiomart.com/images/product/original/490750659/aashirvaad-superior-mp-atta-5-kg-product-images-o490750659-p590150646-0-202203170454.jpg',
        '/images/products/aashirvaad-atta.jpg',
        '/images/placeholder.svg'
    ],
    'Amul Butter': [
        'https://www.jiomart.com/images/product/original/490001392/amul-butter-500-g-carton-product-images-o490001392-p490001392-0-202203150104.jpg',
        '/images/products/amul-butter.jpg',
        '/images/placeholder.svg'
    ],
    'Fortune Sunflower Oil': [
        'https://www.jiomart.com/images/product/original/491349660/fortune-sunlite-refined-sunflower-oil-1-l-product-images-o491349660-p491349660-0-202203150518.jpg',
        '/images/products/fortune-oil.jpg',
        '/images/placeholder.svg'
    ],
    'Maggi 2-Minute Noodles': [
        'https://www.jiomart.com/images/product/original/490003834/maggi-2-minute-masala-instant-noodles-280-g-product-images-o490003834-p490003834-0-202203150702.jpg',
        '/images/products/maggi-noodles.jpg',
        '/images/placeholder.svg'
    ],
    'Red Label Tea': [
        'https://www.jiomart.com/images/product/original/491584372/brooke-bond-red-label-strong-blend-tea-500-g-product-images-o491584372-p590838653-0-202203170359.jpg',
        '/images/products/red-label-tea.jpg',
        '/images/placeholder.svg'
    ],
    'Surf Excel Detergent': [
        'https://www.jiomart.com/images/product/original/490001795/surf-excel-quick-wash-detergent-powder-2-kg-product-images-o490001795-p490001795-0-202203170647.jpg',
        '/images/products/surf-excel.jpg',
        '/images/placeholder.svg'
    ],
    'Colgate MaxFresh': [
        'https://www.jiomart.com/images/product/original/491432230/colgate-maxfresh-spicy-fresh-toothpaste-150-g-product-images-o491432230-p491432230-0-202203152038.jpg',
        '/images/products/colgate-maxfresh.jpg',
        '/images/placeholder.svg'
    ]
};

// Default placeholder image URL
const DEFAULT_PLACEHOLDER = '/images/placeholder.svg';

export const getProductImage = (productName: string): string => {
    const images = productImagesList[productName as keyof typeof productImagesList];
    return images ? images[0] : DEFAULT_PLACEHOLDER;
};

// Function to get all alternative URLs for a product
export const getAlternativeImages = (productName: string): string[] => {
    return productImagesList[productName as keyof typeof productImagesList] || [DEFAULT_PLACEHOLDER];
};

// Function to get next image URL when one fails
export const getNextImage = (productName: string, currentUrl: string): string => {
    const images = productImagesList[productName as keyof typeof productImagesList];
    if (!images) return DEFAULT_PLACEHOLDER;

    const currentIndex = images.indexOf(currentUrl);
    if (currentIndex === -1 || currentIndex === images.length - 1) {
        return DEFAULT_PLACEHOLDER;
    }
    return images[currentIndex + 1];
}; 