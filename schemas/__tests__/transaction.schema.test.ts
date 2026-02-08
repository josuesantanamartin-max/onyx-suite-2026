import { describe, it, expect } from 'vitest';
import { transactionSchema, validateTransaction } from '../transaction.schema';

describe('Transaction Schema', () => {
    describe('Valid transactions', () => {
        it('should validate a complete valid transaction', () => {
            const validTransaction = {
                type: 'EXPENSE',
                amount: 100.50,
                date: '2026-01-15',
                category: 'Food',
                subCategory: 'Groceries',
                accountId: 'acc123',
                description: 'Weekly groceries',
                isRecurring: false,
                notes: 'Bought at supermarket',
            };

            const result = validateTransaction(validTransaction);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.amount).toBe(100.50);
                expect(result.data.category).toBe('Food');
            }
        });

        it('should validate transaction with minimal required fields', () => {
            const minimalTransaction = {
                type: 'INCOME',
                amount: 1500,
                date: '2026-01-01',
                category: 'Salary',
                accountId: 'acc456',
                description: 'Monthly salary',
            };

            const result = validateTransaction(minimalTransaction);

            expect(result.success).toBe(true);
        });

        it('should validate recurring transaction', () => {
            const recurringTransaction = {
                type: 'EXPENSE',
                amount: 50,
                date: '2026-01-01',
                category: 'Utilities',
                accountId: 'acc789',
                description: 'Internet bill',
                isRecurring: true,
                frequency: 'MONTHLY',
            };

            const result = validateTransaction(recurringTransaction);

            expect(result.success).toBe(true);
        });
    });

    describe('Invalid transactions', () => {
        it('should reject negative amount', () => {
            const invalidTransaction = {
                type: 'EXPENSE',
                amount: -50,
                date: '2026-01-15',
                category: 'Food',
                accountId: 'acc123',
                description: 'Test',
            };

            const result = validateTransaction(invalidTransaction);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('greater than 0');
            }
        });

        it('should reject zero amount', () => {
            const invalidTransaction = {
                type: 'EXPENSE',
                amount: 0,
                date: '2026-01-15',
                category: 'Food',
                accountId: 'acc123',
                description: 'Test',
            };

            const result = validateTransaction(invalidTransaction);

            expect(result.success).toBe(false);
        });

        it('should reject invalid date format', () => {
            const invalidTransaction = {
                type: 'EXPENSE',
                amount: 100,
                date: '01/15/2026', // Wrong format
                category: 'Food',
                accountId: 'acc123',
                description: 'Test',
            };

            const result = validateTransaction(invalidTransaction);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('YYYY-MM-DD');
            }
        });

        it('should reject empty category', () => {
            const invalidTransaction = {
                type: 'EXPENSE',
                amount: 100,
                date: '2026-01-15',
                category: '',
                accountId: 'acc123',
                description: 'Test',
            };

            const result = validateTransaction(invalidTransaction);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('cannot be empty');
            }
        });

        it('should reject empty description', () => {
            const invalidTransaction = {
                type: 'EXPENSE',
                amount: 100,
                date: '2026-01-15',
                category: 'Food',
                accountId: 'acc123',
                description: '',
            };

            const result = validateTransaction(invalidTransaction);

            expect(result.success).toBe(false);
        });

        it('should reject description over 500 characters', () => {
            const invalidTransaction = {
                type: 'EXPENSE',
                amount: 100,
                date: '2026-01-15',
                category: 'Food',
                accountId: 'acc123',
                description: 'a'.repeat(501),
            };

            const result = validateTransaction(invalidTransaction);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('less than 500');
            }
        });

        it('should reject invalid transaction type', () => {
            const invalidTransaction = {
                type: 'TRANSFER', // Invalid type
                amount: 100,
                date: '2026-01-15',
                category: 'Food',
                accountId: 'acc123',
                description: 'Test',
            };

            const result = validateTransaction(invalidTransaction);

            expect(result.success).toBe(false);
        });

        it('should reject invalid frequency', () => {
            const invalidTransaction = {
                type: 'EXPENSE',
                amount: 100,
                date: '2026-01-15',
                category: 'Food',
                accountId: 'acc123',
                description: 'Test',
                isRecurring: true,
                frequency: 'DAILY', // Invalid frequency
            };

            const result = validateTransaction(invalidTransaction);

            expect(result.success).toBe(false);
        });
    });

    describe('Edge cases', () => {
        it('should handle very large amounts', () => {
            const transaction = {
                type: 'INCOME',
                amount: 999999999.99,
                date: '2026-01-15',
                category: 'Investment',
                accountId: 'acc123',
                description: 'Large investment return',
            };

            const result = validateTransaction(transaction);

            expect(result.success).toBe(true);
        });

        it('should handle decimal amounts correctly', () => {
            const transaction = {
                type: 'EXPENSE',
                amount: 10.99,
                date: '2026-01-15',
                category: 'Food',
                accountId: 'acc123',
                description: 'Coffee',
            };

            const result = validateTransaction(transaction);

            expect(result.success).toBe(true);
        });

        it('should reject Infinity as amount', () => {
            const transaction = {
                type: 'EXPENSE',
                amount: Infinity,
                date: '2026-01-15',
                category: 'Food',
                accountId: 'acc123',
                description: 'Test',
            };

            const result = validateTransaction(transaction);

            expect(result.success).toBe(false);
        });
    });
});
