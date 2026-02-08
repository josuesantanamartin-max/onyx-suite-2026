import { vi } from 'vitest';

/**
 * Creates a complete Supabase mock chain that supports all common operations
 */
export function createSupabaseMock() {
    const createChain = (finalValue: any = { data: null, error: null }) => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        like: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        containedBy: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        match: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(finalValue),
        maybeSingle: vi.fn().mockResolvedValue(finalValue),
        then: vi.fn((resolve) => resolve(finalValue)),
    });

    return {
        from: vi.fn(() => createChain()),
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            signIn: vi.fn().mockResolvedValue({ data: null, error: null }),
            signOut: vi.fn().mockResolvedValue({ error: null }),
            signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn().mockResolvedValue({ data: null, error: null }),
                download: vi.fn().mockResolvedValue({ data: null, error: null }),
                remove: vi.fn().mockResolvedValue({ data: null, error: null }),
                list: vi.fn().mockResolvedValue({ data: [], error: null }),
                getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/image.jpg' } })),
            })),
        },
    };
}

/**
 * Mock store for testing React components
 */
export function createMockStore<T>(initialState: Partial<T> = {}) {
    return vi.fn(() => initialState);
}

/**
 * Creates a mock for useFinanceStore
 */
export function createFinanceStoreMock(overrides = {}) {
    return {
        transactions: [],
        accounts: [],
        budgets: [],
        goals: [],
        debts: [],
        totalIncome: 0,
        totalExpenses: 0,
        addTransaction: vi.fn(),
        updateTransaction: vi.fn(),
        deleteTransaction: vi.fn(),
        addAccount: vi.fn(),
        updateAccount: vi.fn(),
        deleteAccount: vi.fn(),
        addBudget: vi.fn(),
        updateBudget: vi.fn(),
        deleteBudget: vi.fn(),
        addGoal: vi.fn(),
        updateGoal: vi.fn(),
        deleteGoal: vi.fn(),
        addDebt: vi.fn(),
        updateDebt: vi.fn(),
        deleteDebt: vi.fn(),
        ...overrides,
    };
}

/**
 * Creates a mock for useLifeStore
 */
export function createLifeStoreMock(overrides = {}) {
    return {
        recipes: [],
        weeklyPlans: [],
        pantry: [],
        shoppingList: [],
        trips: [],
        addRecipe: vi.fn(),
        updateRecipe: vi.fn(),
        deleteRecipe: vi.fn(),
        setWeeklyPlans: vi.fn(),
        addPantryItem: vi.fn(),
        updatePantryItem: vi.fn(),
        deletePantryItem: vi.fn(),
        setShoppingList: vi.fn(),
        addTrip: vi.fn(),
        updateTrip: vi.fn(),
        deleteTrip: vi.fn(),
        ...overrides,
    };
}

/**
 * Creates a mock for useUserStore
 */
export function createUserStoreMock(overrides = {}) {
    return {
        user: { id: 'test-user-id', email: 'test@example.com' },
        language: 'ES',
        theme: 'light',
        setUser: vi.fn(),
        setLanguage: vi.fn(),
        setTheme: vi.fn(),
        logout: vi.fn(),
        ...overrides,
    };
}
