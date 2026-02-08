import { describe, it, expect, vi, beforeEach } from 'vitest';
import { monitoringService } from '../monitoringService';

// Mock Sentry
vi.mock('@sentry/react', () => ({
    init: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    setUser: vi.fn(),
    addBreadcrumb: vi.fn(),
    setContext: vi.fn(),
    setTag: vi.fn(),
    setMeasurement: vi.fn(),
    startTransaction: vi.fn(() => ({
        finish: vi.fn(),
    })),
    browserTracingIntegration: vi.fn(() => ({})),
    replayIntegration: vi.fn(() => ({})),
}));

// Mock web-vitals
vi.mock('web-vitals', () => ({
    onCLS: vi.fn((callback) => callback({ name: 'CLS', value: 0.1, unit: 'score' })),
    onFID: vi.fn((callback) => callback({ name: 'FID', value: 50, unit: 'ms' })),
    onLCP: vi.fn((callback) => callback({ name: 'LCP', value: 2000, unit: 'ms' })),
    onTTFB: vi.fn((callback) => callback({ name: 'TTFB', value: 500, unit: 'ms' })),
    onINP: vi.fn((callback) => callback({ name: 'INP', value: 100, unit: 'ms' })),
}));

describe('MonitoringService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize successfully', () => {
            expect(() => monitoringService.init()).not.toThrow();
        });

        it('should not initialize twice', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            monitoringService.init();
            monitoringService.init();
            expect(consoleSpy).toHaveBeenCalledWith('[Monitoring] Service already initialized');
            consoleSpy.mockRestore();
        });

        it('should return correct initialization status', () => {
            expect(monitoringService.isInitialized()).toBe(true);
        });
    });

    describe('Error Tracking', () => {
        it('should capture errors', () => {
            const error = new Error('Test error');
            const context = { component: 'TestComponent' };

            expect(() => monitoringService.captureError(error, context)).not.toThrow();
        });

        it('should capture messages with different severity levels', () => {
            expect(() => monitoringService.captureMessage('Info message', 'info')).not.toThrow();
            expect(() => monitoringService.captureMessage('Warning message', 'warning')).not.toThrow();
            expect(() => monitoringService.captureMessage('Error message', 'error')).not.toThrow();
        });
    });

    describe('User Context', () => {
        it('should set user context', () => {
            const user = {
                id: 'user123',
                email: 'test@example.com',
                username: 'Test User',
            };

            expect(() => monitoringService.setUserContext(user)).not.toThrow();
        });

        it('should clear user context', () => {
            expect(() => monitoringService.setUserContext(null)).not.toThrow();
        });
    });

    describe('Breadcrumbs', () => {
        it('should add breadcrumbs', () => {
            expect(() => monitoringService.addBreadcrumb(
                'User clicked button',
                'user-action',
                { buttonId: 'submit' }
            )).not.toThrow();
        });
    });

    describe('Context and Tags', () => {
        it('should set custom context', () => {
            expect(() => monitoringService.setContext('app', {
                version: '1.0.0',
                environment: 'test',
            })).not.toThrow();
        });

        it('should set tags', () => {
            expect(() => monitoringService.setTag('feature', 'finance')).not.toThrow();
        });
    });

    describe('Configuration', () => {
        it('should return current configuration', () => {
            const config = monitoringService.getConfig();
            expect(config).toBeDefined();
            expect(config).toHaveProperty('environment');
            expect(config).toHaveProperty('enableAnalytics');
            expect(config).toHaveProperty('enablePerformanceMonitoring');
        });
    });
});
