import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    AppError,
    ErrorCodes,
    ErrorMessages,
    handleError,
    logError,
    formatErrorMessage,
    isRetryableError,
} from '../errorHandler';

// Mock console methods
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => { });

// Mock monitoring service
vi.mock('../../services/monitoringService', () => ({
    monitoringService: {
        isInitialized: vi.fn(() => true),
        captureError: vi.fn(),
    },
}));

describe('ErrorHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('AppError', () => {
        it('should create AppError with all properties', () => {
            const error = new AppError(
                'Test error',
                ErrorCodes.API_REQUEST_FAILED,
                'high',
                new Error('Original')
            );

            expect(error.message).toBe('Test error');
            expect(error.code).toBe(ErrorCodes.API_REQUEST_FAILED);
            expect(error.severity).toBe('high');
            expect(error.name).toBe('AppError');
            expect(error.originalError).toBeInstanceOf(Error);
        });

        it('should convert to JSON', () => {
            const error = new AppError('Test', ErrorCodes.VALIDATION_FAILED, 'medium');
            const json = error.toJSON();

            expect(json).toEqual({
                name: 'AppError',
                message: 'Test',
                code: ErrorCodes.VALIDATION_FAILED,
                severity: 'medium',
                stack: expect.any(String),
            });
        });

        it('should capture stack trace', () => {
            const error = new AppError('Test', ErrorCodes.UNKNOWN_ERROR, 'low');
            expect(error.stack).toBeDefined();
        });
    });

    describe('handleError', () => {
        it('should return AppError as-is', () => {
            const appError = new AppError('Test', ErrorCodes.NOT_FOUND, 'low');
            const result = handleError(appError);

            expect(result).toBe(appError);
        });

        it('should detect API key errors', () => {
            const error = new Error('API key is missing');
            const result = handleError(error);

            expect(result.code).toBe(ErrorCodes.API_KEY_MISSING);
            expect(result.severity).toBe('high');
            expect(result.message).toBe(ErrorMessages[ErrorCodes.API_KEY_MISSING]);
        });

        it('should detect storage quota errors', () => {
            const error = new Error('Storage quota exceeded');
            const result = handleError(error);

            expect(result.code).toBe(ErrorCodes.STORAGE_QUOTA_EXCEEDED);
            expect(result.severity).toBe('medium');
        });

        it('should detect network errors', () => {
            const error = new Error('Network connection failed');
            const result = handleError(error);

            expect(result.code).toBe(ErrorCodes.NETWORK_ERROR);
            expect(result.severity).toBe('medium');
        });

        it('should handle generic Error objects', () => {
            const error = new Error('Something went wrong');
            const result = handleError(error);

            expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR);
            expect(result.message).toBe('Something went wrong');
        });

        it('should handle non-Error objects', () => {
            const result = handleError('String error');

            expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR);
            expect(result.message).toBe(ErrorMessages[ErrorCodes.UNKNOWN_ERROR]);
        });

        it('should handle null/undefined', () => {
            const result = handleError(null);

            expect(result).toBeInstanceOf(AppError);
            expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR);
        });
    });

    describe('logError', () => {
        it('should log high severity errors to console.error', () => {
            const error = new AppError('Critical', ErrorCodes.API_KEY_MISSING, 'high');
            logError(error);

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[HIGH SEVERITY ERROR]',
                expect.objectContaining({
                    message: 'Critical',
                    severity: 'high',
                })
            );
        });

        it('should log medium severity errors to console.warn', () => {
            const error = new AppError('Warning', ErrorCodes.NETWORK_ERROR, 'medium');
            logError(error);

            expect(mockConsoleWarn).toHaveBeenCalledWith(
                '[MEDIUM SEVERITY ERROR]',
                expect.any(Object)
            );
        });

        it('should log low severity errors to console.log', () => {
            const error = new AppError('Info', ErrorCodes.NOT_FOUND, 'low');
            logError(error);

            expect(mockConsoleLog).toHaveBeenCalledWith(
                '[LOW SEVERITY ERROR]',
                expect.any(Object)
            );
        });

        it('should include context in log', () => {
            const error = new AppError('Test', ErrorCodes.VALIDATION_FAILED, 'medium');
            const context = { userId: '123', action: 'submit' };

            logError(error, context);

            expect(mockConsoleWarn).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    context,
                })
            );
        });

        it('should include timestamp in log', () => {
            const error = new AppError('Test', ErrorCodes.UNKNOWN_ERROR, 'low');
            logError(error);

            expect(mockConsoleLog).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    timestamp: expect.any(String),
                })
            );
        });
    });

    describe('formatErrorMessage', () => {
        it('should format AppError message', () => {
            const error = new AppError('Custom message', ErrorCodes.INVALID_INPUT, 'low');
            const message = formatErrorMessage(error);

            expect(message).toBe('Custom message');
        });

        it('should format standard Error message', () => {
            const error = new Error('Standard error');
            const message = formatErrorMessage(error);

            expect(message).toBe('Standard error');
        });

        it('should format unknown errors', () => {
            const message = formatErrorMessage('Unknown');

            expect(message).toBe(ErrorMessages[ErrorCodes.UNKNOWN_ERROR]);
        });
    });

    describe('isRetryableError', () => {
        it('should identify retryable API errors', () => {
            const error = new AppError('Failed', ErrorCodes.API_REQUEST_FAILED, 'medium');
            expect(isRetryableError(error)).toBe(true);
        });

        it('should identify retryable network errors', () => {
            const error = new AppError('Network', ErrorCodes.NETWORK_ERROR, 'medium');
            expect(isRetryableError(error)).toBe(true);
        });

        it('should identify retryable timeout errors', () => {
            const error = new AppError('Timeout', ErrorCodes.TIMEOUT_ERROR, 'medium');
            expect(isRetryableError(error)).toBe(true);
        });

        it('should identify retryable sync errors', () => {
            const error = new AppError('Sync', ErrorCodes.STORAGE_SYNC_FAILED, 'medium');
            expect(isRetryableError(error)).toBe(true);
        });

        it('should identify non-retryable errors', () => {
            const error = new AppError('Invalid', ErrorCodes.VALIDATION_FAILED, 'low');
            expect(isRetryableError(error)).toBe(false);
        });

        it('should handle standard Error objects', () => {
            const error = new Error('Network connection failed');
            expect(isRetryableError(error)).toBe(true);
        });
    });

    describe('ErrorCodes', () => {
        it('should have all required error codes', () => {
            expect(ErrorCodes.API_KEY_MISSING).toBe('API_KEY_MISSING');
            expect(ErrorCodes.VALIDATION_FAILED).toBe('VALIDATION_FAILED');
            expect(ErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR');
            expect(ErrorCodes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
        });
    });

    describe('ErrorMessages', () => {
        it('should have messages for all error codes', () => {
            Object.values(ErrorCodes).forEach(code => {
                expect(ErrorMessages[code]).toBeDefined();
                expect(typeof ErrorMessages[code]).toBe('string');
            });
        });
    });
});
