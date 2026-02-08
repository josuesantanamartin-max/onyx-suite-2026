import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performanceService } from '../performanceService';

describe('PerformanceService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        performanceService.clearMetrics();
    });

    describe('Async Measurement', () => {
        it('should measure async function execution', async () => {
            const asyncFn = async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                return 'result';
            };

            const result = await performanceService.measureAsync('test_async', asyncFn);
            expect(result).toBe('result');
        });

        it('should handle errors in async functions', async () => {
            const errorFn = async () => {
                throw new Error('Test error');
            };

            await expect(performanceService.measureAsync('test_error', errorFn))
                .rejects.toThrow('Test error');
        });
    });

    describe('Sync Measurement', () => {
        it('should measure sync function execution', () => {
            const syncFn = () => {
                let sum = 0;
                for (let i = 0; i < 1000; i++) {
                    sum += i;
                }
                return sum;
            };

            const result = performanceService.measure('test_sync', syncFn);
            expect(result).toBe(499500);
        });

        it('should handle errors in sync functions', () => {
            const errorFn = () => {
                throw new Error('Sync error');
            };

            expect(() => performanceService.measure('test_sync_error', errorFn))
                .toThrow('Sync error');
        });
    });

    describe('Performance Marks', () => {
        it('should start and end marks', () => {
            expect(() => {
                performanceService.startMark('test_mark');
                performanceService.endMark('test_mark');
            }).not.toThrow();
        });
    });

    describe('Custom Metrics', () => {
        it('should record custom metrics', () => {
            performanceService.recordMetric('custom_metric', 123.45, 'ms');
            const metrics = performanceService.getMetrics();

            expect(metrics.length).toBeGreaterThan(0);
            const metric = metrics.find(m => m.name === 'custom_metric');
            expect(metric).toBeDefined();
            expect(metric?.value).toBe(123.45);
            expect(metric?.unit).toBe('ms');
        });
    });

    describe('API Call Tracking', () => {
        it('should track API calls', () => {
            performanceService.trackAPICall('/api/transactions', 'GET', 250, 200);
            const apiMetrics = performanceService.getAPIMetrics();

            expect(apiMetrics.length).toBe(1);
            expect(apiMetrics[0].endpoint).toBe('/api/transactions');
            expect(apiMetrics[0].method).toBe('GET');
            expect(apiMetrics[0].duration).toBe(250);
            expect(apiMetrics[0].status).toBe(200);
        });

        it('should warn on slow API calls', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            performanceService.trackAPICall('/api/slow', 'POST', 5000, 200);

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('Metrics Management', () => {
        it('should get average metric value', () => {
            performanceService.recordMetric('test_avg', 100, 'ms');
            performanceService.recordMetric('test_avg', 200, 'ms');
            performanceService.recordMetric('test_avg', 300, 'ms');

            const average = performanceService.getAverageMetric('test_avg');
            expect(average).toBe(200);
        });

        it('should return null for non-existent metrics', () => {
            const average = performanceService.getAverageMetric('non_existent');
            expect(average).toBeNull();
        });

        it('should clear all metrics', () => {
            performanceService.recordMetric('test1', 100, 'ms');
            performanceService.recordMetric('test2', 200, 'ms');

            performanceService.clearMetrics();

            expect(performanceService.getMetrics()).toHaveLength(0);
            expect(performanceService.getAPIMetrics()).toHaveLength(0);
        });
    });

    describe('Configuration', () => {
        it('should return enabled status', () => {
            const isEnabled = performanceService.isEnabled();
            expect(typeof isEnabled).toBe('boolean');
        });
    });
});
