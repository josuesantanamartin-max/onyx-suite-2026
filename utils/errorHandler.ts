/**
 * Custom error class for application-specific errors
 * Provides severity levels and error codes for better error handling
 */
export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public severity: 'low' | 'medium' | 'high',
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'AppError';

        // Maintains proper stack trace for where error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }

    /**
     * Convert to a plain object for logging/serialization
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            severity: this.severity,
            stack: this.stack,
        };
    }
}

/**
 * Error codes for different types of errors
 */
export const ErrorCodes = {
    // API Errors
    API_KEY_MISSING: 'API_KEY_MISSING',
    API_REQUEST_FAILED: 'API_REQUEST_FAILED',
    API_RATE_LIMIT: 'API_RATE_LIMIT',
    API_INVALID_RESPONSE: 'API_INVALID_RESPONSE',

    // Validation Errors
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    INVALID_INPUT: 'INVALID_INPUT',
    REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',

    // Storage Errors
    STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
    STORAGE_ACCESS_DENIED: 'STORAGE_ACCESS_DENIED',
    STORAGE_SYNC_FAILED: 'STORAGE_SYNC_FAILED',

    // Network Errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',

    // Business Logic Errors
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
    NOT_FOUND: 'NOT_FOUND',

    // Unknown
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * User-friendly error messages
 */
export const ErrorMessages: Record<string, string> = {
    [ErrorCodes.API_KEY_MISSING]: 'API key is missing. Please check your configuration.',
    [ErrorCodes.API_REQUEST_FAILED]: 'Failed to connect to the service. Please try again.',
    [ErrorCodes.API_RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
    [ErrorCodes.API_INVALID_RESPONSE]: 'Received invalid response from the service.',

    [ErrorCodes.VALIDATION_FAILED]: 'Please check your input and try again.',
    [ErrorCodes.INVALID_INPUT]: 'The provided input is invalid.',
    [ErrorCodes.REQUIRED_FIELD_MISSING]: 'Please fill in all required fields.',

    [ErrorCodes.STORAGE_QUOTA_EXCEEDED]: 'Storage limit exceeded. Please free up some space.',
    [ErrorCodes.STORAGE_ACCESS_DENIED]: 'Cannot access storage. Please check permissions.',
    [ErrorCodes.STORAGE_SYNC_FAILED]: 'Failed to sync data. Please check your connection.',

    [ErrorCodes.NETWORK_ERROR]: 'Network error. Please check your internet connection.',
    [ErrorCodes.TIMEOUT_ERROR]: 'Request timed out. Please try again.',

    [ErrorCodes.INSUFFICIENT_BALANCE]: 'Insufficient balance for this operation.',
    [ErrorCodes.DUPLICATE_ENTRY]: 'This entry already exists.',
    [ErrorCodes.NOT_FOUND]: 'The requested item was not found.',

    [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

/**
 * Handle errors consistently across the application
 */
export function handleError(error: unknown): AppError {
    // Already an AppError
    if (error instanceof AppError) {
        return error;
    }

    // Standard Error
    if (error instanceof Error) {
        // Check for specific error patterns
        if (error.message.includes('API key')) {
            return new AppError(
                ErrorMessages[ErrorCodes.API_KEY_MISSING],
                ErrorCodes.API_KEY_MISSING,
                'high',
                error
            );
        }

        if (error.message.includes('quota') || error.message.includes('storage')) {
            return new AppError(
                ErrorMessages[ErrorCodes.STORAGE_QUOTA_EXCEEDED],
                ErrorCodes.STORAGE_QUOTA_EXCEEDED,
                'medium',
                error
            );
        }

        if (error.message.includes('network') || error.message.includes('fetch')) {
            return new AppError(
                ErrorMessages[ErrorCodes.NETWORK_ERROR],
                ErrorCodes.NETWORK_ERROR,
                'medium',
                error
            );
        }

        // Generic error
        return new AppError(
            error.message || ErrorMessages[ErrorCodes.UNKNOWN_ERROR],
            ErrorCodes.UNKNOWN_ERROR,
            'medium',
            error
        );
    }

    // Unknown error type
    return new AppError(
        ErrorMessages[ErrorCodes.UNKNOWN_ERROR],
        ErrorCodes.UNKNOWN_ERROR,
        'medium',
        error
    );
}

/**
 * Log errors to console and monitoring service
 */
export function logError(error: AppError, context?: Record<string, any>) {
    const logData = {
        ...error.toJSON(),
        context,
        timestamp: new Date().toISOString(),
    };

    // Log based on severity
    if (error.severity === 'high') {
        console.error('[HIGH SEVERITY ERROR]', logData);
    } else if (error.severity === 'medium') {
        console.warn('[MEDIUM SEVERITY ERROR]', logData);
    } else {
        console.log('[LOW SEVERITY ERROR]', logData);
    }

    // Send to monitoring service (Sentry)
    // Only send medium and high severity errors to avoid noise
    if (error.severity === 'high' || error.severity === 'medium') {
        // Dynamically import to avoid circular dependencies
        import('../services/monitoringService').then(({ monitoringService }) => {
            if (monitoringService.isInitialized()) {
                monitoringService.captureError(error.originalError as Error || error, {
                    ...context,
                    errorCode: error.code,
                    severity: error.severity,
                });
            }
        }).catch(err => {
            console.error('[Error Handler] Failed to send error to monitoring service:', err);
        });
    }
}

/**
 * Create a user-friendly error message
 */
export function formatErrorMessage(error: unknown): string {
    const appError = handleError(error);
    return appError.message;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
    const appError = handleError(error);

    const retryableCodes = [
        ErrorCodes.API_REQUEST_FAILED,
        ErrorCodes.NETWORK_ERROR,
        ErrorCodes.TIMEOUT_ERROR,
        ErrorCodes.STORAGE_SYNC_FAILED,
    ];

    return retryableCodes.includes(appError.code as any);
}
