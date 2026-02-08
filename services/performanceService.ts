import { monitoringService } from './monitoringService';

/**
 * Performance metric data
 */
interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: number;
}

/**
 * API call performance data
 */
interface APIPerformance {
    endpoint: string;
    method: string;
    duration: number;
    status: number;
    timestamp: number;
}

/**
 * Performance monitoring service
 * Tracks component render times, API calls, and custom performance metrics
 */
class PerformanceService {
    private enabled: boolean;
    private metrics: PerformanceMetric[] = [];
    private apiCalls: APIPerformance[] = [];
    private maxStoredMetrics = 100; // Limit stored metrics to prevent memory issues

    constructor() {
        this.enabled = import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';
    }

    /**
     * Measure the duration of a function execution
     */
    async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
        if (!this.enabled) {
            return fn();
        }

        const startTime = performance.now();
        try {
            const result = await fn();
            const duration = performance.now() - startTime;
            this.recordMetric(name, duration, 'ms');
            return result;
        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordMetric(`${name}_error`, duration, 'ms');
            throw error;
        }
    }

    /**
     * Measure the duration of a synchronous function execution
     */
    measure<T>(name: string, fn: () => T): T {
        if (!this.enabled) {
            return fn();
        }

        const startTime = performance.now();
        try {
            const result = fn();
            const duration = performance.now() - startTime;
            this.recordMetric(name, duration, 'ms');
            return result;
        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordMetric(`${name}_error`, duration, 'ms');
            throw error;
        }
    }

    /**
     * Start a performance mark
     */
    startMark(name: string): void {
        if (!this.enabled) return;
        performance.mark(`${name}_start`);
    }

    /**
     * End a performance mark and record the duration
     */
    endMark(name: string): void {
        if (!this.enabled) return;

        try {
            performance.mark(`${name}_end`);
            performance.measure(name, `${name}_start`, `${name}_end`);

            const measure = performance.getEntriesByName(name, 'measure')[0];
            if (measure) {
                this.recordMetric(name, measure.duration, 'ms');
            }

            // Clean up marks
            performance.clearMarks(`${name}_start`);
            performance.clearMarks(`${name}_end`);
            performance.clearMeasures(name);
        } catch (error) {
            console.warn('[Performance] Failed to end mark:', name, error);
        }
    }

    /**
     * Record a custom metric
     */
    recordMetric(name: string, value: number, unit: string = 'ms'): void {
        if (!this.enabled) return;

        const metric: PerformanceMetric = {
            name,
            value,
            unit,
            timestamp: Date.now(),
        };

        this.metrics.push(metric);

        // Limit stored metrics
        if (this.metrics.length > this.maxStoredMetrics) {
            this.metrics.shift();
        }

        // Log in development
        if (import.meta.env.VITE_ENVIRONMENT === 'development') {
            console.log(`[Performance] ${name}: ${value.toFixed(2)}${unit}`);
        }

        // Send to monitoring service
        monitoringService.setContext('performance', {
            latest_metric: metric,
        });
    }

    /**
     * Track API call performance
     */
    trackAPICall(endpoint: string, method: string, duration: number, status: number): void {
        if (!this.enabled) return;

        const apiCall: APIPerformance = {
            endpoint,
            method,
            duration,
            status,
            timestamp: Date.now(),
        };

        this.apiCalls.push(apiCall);

        // Limit stored API calls
        if (this.apiCalls.length > this.maxStoredMetrics) {
            this.apiCalls.shift();
        }

        // Record as metric
        this.recordMetric(`api_${method}_${endpoint}`, duration, 'ms');

        // Log slow API calls
        if (duration > 3000) {
            console.warn(`[Performance] Slow API call: ${method} ${endpoint} (${duration.toFixed(2)}ms)`);
            monitoringService.captureMessage(
                `Slow API call: ${method} ${endpoint}`,
                'warning',
                { duration, status }
            );
        }
    }

    /**
     * Get all recorded metrics
     */
    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    /**
     * Get all recorded API calls
     */
    getAPIMetrics(): APIPerformance[] {
        return [...this.apiCalls];
    }

    /**
     * Get average metric value by name
     */
    getAverageMetric(name: string): number | null {
        const filteredMetrics = this.metrics.filter(m => m.name === name);
        if (filteredMetrics.length === 0) return null;

        const sum = filteredMetrics.reduce((acc, m) => acc + m.value, 0);
        return sum / filteredMetrics.length;
    }

    /**
     * Clear all stored metrics
     */
    clearMetrics(): void {
        this.metrics = [];
        this.apiCalls = [];
    }

    /**
     * Check if performance monitoring is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }
}

// Export singleton instance
export const performanceService = new PerformanceService();

// Export types
export type { PerformanceMetric, APIPerformance };
