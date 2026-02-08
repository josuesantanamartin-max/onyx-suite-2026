import { describe, it, expect } from 'vitest';
import {
    estimateItemPrice,
    estimateTotalPrice,
    formatPrice,
    updateItemPrice,
} from '../priceEstimation';
import { ShoppingItem } from '../../types';

describe('PriceEstimation', () => {
    describe('estimateItemPrice', () => {
        it('should estimate price for vegetables by weight', () => {
            const item: ShoppingItem = {
                id: '1',
                name: 'Tomatoes',
                quantity: 2,
                unit: 'kg',
                category: 'Vegetables',
                checked: false,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBe(5.0); // 2kg * 2.5€/kg
        });

        it('should estimate price for fruits', () => {
            const item: ShoppingItem = {
                id: '2',
                name: 'Apples',
                quantity: 1.5,
                unit: 'kg',
                category: 'Fruits',
                checked: false,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBe(4.5); // 1.5kg * 3€/kg
        });

        it('should estimate price for dairy', () => {
            const item: ShoppingItem = {
                id: '3',
                name: 'Milk',
                quantity: 2,
                unit: 'pcs',
                category: 'Dairy',
                checked: false,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBe(3.6); // 2 * 1.8€
        });

        it('should estimate price for meat', () => {
            const item: ShoppingItem = {
                id: '4',
                name: 'Chicken',
                quantity: 1,
                unit: 'kg',
                category: 'Meat',
                checked: false,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBe(8.0); // 1kg * 8€/kg
        });

        it('should convert grams to kilograms', () => {
            const item: ShoppingItem = {
                id: '5',
                name: 'Cheese',
                quantity: 500,
                unit: 'g',
                category: 'Dairy',
                checked: false,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBe(0.9); // 0.5kg * 1.8€
        });

        it('should convert milliliters to liters', () => {
            const item: ShoppingItem = {
                id: '6',
                name: 'Olive Oil',
                quantity: 500,
                unit: 'ml',
                category: 'Pantry',
                checked: false,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBe(1.0); // 0.5l * 2€
        });

        it('should handle cucharada (tablespoon) unit', () => {
            const item: ShoppingItem = {
                id: '7',
                name: 'Sugar',
                quantity: 10,
                unit: 'cda',
                category: 'Pantry',
                checked: false,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBeCloseTo(0.3, 1); // 10 * 0.015 * 2€
        });

        it('should handle cucharadita (teaspoon) unit', () => {
            const item: ShoppingItem = {
                id: '8',
                name: 'Salt',
                quantity: 5,
                unit: 'cdta',
                category: 'Spices',
                checked: false,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBeCloseTo(0.1, 1); // 5 * 0.005 * 4€
        });

        it('should use existing estimated price if available', () => {
            const item: ShoppingItem = {
                id: '9',
                name: 'Custom Item',
                quantity: 1,
                unit: 'pcs',
                category: 'Other',
                checked: false,
                estimatedPrice: 5.99,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBe(5.99);
        });

        it('should use default category for unknown categories', () => {
            const item: ShoppingItem = {
                id: '10',
                name: 'Unknown',
                quantity: 2,
                unit: 'pcs',
                category: 'UnknownCategory',
                checked: false,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBe(5.0); // 2 * 2.5€ (Other category)
        });

        it('should use default unit conversion for unknown units', () => {
            const item: ShoppingItem = {
                id: '11',
                name: 'Item',
                quantity: 3,
                unit: 'unknown',
                category: 'Other',
                checked: false,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBe(7.5); // 3 * 1 * 2.5€
        });

        it('should enforce minimum price of 0.10€', () => {
            const item: ShoppingItem = {
                id: '12',
                name: 'Tiny Item',
                quantity: 0.001,
                unit: 'g',
                category: 'Spices',
                checked: false,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBe(0.10);
        });

        it('should round to 2 decimal places', () => {
            const item: ShoppingItem = {
                id: '13',
                name: 'Item',
                quantity: 1.333,
                unit: 'kg',
                category: 'Vegetables',
                checked: false,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBe(3.33); // 1.333 * 2.5 = 3.3325 → 3.33
        });

        it('should handle zero estimated price', () => {
            const item: ShoppingItem = {
                id: '14',
                name: 'Free Item',
                quantity: 1,
                unit: 'pcs',
                category: 'Other',
                checked: false,
                estimatedPrice: 0,
            } as ShoppingItem;

            const price = estimateItemPrice(item);
            expect(price).toBe(2.5); // Should calculate, not use 0
        });
    });

    describe('estimateTotalPrice', () => {
        it('should calculate total price for multiple items', () => {
            const items: ShoppingItem[] = [
                {
                    id: '1',
                    name: 'Tomatoes',
                    quantity: 2,
                    unit: 'kg',
                    category: 'Vegetables',
                    checked: false,
                } as ShoppingItem,
                {
                    id: '2',
                    name: 'Milk',
                    quantity: 1,
                    unit: 'pcs',
                    category: 'Dairy',
                    checked: false,
                } as ShoppingItem,
            ];

            const total = estimateTotalPrice(items);
            expect(total).toBe(6.8); // 5.0 + 1.8
        });

        it('should handle empty list', () => {
            const total = estimateTotalPrice([]);
            expect(total).toBe(0);
        });

        it('should round total to 2 decimals', () => {
            const items: ShoppingItem[] = [
                {
                    id: '1',
                    name: 'Item 1',
                    quantity: 1.111,
                    unit: 'kg',
                    category: 'Vegetables',
                    checked: false,
                } as ShoppingItem,
                {
                    id: '2',
                    name: 'Item 2',
                    quantity: 2.222,
                    unit: 'kg',
                    category: 'Fruits',
                    checked: false,
                } as ShoppingItem,
            ];

            const total = estimateTotalPrice(items);
            expect(total).toBeCloseTo(9.44, 2);
        });
    });

    describe('formatPrice', () => {
        it('should format price with EUR symbol', () => {
            const formatted = formatPrice(12.5, 'EUR');
            expect(formatted).toBe('12.50€');
        });

        it('should format price with USD symbol', () => {
            const formatted = formatPrice(12.5, 'USD');
            expect(formatted).toBe('12.50$');
        });

        it('should format price with GBP symbol', () => {
            const formatted = formatPrice(12.5, 'GBP');
            expect(formatted).toBe('12.50£');
        });

        it('should default to EUR', () => {
            const formatted = formatPrice(12.5);
            expect(formatted).toBe('12.50€');
        });

        it('should always show 2 decimal places', () => {
            const formatted = formatPrice(10, 'EUR');
            expect(formatted).toBe('10.00€');
        });

        it('should handle large numbers', () => {
            const formatted = formatPrice(1234.56, 'EUR');
            expect(formatted).toBe('1234.56€');
        });
    });

    describe('updateItemPrice', () => {
        it('should update item with custom price', () => {
            const item: ShoppingItem = {
                id: '1',
                name: 'Item',
                quantity: 1,
                unit: 'pcs',
                category: 'Other',
                checked: false,
            } as ShoppingItem;

            const updated = updateItemPrice(item, 9.99);

            expect(updated.estimatedPrice).toBe(9.99);
            expect(updated.id).toBe('1');
            expect(updated.name).toBe('Item');
        });

        it('should calculate price if no custom price provided', () => {
            const item: ShoppingItem = {
                id: '2',
                name: 'Tomatoes',
                quantity: 2,
                unit: 'kg',
                category: 'Vegetables',
                checked: false,
            } as ShoppingItem;

            const updated = updateItemPrice(item);

            expect(updated.estimatedPrice).toBe(5.0);
        });

        it('should not mutate original item', () => {
            const item: ShoppingItem = {
                id: '3',
                name: 'Item',
                quantity: 1,
                unit: 'pcs',
                category: 'Other',
                checked: false,
            } as ShoppingItem;

            const updated = updateItemPrice(item, 5.0);

            expect(item.estimatedPrice).toBeUndefined();
            expect(updated.estimatedPrice).toBe(5.0);
        });
    });
});
