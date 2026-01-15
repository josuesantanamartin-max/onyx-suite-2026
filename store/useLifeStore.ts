import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Ingredient, ShoppingItem, Recipe, Trip, FamilyMember, WeeklyPlanState, DashboardWidget } from '../types';
import { MOCK_PANTRY, MOCK_RECIPES, MOCK_TRIPS, MOCK_FAMILY, DEFAULT_KITCHEN_WIDGETS } from '../data/seeds/lifeSeed';

interface LifeState {
    weeklyPlan: WeeklyPlanState;
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
    setWeeklyPlan: (updater: WeeklyPlanState | ((prev: WeeklyPlanState) => WeeklyPlanState)) => void;
    setPantryItems: (updater: Ingredient[] | ((prev: Ingredient[]) => Ingredient[])) => void;
    setShoppingList: (updater: ShoppingItem[] | ((prev: ShoppingItem[]) => ShoppingItem[])) => void;
    setRecipes: (updater: Recipe[] | ((prev: Recipe[]) => Recipe[])) => void;
    setTrips: (updater: Trip[] | ((prev: Trip[]) => Trip[])) => void;
    setFamilyMembers: (updater: FamilyMember[] | ((prev: FamilyMember[]) => FamilyMember[])) => void;
    setWidgets: (updater: DashboardWidget[] | ((prev: DashboardWidget[]) => DashboardWidget[])) => void; // Kitchen widgets
    setVaultDocuments: (updater: any[] | ((prev: any[]) => any[])) => void;
    setHomeAssets: (updater: any[] | ((prev: any[]) => any[])) => void;
    setRecipeToOpen: (recipe: Recipe | null) => void;
}

export const useLifeStore = create<LifeState & LifeActions>()(
    persist(
        (set) => ({
            weeklyPlan: {},
            pantryItems: MOCK_PANTRY,
            shoppingList: [],
            recipes: MOCK_RECIPES,
            trips: MOCK_TRIPS,
            familyMembers: MOCK_FAMILY,
            widgets: DEFAULT_KITCHEN_WIDGETS,
            vaultDocuments: [],
            homeAssets: [],
            recipeToOpen: null,

            setWeeklyPlan: (updater) => set((state) => ({
                weeklyPlan: typeof updater === 'function' ? updater(state.weeklyPlan) : updater
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
        }),
        {
            name: 'onyx_life_store',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
