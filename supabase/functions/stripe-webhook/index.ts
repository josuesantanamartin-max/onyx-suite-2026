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

// @ts-ignore: Deno global
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

serve(async (req: Request) => {
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

        console.log(`Received webhook: ${event.type}`)

        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
                break

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
                break

            case 'invoice.paid':
                await handleInvoicePaid(event.data.object as Stripe.Invoice)
                break

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object as Stripe.Invoice)
                break

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error: any) {
        console.error('Webhook error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.user_id

    if (!userId) {
        console.error('No user_id in subscription metadata')
        return
    }

    // Determine tier from price
    const priceId = subscription.items.data[0]?.price.id
    let tier = 'FREE'

    if (priceId?.includes('familia')) {
        tier = 'FAMILIA'
    }

    // Determine status
    let status = 'ACTIVE'
    if (subscription.status === 'canceled') status = 'CANCELED'
    if (subscription.status === 'past_due') status = 'PAST_DUE'
    if (subscription.status === 'trialing') status = 'TRIAL'

    await supabaseAdmin
        .from('user_subscriptions')
        .upsert({
            user_id: userId,
            tier,
            status,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        })

    console.log(`Updated subscription for user ${userId}: ${tier} - ${status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.user_id

    if (!userId) {
        console.error('No user_id in subscription metadata')
        return
    }

    await supabaseAdmin
        .from('user_subscriptions')
        .update({
            tier: 'FREE',
            status: 'CANCELED',
            stripe_subscription_id: null,
            stripe_price_id: null,
            canceled_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

    console.log(`Subscription deleted for user ${userId}, reverted to FREE`)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
    console.log(`Invoice paid: ${invoice.id}`)
    // Could send confirmation email here
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string

    // Get user from customer ID
    const { data: subscription } = await supabaseAdmin
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single()

    if (subscription) {
        await supabaseAdmin
            .from('user_subscriptions')
            .update({ status: 'PAST_DUE' })
            .eq('user_id', subscription.user_id)

        console.log(`Payment failed for user ${subscription.user_id}`)
        // Could send notification email here
    }
}
