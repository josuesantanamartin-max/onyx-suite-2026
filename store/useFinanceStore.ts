import { create } from 'zustand';
import { syncService } from '../services/syncService';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction, Account, Budget, Goal, Debt, CategoryStructure, DashboardWidget } from '../types';
import { INITIAL_CATEGORIES } from '../constants';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_BUDGETS, MOCK_GOALS, MOCK_DEBTS, DEFAULT_FINANCE_WIDGETS } from '../data/seeds/financeSeed';

interface FinanceState {
    transactions: Transaction[];
    accounts: Account[];
    budgets: Budget[];
    goals: Goal[];
    debts: Debt[];
    categories: CategoryStructure[];
    widgets: DashboardWidget[];
    currency: 'EUR' | 'USD' | 'GBP';
}

interface FinanceActions {
    setTransactions: (updater: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
    setAccounts: (updater: Account[] | ((prev: Account[]) => Account[])) => void;
    setBudgets: (updater: Budget[] | ((prev: Budget[]) => Budget[])) => void;
    setGoals: (updater: Goal[] | ((prev: Goal[]) => Goal[])) => void;
    setDebts: (updater: Debt[] | ((prev: Debt[]) => Debt[])) => void;
    setCategories: (updater: CategoryStructure[] | ((prev: CategoryStructure[]) => CategoryStructure[])) => void;
    setWidgets: (updater: DashboardWidget[] | ((prev: DashboardWidget[]) => DashboardWidget[])) => void;
    setCurrency: (currency: 'EUR' | 'USD' | 'GBP') => void;

    // Shortcuts for common operations to reduce logic in components
    addTransaction: (transaction: Transaction) => Promise<void>;
    updateAccountBalance: (accountId: string, amount: number) => Promise<void>;
    loadFromCloud: () => Promise<void>;
}

export const useFinanceStore = create<FinanceState & FinanceActions>()(
    persist(
        (set) => ({
            transactions: MOCK_TRANSACTIONS,
            accounts: MOCK_ACCOUNTS,
            budgets: MOCK_BUDGETS,
            goals: MOCK_GOALS,
            debts: MOCK_DEBTS,
            categories: INITIAL_CATEGORIES,
            widgets: DEFAULT_FINANCE_WIDGETS,
            currency: 'EUR',

            setTransactions: (updater) => set((state) => ({
                transactions: typeof updater === 'function' ? updater(state.transactions) : updater
            })),
            setAccounts: (updater) => set((state) => ({
                accounts: typeof updater === 'function' ? updater(state.accounts) : updater
            })),
            setBudgets: (updater) => set((state) => ({
                budgets: typeof updater === 'function' ? updater(state.budgets) : updater
            })),
            setGoals: (updater) => set((state) => ({
                goals: typeof updater === 'function' ? updater(state.goals) : updater
            })),
            setDebts: (updater) => set((state) => ({
                debts: typeof updater === 'function' ? updater(state.debts) : updater
            })),
            setCategories: (updater) => set((state) => ({
                categories: typeof updater === 'function' ? updater(state.categories) : updater
            })),
            setWidgets: (updater) => set((state) => ({
                widgets: typeof updater === 'function' ? updater(state.widgets) : updater
            })),
            setCurrency: (currency) => set({ currency }),

            addTransaction: async (tx) => {
                set((state) => ({ transactions: [tx, ...state.transactions] }));
                try {
                    await syncService.saveTransaction(tx);
                } catch (e) {
                    console.error("Failed to sync transaction:", e);
                }
            },
            updateAccountBalance: async (accountId, amount) => {
                set((state) => {
                    const updatedAccounts = state.accounts.map(acc =>
                        acc.id === accountId ? { ...acc, balance: acc.balance + amount } : acc
                    );
                    const updatedAccount = updatedAccounts.find(a => a.id === accountId);
                    if (updatedAccount) {
                        syncService.saveAccount(updatedAccount).catch(e => console.error("Failed to sync account:", e));
                    }
                    return { accounts: updatedAccounts };
                });
            },
            loadFromCloud: async () => {
                try {
                    const [accounts, transactions, budgets, goals, debts] = await Promise.all([
                        syncService.fetchAccounts(),
                        syncService.fetchTransactions(),
                        syncService.fetchBudgets(),
                        syncService.fetchGoals(),
                        syncService.fetchDebts(),
                    ]);

                    if (accounts.length > 0) set({ accounts });
                    if (transactions.length > 0) set({ transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) });
                    if (budgets.length > 0) set({ budgets });
                    if (goals.length > 0) set({ goals });
                    if (debts.length > 0) set({ debts });
                } catch (e) {
                    console.error("Failed to load from cloud:", e);
                }
            }
        }),
        {
            name: 'onyx_finance_store',
            storage: createJSONStorage(() => localStorage), // Explicitly use localStorage
        }
    )
);
