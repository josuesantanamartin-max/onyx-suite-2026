import { describe, it, expect, vi, beforeEach } from 'vitest';
import { householdService } from '../householdService';

// Mock Supabase client
const mockRpc = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockSingle = vi.fn();
const mockGetUser = vi.fn();

vi.mock('../supabaseClient', () => ({
    supabase: {
        rpc: mockRpc,
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

describe('HouseholdService', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock chains
        mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq });
        mockOrder.mockReturnValue({ limit: mockLimit });
        mockLimit.mockResolvedValue({ data: [], error: null });
        mockInsert.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });
        mockSingle.mockResolvedValue({ data: null, error: null });
        mockUpdate.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ select: mockSelect, data: null, error: null });
        mockDelete.mockReturnValue({ eq: mockEq });
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    });

    describe('createHousehold', () => {
        it('should create a new household', async () => {
            mockRpc.mockResolvedValueOnce({ data: 'household-123', error: null });

            const result = await householdService.createHousehold({
                name: 'My Family',
                currency: 'EUR',
            });

            expect(result).toBe('household-123');
            expect(mockRpc).toHaveBeenCalledWith('create_new_household', {
                household_name: 'My Family',
                household_currency: 'EUR',
            });
        });

        it('should throw error if creation fails', async () => {
            mockRpc.mockResolvedValueOnce({ data: null, error: new Error('Creation failed') });

            await expect(
                householdService.createHousehold({ name: 'Test', currency: 'USD' })
            ).rejects.toThrow('Creation failed');
        });
    });

    describe('getMyHouseholds', () => {
        it('should fetch all user households', async () => {
            const mockHouseholds = [
                { id: '1', name: 'Family', currency: 'EUR' },
                { id: '2', name: 'Roommates', currency: 'USD' },
            ];

            mockOrder.mockResolvedValueOnce({ data: mockHouseholds, error: null });

            const result = await householdService.getMyHouseholds();

            expect(result).toEqual(mockHouseholds);
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
        });

        it('should throw error if fetch fails', async () => {
            mockOrder.mockResolvedValueOnce({ data: null, error: new Error('Fetch failed') });

            await expect(householdService.getMyHouseholds()).rejects.toThrow('Fetch failed');
        });
    });

    describe('getHouseholdMembers', () => {
        it('should fetch household members', async () => {
            const mockMembers = [
                { id: '1', user_id: 'user-1', role: 'ADMIN' },
                { id: '2', user_id: 'user-2', role: 'MEMBER' },
            ];

            mockEq.mockResolvedValueOnce({ data: mockMembers, error: null });

            const result = await householdService.getHouseholdMembers('household-123');

            expect(result).toEqual(mockMembers);
            expect(mockSelect).toHaveBeenCalledWith('*, user:user_id(email, user_metadata)');
            expect(mockEq).toHaveBeenCalledWith('household_id', 'household-123');
        });

        it('should throw error if fetch fails', async () => {
            mockEq.mockResolvedValueOnce({ data: null, error: new Error('Fetch failed') });

            await expect(
                householdService.getHouseholdMembers('household-123')
            ).rejects.toThrow('Fetch failed');
        });
    });

    describe('inviteMember', () => {
        it('should invite a member to household', async () => {
            const mockInvite = {
                id: 'invite-123',
                household_id: 'household-123',
                email: 'user@example.com',
                role: 'MEMBER',
            };

            mockSingle.mockResolvedValueOnce({ data: mockInvite, error: null });

            const result = await householdService.inviteMember(
                'household-123',
                'user@example.com',
                'MEMBER'
            );

            expect(result).toEqual(mockInvite);
            expect(mockInsert).toHaveBeenCalledWith({
                household_id: 'household-123',
                email: 'user@example.com',
                role: 'MEMBER',
                created_by: 'user-123',
            });
        });

        it('should throw error if invite fails', async () => {
            mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Invite failed') });

            await expect(
                householdService.inviteMember('household-123', 'user@example.com', 'MEMBER')
            ).rejects.toThrow('Invite failed');
        });
    });

    describe('updatePermissions', () => {
        it('should update household permissions', async () => {
            const permissions = {
                ADMIN: { canEdit: true, canDelete: true },
                MEMBER: { canEdit: true, canDelete: false },
            };

            mockEq.mockResolvedValueOnce({ error: null });

            await householdService.updatePermissions('household-123', permissions as any);

            expect(mockUpdate).toHaveBeenCalledWith({ permissions });
            expect(mockEq).toHaveBeenCalledWith('id', 'household-123');
        });

        it('should throw error if update fails', async () => {
            mockEq.mockResolvedValueOnce({ error: new Error('Update failed') });

            await expect(
                householdService.updatePermissions('household-123', {} as any)
            ).rejects.toThrow('Update failed');
        });
    });

    describe('leaveHousehold', () => {
        it('should allow user to leave household', async () => {
            mockEq.mockReturnValue({ eq: mockEq });
            mockEq.mockResolvedValueOnce({ error: null });

            await householdService.leaveHousehold('household-123');

            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('household_id', 'household-123');
            expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
        });

        it('should throw error if user not found', async () => {
            mockGetUser.mockResolvedValueOnce({ data: { user: null } });

            await expect(
                householdService.leaveHousehold('household-123')
            ).rejects.toThrow('User not found');
        });

        it('should throw error if leave fails', async () => {
            mockEq.mockReturnValue({ eq: mockEq });
            mockEq.mockResolvedValueOnce({ error: new Error('Leave failed') });

            await expect(
                householdService.leaveHousehold('household-123')
            ).rejects.toThrow('Leave failed');
        });
    });

    describe('sendMessage', () => {
        it('should send a message to household', async () => {
            mockInsert.mockResolvedValueOnce({ error: null });

            await householdService.sendMessage('household-123', 'Hello everyone!');

            expect(mockInsert).toHaveBeenCalledWith({
                household_id: 'household-123',
                content: 'Hello everyone!',
                user_id: 'user-123',
            });
        });

        it('should throw error if send fails', async () => {
            mockInsert.mockResolvedValueOnce({ error: new Error('Send failed') });

            await expect(
                householdService.sendMessage('household-123', 'Test')
            ).rejects.toThrow('Send failed');
        });
    });

    describe('getMessages', () => {
        it('should fetch household messages with default limit', async () => {
            const mockMessages = [
                { id: '1', content: 'Hello', user_id: 'user-1' },
                { id: '2', content: 'Hi', user_id: 'user-2' },
            ];

            mockLimit.mockResolvedValueOnce({ data: mockMessages, error: null });

            const result = await householdService.getMessages('household-123');

            expect(result).toEqual(mockMessages);
            expect(mockSelect).toHaveBeenCalledWith('*, user:user_id(email, user_metadata)');
            expect(mockEq).toHaveBeenCalledWith('household_id', 'household-123');
            expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
            expect(mockLimit).toHaveBeenCalledWith(50);
        });

        it('should fetch messages with custom limit', async () => {
            mockLimit.mockResolvedValueOnce({ data: [], error: null });

            await householdService.getMessages('household-123', 20);

            expect(mockLimit).toHaveBeenCalledWith(20);
        });

        it('should throw error if fetch fails', async () => {
            mockLimit.mockResolvedValueOnce({ data: null, error: new Error('Fetch failed') });

            await expect(
                householdService.getMessages('household-123')
            ).rejects.toThrow('Fetch failed');
        });
    });
});
