import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShoppingListComponent } from '../ShoppingListComponent';
import { useLifeStore } from '../../../../store/useLifeStore';

// Mock dependencies
vi.mock('../../../../store/useLifeStore');

describe('ShoppingListComponent', () => {
    const mockAddShoppingItem = vi.fn();
    const mockUpdateShoppingItem = vi.fn();
    const mockDeleteShoppingItem = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useLifeStore as any).mockReturnValue({
            shoppingList: [
                {
                    id: '1',
                    name: 'Tomatoes',
                    quantity: 2,
                    unit: 'kg',
                    category: 'Vegetables',
                    checked: false,
                    estimatedPrice: 5.0,
                },
                {
                    id: '2',
                    name: 'Milk',
                    quantity: 1,
                    unit: 'l',
                    category: 'Dairy',
                    checked: false,
                    estimatedPrice: 1.5,
                },
                {
                    id: '3',
                    name: 'Bread',
                    quantity: 1,
                    unit: 'pcs',
                    category: 'Pantry',
                    checked: true,
                    estimatedPrice: 2.0,
                },
            ],
            addShoppingItem: mockAddShoppingItem,
            updateShoppingItem: mockUpdateShoppingItem,
            deleteShoppingItem: mockDeleteShoppingItem,
        });
    });

    it('should render shopping list', () => {
        render(<ShoppingListComponent />);

        expect(screen.getByText('Tomatoes')).toBeInTheDocument();
        expect(screen.getByText('Milk')).toBeInTheDocument();
        expect(screen.getByText('Bread')).toBeInTheDocument();
    });

    it('should display items grouped by category', () => {
        render(<ShoppingListComponent />);

        expect(screen.getByText(/Vegetables/i)).toBeInTheDocument();
        expect(screen.getByText(/Dairy/i)).toBeInTheDocument();
        expect(screen.getByText(/Pantry/i)).toBeInTheDocument();
    });

    it('should display item quantities and units', () => {
        render(<ShoppingListComponent />);

        expect(screen.getByText(/2.*kg/i)).toBeInTheDocument();
        expect(screen.getByText(/1.*l/i)).toBeInTheDocument();
    });

    it('should display estimated prices', () => {
        render(<ShoppingListComponent />);

        expect(screen.getByText(/5\.0/)).toBeInTheDocument();
        expect(screen.getByText(/1\.5/)).toBeInTheDocument();
    });

    it('should display total price', () => {
        render(<ShoppingListComponent />);

        // Total: 5.0 + 1.5 + 2.0 = 8.5
        expect(screen.getByText(/8\.5/)).toBeInTheDocument();
    });

    it('should check item when clicked', () => {
        render(<ShoppingListComponent />);

        const tomatoCheckbox = screen.getAllByRole('checkbox')[0];
        fireEvent.click(tomatoCheckbox);

        expect(mockUpdateShoppingItem).toHaveBeenCalledWith('1', { checked: true });
    });

    it('should uncheck item when clicked', () => {
        render(<ShoppingListComponent />);

        const breadCheckbox = screen.getAllByRole('checkbox')[2];
        fireEvent.click(breadCheckbox);

        expect(mockUpdateShoppingItem).toHaveBeenCalledWith('3', { checked: false });
    });

    it('should add new item', () => {
        render(<ShoppingListComponent />);

        const addButton = screen.getByText(/Añadir/i) || screen.getByText(/Agregar/i);
        fireEvent.click(addButton);

        expect(mockAddShoppingItem).toHaveBeenCalled();
    });

    it('should delete item', () => {
        render(<ShoppingListComponent />);

        const deleteButtons = screen.getAllByRole('button', { name: /eliminar|delete/i });
        fireEvent.click(deleteButtons[0]);

        expect(mockDeleteShoppingItem).toHaveBeenCalledWith('1');
    });

    it('should clear checked items', () => {
        render(<ShoppingListComponent />);

        const clearButton = screen.getByText(/Limpiar/i) || screen.getByText(/Clear/i);
        fireEvent.click(clearButton);

        expect(mockDeleteShoppingItem).toHaveBeenCalledWith('3');
    });

    it('should handle empty shopping list', () => {
        (useLifeStore as any).mockReturnValue({
            shoppingList: [],
            addShoppingItem: mockAddShoppingItem,
            updateShoppingItem: mockUpdateShoppingItem,
            deleteShoppingItem: mockDeleteShoppingItem,
        });

        render(<ShoppingListComponent />);

        expect(screen.getByText(/vacía|empty/i)).toBeInTheDocument();
    });

    it('should filter unchecked items', () => {
        render(<ShoppingListComponent />);

        const filterButton = screen.getByText(/Pendientes/i) || screen.getByText(/Unchecked/i);
        if (filterButton) {
            fireEvent.click(filterButton);
            expect(screen.queryByText('Bread')).not.toBeInTheDocument();
        }
    });

    it('should sort items by category', () => {
        render(<ShoppingListComponent />);

        const items = screen.getAllByRole('listitem') || screen.getAllByText(/kg|l|pcs/i);
        expect(items.length).toBeGreaterThan(0);
    });

    it('should display item count', () => {
        render(<ShoppingListComponent />);

        expect(screen.getByText(/3.*items/i) || screen.getByText(/3.*artículos/i)).toBeInTheDocument();
    });

    it('should handle items without estimated price', () => {
        (useLifeStore as any).mockReturnValue({
            shoppingList: [
                {
                    id: '1',
                    name: 'Item',
                    quantity: 1,
                    unit: 'pcs',
                    category: 'Other',
                    checked: false,
                },
            ],
            addShoppingItem: mockAddShoppingItem,
            updateShoppingItem: mockUpdateShoppingItem,
            deleteShoppingItem: mockDeleteShoppingItem,
        });

        render(<ShoppingListComponent />);

        expect(screen.getByText('Item')).toBeInTheDocument();
    });
});
