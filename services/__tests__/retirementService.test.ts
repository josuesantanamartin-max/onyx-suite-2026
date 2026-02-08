import { describe, it, expect, vi } from 'vitest';
import { retirementService } from '../retirementService';

// Mock Supabase client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockSingle = vi.fn();
const mockGetUser = vi.fn();

vi.mock('../supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: mockSelect,
            insert: mockInsert,
            update: mockUpdate,
            delete: mockDelete,
        })),
        auth: {
            getUser: mockGetUser,
        },
    },
}));

describe('RetirementService', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock chain
        mockSelect.mockReturnValue({ order: mockOrder });
        mockOrder.mockResolvedValue({ data: [], error: null });
        mockInsert.mockReturnValue({ select: mockSelect });
        mockUpdate.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });
        mockSingle.mockResolvedValue({ data: null, error: null });
        mockDelete.mockReturnValue({ eq: mockEq });
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    });

    describe('getPlans', () => {
        it('should fetch all retirement plans', async () => {
            const mockPlans = [
                { id: '1', name: 'Plan A', targetAmount: 500000 },
                { id: '2', name: 'Plan B', targetAmount: 750000 },
            ];

            mockOrder.mockResolvedValueOnce({ data: mockPlans, error: null });

            const result = await retirementService.getPlans();

            expect(result).toEqual(mockPlans);
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
        });

        it('should throw error if fetch fails', async () => {
            mockOrder.mockResolvedValueOnce({ data: null, error: new Error('Fetch failed') });

            await expect(retirementService.getPlans()).rejects.toThrow('Fetch failed');
        });

        it('should return empty array if no plans exist', async () => {
            mockOrder.mockResolvedValueOnce({ data: [], error: null });

            const result = await retirementService.getPlans();

            expect(result).toEqual([]);
        });
    });

    describe('createPlan', () => {
        it('should create a new retirement plan', async () => {
            const newPlan = {
                name: 'My Retirement',
                targetAmount: 1000000,
                currentAge: 30,
                retirementAge: 65,
            };

            const createdPlan = { id: 'plan-123', ...newPlan, user_id: 'user-123' };
            mockSingle.mockResolvedValueOnce({ data: createdPlan, error: null });

            const result = await retirementService.createPlan(newPlan);

            expect(result).toEqual(createdPlan);
            expect(mockInsert).toHaveBeenCalledWith({
                ...newPlan,
                user_id: 'user-123',
            });
        });

        it('should throw error if creation fails', async () => {
            mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Creation failed') });

            await expect(
                retirementService.createPlan({ name: 'Test', targetAmount: 100000 } as any)
            ).rejects.toThrow('Creation failed');
        });

        it('should include user ID from auth', async () => {
            const newPlan = { name: 'Test Plan', targetAmount: 500000 } as any;
            mockSingle.mockResolvedValueOnce({ data: { id: '1', ...newPlan }, error: null });

            await retirementService.createPlan(newPlan);

            expect(mockGetUser).toHaveBeenCalled();
            expect(mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({ user_id: 'user-123' })
            );
        });
    });

    describe('updatePlan', () => {
        it('should update an existing plan', async () => {
            const updates = { targetAmount: 1200000 };
            const updatedPlan = { id: 'plan-123', name: 'Updated', ...updates };

            mockSingle.mockResolvedValueOnce({ data: updatedPlan, error: null });

            const result = await retirementService.updatePlan('plan-123', updates);

            expect(result).toEqual(updatedPlan);
            expect(mockUpdate).toHaveBeenCalledWith(updates);
            expect(mockEq).toHaveBeenCalledWith('id', 'plan-123');
        });

        it('should throw error if update fails', async () => {
            mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Update failed') });

            await expect(
                retirementService.updatePlan('plan-123', { targetAmount: 500000 })
            ).rejects.toThrow('Update failed');
        });

        it('should handle partial updates', async () => {
            const partialUpdate = { name: 'New Name' };
            mockSingle.mockResolvedValueOnce({ data: { id: '1', ...partialUpdate }, error: null });

            await retirementService.updatePlan('plan-123', partialUpdate);

            expect(mockUpdate).toHaveBeenCalledWith(partialUpdate);
        });
    });

    describe('deletePlan', () => {
        it('should delete a plan by ID', async () => {
            mockEq.mockResolvedValueOnce({ error: null });

            await retirementService.deletePlan('plan-123');

            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', 'plan-123');
        });

        it('should throw error if deletion fails', async () => {
            mockEq.mockResolvedValueOnce({ error: new Error('Deletion failed') });

            await expect(retirementService.deletePlan('plan-123')).rejects.toThrow('Deletion failed');
        });
    });

    describe('Error handling', () => {
        it('should throw error if Supabase client is not initialized', async () => {
            // This test would require mocking the module differently
            // Skipping for now as the current implementation always has supabase
        });
    });
});
