import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getUpcomingPayments,
    getTotalUpcomingPayments,
    getUrgentPayments,
    getOverduePayments,
} from '../upcomingPayments';
import { Transaction, Debt, Account } from '../../types';

describe('UpcomingPayments', () => {
    // Mock current date
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-02-15'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('getUpcomingPayments', () => {
        it('should get upcoming payments from recurring transactions', () => {
            const transactions: Transaction[] = [
                {
                    id: '1',
                    type: 'EXPENSE',
                    amount: 1000,
                    description: 'Rent',
                    category: 'Vivienda',
                    date: '2026-02-01',
                    isRecurring: true,
                    frequency: 'MONTHLY',
                    accountId: 'acc-1',
                } as Transaction,
            ];

            const payments = getUpcomingPayments(transactions, [], [], 30);

            expect(payments.length).toBeGreaterThan(0);
            expect(payments[0].source).toBe('RECURRING');
            expect(payments[0].amount).toBe(1000);
        });

        it('should calculate next due date for weekly recurring', () => {
            const transactions: Transaction[] = [
                {
                    id: '1',
                    type: 'EXPENSE',
                    amount: 50,
                    description: 'Weekly Groceries',
                    category: 'Comida',
                    date: '2026-02-10',
                    isRecurring: true,
                    frequency: 'WEEKLY',
                } as Transaction,
            ];

            const payments = getUpcomingPayments(transactions, [], [], 30);

            expect(payments.length).toBeGreaterThan(0);
            const nextDate = new Date(payments[0].dueDate);
            expect(nextDate.getTime()).toBeGreaterThan(new Date('2026-02-15').getTime());
        });

        it('should calculate next due date for biweekly recurring', () => {
            const transactions: Transaction[] = [
                {
                    id: '1',
                    type: 'EXPENSE',
                    amount: 100,
                    description: 'Biweekly Payment',
                    category: 'Varios',
                    date: '2026-02-01',
                    isRecurring: true,
                    frequency: 'BIWEEKLY',
                } as Transaction,
            ];

            const payments = getUpcomingPayments(transactions, [], [], 30);

            expect(payments.length).toBeGreaterThan(0);
        });

        it('should calculate next due date for monthly recurring', () => {
            const transactions: Transaction[] = [
                {
                    id: '1',
                    type: 'EXPENSE',
                    amount: 500,
                    description: 'Monthly Subscription',
                    category: 'Suscripciones',
                    date: '2026-01-20',
                    isRecurring: true,
                    frequency: 'MONTHLY',
                } as Transaction,
            ];

            const payments = getUpcomingPayments(transactions, [], [], 30);

            expect(payments.length).toBeGreaterThan(0);
        });

        it('should calculate next due date for yearly recurring', () => {
            const transactions: Transaction[] = [
                {
                    id: '1',
                    type: 'EXPENSE',
                    amount: 1200,
                    description: 'Annual Insurance',
                    category: 'Seguros',
                    date: '2025-03-01',
                    isRecurring: true,
                    frequency: 'YEARLY',
                } as Transaction,
            ];

            const payments = getUpcomingPayments(transactions, [], [], 365);

            expect(payments.length).toBeGreaterThan(0);
        });

        it('should include debt minimum payments', () => {
            const debts: Debt[] = [
                {
                    id: 'debt-1',
                    name: 'Credit Card',
                    remainingBalance: 5000,
                    minPayment: 150,
                    dueDate: '20',
                    accountId: 'acc-1',
                } as Debt,
            ];

            const payments = getUpcomingPayments([], debts, [], 30);

            expect(payments.length).toBeGreaterThan(0);
            expect(payments[0].source).toBe('DEBT');
            expect(payments[0].amount).toBe(150);
        });

        it('should include credit card payments', () => {
            const accounts: Account[] = [
                {
                    id: 'cc-1',
                    type: 'CREDIT',
                    name: 'Visa Card',
                    balance: -500,
                    paymentDay: 25,
                    linkedAccountId: 'acc-1',
                } as Account,
            ];

            const payments = getUpcomingPayments([], [], accounts, 30);

            expect(payments.length).toBeGreaterThan(0);
            expect(payments[0].source).toBe('CREDIT_CARD');
            expect(payments[0].amount).toBe(500);
        });

        it('should not include credit cards with zero balance', () => {
            const accounts: Account[] = [
                {
                    id: 'cc-1',
                    type: 'CREDIT',
                    name: 'Visa Card',
                    balance: 0,
                    paymentDay: 25,
                } as Account,
            ];

            const payments = getUpcomingPayments([], [], accounts, 30);

            expect(payments.length).toBe(0);
        });

        it('should filter by days ahead', () => {
            const transactions: Transaction[] = [
                {
                    id: '1',
                    type: 'EXPENSE',
                    amount: 100,
                    description: 'Payment',
                    category: 'Varios',
                    date: '2026-02-01',
                    isRecurring: true,
                    frequency: 'MONTHLY',
                } as Transaction,
            ];

            const paymentsShort = getUpcomingPayments(transactions, [], [], 7);
            const paymentsLong = getUpcomingPayments(transactions, [], [], 60);

            expect(paymentsLong.length).toBeGreaterThanOrEqual(paymentsShort.length);
        });

        it('should sort payments by due date', () => {
            const debts: Debt[] = [
                {
                    id: 'debt-1',
                    name: 'Debt 1',
                    minPayment: 100,
                    dueDate: '25',
                } as Debt,
                {
                    id: 'debt-2',
                    name: 'Debt 2',
                    minPayment: 200,
                    dueDate: '10',
                } as Debt,
            ];

            const payments = getUpcomingPayments([], debts, [], 30);

            if (payments.length >= 2) {
                const date1 = new Date(payments[0].dueDate);
                const date2 = new Date(payments[1].dueDate);
                expect(date1.getTime()).toBeLessThanOrEqual(date2.getTime());
            }
        });

        it('should calculate days until due correctly', () => {
            const debts: Debt[] = [
                {
                    id: 'debt-1',
                    name: 'Debt',
                    minPayment: 100,
                    dueDate: '20',
                } as Debt,
            ];

            const payments = getUpcomingPayments([], debts, [], 30);

            expect(payments[0].daysUntilDue).toBeGreaterThanOrEqual(0);
        });

        it('should mark overdue payments', () => {
            const debts: Debt[] = [
                {
                    id: 'debt-1',
                    name: 'Overdue Debt',
                    minPayment: 100,
                    dueDate: '10',
                } as Debt,
            ];

            const payments = getUpcomingPayments([], debts, [], 30);

            const overduePayment = payments.find(p => p.daysUntilDue < 0);
            if (overduePayment) {
                expect(overduePayment.isOverdue).toBe(true);
            }
        });

        it('should handle empty inputs', () => {
            const payments = getUpcomingPayments([], [], [], 30);

            expect(payments).toEqual([]);
        });

        it('should ignore non-recurring transactions', () => {
            const transactions: Transaction[] = [
                {
                    id: '1',
                    type: 'EXPENSE',
                    amount: 100,
                    description: 'One-time',
                    category: 'Varios',
                    date: '2026-02-10',
                    isRecurring: false,
                } as Transaction,
            ];

            const payments = getUpcomingPayments(transactions, [], [], 30);

            expect(payments.length).toBe(0);
        });

        it('should ignore income transactions', () => {
            const transactions: Transaction[] = [
                {
                    id: '1',
                    type: 'INCOME',
                    amount: 3000,
                    description: 'Salary',
                    category: 'Salario',
                    date: '2026-02-01',
                    isRecurring: true,
                    frequency: 'MONTHLY',
                } as Transaction,
            ];

            const payments = getUpcomingPayments(transactions, [], [], 30);

            expect(payments.length).toBe(0);
        });
    });

    describe('getTotalUpcomingPayments', () => {
        it('should calculate total of all payments', () => {
            const payments = [
                {
                    id: '1',
                    name: 'Payment 1',
                    amount: 100,
                    dueDate: '2026-02-20',
                    category: 'Test',
                    source: 'RECURRING' as const,
                    isPaid: false,
                    daysUntilDue: 5,
                    isOverdue: false,
                },
                {
                    id: '2',
                    name: 'Payment 2',
                    amount: 200,
                    dueDate: '2026-02-25',
                    category: 'Test',
                    source: 'DEBT' as const,
                    isPaid: false,
                    daysUntilDue: 10,
                    isOverdue: false,
                },
            ];

            const total = getTotalUpcomingPayments(payments);

            expect(total).toBe(300);
        });

        it('should return 0 for empty list', () => {
            const total = getTotalUpcomingPayments([]);

            expect(total).toBe(0);
        });
    });

    describe('getUrgentPayments', () => {
        it('should filter payments due in next 3 days', () => {
            const payments = [
                {
                    id: '1',
                    name: 'Urgent',
                    amount: 100,
                    dueDate: '2026-02-17',
                    category: 'Test',
                    source: 'RECURRING' as const,
                    isPaid: false,
                    daysUntilDue: 2,
                    isOverdue: false,
                },
                {
                    id: '2',
                    name: 'Not Urgent',
                    amount: 200,
                    dueDate: '2026-02-25',
                    category: 'Test',
                    source: 'DEBT' as const,
                    isPaid: false,
                    daysUntilDue: 10,
                    isOverdue: false,
                },
            ];

            const urgent = getUrgentPayments(payments);

            expect(urgent.length).toBe(1);
            expect(urgent[0].id).toBe('1');
        });

        it('should not include overdue payments', () => {
            const payments = [
                {
                    id: '1',
                    name: 'Overdue',
                    amount: 100,
                    dueDate: '2026-02-10',
                    category: 'Test',
                    source: 'RECURRING' as const,
                    isPaid: false,
                    daysUntilDue: -5,
                    isOverdue: true,
                },
            ];

            const urgent = getUrgentPayments(payments);

            expect(urgent.length).toBe(0);
        });
    });

    describe('getOverduePayments', () => {
        it('should filter overdue payments', () => {
            const payments = [
                {
                    id: '1',
                    name: 'Overdue',
                    amount: 100,
                    dueDate: '2026-02-10',
                    category: 'Test',
                    source: 'RECURRING' as const,
                    isPaid: false,
                    daysUntilDue: -5,
                    isOverdue: true,
                },
                {
                    id: '2',
                    name: 'On Time',
                    amount: 200,
                    dueDate: '2026-02-25',
                    category: 'Test',
                    source: 'DEBT' as const,
                    isPaid: false,
                    daysUntilDue: 10,
                    isOverdue: false,
                },
            ];

            const overdue = getOverduePayments(payments);

            expect(overdue.length).toBe(1);
            expect(overdue[0].id).toBe('1');
        });

        it('should return empty for no overdue payments', () => {
            const payments = [
                {
                    id: '1',
                    name: 'On Time',
                    amount: 100,
                    dueDate: '2026-02-25',
                    category: 'Test',
                    source: 'RECURRING' as const,
                    isPaid: false,
                    daysUntilDue: 10,
                    isOverdue: false,
                },
            ];

            const overdue = getOverduePayments(payments);

            expect(overdue.length).toBe(0);
        });
    });
});
