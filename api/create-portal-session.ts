import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover',
});

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { returnUrl, customerId } = req.body;

        console.log('Creating customer portal session');

        // If customerId is provided, use it. Otherwise, we'll need to get it from the session
        if (!customerId) {
            return res.status(400).json({
                error: 'Customer ID is required. Please create a subscription first.'
            });
        }

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || `${req.headers.origin}/settings?tab=subscription`,
        });

        return res.status(200).json({ url: session.url });
    } catch (error: any) {
        console.error('Error creating portal session:', error);
        return res.status(400).json({
            error: error.message || 'Failed to create portal session'
        });
    }
}
