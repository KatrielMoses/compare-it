import { Product, PriceInfo } from '../types/Product';

interface ProductMatchScore {
    score: number;
    reasons: string[];
}

export class ProductMatcher {
    private static MINIMUM_MATCH_SCORE = 0.8; // 80% confidence required for a match

    // Normalize text for comparison by removing special characters and converting to lowercase
    private static normalizeText(text: string): string {
        return text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();
    }

    // Extract brand name from product name (if present)
    private static extractBrand(productName: string): string {
        const commonBrands = ['tata', 'amul', 'fortune', 'maggi', 'colgate', 'surf', 'red label', 'aashirvaad'];
        const normalizedName = this.normalizeText(productName);

        for (const brand of commonBrands) {
            if (normalizedName.includes(brand)) {
                return brand;
            }
        }
        return '';
    }

    // Extract weight/quantity from product name or weight field
    private static normalizeWeight(weight: string): string {
        return weight.toLowerCase()
            .replace(/\s+/g, '')
            .replace('gram', 'g')
            .replace('kilogram', 'kg')
            .replace('ml', 'ml')
            .replace('liter', 'l')
            .replace('litre', 'l');
    }

    // Compare two products and return a similarity score
    public static compareProducts(product1: Product, product2: Product): ProductMatchScore {
        let totalScore = 0;
        const reasons: string[] = [];

        // 1. Name Similarity (40% weight)
        const name1 = this.normalizeText(product1.name);
        const name2 = this.normalizeText(product2.name);

        const nameScore = this.calculateStringSimilarity(name1, name2);
        totalScore += nameScore * 0.4;

        if (nameScore < 0.7) {
            reasons.push(`Low name similarity: ${Math.round(nameScore * 100)}%`);
        }

        // 2. Brand Match (30% weight)
        const brand1 = this.extractBrand(product1.name);
        const brand2 = this.extractBrand(product2.name);

        if (brand1 && brand2) {
            const brandScore = brand1 === brand2 ? 1 : 0;
            totalScore += brandScore * 0.3;

            if (brandScore === 0) {
                reasons.push(`Brand mismatch: ${brand1} vs ${brand2}`);
            }
        }

        // 3. Weight/Quantity Match (30% weight)
        const weight1 = product1.weight || '';
        const weight2 = product2.weight || '';

        if (weight1 && weight2) {
            const normalizedWeight1 = this.normalizeWeight(weight1);
            const normalizedWeight2 = this.normalizeWeight(weight2);
            const weightScore = normalizedWeight1 === normalizedWeight2 ? 1 : 0;
            totalScore += weightScore * 0.3;

            if (weightScore === 0) {
                reasons.push(`Weight mismatch: ${weight1} vs ${weight2}`);
            }
        } else {
            reasons.push('Weight information missing for comparison');
            // If weights are missing, distribute the weight score to name and brand
            totalScore += (nameScore * 0.15) + (brand1 === brand2 ? 0.15 : 0);
        }

        return {
            score: totalScore,
            reasons
        };
    }

    // Calculate string similarity using Levenshtein distance
    private static calculateStringSimilarity(str1: string, str2: string): number {
        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0) return 1.0;

        const distance = this.levenshteinDistance(str1, str2);
        return 1 - (distance / maxLength);
    }

    // Levenshtein distance implementation
    private static levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = [];

        for (let i = 0; i <= str1.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str2.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str1.length; i++) {
            for (let j = 1; j <= str2.length; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str1.length][str2.length];
    }

    // Verify if products are the same based on the minimum match score
    public static areProductsSame(product1: Product, product2: Product): { isMatch: boolean; matchDetails: ProductMatchScore } {
        const matchScore = this.compareProducts(product1, product2);
        return {
            isMatch: matchScore.score >= this.MINIMUM_MATCH_SCORE,
            matchDetails: matchScore
        };
    }
} 