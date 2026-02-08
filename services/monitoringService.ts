import * as Sentry from '@sentry/react';
import { onCLS, onLCP, onTTFB, onINP } from 'web-vitals';

/**
 * Configuration for monitoring service
 */
interface MonitoringConfig {
    dsn?: string;
    environment: string;
    enableAnalytics: boolean;
    enablePerformanceMonitoring: boolean;
    sampleRate?: number;
    tracesSampleRate?: number;
}

/**
 * User context for error tracking
 */
interface UserContext {
    id: string;
    email?: string;
    username?: string;
}

/**
 * Additional context for errors
 */
interface ErrorContext {
    [key: string]: any;
}

/**
 * Centralized monitoring service
 * Integrates Sentry for error tracking and Web Vitals for performance monitoring
 */
class MonitoringService {
    private initialized = false;
    private config: MonitoringConfig;

    constructor() {
        this.config = {
            dsn: import.meta.env.VITE_SENTRY_DSN,
            environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.VITE_ENVIRONMENT || 'development',
            enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
            enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
            sampleRate: 1.0, // Capture 100% of errors
            tracesSampleRate: 0.1, // Capture 10% of transactions for performance
        };
    }

    /**
     * Initialize monitoring service
     * Should be called once at app startup
     */
    init(): void {
        if (this.initialized) {
            console.warn('[Monitoring] Service already initialized');
            return;
        }

        // Only initialize Sentry if DSN is provided and not in development
        if (this.config.dsn && this.config.environment !== 'development') {
            try {
                Sentry.init({
                    dsn: this.config.dsn,
                    environment: this.config.environment,
                    integrations: [
                        Sentry.browserTracingIntegration(),
                        Sentry.replayIntegration({
                            maskAllText: true,
                            blockAllMedia: true,
                        }),
                    ],
                    // Performance Monitoring
                    tracesSampleRate: this.config.tracesSampleRate,
                    // Session Replay
                    replaysSessionSampleRate: 0.1, // 10% of sessions
                    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
                    // Error filtering
                    beforeSend(event, hint) {
                        // Filter out errors from browser extensions
                        if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
                            frame => frame.filename?.includes('extension://')
                        )) {
                            return null;
                        }
                        return event;
                    },
                });

                this.initialized = true;
                console.log('[Monitoring] Sentry initialized successfully');
            } catch (error) {
                console.error('[Monitoring] Failed to initialize Sentry:', error);
            }
        } else {
            console.log('[Monitoring] Sentry disabled (development mode or no DSN)');
        }

        // Initialize Web Vitals monitoring
        if (this.config.enablePerformanceMonitoring) {
            this.initWebVitals();
        }
    }

    /**
     * Initialize Web Vitals monitoring
     */
    private initWebVitals(): void {
        const sendToAnalytics = (metric: any) => {
            // Log to console in development
            if (this.config.environment === 'development') {
                console.log('[Web Vitals]', metric.name, metric.value);
            }

            // Send to Sentry if initialized
            if (this.initialized) {
                Sentry.setMeasurement(metric.name, metric.value, metric.unit);
            }
        };

        // Monitor Core Web Vitals
        onCLS(sendToAnalytics);
        onLCP(sendToAnalytics);
        onTTFB(sendToAnalytics);
        onINP(sendToAnalytics); // Replaces FID in web-vitals v3+

        console.log('[Monitoring] Web Vitals monitoring initialized');
    }

    /**
     * Capture an error with context
     */
    captureError(error: Error, context?: ErrorContext): void {
        if (!this.initialized) {
            console.error('[Monitoring] Error captured (not sent - service not initialized):', error);
            return;
        }

        Sentry.captureException(error, {
            extra: context,
        });
    }

    /**
     * Capture a message (non-error event)
     */
    captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: ErrorContext): void {
        if (!this.initialized) {
            console.log(`[Monitoring] Message captured (not sent): ${message}`);
            return;
        }

        Sentry.captureMessage(message, {
            level,
            extra: context,
        });
    }

    /**
     * Set user context for error tracking
     */
    setUserContext(user: UserContext | null): void {
        if (!this.initialized) return;

        if (user) {
            Sentry.setUser({
                id: user.id,
                email: user.email,
                username: user.username,
            });
        } else {
            Sentry.setUser(null);
        }
    }

    /**
     * Add breadcrumb for debugging
     */
    addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
        if (!this.initialized) return;

        Sentry.addBreadcrumb({
            message,
            category,
            data,
            level: 'info',
            timestamp: Date.now() / 1000,
        });
    }

    /**
     * Set custom context
     */
    setContext(name: string, context: Record<string, any>): void {
        if (!this.initialized) return;

        Sentry.setContext(name, context);
    }

    /**
     * Set custom tag
     */
    setTag(key: string, value: string): void {
        if (!this.initialized) return;

        Sentry.setTag(key, value);
    }

    /**
     * Start a new transaction for performance monitoring
     */
    startTransaction(name: string, op: string): Sentry.Transaction | null {
        if (!this.initialized || !this.config.enablePerformanceMonitoring) {
            return null;
        }

        return Sentry.startTransaction({ name, op });
    }

    /**
     * Check if monitoring is initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Get current configuration
     */
    getConfig(): MonitoringConfig {
        return { ...this.config };
    }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

// Export types
export type { MonitoringConfig, UserContext, ErrorContext };
