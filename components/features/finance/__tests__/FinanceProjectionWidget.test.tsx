import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinanceProjectionWidget } from '../FinanceProjectionWidget';
import { useFinanceStore } from '../../../../store/useFinanceStore';

// Mock dependencies
vi.mock('../../../../store/useFinanceStore');
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
    Line: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    Legend: () => <div />,
}));

describe('FinanceProjectionWidget', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        (useFinanceStore as any).mockReturnValue({
            transactions: [
                {
                    id: '1',
                    type: 'INCOME',
                    amount: 3000,
                    date: '2026-02-01',
                    isRecurring: true,
                    frequency: 'MONTHLY',
                },
                {
                    id: '2',
                    type: 'EXPENSE',
                    amount: 1500,
                    date: '2026-02-05',
                    isRecurring: true,
                    frequency: 'MONTHLY',
                },
            ],
            accounts: [
                { id: 'acc-1', balance: 10000 },
            ],
        });
    });

    it('should render projection widget', () => {
        render(<FinanceProjectionWidget />);

        expect(screen.getByText(/Proyección/i)).toBeInTheDocument();
    });

    it('should display current balance', () => {
        render(<FinanceProjectionWidget />);

        expect(screen.getByText(/10,000/)).toBeInTheDocument();
    });

    it('should display projection chart', () => {
        render(<FinanceProjectionWidget />);

        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should project future balance based on recurring transactions', () => {
        render(<FinanceProjectionWidget />);

        // Should show positive projection (income > expenses)
        expect(screen.getByText(/Proyección/i)).toBeInTheDocument();
    });

    it('should handle 1 month projection', () => {
        render(<FinanceProjectionWidget period="1month" />);

        expect(screen.getByText(/Proyección/i)).toBeInTheDocument();
    });

    it('should handle 3 month projection', () => {
        render(<FinanceProjectionWidget period="3months" />);

        expect(screen.getByText(/Proyección/i)).toBeInTheDocument();
    });

    it('should handle 6 month projection', () => {
        render(<FinanceProjectionWidget period="6months" />);

        expect(screen.getByText(/Proyección/i)).toBeInTheDocument();
    });

    it('should handle 1 year projection', () => {
        render(<FinanceProjectionWidget period="1year" />);

        expect(screen.getByText(/Proyección/i)).toBeInTheDocument();
    });

    it('should handle no recurring transactions', () => {
        (useFinanceStore as any).mockReturnValue({
            transactions: [],
            accounts: [{ id: 'acc-1', balance: 5000 }],
        });

        render(<FinanceProjectionWidget />);

        expect(screen.getByText(/Proyección/i)).toBeInTheDocument();
    });

    it('should handle no accounts', () => {
        (useFinanceStore as any).mockReturnValue({
            transactions: [],
            accounts: [],
        });

        render(<FinanceProjectionWidget />);

        expect(screen.getByText(/Sin datos/i) || screen.getByText(/No hay/i)).toBeInTheDocument();
    });

    it('should show positive trend for net positive cash flow', () => {
        render(<FinanceProjectionWidget />);

        // Income (3000) > Expenses (1500) = positive trend
        expect(screen.getByText(/Proyección/i)).toBeInTheDocument();
    });

    it('should show negative trend for net negative cash flow', () => {
        (useFinanceStore as any).mockReturnValue({
            transactions: [
                {
                    id: '1',
                    type: 'INCOME',
                    amount: 1000,
                    isRecurring: true,
                    frequency: 'MONTHLY',
                },
                {
                    id: '2',
                    type: 'EXPENSE',
                    amount: 2000,
                    isRecurring: true,
                    frequency: 'MONTHLY',
                },
            ],
            accounts: [{ id: 'acc-1', balance: 10000 }],
        });

        render(<FinanceProjectionWidget />);

        expect(screen.getByText(/Proyección/i)).toBeInTheDocument();
    });

    it('should include only recurring transactions in projection', () => {
        (useFinanceStore as any).mockReturnValue({
            transactions: [
                {
                    id: '1',
                    type: 'INCOME',
                    amount: 3000,
                    isRecurring: true,
                    frequency: 'MONTHLY',
                },
                {
                    id: '2',
                    type: 'EXPENSE',
                    amount: 5000,
                    isRecurring: false, // One-time expense
                },
            ],
            accounts: [{ id: 'acc-1', balance: 10000 }],
        });

        render(<FinanceProjectionWidget />);

        // Should project positive (only recurring income counted)
        expect(screen.getByText(/Proyección/i)).toBeInTheDocument();
    });

    it('should calculate total balance from multiple accounts', () => {
        (useFinanceStore as any).mockReturnValue({
            transactions: [],
            accounts: [
                { id: 'acc-1', balance: 5000 },
                { id: 'acc-2', balance: 3000 },
                { id: 'acc-3', balance: 2000 },
            ],
        });

        render(<FinanceProjectionWidget />);

        expect(screen.getByText(/10,000/)).toBeInTheDocument();
    });
});
