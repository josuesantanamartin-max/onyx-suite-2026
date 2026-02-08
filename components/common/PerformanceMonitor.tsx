import React, { useEffect } from 'react';
import { monitoringService } from '../../services/monitoringService';

/**
 * Performance Monitor Component
 * Initializes Web Vitals monitoring and performance tracking
 * Should be mounted once at the app level
 */
const PerformanceMonitor: React.FC = () => {
    useEffect(() => {
        // Performance monitoring is initialized in monitoringService.init()
        // This component just ensures it's mounted in the app

        // Log performance navigation timing
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
            const renderTime = timing.domComplete - timing.domLoading;

            if (loadTime > 0) {
                monitoringService.setContext('performance_timing', {
                    loadTime,
                    domReadyTime,
                    renderTime,
                });

                // Log in development
                if (import.meta.env.VITE_ENVIRONMENT === 'development') {
                    console.log('[Performance] Page Load Metrics:', {
                        loadTime: `${loadTime}ms`,
                        domReadyTime: `${domReadyTime}ms`,
                        renderTime: `${renderTime}ms`,
                    });
                }
            }
        }

        // Monitor long tasks (tasks that take more than 50ms)
        if ('PerformanceObserver' in window) {
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            console.warn('[Performance] Long Task detected:', {
                                duration: `${entry.duration.toFixed(2)}ms`,
                                startTime: entry.startTime,
                            });

                            // Report to Sentry if task is very long (>100ms)
                            if (entry.duration > 100) {
                                monitoringService.captureMessage(
                                    'Long Task detected',
                                    'warning',
                                    {
                                        duration: entry.duration,
                                        startTime: entry.startTime,
                                    }
                                );
                            }
                        }
                    }
                });

                // Observe long tasks
                longTaskObserver.observe({ entryTypes: ['longtask'] });

                return () => {
                    longTaskObserver.disconnect();
                };
            } catch (error) {
                // Long task API not supported in all browsers
                console.log('[Performance] Long Task API not supported');
            }
        }
    }, []);

    // This component doesn't render anything
    return null;
};

export default PerformanceMonitor;
