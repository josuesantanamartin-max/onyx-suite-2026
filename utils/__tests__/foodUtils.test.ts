import { describe, it, expect } from 'vitest';
import { getIngredientCategory, INGREDIENT_CATEGORY_MAP } from '../foodUtils';

describe('FoodUtils', () => {
    describe('getIngredientCategory', () => {
        describe('Exact matches', () => {
            it('should categorize dairy products', () => {
                expect(getIngredientCategory('leche')).toBe('Dairy');
                expect(getIngredientCategory('queso')).toBe('Dairy');
                expect(getIngredientCategory('yogur')).toBe('Dairy');
                expect(getIngredientCategory('huevos')).toBe('Dairy');
                expect(getIngredientCategory('mantequilla')).toBe('Dairy');
            });

            it('should categorize vegetables', () => {
                expect(getIngredientCategory('tomate')).toBe('Vegetables');
                expect(getIngredientCategory('cebolla')).toBe('Vegetables');
                expect(getIngredientCategory('ajo')).toBe('Vegetables');
                expect(getIngredientCategory('zanahoria')).toBe('Vegetables');
                expect(getIngredientCategory('pimiento')).toBe('Vegetables');
            });

            it('should categorize fruits', () => {
                expect(getIngredientCategory('manzana')).toBe('Fruits');
                expect(getIngredientCategory('plátano')).toBe('Fruits');
                expect(getIngredientCategory('naranja')).toBe('Fruits');
                expect(getIngredientCategory('fresa')).toBe('Fruits');
            });

            it('should categorize meat and fish', () => {
                expect(getIngredientCategory('pollo')).toBe('Meat');
                expect(getIngredientCategory('ternera')).toBe('Meat');
                expect(getIngredientCategory('salmón')).toBe('Meat');
                expect(getIngredientCategory('gamba')).toBe('Meat');
            });

            it('should categorize pantry items', () => {
                expect(getIngredientCategory('arroz')).toBe('Pantry');
                expect(getIngredientCategory('pasta')).toBe('Pantry');
                expect(getIngredientCategory('harina')).toBe('Pantry');
                expect(getIngredientCategory('aceite')).toBe('Pantry');
            });

            it('should categorize frozen items', () => {
                expect(getIngredientCategory('hielo')).toBe('Frozen');
                expect(getIngredientCategory('helado')).toBe('Frozen');
            });

            it('should categorize spices', () => {
                expect(getIngredientCategory('orégano')).toBe('Spices');
                expect(getIngredientCategory('comino')).toBe('Spices');
                expect(getIngredientCategory('canela')).toBe('Spices');
            });
        });

        describe('Case insensitivity', () => {
            it('should handle uppercase input', () => {
                expect(getIngredientCategory('LECHE')).toBe('Dairy');
                expect(getIngredientCategory('TOMATE')).toBe('Vegetables');
                expect(getIngredientCategory('ARROZ')).toBe('Pantry');
            });

            it('should handle mixed case input', () => {
                expect(getIngredientCategory('Leche')).toBe('Dairy');
                expect(getIngredientCategory('ToMaTe')).toBe('Vegetables');
            });
        });

        describe('Partial matches', () => {
            it('should match ingredients containing keywords', () => {
                expect(getIngredientCategory('Salsa de tomate')).toBe('Vegetables');
                expect(getIngredientCategory('Queso rallado')).toBe('Dairy');
                expect(getIngredientCategory('Aceite de oliva')).toBe('Pantry');
            });

            it('should match compound ingredient names', () => {
                expect(getIngredientCategory('Pechuga de pollo')).toBe('Meat');
                expect(getIngredientCategory('Filete de salmón')).toBe('Meat');
            });
        });

        describe('Heuristic matching', () => {
            it('should detect frozen items by keyword', () => {
                expect(getIngredientCategory('Verduras congeladas')).toBe('Frozen');
                expect(getIngredientCategory('Pescado congelado')).toBe('Frozen');
            });

            it('should detect sauces as pantry items', () => {
                expect(getIngredientCategory('Salsa de soja')).toBe('Pantry');
                expect(getIngredientCategory('Salsa picante')).toBe('Pantry');
            });
        });

        describe('Unknown ingredients', () => {
            it('should return "Other" for unknown ingredients', () => {
                expect(getIngredientCategory('Ingrediente desconocido')).toBe('Other');
                expect(getIngredientCategory('XYZ123')).toBe('Other');
                expect(getIngredientCategory('')).toBe('Other');
            });
        });

        describe('Edge cases', () => {
            it('should handle empty strings', () => {
                expect(getIngredientCategory('')).toBe('Other');
            });

            it('should handle special characters', () => {
                expect(getIngredientCategory('Ñoquis')).toBe('Other');
                expect(getIngredientCategory('Café')).toBe('Pantry');
            });

            it('should handle numbers in names', () => {
                expect(getIngredientCategory('Leche 2%')).toBe('Dairy');
            });
        });
    });

    describe('INGREDIENT_CATEGORY_MAP', () => {
        it('should have valid category values', () => {
            const validCategories = ['Dairy', 'Vegetables', 'Fruits', 'Meat', 'Pantry', 'Frozen', 'Spices'];

            Object.values(INGREDIENT_CATEGORY_MAP).forEach(category => {
                expect(validCategories).toContain(category);
            });
        });

        it('should have lowercase keys', () => {
            Object.keys(INGREDIENT_CATEGORY_MAP).forEach(key => {
                expect(key).toBe(key.toLowerCase());
            });
        });

        it('should contain common ingredients', () => {
            expect(INGREDIENT_CATEGORY_MAP['leche']).toBeDefined();
            expect(INGREDIENT_CATEGORY_MAP['tomate']).toBeDefined();
            expect(INGREDIENT_CATEGORY_MAP['arroz']).toBeDefined();
            expect(INGREDIENT_CATEGORY_MAP['pollo']).toBeDefined();
        });
    });
});
