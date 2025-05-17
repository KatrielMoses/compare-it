import React, { useState, useEffect } from 'react';
import { Product } from '../types/Product';
import ProductCard from './ProductCard';
import { popularProducts } from '../services/mockData';
import RecommendationService from '../services/recommendationService';

const SearchPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const recommendationService = RecommendationService.getInstance();

    useEffect(() => {
        // Load recent searches from localStorage
        const history = localStorage.getItem('userSearchHistory');
        if (history) {
            try {
                const searches = JSON.parse(history) as Array<{ query: string }>;
                const recentQueries = [...new Set(searches.map(s => s.query))].slice(0, 5);
                setRecentSearches(recentQueries);
            } catch (error) {
                console.error('Error parsing search history:', error);
            }
        }
    }, []);

    const normalizeText = (text: string): string => {
        return text.toLowerCase()
            .trim()
            .replace(/\s+/g, ' ');
    };

    const searchProducts = (query: string) => {
        const normalizedQuery = normalizeText(query);

        return popularProducts.filter(product => {
            const normalizedName = normalizeText(product.name);
            const normalizedCategory = normalizeText(product.category);

            // Check exact matches first
            if (normalizedName === normalizedQuery) return true;

            // Check if product name contains the query
            if (normalizedName.includes(normalizedQuery)) return true;

            // Check if category matches
            if (normalizedCategory.includes(normalizedQuery)) return true;

            // Check individual words in the query
            const queryWords = normalizedQuery.split(' ');
            const nameWords = normalizedName.split(' ');

            return queryWords.every(word =>
                nameWords.some(nameWord => nameWord.includes(word))
            );
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);

        // Simulate API search delay
        setTimeout(() => {
            const results = searchProducts(searchQuery);
            setSearchResults(results);
            setIsSearching(false);

            // Add search to history if we found results
            if (results.length > 0) {
                recommendationService.addSearchToHistory(
                    searchQuery,
                    results[0].category
                );
                setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
            }
        }, 300);
    };

    const handleRecentSearchClick = (query: string) => {
        setSearchQuery(query);
        const results = searchProducts(query);
        setSearchResults(results);
    };

    return (
        <div className="search-page">
            <div className="search-header">
                <h1>Search Products</h1>
                <p>Find and compare prices across platforms</p>
            </div>

            <div className="search-container">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for products..."
                            className="search-input"
                            autoFocus
                        />
                        <button type="submit" className="search-button">
                            Search
                        </button>
                    </div>
                </form>

                {recentSearches.length > 0 && !searchResults.length && (
                    <div className="recent-searches">
                        <h3>Recent Searches</h3>
                        <div className="recent-search-tags">
                            {recentSearches.map((query, index) => (
                                <button
                                    key={index}
                                    className="recent-search-tag"
                                    onClick={() => handleRecentSearchClick(query)}
                                >
                                    {query}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="search-results">
                {isSearching ? (
                    <div className="loading-spinner-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : searchResults.length > 0 ? (
                    <>
                        <div className="results-header">
                            <h2>Search Results</h2>
                            <p>{searchResults.length} products found</p>
                        </div>
                        <div className="products-grid">
                            {searchResults.map(product => (
                                <div key={product.id} className="product-wrapper">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </>
                ) : searchQuery && !isSearching ? (
                    <div className="no-results">
                        <p>No products found matching "{searchQuery}"</p>
                        <p>Try searching for a different product or check your spelling</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default SearchPage; 