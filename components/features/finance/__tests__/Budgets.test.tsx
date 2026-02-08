import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Budgets from '../Budgets';
import { useFinanceStore } from '../../../../store/useFinanceStore';

// Mock stores
vi.mock('../../../../store/useFinanceStore');
vi.mock('../../../../hooks/useErrorHandler', () => ({
    useErrorHandler: () => ({ handleError: vi.fn() })
}));

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div data-testid="cell" />,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

describe('Budgets Component', () => {
    const mockAddBudget = vi.fn();
    const mockUpdateBudget = vi.fn();
    const mockDeleteBudget = vi.fn();
    const mockOnViewTransactions = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock useFinanceStore
        (useFinanceStore as any).mockReturnValue({
            budgets: [
                {
                    id: '1',
                    category: 'Food',
                    subCategory: 'Groceries',
                    limit: 500,
                    period: 'MONTHLY',
                    budgetType: 'FIXED',
                },
                {
                    id: '2',
                    category: 'Entertainment',
                    limit: 200,
                    period: 'MONTHLY',
                    budgetType: 'PERCENTAGE',
                    percentage: 10,
                },
            ],
            transactions: [
                {
                    id: 't1',
                    type: 'EXPENSE',
                    amount: 150,
                    date: '2026-01-15',
                    category: 'Food',
                    subCategory: 'Groceries',
                    accountId: 'acc1',
                    description: 'Shopping',
                },
            ],
            totalIncome: 2000,
            addBudget: mockAddBudget,
            updateBudget: mockUpdateBudget,
            deleteBudget: mockDeleteBudget,
        });
    });

    describe('Renderización', () => {
        it('debe renderizar el componente correctamente', () => {
            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            expect(screen.getByText(/presupuestos/i)).toBeInTheDocument();
        });

        it('debe mostrar los presupuestos existentes', () => {
            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            expect(screen.getByText('Food')).toBeInTheDocument();
            expect(screen.getByText('Entertainment')).toBeInTheDocument();
        });

        it('debe mostrar el gráfico de presupuestos', () => {
            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
        });
    });

    describe('Cálculo de Gastos', () => {
        it('debe calcular correctamente el gasto en una categoría', () => {
            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            // Debe mostrar 150€ gastados de 500€ en Food
            expect(screen.getByText(/150.*€/)).toBeInTheDocument();
            expect(screen.getByText(/500.*€/)).toBeInTheDocument();
        });

        it('debe calcular el porcentaje de uso del presupuesto', () => {
            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            // 150/500 = 30%
            expect(screen.getByText(/30%/)).toBeInTheDocument();
        });

        it('debe mostrar advertencia cuando se supera el 80% del presupuesto', () => {
            (useFinanceStore as any).mockReturnValue({
                budgets: [
                    {
                        id: '1',
                        category: 'Food',
                        limit: 100,
                        period: 'MONTHLY',
                        budgetType: 'FIXED',
                    },
                ],
                transactions: [
                    {
                        id: 't1',
                        type: 'EXPENSE',
                        amount: 85,
                        date: '2026-01-15',
                        category: 'Food',
                        accountId: 'acc1',
                        description: 'Shopping',
                    },
                ],
                totalIncome: 2000,
                addBudget: mockAddBudget,
                updateBudget: mockUpdateBudget,
                deleteBudget: mockDeleteBudget,
            });

            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            // Debe mostrar algún indicador de advertencia (85% usado)
            expect(screen.getByText(/85%/)).toBeInTheDocument();
        });
    });

    describe('Formulario de Nuevo Presupuesto', () => {
        it('debe mostrar el formulario al hacer clic en "Nuevo Presupuesto"', () => {
            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            const addButton = screen.getByRole('button', { name: /nuevo presupuesto/i });
            fireEvent.click(addButton);

            expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/límite/i)).toBeInTheDocument();
        });

        it('debe crear un presupuesto fijo con datos válidos', async () => {
            mockAddBudget.mockResolvedValue(undefined);

            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            const addButton = screen.getByRole('button', { name: /nuevo presupuesto/i });
            fireEvent.click(addButton);

            // Llenar formulario
            fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'Transport' } });
            fireEvent.change(screen.getByLabelText(/límite/i), { target: { value: '300' } });
            fireEvent.change(screen.getByLabelText(/período/i), { target: { value: 'MONTHLY' } });
            fireEvent.change(screen.getByLabelText(/tipo/i), { target: { value: 'FIXED' } });

            const submitButton = screen.getByRole('button', { name: /guardar/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockAddBudget).toHaveBeenCalledWith(
                    expect.objectContaining({
                        category: 'Transport',
                        limit: 300,
                        period: 'MONTHLY',
                        budgetType: 'FIXED',
                    })
                );
            });
        });

        it('debe validar que el presupuesto de porcentaje incluya el porcentaje', async () => {
            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            const addButton = screen.getByRole('button', { name: /nuevo presupuesto/i });
            fireEvent.click(addButton);

            // Intentar crear presupuesto PERCENTAGE sin porcentaje
            fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'Transport' } });
            fireEvent.change(screen.getByLabelText(/límite/i), { target: { value: '300' } });
            fireEvent.change(screen.getByLabelText(/tipo/i), { target: { value: 'PERCENTAGE' } });

            const submitButton = screen.getByRole('button', { name: /guardar/i });
            fireEvent.click(submitButton);

            // No debe llamar a addBudget si falta el porcentaje
            await waitFor(() => {
                expect(mockAddBudget).not.toHaveBeenCalled();
            });
        });
    });

    describe('Edición de Presupuestos', () => {
        it('debe abrir el formulario de edición', () => {
            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            const editButtons = screen.getAllByRole('button', { name: /editar/i });
            fireEvent.click(editButtons[0]);

            expect(screen.getByDisplayValue('500')).toBeInTheDocument();
        });

        it('debe actualizar un presupuesto existente', async () => {
            mockUpdateBudget.mockResolvedValue(undefined);

            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            const editButtons = screen.getAllByRole('button', { name: /editar/i });
            fireEvent.click(editButtons[0]);

            // Modificar el límite
            const limitInput = screen.getByDisplayValue('500');
            fireEvent.change(limitInput, { target: { value: '600' } });

            const saveButton = screen.getByRole('button', { name: /guardar/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockUpdateBudget).toHaveBeenCalledWith(
                    '1',
                    expect.objectContaining({
                        limit: 600,
                    })
                );
            });
        });
    });

    describe('Eliminación de Presupuestos', () => {
        it('debe eliminar un presupuesto al confirmar', async () => {
            global.confirm = vi.fn(() => true);

            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
            fireEvent.click(deleteButtons[0]);

            await waitFor(() => {
                expect(mockDeleteBudget).toHaveBeenCalledWith('1');
            });
        });

        it('no debe eliminar si se cancela la confirmación', async () => {
            global.confirm = vi.fn(() => false);

            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
            fireEvent.click(deleteButtons[0]);

            await waitFor(() => {
                expect(mockDeleteBudget).not.toHaveBeenCalled();
            });
        });
    });

    describe('Ver Transacciones', () => {
        it('debe llamar a onViewTransactions al hacer clic en ver detalles', () => {
            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            const viewButtons = screen.getAllByRole('button', { name: /ver.*transacciones/i });
            fireEvent.click(viewButtons[0]);

            expect(mockOnViewTransactions).toHaveBeenCalledWith('Food', 'Groceries');
        });
    });

    describe('Presupuestos de Porcentaje', () => {
        it('debe calcular el límite efectivo basado en el porcentaje de ingresos', () => {
            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            // Entertainment tiene 10% de 2000€ = 200€
            const entertainmentBudget = screen.getByText('Entertainment');
            expect(entertainmentBudget).toBeInTheDocument();
            expect(screen.getByText(/200.*€/)).toBeInTheDocument();
        });
    });

    describe('Casos Extremos', () => {
        it('debe manejar lista vacía de presupuestos', () => {
            (useFinanceStore as any).mockReturnValue({
                budgets: [],
                transactions: [],
                totalIncome: 0,
                addBudget: mockAddBudget,
                updateBudget: mockUpdateBudget,
                deleteBudget: mockDeleteBudget,
            });

            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            expect(screen.getByText(/no hay presupuestos/i)).toBeInTheDocument();
        });

        it('debe manejar presupuesto sin gastos', () => {
            (useFinanceStore as any).mockReturnValue({
                budgets: [
                    {
                        id: '1',
                        category: 'Savings',
                        limit: 1000,
                        period: 'MONTHLY',
                        budgetType: 'FIXED',
                    },
                ],
                transactions: [],
                totalIncome: 2000,
                addBudget: mockAddBudget,
                updateBudget: mockUpdateBudget,
                deleteBudget: mockDeleteBudget,
            });

            render(<Budgets onViewTransactions={mockOnViewTransactions} />);

            // Debe mostrar 0% de uso
            expect(screen.getByText(/0%/)).toBeInTheDocument();
        });
    });
});
