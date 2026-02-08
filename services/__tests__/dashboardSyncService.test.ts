import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardSyncService } from '../dashboardSyncService';
import { supabase } from '../supabaseClient';
import { DashboardLayout } from '../../types';

// Mock Supabase client - must be inline due to vi.mock hoisting
vi.mock('../supabaseClient', () => {
    const createChain = (finalValue: any = { data: null, error: null }) => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(finalValue),
        then: vi.fn((resolve) => resolve(finalValue)),
    });

    return {
        supabase: {
            from: vi.fn(() => createChain()),
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
            },
        },
    };
});

describe('DashboardSyncService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('loadUserLayouts', () => {
        it('should load layouts from Supabase', async () => {
            const mockLayouts = [
                {
                    layout_id: '1',
                    user_id: 'user123',
                    name: 'My Layout',
                    description: 'Test layout',
                    is_default: true,
                    widgets: [],
                    created_at: '2026-01-01',
                    updated_at: '2026-01-01',
                },
            ];

            const mockFrom = vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: mockLayouts, error: null }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await dashboardSyncService.loadUserLayouts('user123');

            expect(mockFrom).toHaveBeenCalledWith('user_dashboard_layouts');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
            expect(result[0].name).toBe('My Layout');
        });

        it('should return empty array when no layouts exist', async () => {
            const mockFrom = vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await dashboardSyncService.loadUserLayouts('user123');

            expect(result).toEqual([]);
        });

        it('should handle errors gracefully', async () => {
            const mockFrom = vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await dashboardSyncService.loadUserLayouts('user123');

            expect(result).toEqual([]);
        });
    });

    describe('saveLayout', () => {
        it('should save layout to Supabase', async () => {
            const mockLayout: DashboardLayout = {
                id: '1',
                name: 'Test Layout',
                description: 'A test layout',
                isDefault: false,
                widgets: [],
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
            };

            const mockFrom = vi.fn(() => ({
                upsert: vi.fn().mockResolvedValue({ data: mockLayout, error: null }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await dashboardSyncService.saveLayout('user123', mockLayout);

            expect(mockFrom).toHaveBeenCalledWith('user_dashboard_layouts');
            expect(result).toBe(true);
        });

        it('should return false on save error', async () => {
            const mockLayout: DashboardLayout = {
                id: '1',
                name: 'Test Layout',
                isDefault: false,
                widgets: [],
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
            };

            const mockFrom = vi.fn(() => ({
                upsert: vi.fn().mockResolvedValue({ data: null, error: new Error('Save failed') }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await dashboardSyncService.saveLayout('user123', mockLayout);

            expect(result).toBe(false);
        });
    });

    describe('syncLayouts', () => {
        it('should sync multiple layouts', async () => {
            const mockLayouts: DashboardLayout[] = [
                { id: '1', name: 'Layout 1', isDefault: true, widgets: [], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
                { id: '2', name: 'Layout 2', isDefault: false, widgets: [], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
            ];

            vi.spyOn(dashboardSyncService, 'saveLayout').mockResolvedValue(true);

            const result = await dashboardSyncService.syncLayouts('user123', mockLayouts);

            expect(result).toBe(true);
            expect(dashboardSyncService.saveLayout).toHaveBeenCalledTimes(2);
        });

        it('should handle pending syncs with debounce', async () => {
            const layouts1: DashboardLayout[] = [
                { id: '1', name: 'Layout 1', isDefault: true, widgets: [], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
            ];
            const layouts2: DashboardLayout[] = [
                { id: '2', name: 'Layout 2', isDefault: false, widgets: [], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
            ];

            vi.spyOn(dashboardSyncService, 'saveLayout').mockResolvedValue(true);

            // Start first sync
            const promise1 = dashboardSyncService.syncLayouts('user123', layouts1);

            // Immediately start second sync (should be queued)
            const promise2 = dashboardSyncService.syncLayouts('user123', layouts2);

            await Promise.all([promise1, promise2]);

            // Both should complete successfully
            expect(await promise1).toBe(true);
            expect(await promise2).toBe(true);
        });
    });

    describe('setActiveLayout', () => {
        it('should set layout as active', async () => {
            const mockFrom = vi.fn(() => ({
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
            }));

            // First call deactivates all, second activates target
            mockFrom.mockReturnValueOnce({
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            });

            mockFrom.mockReturnValueOnce({
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            });

            (supabase.from as any) = mockFrom;

            const result = await dashboardSyncService.setActiveLayout('user123', 'layout1');

            expect(result).toBe(true);
        });
    });

    describe('deleteLayout', () => {
        it('should delete layout from Supabase', async () => {
            const mockFrom = vi.fn(() => ({
                delete: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await dashboardSyncService.deleteLayout('user123', 'layout1');

            expect(mockFrom).toHaveBeenCalledWith('user_dashboard_layouts');
            expect(result).toBe(true);
        });
    });

    describe('getActiveLayout', () => {
        it('should get active layout', async () => {
            const mockLayout = {
                layout_id: '1',
                user_id: 'user123',
                name: 'Active Layout',
                description: 'Test',
                is_default: true,
                is_active: true,
                widgets: [],
                created_at: '2026-01-01',
                updated_at: '2026-01-01',
            };

            const mockFrom = vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: mockLayout, error: null }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await dashboardSyncService.getActiveLayout('user123');

            expect(result).not.toBeNull();
            expect(result?.id).toBe('1');
            expect(result?.name).toBe('Active Layout');
        });

        it('should return null when no active layout exists', async () => {
            const mockFrom = vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
            }));

            (supabase.from as any) = mockFrom;

            const result = await dashboardSyncService.getActiveLayout('user123');

            expect(result).toBeNull();
        });
    });
});
