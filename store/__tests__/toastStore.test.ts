import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useToastStore } from '../toastStore';

describe('ToastStore', () => {
    beforeEach(() => {
        // Reset store state before each test
        useToastStore.setState({ toasts: [] });
        vi.clearAllTimers();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('addToast', () => {
        it('should add a toast to the store', () => {
            const { addToast, toasts } = useToastStore.getState();

            addToast({
                type: 'success',
                message: 'Operation successful',
            });

            const state = useToastStore.getState();
            expect(state.toasts).toHaveLength(1);
            expect(state.toasts[0].message).toBe('Operation successful');
            expect(state.toasts[0].type).toBe('success');
        });

        it('should generate unique IDs for toasts', () => {
            const { addToast } = useToastStore.getState();

            addToast({ type: 'info', message: 'First' });
            addToast({ type: 'info', message: 'Second' });

            const state = useToastStore.getState();
            expect(state.toasts).toHaveLength(2);
            expect(state.toasts[0].id).not.toBe(state.toasts[1].id);
        });

        it('should use default duration of 5000ms', () => {
            const { addToast } = useToastStore.getState();

            addToast({ type: 'info', message: 'Test' });

            const state = useToastStore.getState();
            expect(state.toasts[0].duration).toBe(5000);
        });

        it('should use custom duration when provided', () => {
            const { addToast } = useToastStore.getState();

            addToast({
                type: 'warning',
                message: 'Warning',
                duration: 3000,
            });

            const state = useToastStore.getState();
            expect(state.toasts[0].duration).toBe(3000);
        });

        it('should auto-remove toast after duration', () => {
            const { addToast } = useToastStore.getState();

            addToast({
                type: 'success',
                message: 'Auto-dismiss',
                duration: 2000,
            });

            expect(useToastStore.getState().toasts).toHaveLength(1);

            // Fast-forward time
            vi.advanceTimersByTime(2000);

            expect(useToastStore.getState().toasts).toHaveLength(0);
        });

        it('should handle multiple toasts with different durations', () => {
            const { addToast } = useToastStore.getState();

            addToast({ type: 'info', message: 'First', duration: 1000 });
            addToast({ type: 'info', message: 'Second', duration: 3000 });

            expect(useToastStore.getState().toasts).toHaveLength(2);

            vi.advanceTimersByTime(1500);
            expect(useToastStore.getState().toasts).toHaveLength(1);
            expect(useToastStore.getState().toasts[0].message).toBe('Second');

            vi.advanceTimersByTime(2000);
            expect(useToastStore.getState().toasts).toHaveLength(0);
        });

        it('should support all toast types', () => {
            const { addToast } = useToastStore.getState();

            addToast({ type: 'success', message: 'Success' });
            addToast({ type: 'error', message: 'Error' });
            addToast({ type: 'warning', message: 'Warning' });
            addToast({ type: 'info', message: 'Info' });

            const state = useToastStore.getState();
            expect(state.toasts).toHaveLength(4);
            expect(state.toasts.map(t => t.type)).toEqual(['success', 'error', 'warning', 'info']);
        });
    });

    describe('removeToast', () => {
        it('should remove a specific toast by ID', () => {
            const { addToast, removeToast } = useToastStore.getState();

            addToast({ type: 'info', message: 'First' });
            addToast({ type: 'info', message: 'Second' });

            const toastId = useToastStore.getState().toasts[0].id;
            removeToast(toastId);

            const state = useToastStore.getState();
            expect(state.toasts).toHaveLength(1);
            expect(state.toasts[0].message).toBe('Second');
        });

        it('should do nothing if toast ID does not exist', () => {
            const { addToast, removeToast } = useToastStore.getState();

            addToast({ type: 'info', message: 'Test' });
            removeToast('non-existent-id');

            expect(useToastStore.getState().toasts).toHaveLength(1);
        });

        it('should handle removing from empty list', () => {
            const { removeToast } = useToastStore.getState();

            removeToast('any-id');

            expect(useToastStore.getState().toasts).toHaveLength(0);
        });
    });

    describe('clearAll', () => {
        it('should remove all toasts', () => {
            const { addToast, clearAll } = useToastStore.getState();

            addToast({ type: 'success', message: 'First' });
            addToast({ type: 'error', message: 'Second' });
            addToast({ type: 'warning', message: 'Third' });

            expect(useToastStore.getState().toasts).toHaveLength(3);

            clearAll();

            expect(useToastStore.getState().toasts).toHaveLength(0);
        });

        it('should work on empty toast list', () => {
            const { clearAll } = useToastStore.getState();

            clearAll();

            expect(useToastStore.getState().toasts).toHaveLength(0);
        });
    });

    describe('Toast queue management', () => {
        it('should maintain toast order (FIFO)', () => {
            const { addToast } = useToastStore.getState();

            addToast({ type: 'info', message: 'First' });
            addToast({ type: 'info', message: 'Second' });
            addToast({ type: 'info', message: 'Third' });

            const state = useToastStore.getState();
            expect(state.toasts[0].message).toBe('First');
            expect(state.toasts[1].message).toBe('Second');
            expect(state.toasts[2].message).toBe('Third');
        });

        it('should handle rapid toast additions', () => {
            const { addToast } = useToastStore.getState();

            for (let i = 0; i < 10; i++) {
                addToast({ type: 'info', message: `Toast ${i}` });
            }

            expect(useToastStore.getState().toasts).toHaveLength(10);
        });
    });

    describe('Edge cases', () => {
        it('should handle empty message', () => {
            const { addToast } = useToastStore.getState();

            addToast({ type: 'info', message: '' });

            const state = useToastStore.getState();
            expect(state.toasts).toHaveLength(1);
            expect(state.toasts[0].message).toBe('');
        });

        it('should handle very long messages', () => {
            const { addToast } = useToastStore.getState();
            const longMessage = 'A'.repeat(1000);

            addToast({ type: 'info', message: longMessage });

            const state = useToastStore.getState();
            expect(state.toasts[0].message).toBe(longMessage);
        });

        it('should handle zero duration', () => {
            const { addToast } = useToastStore.getState();

            addToast({ type: 'info', message: 'Test', duration: 0 });

            const state = useToastStore.getState();
            expect(state.toasts[0].duration).toBe(0);
        });
    });
});
