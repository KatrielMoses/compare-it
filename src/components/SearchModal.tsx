import React, { useState } from 'react';
import { Product } from '../types/Product';
import ProductCard from './ProductCard';
import { ApiService } from '../services/api';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const apiService = ApiService.getInstance();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError(null);

        try {
            const result = await apiService.searchProducts(searchQuery);
            if (result.success) {
                setSearchResults(result.products);
            } else {
                setError(result.error || 'Failed to fetch results');
                setSearchResults([]);
            }
        } catch (error) {
            setError('An error occurred while searching');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="search-modal">
            <div className="search-container">
                <button className="close-button" onClick={onClose}>×</button>
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for products..."
                        autoFocus
                    />
                    <button type="submit" disabled={isSearching}>
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="search-results">
                    {searchResults.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    {!isSearching && searchResults.length === 0 && searchQuery && !error && (
                        <p className="no-results">No products found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchModal; 