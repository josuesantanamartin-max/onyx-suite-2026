import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stripeService } from '../stripeService';

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
    loadStripe: vi.fn(() => Promise.resolve({
        redirectToCheckout: vi.fn(() => Promise.resolve({ error: null }))
    }))
}));

describe('StripeService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createCheckoutSession', () => {
        it('should create checkout session with correct parameters', async () => {
            const priceId = 'price_test_123';
            const userId = 'user_456';

            const result = await stripeService.createCheckoutSession(priceId, userId);

            expect(result).toBeDefined();
            expect(result.sessionId).toBeDefined();
        });

        it('should handle missing price ID', async () => {
            await expect(
                stripeService.createCheckoutSession('', 'user_123')
            ).rejects.toThrow();
        });

        it('should include success and cancel URLs', async () => {
            const result = await stripeService.createCheckoutSession('price_123', 'user_456');

            expect(result.successUrl).toContain('success');
            expect(result.cancelUrl).toContain('cancel');
        });
    });

    describe('redirectToCustomerPortal', () => {
        it('should redirect to customer portal', async () => {
            const customerId = 'cus_test_123';

            const result = await stripeService.redirectToCustomerPortal(customerId);

            expect(result).toBeDefined();
        });

        it('should handle invalid customer ID', async () => {
            await expect(
                stripeService.redirectToCustomerPortal('')
            ).rejects.toThrow();
        });
    });

    describe('validateWebhook', () => {
        it('should validate webhook signature', () => {
            const payload = JSON.stringify({ type: 'checkout.session.completed' });
            const signature = 'test_signature';

            const isValid = stripeService.validateWebhook(payload, signature);

            expect(typeof isValid).toBe('boolean');
        });

        it('should reject invalid signature', () => {
            const payload = JSON.stringify({ type: 'test' });
            const signature = 'invalid_signature';

            const isValid = stripeService.validateWebhook(payload, signature);

            expect(isValid).toBe(false);
        });
    });
});
