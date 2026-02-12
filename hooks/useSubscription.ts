import { useState, useEffect } from 'react';
import { stripeService } from '../services/stripeService';
import { UserSubscription, SubscriptionTier, SUBSCRIPTION_PLANS, hasReachedLimit, canUseFeature } from '../types/subscription';
import { useUserStore } from '../store/useUserStore';

/**
 * Hook for managing user subscription
 */
export const useSubscription = () => {
    const { userProfile } = useUserStore();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load subscription on mount
    useEffect(() => {
        if (userProfile?.id) {
            loadSubscription();
        }
    }, [userProfile?.id]);

    const loadSubscription = async () => {
        if (!userProfile?.id) return;

        setLoading(true);
        try {
            const sub = await stripeService.getSubscription(userProfile.id);
            setSubscription(sub);
            setError(null);
        } catch (err) {
            console.error('Error loading subscription:', err);
            setError('Failed to load subscription');
        } finally {
            setLoading(false);
        }
    };

    const subscribeToPlan = async (tier: SubscriptionTier, billingPeriod: 'monthly' | 'annual' = 'monthly') => {
        if (!userProfile?.id) {
            throw new Error('User not logged in');
        }

        if (tier === 'FREE') return;

        const plan = SUBSCRIPTION_PLANS[tier];
        const priceId = plan.stripePriceIds[billingPeriod];

        try {
            await stripeService.createCheckoutSession({
                priceId,
                userId: userProfile.id
            });
        } catch (err) {
            console.error('Error upgrading:', err);
            throw err;
        }
    };

    const manageBilling = async () => {
        if (!subscription?.stripeCustomerId) {
            throw new Error('No customer ID found. Please create a subscription first.');
        }

        try {
            await stripeService.createPortalSession({
                customerId: subscription.stripeCustomerId
            });
        } catch (err) {
            console.error('Error opening portal:', err);
            throw err;
        }
    };


    const cancelSubscription = async () => {
        if (!subscription?.stripeSubscriptionId) {
            throw new Error('No active subscription');
        }

        try {
            await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
            await loadSubscription(); // Reload to get updated status
        } catch (err) {
            console.error('Error canceling:', err);
            throw err;
        }
    };

    const reactivateSubscription = async () => {
        if (!subscription?.stripeSubscriptionId) {
            throw new Error('No subscription to reactivate');
        }

        try {
            await stripeService.reactivateSubscription(subscription.stripeSubscriptionId);
            await loadSubscription();
        } catch (err) {
            console.error('Error reactivating:', err);
            throw err;
        }
    };

    const checkLimit = (limitType: keyof UserSubscription['usage']): boolean => {
        if (!subscription) return false;
        return hasReachedLimit(subscription, limitType);
    };

    const checkFeature = (feature: keyof typeof SUBSCRIPTION_PLANS.FREE.limits): boolean => {
        if (!subscription) return false;
        return canUseFeature(subscription, feature);
    };

    const incrementUsage = async (metric: keyof UserSubscription['usage']) => {
        if (!userProfile?.id) return;

        try {
            await stripeService.updateUsage(userProfile.id, metric, 1);
            // Update local state
            if (subscription) {
                setSubscription({
                    ...subscription,
                    usage: {
                        ...subscription.usage,
                        [metric]: subscription.usage[metric] + 1
                    }
                });
            }
        } catch (err) {
            console.error('Error incrementing usage:', err);
        }
    };

    const getPlan = () => {
        if (!subscription) return SUBSCRIPTION_PLANS.FREE;
        return SUBSCRIPTION_PLANS[subscription.tier];
    };

    const isActive = () => {
        return subscription?.status === 'ACTIVE' || subscription?.status === 'TRIAL';
    };

    const isCanceled = () => {
        return subscription?.cancelAtPeriodEnd === true;
    };

    const daysUntilRenewal = (): number | null => {
        if (!subscription?.currentPeriodEnd) return null;
        const end = new Date(subscription.currentPeriodEnd);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return {
        subscription,
        loading,
        error,
        plan: getPlan(),
        isActive: isActive(),
        isCanceled: isCanceled(),
        daysUntilRenewal: daysUntilRenewal(),
        subscribeToPlan,
        manageBilling,
        cancelSubscription,
        reactivateSubscription,
        checkLimit,
        checkFeature,
        incrementUsage,
        reload: loadSubscription
    };
};
