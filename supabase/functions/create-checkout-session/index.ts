// @ts-ignore: Deno types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore: Deno types
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
// @ts-ignore: Deno types
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// @ts-ignore: Deno global
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

// @ts-ignore: Deno global
const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { priceId, userId, successUrl, cancelUrl } = await req.json()

        if (!priceId || !userId) {
            throw new Error('Missing required parameters: priceId and userId')
        }

        console.log(`Creating checkout session for user ${userId}, price ${priceId}`)

        // Create or retrieve Stripe customer
        const { data: subscription } = await supabaseAdmin
            .from('user_subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', userId)
            .single()

        let customerId = subscription?.stripe_customer_id

        if (!customerId) {
            // Create new Stripe customer
            const customer = await stripe.customers.create({
                metadata: {
                    supabase_user_id: userId,
                },
            })
            customerId = customer.id

            // Save customer ID
            await supabaseAdmin
                .from('user_subscriptions')
                .upsert({
                    user_id: userId,
                    stripe_customer_id: customerId,
                })
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl || `${req.headers.get('origin')}/settings?tab=subscription&success=true`,
            cancel_url: cancelUrl || `${req.headers.get('origin')}/settings?tab=subscription&canceled=true`,
            metadata: {
                user_id: userId,
            },
            subscription_data: {
                metadata: {
                    user_id: userId,
                },
            },
        })

        return new Response(
            JSON.stringify({ url: session.url }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error: any) {
        console.error('Error creating checkout session:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
