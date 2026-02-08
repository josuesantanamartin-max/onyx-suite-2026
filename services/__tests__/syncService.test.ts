import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncService } from '../syncService';
import { supabase } from '../supabaseClient';

// Mock Supabase client - must be inline due to vi.mock hoisting
vi.mock('../supabaseClient', () => {
    const createChain = (finalValue: any = { data: null, error: null }) => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(finalValue),
        then: vi.fn((resolve) => resolve(finalValue)),
    });

    return {
        supabase: {
            from: vi.fn(() => createChain()),
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
            },
        },
    };
});

describe('SyncService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchTransactions', () => {
        it('should fetch transactions from Supabase', async () => {
            const mockTransactions = [
                { id: '1', description: 'Test', amount: 100, date: '2026-01-01' },
            ];

            const mockFrom = vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: mockTransactions, error: null }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await syncService.fetchTransactions();

            expect(mockFrom).toHaveBeenCalledWith('transactions');
            expect(result).toEqual(mockTransactions);
        });

        it('should return empty array on error', async () => {
            const mockFrom = vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await syncService.fetchTransactions();

            expect(result).toEqual([]);
        });
    });

    describe('saveTransaction', () => {
        it('should save transaction to Supabase', async () => {
            const mockTransaction = {
                id: '1',
                description: 'Test Transaction',
                amount: 100,
                date: '2026-01-01',
                category: 'Food',
                accountId: 'acc1',
                type: 'EXPENSE' as const,
            };

            const mockFrom = vi.fn(() => ({
                upsert: vi.fn().mockResolvedValue({ data: mockTransaction, error: null }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await syncService.saveTransaction(mockTransaction);

            expect(mockFrom).toHaveBeenCalledWith('transactions');
            expect(result).toBe(true);
        });

        it('should handle save errors gracefully', async () => {
            const mockTransaction = {
                id: '1',
                description: 'Test',
                amount: 100,
                date: '2026-01-01',
                category: 'Food',
                accountId: 'acc1',
                type: 'EXPENSE' as const,
            };

            const mockFrom = vi.fn(() => ({
                upsert: vi.fn().mockResolvedValue({ data: null, error: new Error('Save failed') }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await syncService.saveTransaction(mockTransaction);

            expect(result).toBe(false);
        });
    });

    describe('fetchBudgets', () => {
        it('should fetch budgets from Supabase', async () => {
            const mockBudgets = [
                { id: '1', category: 'Food', limit: 500, period: 'monthly' },
            ];

            const mockFrom = vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: mockBudgets, error: null }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await syncService.fetchBudgets();

            expect(mockFrom).toHaveBeenCalledWith('budgets');
            expect(result).toEqual(mockBudgets);
        });
    });

    describe('saveBudget', () => {
        it('should save budget to Supabase', async () => {
            const mockBudget = {
                id: '1',
                category: 'Food',
                limit: 500,
                period: 'MONTHLY' as const,
                budgetType: 'FIXED' as const,
            };

            const mockFrom = vi.fn(() => ({
                upsert: vi.fn().mockResolvedValue({ data: mockBudget, error: null }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await syncService.saveBudget(mockBudget);

            expect(result).toBe(true);
        });
    });

    describe('fetchRecipes', () => {
        it('should fetch recipes from Supabase', async () => {
            const mockRecipes = [
                { id: '1', name: 'Pasta', ingredients: [], steps: [] },
            ];

            const mockFrom = vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: mockRecipes, error: null }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await syncService.fetchRecipes();

            expect(mockFrom).toHaveBeenCalledWith('recipes');
            expect(result).toEqual(mockRecipes);
        });
    });

    describe('saveRecipe', () => {
        it('should save recipe to Supabase', async () => {
            const mockRecipe = {
                id: '1',
                name: 'Test Recipe',
                ingredients: [],
                instructions: [],
                prepTime: 30,
                calories: 300,
                tags: ['test'],
                rating: 0,
                baseServings: 4,
            };

            const mockFrom = vi.fn(() => ({
                upsert: vi.fn().mockResolvedValue({ data: mockRecipe, error: null }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await syncService.saveRecipe(mockRecipe);

            expect(result).toBe(true);
        });
    });

    describe('syncAllFromCloud', () => {
        it('should sync all data from Supabase', async () => {
            const mockData = {
                accounts: [],
                transactions: [],
                budgets: [],
                goals: [],
                debts: [],
                pantry: [],
                recipes: [],
                shoppingList: [],
                weeklyPlan: [],
                familyMembers: [],
            };

            // Mock all fetch methods
            vi.spyOn(syncService, 'fetchAccounts').mockResolvedValue([]);
            vi.spyOn(syncService, 'fetchTransactions').mockResolvedValue([]);
            vi.spyOn(syncService, 'fetchBudgets').mockResolvedValue([]);
            vi.spyOn(syncService, 'fetchGoals').mockResolvedValue([]);
            vi.spyOn(syncService, 'fetchDebts').mockResolvedValue([]);
            vi.spyOn(syncService, 'fetchPantry').mockResolvedValue([]);
            vi.spyOn(syncService, 'fetchRecipes').mockResolvedValue([]);
            vi.spyOn(syncService, 'fetchShoppingList').mockResolvedValue([]);
            vi.spyOn(syncService, 'fetchWeeklyPlan').mockResolvedValue([]);
            vi.spyOn(syncService, 'fetchFamilyMembers').mockResolvedValue([]);

            const result = await syncService.syncAllFromCloud();

            expect(result).toEqual(mockData);
        });
    });
});
