import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Ingredient, ShoppingItem, Recipe, Trip, FamilyMember, DashboardWidget } from '../types';
import { WeeklyPlan, Chore } from '../types/life';
import { MOCK_PANTRY, MOCK_RECIPES, MOCK_TRIPS, MOCK_FAMILY, DEFAULT_KITCHEN_WIDGETS } from '../data/seeds/lifeSeed';

interface LifeState {
    weeklyPlans: WeeklyPlan[];
    pantryItems: Ingredient[];
    shoppingList: ShoppingItem[];
    recipes: Recipe[];
    trips: Trip[];
    familyMembers: FamilyMember[];
    widgets: DashboardWidget[];
    vaultDocuments: any[];
    homeAssets: any[];
    recipeToOpen: Recipe | null;
}

interface LifeActions {
    setWeeklyPlans: (updater: WeeklyPlan[] | ((prev: WeeklyPlan[]) => WeeklyPlan[])) => void;
    setPantryItems: (updater: Ingredient[] | ((prev: Ingredient[]) => Ingredient[])) => void;
    setShoppingList: (updater: ShoppingItem[] | ((prev: ShoppingItem[]) => ShoppingItem[])) => void;
    setRecipes: (updater: Recipe[] | ((prev: Recipe[]) => Recipe[])) => void;
    setTrips: (updater: Trip[] | ((prev: Trip[]) => Trip[])) => void;
    setFamilyMembers: (updater: FamilyMember[] | ((prev: FamilyMember[]) => FamilyMember[])) => void;
    setWidgets: (updater: DashboardWidget[] | ((prev: DashboardWidget[]) => DashboardWidget[])) => void; // Kitchen widgets
    setVaultDocuments: (updater: any[] | ((prev: any[]) => any[])) => void;
    setHomeAssets: (updater: any[] | ((prev: any[]) => any[])) => void;
    setRecipeToOpen: (recipe: Recipe | null) => void;

    // Helper methods for testing and easier component usage
    addRecipe: (recipe: Recipe) => void;
    updateRecipe: (id: string, updates: Partial<Recipe>) => void;
    deleteRecipe: (id: string) => void;
    addPantryItem: (item: Ingredient) => void;
    updatePantryItem: (id: string, updates: Partial<Ingredient>) => void;
    deletePantryItem: (id: string) => void;
    addShoppingItem: (item: ShoppingItem) => void;
    updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
    deleteShoppingItem: (id: string) => void;
    addWeeklyPlan: (plan: WeeklyPlan) => void;
    updateWeeklyPlan: (id: string, updates: Partial<WeeklyPlan>) => void;
    deleteWeeklyPlan: (id: string) => void;
    addTrip: (trip: Trip) => void;
    updateTrip: (id: string, updates: Partial<Trip>) => void;
    deleteTrip: (id: string) => void;
    addFamilyMember: (member: FamilyMember) => void;
    updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
    deleteFamilyMember: (id: string) => void;
}

export const useLifeStore = create<LifeState & LifeActions>()(
    persist(
        (set) => ({
            weeklyPlans: [],
            pantryItems: MOCK_PANTRY,
            shoppingList: [],
            recipes: MOCK_RECIPES,
            trips: MOCK_TRIPS,
            familyMembers: MOCK_FAMILY,
            widgets: DEFAULT_KITCHEN_WIDGETS,
            vaultDocuments: [],
            homeAssets: [],
            recipeToOpen: null,

            setWeeklyPlans: (updater) => set((state) => ({
                weeklyPlans: typeof updater === 'function' ? updater(state.weeklyPlans) : updater
            })),
            setPantryItems: (updater) => set((state) => ({
                pantryItems: typeof updater === 'function' ? updater(state.pantryItems) : updater
            })),
            setShoppingList: (updater) => set((state) => ({
                shoppingList: typeof updater === 'function' ? updater(state.shoppingList) : updater
            })),
            setRecipes: (updater) => set((state) => ({
                recipes: typeof updater === 'function' ? updater(state.recipes) : updater
            })),
            setTrips: (updater) => set((state) => ({
                trips: typeof updater === 'function' ? updater(state.trips) : updater
            })),
            setFamilyMembers: (updater) => set((state) => ({
                familyMembers: typeof updater === 'function' ? updater(state.familyMembers) : updater
            })),
            setWidgets: (updater) => set((state) => ({
                widgets: typeof updater === 'function' ? updater(state.widgets) : updater
            })),
            setVaultDocuments: (updater) => set((state) => ({
                vaultDocuments: typeof updater === 'function' ? updater(state.vaultDocuments) : updater
            })),
            setHomeAssets: (updater) => set((state) => ({
                homeAssets: typeof updater === 'function' ? updater(state.homeAssets) : updater
            })),
            setRecipeToOpen: (recipe) => set({ recipeToOpen: recipe }),

            // Helper method implementations
            addRecipe: (recipe) => {
                set((state) => ({ recipes: [...state.recipes, recipe] }));
            },
            updateRecipe: (id, updates) => {
                set((state) => ({
                    recipes: state.recipes.map(r =>
                        r.id === id ? { ...r, ...updates } : r
                    )
                }));
            },
            deleteRecipe: (id) => {
                set((state) => ({
                    recipes: state.recipes.filter(r => r.id !== id)
                }));
            },
            addPantryItem: (item) => {
                set((state) => ({ pantryItems: [...state.pantryItems, item] }));
            },
            updatePantryItem: (id, updates) => {
                set((state) => ({
                    pantryItems: state.pantryItems.map(i =>
                        i.id === id ? { ...i, ...updates } : i
                    )
                }));
            },
            deletePantryItem: (id) => {
                set((state) => ({
                    pantryItems: state.pantryItems.filter(i => i.id !== id)
                }));
            },
            addShoppingItem: (item) => {
                set((state) => ({ shoppingList: [...state.shoppingList, item] }));
            },
            updateShoppingItem: (id, updates) => {
                set((state) => ({
                    shoppingList: state.shoppingList.map(i =>
                        i.id === id ? { ...i, ...updates } : i
                    )
                }));
            },
            deleteShoppingItem: (id) => {
                set((state) => ({
                    shoppingList: state.shoppingList.filter(i => i.id !== id)
                }));
            },
            addWeeklyPlan: (plan) => {
                set((state) => ({ weeklyPlans: [...state.weeklyPlans, plan] }));
            },
            updateWeeklyPlan: (id, updates) => {
                set((state) => ({
                    weeklyPlans: state.weeklyPlans.map(p =>
                        p.id === id ? { ...p, ...updates } : p
                    )
                }));
            },
            deleteWeeklyPlan: (id) => {
                set((state) => ({
                    weeklyPlans: state.weeklyPlans.filter(p => p.id !== id)
                }));
            },
            addTrip: (trip) => {
                set((state) => ({ trips: [...state.trips, trip] }));
            },
            updateTrip: (id, updates) => {
                set((state) => ({
                    trips: state.trips.map(t =>
                        t.id === id ? { ...t, ...updates } : t
                    )
                }));
            },
            deleteTrip: (id) => {
                set((state) => ({
                    trips: state.trips.filter(t => t.id !== id)
                }));
            },
            addFamilyMember: (member) => {
                set((state) => ({ familyMembers: [...state.familyMembers, member] }));
            },
            updateFamilyMember: (id, updates) => {
                set((state) => ({
                    familyMembers: state.familyMembers.map(m =>
                        m.id === id ? { ...m, ...updates } : m
                    )
                }));
            },
            deleteFamilyMember: (id) => {
                set((state) => ({
                    familyMembers: state.familyMembers.filter(m => m.id !== id)
                }));
            },
        }),
        {
            name: 'onyx_life_store',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
