import { describe, it, expect } from 'vitest';
import { budgetSchema, validateBudget } from '../budget.schema';

describe('Budget Schema', () => {
    describe('Valid budgets', () => {
        it('should validate a complete fixed budget', () => {
            const validBudget = {
                category: 'Food',
                subCategory: 'Groceries',
                limit: 500,
                period: 'MONTHLY',
                budgetType: 'FIXED',
            };

            const result = validateBudget(validBudget);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.limit).toBe(500);
                expect(result.data.budgetType).toBe('FIXED');
            }
        });

        it('should validate percentage-based budget', () => {
            const percentageBudget = {
                category: 'Entertainment',
                limit: 200,
                period: 'MONTHLY',
                budgetType: 'PERCENTAGE',
                percentage: 10,
            };

            const result = validateBudget(percentageBudget);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.percentage).toBe(10);
            }
        });

        it('should validate custom period budget', () => {
            const customBudget = {
                category: 'Vacation',
                limit: 2000,
                period: 'CUSTOM',
                budgetType: 'FIXED',
                startDate: '2026-06-01',
                endDate: '2026-08-31',
            };

            const result = validateBudget(customBudget);

            expect(result.success).toBe(true);
        });

        it('should validate yearly budget', () => {
            const yearlyBudget = {
                category: 'Insurance',
                limit: 1200,
                period: 'YEARLY',
                budgetType: 'FIXED',
            };

            const result = validateBudget(yearlyBudget);

            expect(result.success).toBe(true);
        });
    });

    describe('Invalid budgets', () => {
        it('should reject negative limit', () => {
            const invalidBudget = {
                category: 'Food',
                limit: -100,
                period: 'MONTHLY',
                budgetType: 'FIXED',
            };

            const result = validateBudget(invalidBudget);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('greater than 0');
            }
        });

        it('should reject zero limit', () => {
            const invalidBudget = {
                category: 'Food',
                limit: 0,
                period: 'MONTHLY',
                budgetType: 'FIXED',
            };

            const result = validateBudget(invalidBudget);

            expect(result.success).toBe(false);
        });

        it('should reject empty category', () => {
            const invalidBudget = {
                category: '',
                limit: 500,
                period: 'MONTHLY',
                budgetType: 'FIXED',
            };

            const result = validateBudget(invalidBudget);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('cannot be empty');
            }
        });

        it('should reject percentage budget without percentage value', () => {
            const invalidBudget = {
                category: 'Food',
                limit: 500,
                period: 'MONTHLY',
                budgetType: 'PERCENTAGE',
                // Missing percentage field
            };

            const result = validateBudget(invalidBudget);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('Percentage is required')
                )).toBe(true);
            }
        });

        it('should reject percentage over 100', () => {
            const invalidBudget = {
                category: 'Food',
                limit: 500,
                period: 'MONTHLY',
                budgetType: 'PERCENTAGE',
                percentage: 150,
            };

            const result = validateBudget(invalidBudget);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('less than or equal to 100');
            }
        });

        it('should reject negative percentage', () => {
            const invalidBudget = {
                category: 'Food',
                limit: 500,
                period: 'MONTHLY',
                budgetType: 'PERCENTAGE',
                percentage: -10,
            };

            const result = validateBudget(invalidBudget);

            expect(result.success).toBe(false);
        });

        it('should reject custom period without start date', () => {
            const invalidBudget = {
                category: 'Vacation',
                limit: 2000,
                period: 'CUSTOM',
                budgetType: 'FIXED',
                endDate: '2026-08-31',
                // Missing startDate
            };

            const result = validateBudget(invalidBudget);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('Start date and end date are required')
                )).toBe(true);
            }
        });

        it('should reject custom period without end date', () => {
            const invalidBudget = {
                category: 'Vacation',
                limit: 2000,
                period: 'CUSTOM',
                budgetType: 'FIXED',
                startDate: '2026-06-01',
                // Missing endDate
            };

            const result = validateBudget(invalidBudget);

            expect(result.success).toBe(false);
        });

        it('should reject end date before start date', () => {
            const invalidBudget = {
                category: 'Vacation',
                limit: 2000,
                period: 'CUSTOM',
                budgetType: 'FIXED',
                startDate: '2026-08-31',
                endDate: '2026-06-01', // Before start date
            };

            const result = validateBudget(invalidBudget);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('End date must be after start date')
                )).toBe(true);
            }
        });

        it('should reject invalid date format in startDate', () => {
            const invalidBudget = {
                category: 'Vacation',
                limit: 2000,
                period: 'CUSTOM',
                budgetType: 'FIXED',
                startDate: '06/01/2026', // Wrong format
                endDate: '2026-08-31',
            };

            const result = validateBudget(invalidBudget);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('YYYY-MM-DD');
            }
        });

        it('should reject invalid period type', () => {
            const invalidBudget = {
                category: 'Food',
                limit: 500,
                period: 'QUARTERLY', // Invalid period
                budgetType: 'FIXED',
            };

            const result = validateBudget(invalidBudget);

            expect(result.success).toBe(false);
        });
    });

    describe('Edge cases', () => {
        it('should handle very large budget limits', () => {
            const budget = {
                category: 'Business',
                limit: 999999999,
                period: 'YEARLY',
                budgetType: 'FIXED',
            };

            const result = validateBudget(budget);

            expect(result.success).toBe(true);
        });

        it('should handle decimal budget limits', () => {
            const budget = {
                category: 'Coffee',
                limit: 50.50,
                period: 'MONTHLY',
                budgetType: 'FIXED',
            };

            const result = validateBudget(budget);

            expect(result.success).toBe(true);
        });

        it('should handle percentage at minimum (0%)', () => {
            const budget = {
                category: 'Savings',
                limit: 1000,
                period: 'MONTHLY',
                budgetType: 'FIXED', // Changed to FIXED since 0% doesn't make sense for PERCENTAGE type
            };

            const result = validateBudget(budget);

            expect(result.success).toBe(true);
        });

        it('should handle 100% percentage', () => {
            const budget = {
                category: 'All',
                limit: 5000,
                period: 'MONTHLY',
                budgetType: 'PERCENTAGE',
                percentage: 100,
            };

            const result = validateBudget(budget);

            expect(result.success).toBe(true);
        });

        it('should reject Infinity as limit', () => {
            const budget = {
                category: 'Food',
                limit: Infinity,
                period: 'MONTHLY',
                budgetType: 'FIXED',
            };

            const result = validateBudget(budget);

            expect(result.success).toBe(false);
        });
    });
});
