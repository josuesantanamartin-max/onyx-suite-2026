import { describe, it, expect, beforeEach } from 'vitest';
import { useLifeStore } from '../useLifeStore';
import { Recipe, Trip, Ingredient, ShoppingItem, FamilyMember } from '../../types';
import { WeeklyPlan } from '../../types/life';

describe('UseLifeStore', () => {
    beforeEach(() => {
        // Reset store state before each test
        useLifeStore.setState({
            weeklyPlans: [],
            pantryItems: [],
            shoppingList: [],
            recipes: [],
            trips: [],
            familyMembers: [],
            widgets: [],
            vaultDocuments: [],
            homeAssets: [],
            recipeToOpen: null,
        });
    });

    describe('Recipe Management', () => {
        it('should add a recipe', () => {
            const recipe: Recipe = {
                id: 'recipe-1',
                name: 'Pasta Carbonara',
                category: 'Dinner',
                ingredients: [],
                instructions: [],
            } as Recipe;

            useLifeStore.getState().addRecipe(recipe);

            const state = useLifeStore.getState();
            expect(state.recipes).toHaveLength(1);
            expect(state.recipes[0].name).toBe('Pasta Carbonara');
        });

        it('should update a recipe', () => {
            const recipe: Recipe = {
                id: 'recipe-1',
                name: 'Original',
                category: 'Dinner',
            } as Recipe;

            useLifeStore.setState({ recipes: [recipe] });
            useLifeStore.getState().updateRecipe('recipe-1', { name: 'Updated' });

            const state = useLifeStore.getState();
            expect(state.recipes[0].name).toBe('Updated');
        });

        it('should delete a recipe', () => {
            const recipes: Recipe[] = [
                { id: 'recipe-1', name: 'Recipe 1' } as Recipe,
                { id: 'recipe-2', name: 'Recipe 2' } as Recipe,
            ];

            useLifeStore.setState({ recipes });
            useLifeStore.getState().deleteRecipe('recipe-1');

            const state = useLifeStore.getState();
            expect(state.recipes).toHaveLength(1);
            expect(state.recipes[0].id).toBe('recipe-2');
        });

        it('should set recipes using function updater', () => {
            useLifeStore.getState().setRecipes(prev => [
                ...prev,
                { id: 'recipe-1', name: 'New Recipe' } as Recipe,
            ]);

            expect(useLifeStore.getState().recipes).toHaveLength(1);
        });

        it('should set recipes using direct value', () => {
            const recipes: Recipe[] = [
                { id: 'recipe-1', name: 'Recipe 1' } as Recipe,
            ];

            useLifeStore.getState().setRecipes(recipes);

            expect(useLifeStore.getState().recipes).toEqual(recipes);
        });
    });

    describe('Pantry Management', () => {
        it('should add pantry item', () => {
            const item: Ingredient = {
                id: 'item-1',
                name: 'Tomatoes',
                quantity: 5,
                unit: 'pcs',
            } as Ingredient;

            useLifeStore.getState().addPantryItem(item);

            expect(useLifeStore.getState().pantryItems).toHaveLength(1);
            expect(useLifeStore.getState().pantryItems[0].name).toBe('Tomatoes');
        });

        it('should update pantry item', () => {
            const item: Ingredient = {
                id: 'item-1',
                name: 'Tomatoes',
                quantity: 5,
            } as Ingredient;

            useLifeStore.setState({ pantryItems: [item] });
            useLifeStore.getState().updatePantryItem('item-1', { quantity: 10 });

            expect(useLifeStore.getState().pantryItems[0].quantity).toBe(10);
        });

        it('should delete pantry item', () => {
            const items: Ingredient[] = [
                { id: 'item-1', name: 'Item 1' } as Ingredient,
                { id: 'item-2', name: 'Item 2' } as Ingredient,
            ];

            useLifeStore.setState({ pantryItems: items });
            useLifeStore.getState().deletePantryItem('item-1');

            expect(useLifeStore.getState().pantryItems).toHaveLength(1);
            expect(useLifeStore.getState().pantryItems[0].id).toBe('item-2');
        });
    });

    describe('Shopping List Management', () => {
        it('should add shopping item', () => {
            const item: ShoppingItem = {
                id: 'shop-1',
                name: 'Milk',
                quantity: 2,
                category: 'Dairy',
                checked: false,
            } as ShoppingItem;

            useLifeStore.getState().addShoppingItem(item);

            expect(useLifeStore.getState().shoppingList).toHaveLength(1);
        });

        it('should update shopping item', () => {
            const item: ShoppingItem = {
                id: 'shop-1',
                name: 'Milk',
                checked: false,
            } as ShoppingItem;

            useLifeStore.setState({ shoppingList: [item] });
            useLifeStore.getState().updateShoppingItem('shop-1', { checked: true });

            expect(useLifeStore.getState().shoppingList[0].checked).toBe(true);
        });

        it('should delete shopping item', () => {
            const items: ShoppingItem[] = [
                { id: 'shop-1', name: 'Item 1' } as ShoppingItem,
                { id: 'shop-2', name: 'Item 2' } as ShoppingItem,
            ];

            useLifeStore.setState({ shoppingList: items });
            useLifeStore.getState().deleteShoppingItem('shop-1');

            expect(useLifeStore.getState().shoppingList).toHaveLength(1);
        });
    });

    describe('Weekly Plan Management', () => {
        it('should add weekly plan', () => {
            const plan: WeeklyPlan = {
                id: 'plan-1',
                weekStart: '2026-02-03',
                meals: {},
            } as WeeklyPlan;

            useLifeStore.getState().addWeeklyPlan(plan);

            expect(useLifeStore.getState().weeklyPlans).toHaveLength(1);
        });

        it('should update weekly plan', () => {
            const plan: WeeklyPlan = {
                id: 'plan-1',
                weekStart: '2026-02-03',
            } as WeeklyPlan;

            useLifeStore.setState({ weeklyPlans: [plan] });
            useLifeStore.getState().updateWeeklyPlan('plan-1', { weekStart: '2026-02-10' });

            expect(useLifeStore.getState().weeklyPlans[0].weekStart).toBe('2026-02-10');
        });

        it('should delete weekly plan', () => {
            const plans: WeeklyPlan[] = [
                { id: 'plan-1' } as WeeklyPlan,
                { id: 'plan-2' } as WeeklyPlan,
            ];

            useLifeStore.setState({ weeklyPlans: plans });
            useLifeStore.getState().deleteWeeklyPlan('plan-1');

            expect(useLifeStore.getState().weeklyPlans).toHaveLength(1);
        });
    });

    describe('Trip Management', () => {
        it('should add trip', () => {
            const trip: Trip = {
                id: 'trip-1',
                destination: 'Paris',
                startDate: '2026-06-01',
                endDate: '2026-06-07',
            } as Trip;

            useLifeStore.getState().addTrip(trip);

            expect(useLifeStore.getState().trips).toHaveLength(1);
            expect(useLifeStore.getState().trips[0].destination).toBe('Paris');
        });

        it('should update trip', () => {
            const trip: Trip = {
                id: 'trip-1',
                destination: 'Paris',
            } as Trip;

            useLifeStore.setState({ trips: [trip] });
            useLifeStore.getState().updateTrip('trip-1', { destination: 'London' });

            expect(useLifeStore.getState().trips[0].destination).toBe('London');
        });

        it('should delete trip', () => {
            const trips: Trip[] = [
                { id: 'trip-1' } as Trip,
                { id: 'trip-2' } as Trip,
            ];

            useLifeStore.setState({ trips });
            useLifeStore.getState().deleteTrip('trip-1');

            expect(useLifeStore.getState().trips).toHaveLength(1);
        });
    });

    describe('Family Member Management', () => {
        it('should add family member', () => {
            const member: FamilyMember = {
                id: 'member-1',
                name: 'John Doe',
                role: 'Parent',
            } as FamilyMember;

            useLifeStore.getState().addFamilyMember(member);

            expect(useLifeStore.getState().familyMembers).toHaveLength(1);
        });

        it('should update family member', () => {
            const member: FamilyMember = {
                id: 'member-1',
                name: 'John Doe',
            } as FamilyMember;

            useLifeStore.setState({ familyMembers: [member] });
            useLifeStore.getState().updateFamilyMember('member-1', { name: 'Jane Doe' });

            expect(useLifeStore.getState().familyMembers[0].name).toBe('Jane Doe');
        });

        it('should delete family member', () => {
            const members: FamilyMember[] = [
                { id: 'member-1' } as FamilyMember,
                { id: 'member-2' } as FamilyMember,
            ];

            useLifeStore.setState({ familyMembers: members });
            useLifeStore.getState().deleteFamilyMember('member-1');

            expect(useLifeStore.getState().familyMembers).toHaveLength(1);
        });
    });

    describe('Recipe to Open', () => {
        it('should set recipe to open', () => {
            const recipe: Recipe = {
                id: 'recipe-1',
                name: 'Test Recipe',
            } as Recipe;

            useLifeStore.getState().setRecipeToOpen(recipe);

            expect(useLifeStore.getState().recipeToOpen).toEqual(recipe);
        });

        it('should clear recipe to open', () => {
            const recipe: Recipe = { id: 'recipe-1' } as Recipe;
            useLifeStore.setState({ recipeToOpen: recipe });

            useLifeStore.getState().setRecipeToOpen(null);

            expect(useLifeStore.getState().recipeToOpen).toBeNull();
        });
    });

    describe('Widgets Management', () => {
        it('should set widgets', () => {
            const widgets = [{ id: 'widget-1', type: 'calendar' }];

            useLifeStore.getState().setWidgets(widgets as any);

            expect(useLifeStore.getState().widgets).toEqual(widgets);
        });
    });

    describe('Vault Documents Management', () => {
        it('should set vault documents', () => {
            const docs = [{ id: 'doc-1', name: 'Passport' }];

            useLifeStore.getState().setVaultDocuments(docs);

            expect(useLifeStore.getState().vaultDocuments).toEqual(docs);
        });
    });

    describe('Home Assets Management', () => {
        it('should set home assets', () => {
            const assets = [{ id: 'asset-1', name: 'House' }];

            useLifeStore.getState().setHomeAssets(assets);

            expect(useLifeStore.getState().homeAssets).toEqual(assets);
        });
    });
});
