// Using multiple reliable CDN sources for product images with fallbacks
const productImagesList = {
    'Tata Salt': [
        'https://www.jiomart.com/images/product/original/490001795/tata-salt-1-kg-product-images-o490001795-p490001795-0-202203150432.jpg',
        'https://www.bigbasket.com/media/uploads/p/l/241600_7-tata-salt-iodized.jpg',
        'https://m.media-amazon.com/images/I/51uhkKs1CJL._SL1000_.jpg'
    ],
    'Aashirvaad Atta': [
        'https://www.jiomart.com/images/product/original/490750659/aashirvaad-superior-mp-atta-5-kg-product-images-o490750659-p590150646-0-202203170454.jpg',
        'https://www.bigbasket.com/media/uploads/p/l/126903_8-aashirvaad-atta-whole-wheat.jpg',
        'https://m.media-amazon.com/images/I/71vYQX8wjZL._SL1500_.jpg'
    ],
    'Amul Butter': [
        'https://www.jiomart.com/images/product/original/490001392/amul-butter-500-g-carton-product-images-o490001392-p490001392-0-202203150104.jpg',
        'https://www.bigbasket.com/media/uploads/p/l/40019374_12-amul-butter-pasteurised.jpg',
        'https://m.media-amazon.com/images/I/61O45aKes6L._SL1500_.jpg'
    ],
    'Fortune Sunflower Oil': [
        'https://www.jiomart.com/images/product/original/491349660/fortune-sunlite-refined-sunflower-oil-1-l-product-images-o491349660-p491349660-0-202203150518.jpg',
        'https://www.bigbasket.com/media/uploads/p/l/274148_14-fortune-sun-lite-sunflower-refined-oil.jpg',
        'https://m.media-amazon.com/images/I/61beXBzSgWL._SL1500_.jpg'
    ],
    'Maggi 2-Minute Noodles': [
        'https://www.jiomart.com/images/product/original/490003834/maggi-2-minute-masala-instant-noodles-280-g-product-images-o490003834-p490003834-0-202203150702.jpg',
        'https://www.bigbasket.com/media/uploads/p/l/266164_22-maggi-2-minute-noodles-masala.jpg',
        'https://m.media-amazon.com/images/I/81Xw2oj1UaL._SL1500_.jpg'
    ],
    'Red Label Tea': [
        'https://www.jiomart.com/images/product/original/491584372/brooke-bond-red-label-strong-blend-tea-500-g-product-images-o491584372-p590838653-0-202203170359.jpg',
        'https://www.bigbasket.com/media/uploads/p/l/266579_18-red-label-tea.jpg',
        'https://m.media-amazon.com/images/I/61jcuoMfJ6L._SL1000_.jpg'
    ],
    'Surf Excel Detergent': [
        'https://www.jiomart.com/images/product/original/490001795/surf-excel-quick-wash-detergent-powder-2-kg-product-images-o490001795-p490001795-0-202203170647.jpg',
        'https://www.bigbasket.com/media/uploads/p/l/267012_19-surf-excel-quick-wash-detergent-powder.jpg',
        'https://m.media-amazon.com/images/I/61ePenXfH3L._SL1000_.jpg'
    ],
    'Colgate MaxFresh': [
        'https://www.jiomart.com/images/product/original/491432230/colgate-maxfresh-spicy-fresh-toothpaste-150-g-product-images-o491432230-p491432230-0-202203152038.jpg',
        'https://www.bigbasket.com/media/uploads/p/l/281497_12-colgate-maxfresh-toothpaste-gel-spicy-fresh.jpg',
        'https://m.media-amazon.com/images/I/71J6YKDoL4L._SL1500_.jpg'
    ]
};

export const getProductImage = (productName: string): string => {
    const images = productImagesList[productName as keyof typeof productImagesList];
    return images ? images[0] : ''; // Return the first image URL by default
};

// Function to get all alternative URLs for a product
export const getAlternativeImages = (productName: string): string[] => {
    return productImagesList[productName as keyof typeof productImagesList] || [];
};

// Function to get next image URL when one fails
export const getNextImage = (productName: string, currentUrl: string): string => {
    const images = productImagesList[productName as keyof typeof productImagesList];
    if (!images) return '';

    const currentIndex = images.indexOf(currentUrl);
    if (currentIndex === -1 || currentIndex === images.length - 1) {
        return images[0];
    }
    return images[currentIndex + 1];
}; 