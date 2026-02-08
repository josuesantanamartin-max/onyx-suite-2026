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
        const { priceId, userId, successUrl, cancelUrl } = req.body;

        if (!priceId || !userId) {
            return res.status(400).json({
                error: 'Missing required parameters: priceId and userId'
            });
        }

        console.log(`Creating checkout session for user ${userId}, price ${priceId}`);

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl || `${req.headers.origin}/settings?tab=subscription&success=true`,
            cancel_url: cancelUrl || `${req.headers.origin}/settings?tab=subscription&canceled=true`,
            client_reference_id: userId,
            metadata: {
                user_id: userId,
            },
            subscription_data: {
                metadata: {
                    user_id: userId,
                },
            },
        });

        return res.status(200).json({ url: session.url });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        return res.status(400).json({
            error: error.message || 'Failed to create checkout session'
        });
    }
}
