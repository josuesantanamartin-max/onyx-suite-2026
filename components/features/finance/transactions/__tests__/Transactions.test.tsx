import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Transactions from '../Transactions';
import { useFinanceStore } from '../../../../../store/useFinanceStore';
import { useUserStore } from '../../../../../store/useUserStore';

// Mock stores
vi.mock('../../../../../store/useFinanceStore');
vi.mock('../../../../../store/useUserStore');
vi.mock('../../../../../hooks/useErrorHandler', () => ({
    useErrorHandler: () => ({ handleError: vi.fn() })
}));

describe('Transactions Component', () => {
    const mockAddTransaction = vi.fn();
    const mockUpdateTransaction = vi.fn();
    const mockDeleteTransaction = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock useFinanceStore
        (useFinanceStore as any).mockReturnValue({
            transactions: [
                {
                    id: '1',
                    type: 'EXPENSE',
                    amount: 50.00,
                    date: '2026-01-15',
                    category: 'Food',
                    subCategory: 'Groceries',
                    accountId: 'acc1',
                    description: 'Weekly shopping',
                },
                {
                    id: '2',
                    type: 'INCOME',
                    amount: 2000.00,
                    date: '2026-01-01',
                    category: 'Salary',
                    accountId: 'acc1',
                    description: 'Monthly salary',
                },
            ],
            accounts: [
                { id: 'acc1', name: 'Main Account', type: 'BANK', balance: 1000, currency: 'EUR' },
            ],
            addTransaction: mockAddTransaction,
            updateTransaction: mockUpdateTransaction,
            deleteTransaction: mockDeleteTransaction,
        });

        // Mock useUserStore
        (useUserStore as any).mockReturnValue({
            user: { id: 'user1', email: 'test@example.com' },
        });
    });

    describe('Renderización', () => {
        it('debe renderizar el componente correctamente', () => {
            render(<Transactions />);

            expect(screen.getByText(/transacciones/i)).toBeInTheDocument();
        });

        it('debe mostrar las transacciones existentes', () => {
            render(<Transactions />);

            expect(screen.getByText('Weekly shopping')).toBeInTheDocument();
            expect(screen.getByText('Monthly salary')).toBeInTheDocument();
        });

        it('debe mostrar los montos formateados correctamente', () => {
            render(<Transactions />);

            expect(screen.getByText(/50.*€/)).toBeInTheDocument();
            expect(screen.getByText(/2.*000.*€/)).toBeInTheDocument();
        });
    });

    describe('Filtros', () => {
        it('debe aplicar filtros iniciales cuando se proporcionan', () => {
            const initialFilters = {
                category: 'Food',
                type: 'EXPENSE' as const,
            };

            render(<Transactions initialFilters={initialFilters} />);

            // Solo debe mostrar transacciones de tipo EXPENSE en categoría Food
            expect(screen.getByText('Weekly shopping')).toBeInTheDocument();
            expect(screen.queryByText('Monthly salary')).not.toBeInTheDocument();
        });

        it('debe limpiar filtros cuando se llama onClearFilters', () => {
            const mockClearFilters = vi.fn();
            const initialFilters = {
                category: 'Food',
            };

            render(
                <Transactions
                    initialFilters={initialFilters}
                    onClearFilters={mockClearFilters}
                />
            );

            // Buscar y hacer clic en el botón de limpiar filtros
            const clearButton = screen.getByRole('button', { name: /limpiar/i });
            fireEvent.click(clearButton);

            expect(mockClearFilters).toHaveBeenCalled();
        });
    });

    describe('Formulario de Nueva Transacción', () => {
        it('debe mostrar el formulario cuando se hace clic en "Nueva Transacción"', () => {
            render(<Transactions />);

            const addButton = screen.getByRole('button', { name: /nueva transacción/i });
            fireEvent.click(addButton);

            expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/monto/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
        });

        it('debe validar campos requeridos antes de enviar', async () => {
            render(<Transactions />);

            const addButton = screen.getByRole('button', { name: /nueva transacción/i });
            fireEvent.click(addButton);

            const submitButton = screen.getByRole('button', { name: /guardar/i });
            fireEvent.click(submitButton);

            // No debe llamar a addTransaction si hay errores de validación
            await waitFor(() => {
                expect(mockAddTransaction).not.toHaveBeenCalled();
            });
        });

        it('debe crear una nueva transacción con datos válidos', async () => {
            mockAddTransaction.mockResolvedValue(undefined);

            render(<Transactions />);

            const addButton = screen.getByRole('button', { name: /nueva transacción/i });
            fireEvent.click(addButton);

            // Llenar el formulario
            fireEvent.change(screen.getByLabelText(/tipo/i), { target: { value: 'EXPENSE' } });
            fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '25.50' } });
            fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'Food' } });
            fireEvent.change(screen.getByLabelText(/cuenta/i), { target: { value: 'acc1' } });
            fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Coffee' } });
            fireEvent.change(screen.getByLabelText(/fecha/i), { target: { value: '2026-01-20' } });

            const submitButton = screen.getByRole('button', { name: /guardar/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockAddTransaction).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'EXPENSE',
                        amount: 25.50,
                        category: 'Food',
                        description: 'Coffee',
                    })
                );
            });
        });
    });

    describe('Edición de Transacciones', () => {
        it('debe abrir el modal de edición al hacer clic en editar', () => {
            render(<Transactions />);

            const editButtons = screen.getAllByRole('button', { name: /editar/i });
            fireEvent.click(editButtons[0]);

            expect(screen.getByDisplayValue('Weekly shopping')).toBeInTheDocument();
            expect(screen.getByDisplayValue('50')).toBeInTheDocument();
        });

        it('debe actualizar una transacción existente', async () => {
            mockUpdateTransaction.mockResolvedValue(undefined);

            render(<Transactions />);

            const editButtons = screen.getAllByRole('button', { name: /editar/i });
            fireEvent.click(editButtons[0]);

            // Modificar el monto
            const amountInput = screen.getByDisplayValue('50');
            fireEvent.change(amountInput, { target: { value: '75' } });

            const saveButton = screen.getByRole('button', { name: /guardar/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockUpdateTransaction).toHaveBeenCalledWith(
                    '1',
                    expect.objectContaining({
                        amount: 75,
                    })
                );
            });
        });
    });

    describe('Eliminación de Transacciones', () => {
        it('debe eliminar una transacción al confirmar', async () => {
            // Mock window.confirm
            global.confirm = vi.fn(() => true);

            render(<Transactions />);

            const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
            fireEvent.click(deleteButtons[0]);

            await waitFor(() => {
                expect(mockDeleteTransaction).toHaveBeenCalledWith('1');
            });
        });

        it('no debe eliminar si se cancela la confirmación', async () => {
            global.confirm = vi.fn(() => false);

            render(<Transactions />);

            const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
            fireEvent.click(deleteButtons[0]);

            await waitFor(() => {
                expect(mockDeleteTransaction).not.toHaveBeenCalled();
            });
        });
    });

    describe('Estadísticas', () => {
        it('debe calcular y mostrar el total de ingresos', () => {
            render(<Transactions />);

            expect(screen.getByText(/ingresos/i)).toBeInTheDocument();
            expect(screen.getByText(/2.*000/)).toBeInTheDocument();
        });

        it('debe calcular y mostrar el total de gastos', () => {
            render(<Transactions />);

            expect(screen.getByText(/gastos/i)).toBeInTheDocument();
            expect(screen.getByText(/50/)).toBeInTheDocument();
        });
    });

    describe('Casos Extremos', () => {
        it('debe manejar lista vacía de transacciones', () => {
            (useFinanceStore as any).mockReturnValue({
                transactions: [],
                accounts: [],
                addTransaction: mockAddTransaction,
                updateTransaction: mockUpdateTransaction,
                deleteTransaction: mockDeleteTransaction,
            });

            render(<Transactions />);

            expect(screen.getByText(/no hay transacciones/i)).toBeInTheDocument();
        });

        it('debe manejar montos muy grandes', () => {
            (useFinanceStore as any).mockReturnValue({
                transactions: [
                    {
                        id: '1',
                        type: 'INCOME',
                        amount: 999999.99,
                        date: '2026-01-01',
                        category: 'Investment',
                        accountId: 'acc1',
                        description: 'Big win',
                    },
                ],
                accounts: [
                    { id: 'acc1', name: 'Main Account', type: 'BANK', balance: 1000, currency: 'EUR' },
                ],
                addTransaction: mockAddTransaction,
                updateTransaction: mockUpdateTransaction,
                deleteTransaction: mockDeleteTransaction,
            });

            render(<Transactions />);

            expect(screen.getByText(/999.*999/)).toBeInTheDocument();
        });
    });
});
