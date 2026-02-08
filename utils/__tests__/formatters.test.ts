import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber, formatPercentage } from '../formatters';

describe('formatter utilities', () => {
    describe('formatCurrency', () => {
        it('should format EUR currency correctly', () => {
            expect(formatCurrency(1234.56, 'EUR')).toBe('1.234,56 €');
            expect(formatCurrency(1000, 'EUR')).toBe('1.000,00 €');
        });

        it('should format USD currency correctly', () => {
            expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
            expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
        });

        it('should format GBP currency correctly', () => {
            expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56');
        });

        it('should handle zero and negative values', () => {
            expect(formatCurrency(0, 'EUR')).toBe('0,00 €');
            expect(formatCurrency(-500, 'EUR')).toBe('-500,00 €');
        });

        it('should handle large numbers', () => {
            expect(formatCurrency(1000000, 'EUR')).toContain('1.000.000');
        });
    });

    describe('formatDate', () => {
        it('should format dates correctly', () => {
            const date = new Date('2026-01-27');
            const formatted = formatDate(date);
            expect(formatted).toMatch(/27.*01.*2026|Jan.*27.*2026/);
        });

        it('should handle string dates', () => {
            const formatted = formatDate('2026-01-27');
            expect(formatted).toBeTruthy();
        });

        it('should handle different formats', () => {
            const date = new Date('2026-01-27');
            expect(formatDate(date, 'short')).toBeTruthy();
            expect(formatDate(date, 'long')).toBeTruthy();
        });
    });

    describe('formatNumber', () => {
        it('should format numbers with thousands separator', () => {
            expect(formatNumber(1234)).toBe('1.234');
            expect(formatNumber(1000000)).toBe('1.000.000');
        });

        it('should handle decimals', () => {
            expect(formatNumber(1234.56, 2)).toBe('1.234,56');
            expect(formatNumber(99.9, 1)).toBe('99,9');
        });

        it('should handle zero decimals', () => {
            expect(formatNumber(1234.56, 0)).toBe('1.235');
        });
    });

    describe('formatPercentage', () => {
        it('should format percentages correctly', () => {
            expect(formatPercentage(0.5)).toBe('50%');
            expect(formatPercentage(0.75)).toBe('75%');
            expect(formatPercentage(1)).toBe('100%');
        });

        it('should handle decimal percentages', () => {
            expect(formatPercentage(0.333, 1)).toBe('33.3%');
            expect(formatPercentage(0.6666, 2)).toBe('66.66%');
        });

        it('should handle values over 100%', () => {
            expect(formatPercentage(1.5)).toBe('150%');
        });

        it('should handle zero', () => {
            expect(formatPercentage(0)).toBe('0%');
        });
    });
});
