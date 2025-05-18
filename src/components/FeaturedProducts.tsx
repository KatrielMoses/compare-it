import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import ProductCard from './ProductCard';
import { popularProducts } from '../services/mockData';
import { ApiService } from '../services/api';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const FeaturedProducts: React.FC = () => {
    const [featuredProducts, setFeaturedProducts] = useState<typeof popularProducts>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Function to fetch popular products from multiple sources
    const fetchPopularProducts = async () => {
        try {
            setIsLoading(true);
            const apiService = ApiService.getInstance();
            const response = await apiService.searchProducts('popular products', ['zepto', 'blinkit', 'swiggymart']);

            if (!response.success || !response.products?.length) {
                console.log('Using mock data as fallback');
                return popularProducts;
            }

            return response.products;
        } catch (error) {
            console.error('Error fetching products:', error);
            // Fallback to mock data if API fails
            return popularProducts;
        }
    };

    // Function to shuffle array
    const shuffleArray = (array: typeof popularProducts) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Update featured products every 2 hours
    useEffect(() => {
        const updateFeaturedProducts = async () => {
            setIsLoading(true);
            try {
                const products = await fetchPopularProducts();
                const shuffled = shuffleArray(products);
                // Ensure we always have exactly 20 products
                const selected = shuffled.slice(0, 20);
                if (selected.length < 20) {
                    // If we have less than 20 products, repeat some to reach 20
                    const repeated = [...selected];
                    while (repeated.length < 20) {
                        repeated.push(...selected.slice(0, 20 - repeated.length));
                    }
                    setFeaturedProducts(repeated);
                } else {
                    setFeaturedProducts(selected);
                }
            } catch (error) {
                console.error('Error updating featured products:', error);
                setFeaturedProducts(popularProducts);
            } finally {
                setIsLoading(false);
            }
        };

        // Initial update
        updateFeaturedProducts();

        // Set up interval for updates (2 hours = 7200000 milliseconds)
        const interval = setInterval(updateFeaturedProducts, 7200000);

        return () => clearInterval(interval);
    }, []);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        cssEase: "linear",
        responsive: [
            {
                breakpoint: 1400,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            }
        ]
    };

    return (
        <section className="featured-products">
            <div className="section-header">
                <h2>Featured Products</h2>
                <p>Compare prices across multiple platforms</p>
            </div>
            <div className="featured-slider">
                {isLoading ? (
                    <div className="loading-spinner-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : (
                    <Slider {...sliderSettings}>
                        {featuredProducts.map(product => (
                            <div key={product.id} className="slider-item">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </Slider>
                )}
            </div>
        </section>
    );
};

export default FeaturedProducts; 