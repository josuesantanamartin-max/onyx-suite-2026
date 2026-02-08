import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '../useUserStore';

describe('useUserStore', () => {
    beforeEach(() => {
        useUserStore.setState({
            isAuthenticated: false,
            isDemoMode: false,
            language: 'ES',
            currency: 'EUR',
            theme: 'light',
            userProfile: null,
            subscription: {
                plan: 'FREE',
                status: 'NONE'
            },
            hasCompletedOnboarding: false,
            automationRules: [],
            syncLogs: []
        });
    });

    describe('Authentication', () => {
        it('should set authenticated state', () => {
            useUserStore.getState().setAuthenticated(true);
            expect(useUserStore.getState().isAuthenticated).toBe(true);
        });

        it('should enable demo mode', () => {
            useUserStore.getState().setDemoMode(true);
            expect(useUserStore.getState().isDemoMode).toBe(true);
        });

        it('should set user profile', () => {
            const profile = {
                id: 'user123',
                email: 'test@example.com',
                full_name: 'Test User',
                avatar_url: 'https://example.com/avatar.jpg'
            };

            useUserStore.getState().setUserProfile(profile);
            expect(useUserStore.getState().userProfile).toEqual(profile);
        });
    });

    describe('Preferences', () => {
        it('should change language', () => {
            useUserStore.getState().setLanguage('EN');
            expect(useUserStore.getState().language).toBe('EN');
        });

        it('should change currency', () => {
            useUserStore.getState().setCurrency('USD');
            expect(useUserStore.getState().currency).toBe('USD');
        });

        it('should change theme', () => {
            useUserStore.getState().setTheme('dark');
            expect(useUserStore.getState().theme).toBe('dark');
        });
    });

    describe('Subscription', () => {
        it('should update subscription plan', () => {
            const subscription = {
                plan: 'PRO' as const,
                status: 'ACTIVE' as const,
                expiryDate: '2026-12-31'
            };

            useUserStore.getState().setSubscription(subscription);
            expect(useUserStore.getState().subscription.plan).toBe('PRO');
            expect(useUserStore.getState().subscription.status).toBe('ACTIVE');
        });

        it('should handle free plan', () => {
            const subscription = {
                plan: 'FREE' as const,
                status: 'NONE' as const
            };

            useUserStore.getState().setSubscription(subscription);
            expect(useUserStore.getState().subscription.plan).toBe('FREE');
        });
    });

    describe('Onboarding', () => {
        it('should mark onboarding as completed', () => {
            useUserStore.getState().completeOnboarding();
            expect(useUserStore.getState().hasCompletedOnboarding).toBe(true);
        });

        it('should start with onboarding incomplete', () => {
            expect(useUserStore.getState().hasCompletedOnboarding).toBe(false);
        });
    });

    describe('Sync Logs', () => {
        it('should add sync log', () => {
            const log = {
                message: 'Data synced successfully',
                timestamp: Date.now(),
                type: 'SYSTEM' as const
            };

            useUserStore.getState().addSyncLog(log);
            expect(useUserStore.getState().syncLogs).toHaveLength(1);
            expect(useUserStore.getState().syncLogs[0].message).toBe('Data synced successfully');
        });

        it('should maintain log history', () => {
            const logs = [
                { message: 'Log 1', timestamp: Date.now(), type: 'FINANCE' as const },
                { message: 'Log 2', timestamp: Date.now(), type: 'KITCHEN' as const },
                { message: 'Log 3', timestamp: Date.now(), type: 'SYSTEM' as const }
            ];

            logs.forEach(log => useUserStore.getState().addSyncLog(log));
            expect(useUserStore.getState().syncLogs).toHaveLength(3);
        });
    });
});
