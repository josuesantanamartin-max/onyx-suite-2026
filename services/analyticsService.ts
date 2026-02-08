import { track } from '@vercel/analytics';

/**
 * Event properties for analytics tracking
 */
interface EventProperties {
    [key: string]: string | number | boolean | undefined;
}

/**
 * Analytics service for tracking user events and page views
 * Integrates with Vercel Analytics
 */
class AnalyticsService {
    private enabled: boolean;
    private environment: string;

    constructor() {
        this.enabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
        this.environment = import.meta.env.VITE_ENVIRONMENT || 'development';
    }

    /**
     * Track a custom event
     */
    trackEvent(eventName: string, properties?: EventProperties): void {
        if (!this.enabled) {
            if (this.environment === 'development') {
                console.log('[Analytics] Event:', eventName, properties);
            }
            return;
        }

        try {
            track(eventName, properties);
        } catch (error) {
            console.error('[Analytics] Failed to track event:', error);
        }
    }

    /**
     * Track page view
     */
    trackPageView(pageName: string, properties?: EventProperties): void {
        this.trackEvent('page_view', {
            page: pageName,
            ...properties,
        });
    }

    /**
     * Track user action
     */
    trackAction(action: string, category: string, properties?: EventProperties): void {
        this.trackEvent('user_action', {
            action,
            category,
            ...properties,
        });
    }

    /**
     * Track financial events
     */
    trackFinancialEvent(eventType: 'transaction_created' | 'budget_created' | 'goal_created' | 'debt_created', properties?: EventProperties): void {
        this.trackEvent(`finance_${eventType}`, properties);
    }

    /**
     * Track AI usage
     */
    trackAIUsage(feature: string, properties?: EventProperties): void {
        this.trackEvent('ai_usage', {
            feature,
            ...properties,
        });
    }

    /**
     * Track errors (user-facing validation errors, not exceptions)
     */
    trackError(errorType: string, message: string, properties?: EventProperties): void {
        this.trackEvent('user_error', {
            error_type: errorType,
            message,
            ...properties,
        });
    }

    /**
     * Track feature usage
     */
    trackFeatureUsage(feature: string, action: string, properties?: EventProperties): void {
        this.trackEvent('feature_usage', {
            feature,
            action,
            ...properties,
        });
    }

    /**
     * Check if analytics is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export types
export type { EventProperties };
