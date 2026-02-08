import { describe, it, expect, beforeEach } from 'vitest';
import { useFinanceStore } from '../useFinanceStore';
import type { Transaction, Account, Budget } from '../../types';

describe('useFinanceStore', () => {
    beforeEach(() => {
        // Reset store to initial state
        useFinanceStore.setState({
            transactions: [],
            accounts: [],
            budgets: [],
            goals: [],
            debts: [],
            categories: []
        });
    });

    describe('Transactions', () => {
        it('should add a transaction', () => {
            const transaction: Transaction = {
                id: 't1',
                date: new Date().toISOString(),
                description: 'Test Purchase',
                amount: 100,
                type: 'EXPENSE',
                category: 'Shopping',
                subCategory: 'Clothes',
                accountId: 'acc1'
            };

            useFinanceStore.getState().addTransaction(transaction);

            const transactions = useFinanceStore.getState().transactions;
            expect(transactions).toHaveLength(1);
            expect(transactions[0]).toEqual(transaction);
        });

        it('should update a transaction', () => {
            const transaction: Transaction = {
                id: 't1',
                date: new Date().toISOString(),
                description: 'Original',
                amount: 100,
                type: 'EXPENSE',
                category: 'Shopping',
                accountId: 'acc1'
            };

            useFinanceStore.getState().addTransaction(transaction);
            useFinanceStore.getState().updateTransaction('t1', { description: 'Updated', amount: 150 });

            const updated = useFinanceStore.getState().transactions[0];
            expect(updated.description).toBe('Updated');
            expect(updated.amount).toBe(150);
        });

        it('should delete a transaction', () => {
            const transaction: Transaction = {
                id: 't1',
                date: new Date().toISOString(),
                description: 'Test',
                amount: 100,
                type: 'EXPENSE',
                category: 'Shopping',
                accountId: 'acc1'
            };

            useFinanceStore.getState().addTransaction(transaction);
            expect(useFinanceStore.getState().transactions).toHaveLength(1);

            useFinanceStore.getState().deleteTransaction('t1');
            expect(useFinanceStore.getState().transactions).toHaveLength(0);
        });
    });

    describe('Accounts', () => {
        it('should add an account', () => {
            const account: Account = {
                id: 'acc1',
                name: 'Checking Account',
                type: 'BANK',
                balance: 1000,
                currency: 'EUR'
            };

            useFinanceStore.getState().addAccount(account);

            const accounts = useFinanceStore.getState().accounts;
            expect(accounts).toHaveLength(1);
            expect(accounts[0]).toEqual(account);
        });

        it('should update account balance', () => {
            const account: Account = {
                id: 'acc1',
                name: 'Savings',
                type: 'BANK',
                balance: 5000,
                currency: 'EUR'
            };

            useFinanceStore.getState().addAccount(account);
            useFinanceStore.getState().updateAccount('acc1', { balance: 6000 });

            const updated = useFinanceStore.getState().accounts[0];
            expect(updated.balance).toBe(6000);
        });

        it('should calculate total balance across accounts', () => {
            const accounts: Account[] = [
                {
                    id: 'acc1',
                    name: 'Checking',
                    type: 'BANK',
                    balance: 1000,
                    currency: 'EUR'
                },
                {
                    id: 'acc2',
                    name: 'Savings',
                    type: 'INVESTMENT',
                    balance: 5000,
                    currency: 'EUR'
                }
            ];

            accounts.forEach(acc => useFinanceStore.getState().addAccount(acc));

            const total = useFinanceStore.getState().accounts.reduce((sum, acc) => sum + acc.balance, 0);
            expect(total).toBe(6000);
        });
    });

    describe('Budgets', () => {
        it('should add a budget', () => {
            const budget: Budget = {
                id: 'b1',
                category: 'Food',
                limit: 500,
                period: 'MONTHLY',
                budgetType: 'FIXED'
            };

            useFinanceStore.getState().addBudget(budget);

            const budgets = useFinanceStore.getState().budgets;
            expect(budgets).toHaveLength(1);
            expect(budgets[0]).toEqual(budget);
        });

        it('should update budget limit', () => {
            const budget: Budget = {
                id: 'b1',
                category: 'Food',
                limit: 500,
                period: 'MONTHLY',
                budgetType: 'FIXED'
            };

            useFinanceStore.getState().addBudget(budget);
            useFinanceStore.getState().updateBudget('b1', { limit: 600 });

            const updated = useFinanceStore.getState().budgets[0];
            expect(updated.limit).toBe(600);
        });
    });
});
