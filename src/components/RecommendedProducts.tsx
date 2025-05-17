import React, { useEffect, useState } from 'react';
import { Product } from '../types/Product';
import ProductCard from './ProductCard';
import RecommendationService from '../services/recommendationService';
import { popularProducts } from '../services/mockData';

const RecommendedProducts: React.FC = () => {
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const recommendationService = RecommendationService.getInstance();

    const updateRecommendations = () => {
        const newRecommendations = recommendationService.getRecommendedProducts(popularProducts);
        setRecommendations(newRecommendations);
    };

    useEffect(() => {
        // Initial load
        updateRecommendations();

        // Refresh recommendations every 2 hours
        const refreshInterval = setInterval(updateRecommendations, 2 * 60 * 60 * 1000);

        return () => clearInterval(refreshInterval);
    }, []);

    return (
        <section className="recommended-products">
            <div className="section-header">
                <h2>Products You Might Like</h2>
                <p>Personalized recommendations based on your interests</p>
            </div>
            <div className="products-grid">
                {recommendations.map(product => (
                    <div key={product.id} className="product-wrapper">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RecommendedProducts; 