import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RetirementSimulator } from '../RetirementSimulator';
import { useRetirementStore } from '../../../../store/useRetirementStore';
import { retirementCalculator } from '../../../../utils/retirementCalculator';

// Mock dependencies
vi.mock('../../../../store/useRetirementStore');
vi.mock('../../../../utils/retirementCalculator');
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
    Area: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
}));

describe('RetirementSimulator', () => {
    const mockCreatePlan = vi.fn();
    const mockUpdatePlan = vi.fn();
    const mockSetActivePlan = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useRetirementStore as any).mockReturnValue({
            plans: [],
            createPlan: mockCreatePlan,
            updatePlan: mockUpdatePlan,
            activePlanId: null,
            setActivePlan: mockSetActivePlan,
        });

        (retirementCalculator.calculate as any).mockReturnValue({
            totalSavings: 500000,
            monthlyIncome: 2000,
            yearsOfFunding: 30,
        });

        (retirementCalculator.getRecommendations as any).mockReturnValue([
            'Recommendation 1',
            'Recommendation 2',
        ]);
    });

    it('should render retirement simulator', () => {
        render(<RetirementSimulator />);

        expect(screen.getByText('Planificador de Jubilación')).toBeInTheDocument();
    });

    it('should display input fields', () => {
        render(<RetirementSimulator />);

        expect(screen.getByLabelText(/Edad Actual/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Edad Retiro/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Ahorro Actual/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Aportación Mensual/i)).toBeInTheDocument();
    });

    it('should display projection results', () => {
        render(<RetirementSimulator />);

        expect(screen.getByText('Capital Acumulado')).toBeInTheDocument();
        expect(screen.getByText('500,000€')).toBeInTheDocument();
        expect(screen.getByText('2,000€')).toBeInTheDocument();
    });

    it('should update form data on input change', () => {
        render(<RetirementSimulator />);

        const ageInput = screen.getByLabelText(/Edad Actual/i);
        fireEvent.change(ageInput, { target: { value: '35' } });

        expect(ageInput).toHaveValue(35);
    });

    it('should recalculate on input change', () => {
        render(<RetirementSimulator />);

        const savingsInput = screen.getByLabelText(/Ahorro Actual/i);
        fireEvent.change(savingsInput, { target: { value: '20000' } });

        expect(retirementCalculator.calculate).toHaveBeenCalled();
    });

    it('should display chart', () => {
        render(<RetirementSimulator />);

        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should display recommendations', () => {
        render(<RetirementSimulator />);

        expect(screen.getByText('Recommendation 1')).toBeInTheDocument();
        expect(screen.getByText('Recommendation 2')).toBeInTheDocument();
    });

    it('should open save modal on save button click', () => {
        render(<RetirementSimulator />);

        const saveButton = screen.getByText('Guardar Plan');
        fireEvent.click(saveButton);

        expect(screen.getByText('Nombre del Plan')).toBeInTheDocument();
    });

    it('should create new plan when saving', async () => {
        mockCreatePlan.mockResolvedValueOnce({});

        render(<RetirementSimulator />);

        fireEvent.click(screen.getByText('Guardar Plan'));
        fireEvent.click(screen.getByText('Guardar'));

        await waitFor(() => {
            expect(mockCreatePlan).toHaveBeenCalled();
        });
    });

    it('should update existing plan when active plan exists', async () => {
        (useRetirementStore as any).mockReturnValue({
            plans: [{ id: 'plan-1', name: 'My Plan', currentAge: 30 }],
            createPlan: mockCreatePlan,
            updatePlan: mockUpdatePlan,
            activePlanId: 'plan-1',
            setActivePlan: mockSetActivePlan,
        });

        mockUpdatePlan.mockResolvedValueOnce({});

        render(<RetirementSimulator />);

        fireEvent.click(screen.getByText('Actualizar Plan'));
        fireEvent.click(screen.getByText('Guardar'));

        await waitFor(() => {
            expect(mockUpdatePlan).toHaveBeenCalled();
        });
    });

    it('should close modal on cancel', () => {
        render(<RetirementSimulator />);

        fireEvent.click(screen.getByText('Guardar Plan'));
        expect(screen.getByText('Nombre del Plan')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Cancelar'));
        expect(screen.queryByText('Nombre del Plan')).not.toBeInTheDocument();
    });

    it('should highlight low years of funding', () => {
        (retirementCalculator.calculate as any).mockReturnValue({
            totalSavings: 100000,
            monthlyIncome: 400,
            yearsOfFunding: 15,
        });

        render(<RetirementSimulator />);

        expect(screen.getByText('15 años')).toBeInTheDocument();
    });

    it('should load active plan data', () => {
        (useRetirementStore as any).mockReturnValue({
            plans: [{
                id: 'plan-1',
                name: 'Test Plan',
                currentAge: 35,
                targetAge: 67,
                currentSavings: 50000,
                monthlyContribution: 1000,
                expectedReturn: 8,
                inflationRate: 2.5,
                targetMonthlyIncome: 3000,
            }],
            createPlan: mockCreatePlan,
            updatePlan: mockUpdatePlan,
            activePlanId: 'plan-1',
            setActivePlan: mockSetActivePlan,
        });

        render(<RetirementSimulator />);

        expect(screen.getByLabelText(/Edad Actual/i)).toHaveValue(35);
        expect(screen.getByLabelText(/Edad Retiro/i)).toHaveValue(67);
    });

    it('should handle years of funding greater than 50', () => {
        (retirementCalculator.calculate as any).mockReturnValue({
            totalSavings: 2000000,
            monthlyIncome: 8000,
            yearsOfFunding: 60,
        });

        render(<RetirementSimulator />);

        expect(screen.getByText('> 50 años')).toBeInTheDocument();
    });
});
