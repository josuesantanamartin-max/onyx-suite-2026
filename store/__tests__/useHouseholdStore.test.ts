import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHouseholdStore } from '../useHouseholdStore';
import { Household, HouseholdMember } from '../../types';

// Mock householdService
vi.mock('../../services/householdService', () => ({
    householdService: {
        getMyHouseholds: vi.fn(),
        createHousehold: vi.fn(),
        getHouseholdMembers: vi.fn(),
        inviteMember: vi.fn(),
    },
}));

import { householdService } from '../../services/householdService';

describe('UseHouseholdStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useHouseholdStore.setState({
            households: [],
            activeHouseholdId: null,
            members: [],
            isLoading: false,
            error: null,
        });
    });

    describe('fetchHouseholds', () => {
        it('should fetch households successfully', async () => {
            const mockHouseholds: Household[] = [
                { id: 'household-1', name: 'Family', currency: 'EUR' } as Household,
                { id: 'household-2', name: 'Roommates', currency: 'USD' } as Household,
            ];

            (householdService.getMyHouseholds as any).mockResolvedValueOnce(mockHouseholds);

            await useHouseholdStore.getState().fetchHouseholds();

            const state = useHouseholdStore.getState();
            expect(state.households).toEqual(mockHouseholds);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('should set first household as active if none selected', async () => {
            const mockHouseholds: Household[] = [
                { id: 'household-1', name: 'Family' } as Household,
            ];

            (householdService.getMyHouseholds as any).mockResolvedValueOnce(mockHouseholds);

            await useHouseholdStore.getState().fetchHouseholds();

            expect(useHouseholdStore.getState().activeHouseholdId).toBe('household-1');
        });

        it('should not change active household if already set', async () => {
            useHouseholdStore.setState({ activeHouseholdId: 'household-2' });

            const mockHouseholds: Household[] = [
                { id: 'household-1', name: 'Family' } as Household,
            ];

            (householdService.getMyHouseholds as any).mockResolvedValueOnce(mockHouseholds);

            await useHouseholdStore.getState().fetchHouseholds();

            expect(useHouseholdStore.getState().activeHouseholdId).toBe('household-2');
        });

        it('should handle fetch errors', async () => {
            (householdService.getMyHouseholds as any).mockRejectedValueOnce(
                new Error('Fetch failed')
            );

            await useHouseholdStore.getState().fetchHouseholds();

            const state = useHouseholdStore.getState();
            expect(state.error).toBe('Fetch failed');
            expect(state.isLoading).toBe(false);
        });

        it('should set loading state during fetch', async () => {
            (householdService.getMyHouseholds as any).mockImplementationOnce(
                () => new Promise(resolve => setTimeout(() => resolve([]), 100))
            );

            const promise = useHouseholdStore.getState().fetchHouseholds();

            expect(useHouseholdStore.getState().isLoading).toBe(true);

            await promise;

            expect(useHouseholdStore.getState().isLoading).toBe(false);
        });
    });

    describe('setActiveHousehold', () => {
        it('should set active household', () => {
            (householdService.getHouseholdMembers as any).mockResolvedValueOnce([]);

            useHouseholdStore.getState().setActiveHousehold('household-123');

            expect(useHouseholdStore.getState().activeHouseholdId).toBe('household-123');
        });

        it('should fetch members when setting active household', () => {
            (householdService.getHouseholdMembers as any).mockResolvedValueOnce([]);

            useHouseholdStore.getState().setActiveHousehold('household-123');

            expect(householdService.getHouseholdMembers).toHaveBeenCalledWith('household-123');
        });
    });

    describe('createHousehold', () => {
        it('should create household successfully', async () => {
            (householdService.createHousehold as any).mockResolvedValueOnce('household-123');
            (householdService.getMyHouseholds as any).mockResolvedValueOnce([]);

            await useHouseholdStore.getState().createHousehold('New Household', 'EUR');

            expect(householdService.createHousehold).toHaveBeenCalledWith({
                name: 'New Household',
                currency: 'EUR',
            });
            expect(householdService.getMyHouseholds).toHaveBeenCalled();
        });

        it('should handle creation errors', async () => {
            (householdService.createHousehold as any).mockRejectedValueOnce(
                new Error('Creation failed')
            );

            await expect(
                useHouseholdStore.getState().createHousehold('Test', 'USD')
            ).rejects.toThrow('Creation failed');

            expect(useHouseholdStore.getState().error).toBe('Creation failed');
        });

        it('should set loading state during creation', async () => {
            (householdService.createHousehold as any).mockImplementationOnce(
                () => new Promise(resolve => setTimeout(() => resolve('id'), 100))
            );
            (householdService.getMyHouseholds as any).mockResolvedValueOnce([]);

            const promise = useHouseholdStore.getState().createHousehold('Test', 'GBP');

            expect(useHouseholdStore.getState().isLoading).toBe(true);

            await promise;
        });
    });

    describe('fetchMembers', () => {
        it('should fetch household members', async () => {
            const mockMembers: HouseholdMember[] = [
                {
                    id: 'member-1',
                    userId: 'user-1',
                    role: 'ADMIN',
                    joinedAt: '2026-01-01',
                    canViewAccounts: ['account-1', 'account-2'],
                    canEditBudgets: true,
                    canAddTransactions: true,
                } as HouseholdMember,
                {
                    id: 'member-2',
                    userId: 'user-2',
                    role: 'MEMBER',
                    joinedAt: '2026-01-15',
                    canViewAccounts: ['account-1'],
                    canEditBudgets: false,
                    canAddTransactions: true,
                } as HouseholdMember,
            ];

            (householdService.getHouseholdMembers as any).mockResolvedValueOnce(mockMembers);

            await useHouseholdStore.getState().fetchMembers('household-123');

            expect(useHouseholdStore.getState().members).toEqual(mockMembers);
        });

        it('should handle fetch members errors silently', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            (householdService.getHouseholdMembers as any).mockRejectedValueOnce(
                new Error('Fetch failed')
            );

            await useHouseholdStore.getState().fetchMembers('household-123');

            expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch members', expect.any(Error));

            consoleSpy.mockRestore();
        });
    });

    describe('inviteMember', () => {
        it('should invite member to active household', async () => {
            useHouseholdStore.setState({ activeHouseholdId: 'household-123' });

            (householdService.inviteMember as any).mockResolvedValueOnce({});

            await useHouseholdStore.getState().inviteMember('user@example.com', 'MEMBER');

            expect(householdService.inviteMember).toHaveBeenCalledWith(
                'household-123',
                'user@example.com',
                'MEMBER'
            );
        });

        it('should throw error if no active household', async () => {
            useHouseholdStore.setState({ activeHouseholdId: null });

            await expect(
                useHouseholdStore.getState().inviteMember('user@example.com', 'MEMBER')
            ).rejects.toThrow('No active household');
        });

        it('should support all role types', async () => {
            useHouseholdStore.setState({ activeHouseholdId: 'household-123' });
            (householdService.inviteMember as any).mockResolvedValue({});

            await useHouseholdStore.getState().inviteMember('admin@example.com', 'ADMIN');
            await useHouseholdStore.getState().inviteMember('member@example.com', 'MEMBER');
            await useHouseholdStore.getState().inviteMember('viewer@example.com', 'VIEWER');

            expect(householdService.inviteMember).toHaveBeenCalledTimes(3);
        });
    });

    describe('Error handling', () => {
        it('should clear error on successful operation', async () => {
            useHouseholdStore.setState({ error: 'Previous error' });

            (householdService.getMyHouseholds as any).mockResolvedValueOnce([]);

            await useHouseholdStore.getState().fetchHouseholds();

            expect(useHouseholdStore.getState().error).toBeNull();
        });
    });
});
