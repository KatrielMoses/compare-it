import React, { useEffect, useState } from 'react';
import { Product, PriceInfo } from '../types/Product';
import { getNextImage } from '../services/imageService';
import { ProductMatcher } from '../services/productMatcher';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [bestPrice, setBestPrice] = useState<PriceInfo | null>(null);
    const [currentImage, setCurrentImage] = useState(product.image);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [attemptCount, setAttemptCount] = useState(0);
    const [unmatchedProducts, setUnmatchedProducts] = useState<{ platform: string; reason: string }[]>([]);

    useEffect(() => {
        // Find the lowest price among available and verified platforms
        const verifiedPrices = product.prices.filter(p => {
            if (!p.inStock) return false;

            // Create a temporary product object for comparison
            const platformProduct: Product = {
                id: `temp_${p.platform}_${Date.now()}`,
                name: p.productName || product.name, // Use platform-specific name if available
                weight: p.weight || product.weight,
                image: p.image || product.image,
                category: product.category,
                prices: [p]
            };

            const { isMatch, matchDetails } = ProductMatcher.areProductsSame(product, platformProduct);

            if (!isMatch) {
                setUnmatchedProducts(prev => [
                    ...prev,
                    {
                        platform: p.platform,
                        reason: matchDetails.reasons.join(', ')
                    }
                ]);
                return false;
            }

            return true;
        });

        if (verifiedPrices.length > 0) {
            const lowest = verifiedPrices.reduce((min, current) =>
                current.price < min.price ? current : min
            );
            setBestPrice(lowest);
        } else {
            setBestPrice(null);
        }
    }, [product]);

    const getPlatformColor = (platform: string) => {
        switch (platform) {
            case 'Zepto':
                return '#2C5282'; // Dark blue
            case 'Blinkit':
                return '#276749'; // Dark green
            case 'SwiggyMart':
                return '#C53030'; // Dark red
            default:
                return '#2D3748'; // Dark gray
        }
    };

    const calculateSavings = (price: number, originalPrice?: number) => {
        if (!originalPrice) return 0;
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    const handleImageError = () => {
        const nextImage = getNextImage(product.name, currentImage);
        if (nextImage && attemptCount < 3) { // Try up to 3 different images
            setCurrentImage(nextImage);
            setAttemptCount(prev => prev + 1);
            setImageLoading(true);
        } else {
            setImageError(true);
            setImageLoading(false);
        }
    };

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    return (
        <div className="product-card">
            <div className="product-image-container">
                {imageLoading && !imageError && (
                    <div className="image-loading">
                        <div className="loading-spinner"></div>
                    </div>
                )}
                {!imageError ? (
                    <img
                        src={currentImage}
                        alt={product.name}
                        className={`product-image ${imageLoading ? 'loading' : 'loaded'}`}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                    />
                ) : (
                    <div className="product-image-placeholder">
                        {product.name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-weight">{product.weight}</p>

                <div className="price-comparison">
                    {bestPrice && (
                        <div className="best-price">
                            <span className="label">Best Price:</span>
                            <span className="price">₹{bestPrice.price}</span>
                            <span
                                className={`platform ${bestPrice.platform.toLowerCase()}`}
                            >
                                {bestPrice.platform}
                            </span>
                            {bestPrice.originalPrice && (
                                <span className="savings">
                                    Save {calculateSavings(bestPrice.price, bestPrice.originalPrice)}%
                                </span>
                            )}
                        </div>
                    )}

                    <div className="all-prices">
                        {product.prices.map((price, index) => {
                            const isUnmatched = unmatchedProducts.find(p => p.platform === price.platform);
                            return (
                                <div
                                    key={index}
                                    className={`price-item ${!price.inStock ? 'out-of-stock' : ''} ${isUnmatched ? 'unmatched' : ''}`}
                                    title={isUnmatched ? `Unmatched: ${isUnmatched.reason}` : undefined}
                                >
                                    <span className={`platform-name ${price.platform.toLowerCase()}`}>
                                        {price.platform}
                                        {isUnmatched && <span className="unmatched-icon">⚠️</span>}
                                    </span>
                                    <span className="price-amount">
                                        {price.inStock ? `₹${price.price}` : 'Out of Stock'}
                                    </span>
                                    {price.deliveryTime && (
                                        <span className="delivery-time">{price.deliveryTime}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard; 