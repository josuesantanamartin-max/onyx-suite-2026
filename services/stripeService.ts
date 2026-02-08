import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabaseClient';
import { SubscriptionTier, UserSubscription } from '../types/subscription';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const stripePromise = STRIPE_PUBLISHABLE_KEY
    ? loadStripe(STRIPE_PUBLISHABLE_KEY)
    : null;

export interface CheckoutSessionParams {
    priceId: string;
    userId: string;
    successUrl?: string;
    cancelUrl?: string;
}

export interface PortalSessionParams {
    customerId?: string;
    returnUrl?: string;
}

export interface SubscriptionUpdateParams {
    subscriptionId: string;
    newPriceId: string;
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}

/**
 * Enhanced Stripe Service with complete subscription management
 */
export const stripeService = {
    /**
     * Create a checkout session and redirect to Stripe
     */
    async createCheckoutSession(params: CheckoutSessionParams): Promise<void> {
        if (!stripePromise) {
            throw new Error('Stripe not initialized. Check VITE_STRIPE_PUBLISHABLE_KEY');
        }

        try {
            const { priceId, userId, successUrl, cancelUrl } = params;

            console.log(`Creating checkout session for user ${userId}, price ${priceId}`);

            // Call local API endpoint instead of Supabase Edge Function
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    userId,
                    successUrl: successUrl || `${window.location.origin}/settings?tab=subscription&success=true`,
                    cancelUrl: cancelUrl || `${window.location.origin}/settings?tab=subscription&canceled=true`
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error creating checkout session:', errorData);
                throw new Error(errorData.error || 'Failed to create checkout session');
            }

            const data = await response.json();

            if (!data?.url) {
                throw new Error('No checkout URL returned');
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url;

        } catch (error) {
            console.error('Checkout error:', error);
            throw error;
        }
    },

    /**
     * Create a customer portal session and redirect
     */
    async createPortalSession(params: PortalSessionParams = {}): Promise<void> {
        try {
            const { customerId, returnUrl } = params;

            console.log('Creating customer portal session');

            if (!customerId) {
                throw new Error('Customer ID is required. Please create a subscription first.');
            }

            // Call local API endpoint instead of Supabase Edge Function
            const response = await fetch('/api/create-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId,
                    returnUrl: returnUrl || `${window.location.origin}/settings?tab=subscription`
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error creating portal session:', errorData);
                throw new Error(errorData.error || 'Failed to create portal session');
            }

            const data = await response.json();

            if (!data?.url) {
                throw new Error('No portal URL returned');
            }

            // Redirect to Stripe Customer Portal
            window.location.href = data.url;

        } catch (error) {
            console.error('Portal error:', error);
            throw error;
        }
    },

    /**
     * Upgrade subscription to a new plan
     */
    async upgradeSubscription(params: SubscriptionUpdateParams): Promise<void> {
        try {
            const { subscriptionId, newPriceId, prorationBehavior = 'create_prorations' } = params;

            console.log(`Upgrading subscription ${subscriptionId} to ${newPriceId}`);

            const { data, error } = await supabase.functions.invoke('update-subscription', {
                body: {
                    subscriptionId,
                    newPriceId,
                    prorationBehavior
                }
            });

            if (error) {
                console.error('Error upgrading subscription:', error);
                throw new Error('Failed to upgrade subscription');
            }

            return data;

        } catch (error) {
            console.error('Upgrade error:', error);
            throw error;
        }
    },

    /**
     * Cancel subscription at period end
     */
    async cancelSubscription(subscriptionId: string): Promise<void> {
        try {
            console.log(`Canceling subscription ${subscriptionId}`);

            const { data, error } = await supabase.functions.invoke('cancel-subscription', {
                body: { subscriptionId }
            });

            if (error) {
                console.error('Error canceling subscription:', error);
                throw new Error('Failed to cancel subscription');
            }

            return data;

        } catch (error) {
            console.error('Cancel error:', error);
            throw error;
        }
    },

    /**
     * Reactivate a canceled subscription
     */
    async reactivateSubscription(subscriptionId: string): Promise<void> {
        try {
            console.log(`Reactivating subscription ${subscriptionId}`);

            const { data, error } = await supabase.functions.invoke('reactivate-subscription', {
                body: { subscriptionId }
            });

            if (error) {
                console.error('Error reactivating subscription:', error);
                throw new Error('Failed to reactivate subscription');
            }

            return data;

        } catch (error) {
            console.error('Reactivate error:', error);
            throw error;
        }
    },

    /**
     * Get subscription details from Supabase
     */
    async getSubscription(userId: string): Promise<UserSubscription | null> {
        try {
            const { data, error } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No subscription found, return default FREE
                    return {
                        tier: 'FREE',
                        status: 'NONE',
                        usage: {
                            transactions: 0,
                            budgets: 0,
                            accounts: 0,
                            recipes: 0,
                            aiGenerations: 0,
                            backups: 0,
                            familyMembers: 1
                        }
                    };
                }
                throw error;
            }

            return data as UserSubscription;

        } catch (error) {
            console.error('Error fetching subscription:', error);
            return null;
        }
    },

    /**
     * Update usage metrics
     */
    async updateUsage(
        userId: string,
        metric: keyof UserSubscription['usage'],
        increment: number = 1
    ): Promise<void> {
        try {
            const { error } = await supabase.rpc('increment_usage', {
                p_user_id: userId,
                p_metric: metric,
                p_increment: increment
            });

            if (error) {
                console.error('Error updating usage:', error);
                throw error;
            }

        } catch (error) {
            console.error('Usage update error:', error);
            throw error;
        }
    },

    /**
     * Reset monthly usage (called by cron job)
     */
    async resetMonthlyUsage(userId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('user_subscriptions')
                .update({
                    usage: {
                        ...{}, // preserve non-monthly metrics
                        aiGenerations: 0
                    }
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error resetting usage:', error);
                throw error;
            }

        } catch (error) {
            console.error('Reset usage error:', error);
            throw error;
        }
    },

    /**
     * Get invoices for a customer
     */
    async getInvoices(customerId: string): Promise<any[]> {
        try {
            const { data, error } = await supabase.functions.invoke('get-invoices', {
                body: { customerId }
            });

            if (error) {
                console.error('Error fetching invoices:', error);
                throw new Error('Failed to fetch invoices');
            }

            return data?.invoices || [];

        } catch (error) {
            console.error('Invoices error:', error);
            return [];
        }
    },

    /**
     * Get upcoming invoice (for plan changes)
     */
    async getUpcomingInvoice(customerId: string, newPriceId?: string): Promise<any> {
        try {
            const { data, error } = await supabase.functions.invoke('get-upcoming-invoice', {
                body: { customerId, newPriceId }
            });

            if (error) {
                console.error('Error fetching upcoming invoice:', error);
                throw new Error('Failed to fetch upcoming invoice');
            }

            return data?.invoice;

        } catch (error) {
            console.error('Upcoming invoice error:', error);
            return null;
        }
    },

    /**
     * Helper: Check if user can perform action based on limits
     */
    canPerformAction(
        subscription: UserSubscription,
        action: keyof UserSubscription['usage']
    ): boolean {
        const plan = subscription.tier;
        const usage = subscription.usage[action];

        // Define limits per plan
        const limits: Record<SubscriptionTier, Record<string, number | null>> = {
            FREE: {
                transactions: 500,
                budgets: 5,
                accounts: 3,
                recipes: 50,
                aiGenerations: 10,
                backups: 3,
                familyMembers: 1
            },
            FAMILIA: {
                transactions: null, // unlimited
                budgets: null,
                accounts: null,
                recipes: null,
                aiGenerations: null,
                backups: 20,
                familyMembers: 5
            }
        };

        const limit = limits[plan][action];
        if (limit === null) return true; // unlimited
        return usage < limit;
    },

    /**
     * Format price for display
     */
    formatPrice(amount: number, currency: string = 'EUR'): string {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency
        }).format(amount);
    },

    /**
     * Calculate prorated amount for upgrade
     */
    calculateProration(
        currentPrice: number,
        newPrice: number,
        daysRemaining: number,
        daysInPeriod: number
    ): number {
        const unusedAmount = (currentPrice / daysInPeriod) * daysRemaining;
        const newAmount = (newPrice / daysInPeriod) * daysRemaining;
        return newAmount - unusedAmount;
    }
};

export default stripeService;
