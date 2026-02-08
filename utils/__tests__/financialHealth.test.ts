import { describe, it, expect } from 'vitest';
import { calculateFinancialHealth, getHealthScoreColor, getHealthLevelText } from '../financialHealth';
import { Transaction, Account, Debt, Budget } from '../../types';

describe('FinancialHealth', () => {
    const selectedDate = new Date('2026-02-15');

    describe('calculateFinancialHealth', () => {
        it('should calculate excellent financial health', () => {
            const transactions: Transaction[] = [
                { id: '1', type: 'INCOME', category: 'Salario', amount: 5000, date: '2026-02-10', description: 'Salary' } as Transaction,
                { id: '2', type: 'EXPENSE', category: 'Vivienda', amount: 1000, date: '2026-02-12', description: 'Rent' } as Transaction,
            ];

            const accounts: Account[] = [
                { id: '1', type: 'BANK', balance: 50000, name: 'Savings' } as Account,
            ];

            const debts: Debt[] = [];
            const budgets: Budget[] = [
                { id: '1', category: 'Vivienda', limit: 1200, period: 'MONTHLY' } as Budget,
            ];

            const result = calculateFinancialHealth(transactions, accounts, debts, budgets, selectedDate);

            expect(result.score).toBeGreaterThan(70);
            expect(result.level).toBe('EXCELLENT');
            expect(result.breakdown.savingsRatio.score).toBeGreaterThan(0);
            expect(result.recommendations).toBeDefined();
        });

        it('should calculate poor financial health with high debt', () => {
            const transactions: Transaction[] = [
                { id: '1', type: 'INCOME', category: 'Salario', amount: 2000, date: '2026-02-10' } as Transaction,
                { id: '2', type: 'EXPENSE', category: 'Vivienda', amount: 1800, date: '2026-02-12' } as Transaction,
            ];

            const accounts: Account[] = [
                { id: '1', type: 'BANK', balance: 5000 } as Account,
            ];

            const debts: Debt[] = [
                { id: '1', remainingBalance: 50000, name: 'Mortgage' } as Debt,
            ];

            const budgets: Budget[] = [];

            const result = calculateFinancialHealth(transactions, accounts, debts, budgets, selectedDate);

            expect(result.score).toBeLessThan(60);
            expect(result.breakdown.debtRatio.score).toBeLessThan(15);
        });

        it('should handle zero income scenario', () => {
            const transactions: Transaction[] = [
                { id: '1', type: 'EXPENSE', category: 'Vivienda', amount: 1000, date: '2026-02-10' } as Transaction,
            ];

            const accounts: Account[] = [
                { id: '1', type: 'BANK', balance: 10000 } as Account,
            ];

            const result = calculateFinancialHealth(transactions, accounts, [], [], selectedDate);

            expect(result.breakdown.savingsRatio.value).toBe(0);
            expect(result.score).toBeLessThan(50);
        });

        it('should calculate savings ratio correctly', () => {
            const transactions: Transaction[] = [
                { id: '1', type: 'INCOME', category: 'Salario', amount: 3000, date: '2026-02-10' } as Transaction,
                { id: '2', type: 'EXPENSE', category: 'Comida', amount: 600, date: '2026-02-12' } as Transaction,
                { id: '3', type: 'EXPENSE', category: 'Transporte', amount: 300, date: '2026-02-14' } as Transaction,
            ];

            const result = calculateFinancialHealth(transactions, [], [], [], selectedDate);

            // Savings = 3000 - 900 = 2100
            // Ratio = 2100 / 3000 = 0.70 (70%)
            expect(result.breakdown.savingsRatio.value).toBeCloseTo(0.70, 2);
            expect(result.breakdown.savingsRatio.score).toBe(30); // Excellent: 30%+ savings
        });

        it('should exclude transfers from income/expense calculations', () => {
            const transactions: Transaction[] = [
                { id: '1', type: 'INCOME', category: 'Salario', amount: 3000, date: '2026-02-10' } as Transaction,
                { id: '2', type: 'INCOME', category: 'Transferencia', amount: 1000, date: '2026-02-11' } as Transaction,
                { id: '3', type: 'EXPENSE', category: 'Comida', amount: 500, date: '2026-02-12' } as Transaction,
                { id: '4', type: 'EXPENSE', category: 'Transferencia', amount: 1000, date: '2026-02-13' } as Transaction,
            ];

            const result = calculateFinancialHealth(transactions, [], [], [], selectedDate);

            // Should only count: Income 3000, Expense 500
            // Savings ratio = (3000 - 500) / 3000 = 0.833
            expect(result.breakdown.savingsRatio.value).toBeCloseTo(0.833, 2);
        });

        it('should calculate debt ratio correctly', () => {
            const accounts: Account[] = [
                { id: '1', type: 'BANK', balance: 20000 } as Account,
            ];

            const debts: Debt[] = [
                { id: '1', remainingBalance: 5000 } as Debt,
                { id: '2', remainingBalance: 3000 } as Debt,
            ];

            const result = calculateFinancialHealth([], accounts, debts, [], selectedDate);

            // Net worth = 20000 - 8000 = 12000
            // Debt ratio = 8000 / 12000 = 0.667
            expect(result.breakdown.debtRatio.value).toBeCloseTo(0.667, 2);
        });

        it('should calculate emergency fund correctly', () => {
            const transactions: Transaction[] = [
                { id: '1', type: 'EXPENSE', category: 'Vivienda', amount: 1000, date: '2026-02-10' } as Transaction,
                { id: '2', type: 'EXPENSE', category: 'Comida', amount: 500, date: '2026-02-12' } as Transaction,
            ];

            const accounts: Account[] = [
                { id: '1', type: 'BANK', balance: 9000 } as Account,
            ];

            const result = calculateFinancialHealth(transactions, accounts, [], [], selectedDate);

            // Monthly expenses = 1500
            // Emergency target = 1500 * 6 = 9000
            // Emergency fund value = 9000 / 9000 = 1.0 (6 months)
            expect(result.breakdown.emergencyFund.value).toBeCloseTo(1.0, 1);
            expect(result.breakdown.emergencyFund.score).toBe(20);
        });

        it('should calculate budget compliance correctly', () => {
            const transactions: Transaction[] = [
                { id: '1', type: 'EXPENSE', category: 'Comida', amount: 400, date: '2026-02-10' } as Transaction,
                { id: '2', type: 'EXPENSE', category: 'Transporte', amount: 150, date: '2026-02-12' } as Transaction,
                { id: '3', type: 'EXPENSE', category: 'Ocio', amount: 250, date: '2026-02-14' } as Transaction,
            ];

            const budgets: Budget[] = [
                { id: '1', category: 'Comida', limit: 500, period: 'MONTHLY' } as Budget,
                { id: '2', category: 'Transporte', limit: 200, period: 'MONTHLY' } as Budget,
                { id: '3', category: 'Ocio', limit: 200, period: 'MONTHLY' } as Budget,
            ];

            const result = calculateFinancialHealth(transactions, [], [], budgets, selectedDate);

            // 2 out of 3 budgets compliant (Comida, Transporte)
            // Compliance = 2/3 = 0.667
            expect(result.breakdown.budgetCompliance.value).toBeCloseTo(0.667, 2);
        });

        it('should handle no budgets scenario', () => {
            const result = calculateFinancialHealth([], [], [], [], selectedDate);

            expect(result.breakdown.budgetCompliance.score).toBe(10); // Default score
            expect(result.recommendations.some(r => r.includes('presupuestos'))).toBe(true);
        });

        it('should calculate income diversification', () => {
            const transactions: Transaction[] = [
                { id: '1', type: 'INCOME', category: 'Salario', amount: 2000, date: '2026-02-10' } as Transaction,
                { id: '2', type: 'INCOME', category: 'Freelance', amount: 500, date: '2026-02-12' } as Transaction,
                { id: '3', type: 'INCOME', category: 'Inversiones', amount: 100, date: '2026-02-14' } as Transaction,
            ];

            const result = calculateFinancialHealth(transactions, [], [], [], selectedDate);

            // 3 income sources
            expect(result.breakdown.diversification.value).toBe(3);
            expect(result.breakdown.diversification.score).toBe(10);
        });

        it('should provide recommendations for low savings', () => {
            const transactions: Transaction[] = [
                { id: '1', type: 'INCOME', category: 'Salario', amount: 2000, date: '2026-02-10' } as Transaction,
                { id: '2', type: 'EXPENSE', category: 'Varios', amount: 1900, date: '2026-02-12' } as Transaction,
            ];

            const result = calculateFinancialHealth(transactions, [], [], [], selectedDate);

            expect(result.recommendations.some(r => r.includes('ahorrar'))).toBe(true);
        });

        it('should provide recommendations for high debt', () => {
            const accounts: Account[] = [{ id: '1', type: 'BANK', balance: 10000 } as Account];
            const debts: Debt[] = [{ id: '1', remainingBalance: 8000 } as Debt];

            const result = calculateFinancialHealth([], accounts, debts, [], selectedDate);

            expect(result.recommendations.some(r => r.includes('deuda'))).toBe(true);
        });

        it('should provide recommendations for low emergency fund', () => {
            const transactions: Transaction[] = [
                { id: '1', type: 'EXPENSE', category: 'Varios', amount: 2000, date: '2026-02-10' } as Transaction,
            ];

            const accounts: Account[] = [{ id: '1', type: 'BANK', balance: 2000 } as Account];

            const result = calculateFinancialHealth(transactions, accounts, [], [], selectedDate);

            expect(result.recommendations.some(r => r.includes('emergencia'))).toBe(true);
        });

        it('should limit recommendations to top 3', () => {
            const result = calculateFinancialHealth([], [], [], [], selectedDate);

            expect(result.recommendations.length).toBeLessThanOrEqual(3);
        });
    });

    describe('getHealthScoreColor', () => {
        it('should return green for excellent scores', () => {
            expect(getHealthScoreColor(85)).toBe('#10b981');
            expect(getHealthScoreColor(100)).toBe('#10b981');
        });

        it('should return blue for good scores', () => {
            expect(getHealthScoreColor(70)).toBe('#3b82f6');
            expect(getHealthScoreColor(60)).toBe('#3b82f6');
        });

        it('should return amber for fair scores', () => {
            expect(getHealthScoreColor(50)).toBe('#f59e0b');
            expect(getHealthScoreColor(40)).toBe('#f59e0b');
        });

        it('should return red for poor scores', () => {
            expect(getHealthScoreColor(30)).toBe('#ef4444');
            expect(getHealthScoreColor(0)).toBe('#ef4444');
        });
    });

    describe('getHealthLevelText', () => {
        it('should return correct Spanish text for each level', () => {
            expect(getHealthLevelText('EXCELLENT')).toBe('Excelente');
            expect(getHealthLevelText('GOOD')).toBe('Buena');
            expect(getHealthLevelText('FAIR')).toBe('Regular');
            expect(getHealthLevelText('POOR')).toBe('Necesita Mejora');
        });

        it('should handle unknown levels', () => {
            expect(getHealthLevelText('UNKNOWN')).toBe('Desconocido');
        });
    });
});
