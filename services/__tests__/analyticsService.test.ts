import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from '../analyticsService';

// Mock Vercel Analytics
vi.mock('@vercel/analytics', () => ({
    track: vi.fn(),
}));

describe('AnalyticsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Event Tracking', () => {
        it('should track custom events', () => {
            expect(() => analyticsService.trackEvent('test_event', {
                property1: 'value1',
                property2: 123,
            })).not.toThrow();
        });

        it('should track page views', () => {
            expect(() => analyticsService.trackPageView('dashboard', {
                section: 'finance',
            })).not.toThrow();
        });

        it('should track user actions', () => {
            expect(() => analyticsService.trackAction(
                'click',
                'button',
                { buttonId: 'submit' }
            )).not.toThrow();
        });
    });

    describe('Financial Events', () => {
        it('should track transaction creation', () => {
            expect(() => analyticsService.trackFinancialEvent('transaction_created', {
                amount: 50,
                category: 'food',
            })).not.toThrow();
        });

        it('should track budget creation', () => {
            expect(() => analyticsService.trackFinancialEvent('budget_created', {
                limit: 500,
                period: 'monthly',
            })).not.toThrow();
        });

        it('should track goal creation', () => {
            expect(() => analyticsService.trackFinancialEvent('goal_created', {
                target: 10000,
                deadline: '2026-12-31',
            })).not.toThrow();
        });
    });

    describe('AI Usage Tracking', () => {
        it('should track AI feature usage', () => {
            expect(() => analyticsService.trackAIUsage('recipe_generation', {
                ingredients: 5,
                servings: 4,
            })).not.toThrow();
        });
    });

    describe('Error Tracking', () => {
        it('should track user errors', () => {
            expect(() => analyticsService.trackError(
                'validation',
                'Invalid email format',
                { field: 'email' }
            )).not.toThrow();
        });
    });

    describe('Feature Usage', () => {
        it('should track feature usage', () => {
            expect(() => analyticsService.trackFeatureUsage(
                'meal_planner',
                'create_plan',
                { meals: 7 }
            )).not.toThrow();
        });
    });

    describe('Configuration', () => {
        it('should return enabled status', () => {
            const isEnabled = analyticsService.isEnabled();
            expect(typeof isEnabled).toBe('boolean');
        });
    });
});
