import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRetirementStore } from '../useRetirementStore';
import { RetirementPlan } from '../../types';

// Mock services
vi.mock('../../services/retirementService', () => ({
    retirementService: {
        getPlans: vi.fn(),
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        deletePlan: vi.fn(),
    },
}));

vi.mock('../../utils/retirementCalculator', () => ({
    retirementCalculator: {
        calculate: vi.fn(),
    },
}));

import { retirementService } from '../../services/retirementService';
import { retirementCalculator } from '../../utils/retirementCalculator';

describe('UseRetirementStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useRetirementStore.setState({
            plans: [],
            activePlanId: null,
            isLoading: false,
            error: null,
        });
    });

    describe('fetchPlans', () => {
        it('should fetch plans and calculate projections', async () => {
            const mockPlans: RetirementPlan[] = [
                {
                    id: 'plan-1',
                    name: 'My Retirement',
                    currentAge: 30,
                    targetAge: 65,
                    currentSavings: 50000,
                    monthlyContribution: 1000,
                    expectedReturn: 7,
                    inflationRate: 2,
                    targetMonthlyIncome: 3000,
                } as RetirementPlan,
            ];

            const mockProjection = {
                totalSavings: 1000000,
                monthlyIncome: 3500,
                yearsOfFunding: 30,
            };

            (retirementService.getPlans as any).mockResolvedValueOnce(mockPlans);
            (retirementCalculator.calculate as any).mockReturnValueOnce(mockProjection);

            await useRetirementStore.getState().fetchPlans();

            const state = useRetirementStore.getState();
            expect(state.plans).toHaveLength(1);
            expect(state.plans[0].projection).toEqual(mockProjection);
            expect(state.isLoading).toBe(false);
        });

        it('should handle fetch errors', async () => {
            (retirementService.getPlans as any).mockRejectedValueOnce(new Error('Fetch failed'));

            await useRetirementStore.getState().fetchPlans();

            const state = useRetirementStore.getState();
            expect(state.error).toBe('Fetch failed');
            expect(state.isLoading).toBe(false);
        });

        it('should set loading state during fetch', async () => {
            (retirementService.getPlans as any).mockImplementationOnce(
                () => new Promise(resolve => setTimeout(() => resolve([]), 100))
            );

            const promise = useRetirementStore.getState().fetchPlans();

            expect(useRetirementStore.getState().isLoading).toBe(true);

            await promise;

            expect(useRetirementStore.getState().isLoading).toBe(false);
        });
    });

    describe('createPlan', () => {
        it('should create plan and refresh list', async () => {
            const newPlan = {
                name: 'New Plan',
                currentAge: 25,
                targetAge: 65,
                currentSavings: 10000,
                monthlyContribution: 500,
                expectedReturn: 7,
                inflationRate: 2,
                targetMonthlyIncome: 2500,
            };

            (retirementService.createPlan as any).mockResolvedValueOnce({});
            (retirementService.getPlans as any).mockResolvedValueOnce([]);
            (retirementCalculator.calculate as any).mockReturnValue({});

            await useRetirementStore.getState().createPlan(newPlan);

            expect(retirementService.createPlan).toHaveBeenCalledWith(newPlan);
            expect(retirementService.getPlans).toHaveBeenCalled();
        });

        it('should handle creation errors', async () => {
            (retirementService.createPlan as any).mockRejectedValueOnce(
                new Error('Creation failed')
            );

            await expect(
                useRetirementStore.getState().createPlan({})
            ).rejects.toThrow('Creation failed');

            expect(useRetirementStore.getState().error).toBe('Creation failed');
        });
    });

    describe('updatePlan', () => {
        it('should update plan and refresh list', async () => {
            const updates = { monthlyContribution: 1500 };

            (retirementService.updatePlan as any).mockResolvedValueOnce({});
            (retirementService.getPlans as any).mockResolvedValueOnce([]);
            (retirementCalculator.calculate as any).mockReturnValue({});

            await useRetirementStore.getState().updatePlan('plan-123', updates);

            expect(retirementService.updatePlan).toHaveBeenCalledWith('plan-123', updates);
            expect(retirementService.getPlans).toHaveBeenCalled();
        });

        it('should handle update errors', async () => {
            (retirementService.updatePlan as any).mockRejectedValueOnce(
                new Error('Update failed')
            );

            await useRetirementStore.getState().updatePlan('plan-123', {});

            expect(useRetirementStore.getState().error).toBe('Update failed');
        });
    });

    describe('deletePlan', () => {
        it('should delete plan from store', async () => {
            const plans: RetirementPlan[] = [
                { id: 'plan-1', name: 'Plan 1' } as RetirementPlan,
                { id: 'plan-2', name: 'Plan 2' } as RetirementPlan,
            ];

            useRetirementStore.setState({ plans });

            (retirementService.deletePlan as any).mockResolvedValueOnce({});

            await useRetirementStore.getState().deletePlan('plan-1');

            const state = useRetirementStore.getState();
            expect(state.plans).toHaveLength(1);
            expect(state.plans[0].id).toBe('plan-2');
        });

        it('should clear active plan if deleted', async () => {
            const plans: RetirementPlan[] = [
                { id: 'plan-1', name: 'Plan 1' } as RetirementPlan,
            ];

            useRetirementStore.setState({ plans, activePlanId: 'plan-1' });

            (retirementService.deletePlan as any).mockResolvedValueOnce({});

            await useRetirementStore.getState().deletePlan('plan-1');

            expect(useRetirementStore.getState().activePlanId).toBeNull();
        });

        it('should keep active plan if different plan deleted', async () => {
            const plans: RetirementPlan[] = [
                { id: 'plan-1', name: 'Plan 1' } as RetirementPlan,
                { id: 'plan-2', name: 'Plan 2' } as RetirementPlan,
            ];

            useRetirementStore.setState({ plans, activePlanId: 'plan-2' });

            (retirementService.deletePlan as any).mockResolvedValueOnce({});

            await useRetirementStore.getState().deletePlan('plan-1');

            expect(useRetirementStore.getState().activePlanId).toBe('plan-2');
        });

        it('should handle deletion errors', async () => {
            (retirementService.deletePlan as any).mockRejectedValueOnce(
                new Error('Deletion failed')
            );

            await useRetirementStore.getState().deletePlan('plan-123');

            expect(useRetirementStore.getState().error).toBe('Deletion failed');
        });
    });

    describe('setActivePlan', () => {
        it('should set active plan', () => {
            useRetirementStore.getState().setActivePlan('plan-123');

            expect(useRetirementStore.getState().activePlanId).toBe('plan-123');
        });

        it('should allow clearing active plan', () => {
            useRetirementStore.setState({ activePlanId: 'plan-123' });

            useRetirementStore.getState().setActivePlan(null as any);

            expect(useRetirementStore.getState().activePlanId).toBeNull();
        });
    });

    describe('runSimulation', () => {
        it('should calculate projection for plan', () => {
            const plan: RetirementPlan = {
                id: 'plan-1',
                currentAge: 30,
                targetAge: 65,
                currentSavings: 50000,
                monthlyContribution: 1000,
                expectedReturn: 7,
                inflationRate: 2,
                targetMonthlyIncome: 3000,
            } as RetirementPlan;

            const mockProjection = {
                totalSavings: 1000000,
                monthlyIncome: 3500,
                yearsOfFunding: 30,
            };

            (retirementCalculator.calculate as any).mockReturnValueOnce(mockProjection);

            const result = useRetirementStore.getState().runSimulation(plan);

            expect(result.projection).toEqual(mockProjection);
            expect(retirementCalculator.calculate).toHaveBeenCalledWith(
                30, 65, 50000, 1000, 7, 2, 3000
            );
        });

        it('should not modify original plan', () => {
            const plan: RetirementPlan = {
                id: 'plan-1',
                currentAge: 30,
            } as RetirementPlan;

            (retirementCalculator.calculate as any).mockReturnValue({
                totalSavings: 100000,
                monthlyIncome: 400,
                yearsOfFunding: 10,
            });

            const result = useRetirementStore.getState().runSimulation(plan);

            expect(result).not.toBe(plan);
            expect(plan.projection).toBeUndefined();
        });
    });

    describe('Error handling', () => {
        it('should clear error on successful operation', async () => {
            useRetirementStore.setState({ error: 'Previous error' });

            (retirementService.getPlans as any).mockResolvedValueOnce([]);

            await useRetirementStore.getState().fetchPlans();

            expect(useRetirementStore.getState().error).toBeNull();
        });
    });
});
