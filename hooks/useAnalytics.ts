import { useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import type { EventProperties } from '../services/analyticsService';

/**
 * Custom hook for analytics tracking
 * Provides convenient methods for tracking events throughout the application
 */
export function useAnalytics() {
    /**
     * Track a custom event
     */
    const trackEvent = useCallback((eventName: string, properties?: EventProperties) => {
        analyticsService.trackEvent(eventName, properties);
    }, []);

    /**
     * Track page view
     */
    const trackPageView = useCallback((pageName: string, properties?: EventProperties) => {
        analyticsService.trackPageView(pageName, properties);
    }, []);

    /**
     * Track user action
     */
    const trackAction = useCallback((action: string, category: string, properties?: EventProperties) => {
        analyticsService.trackAction(action, category, properties);
    }, []);

    /**
     * Track financial events
     */
    const trackFinancialEvent = useCallback((
        eventType: 'transaction_created' | 'budget_created' | 'goal_created' | 'debt_created',
        properties?: EventProperties
    ) => {
        analyticsService.trackFinancialEvent(eventType, properties);
    }, []);

    /**
     * Track AI usage
     */
    const trackAIUsage = useCallback((feature: string, properties?: EventProperties) => {
        analyticsService.trackAIUsage(feature, properties);
    }, []);

    /**
     * Track errors (user-facing validation errors)
     */
    const trackError = useCallback((errorType: string, message: string, properties?: EventProperties) => {
        analyticsService.trackError(errorType, message, properties);
    }, []);

    /**
     * Track feature usage
     */
    const trackFeatureUsage = useCallback((feature: string, action: string, properties?: EventProperties) => {
        analyticsService.trackFeatureUsage(feature, action, properties);
    }, []);

    return {
        trackEvent,
        trackPageView,
        trackAction,
        trackFinancialEvent,
        trackAIUsage,
        trackError,
        trackFeatureUsage,
        isEnabled: analyticsService.isEnabled(),
    };
}
