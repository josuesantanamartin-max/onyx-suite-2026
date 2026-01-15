import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const stripePromise = STRIPE_PUBLISHABLE_KEY
    ? loadStripe(STRIPE_PUBLISHABLE_KEY)
    : null;

export const stripeService = {
    /**
     * Redirige al usuario a Stripe Checkout para suscribirse a un plan PRO.
     * En una implementación real, esto llamaría a una Supabase Edge Function
     * que cree el Checkout Session de Stripe y devuelva la URL.
     */
    async redirectToCheckout(priceId: string, userId: string) {
        if (!stripePromise) {
            console.error("Stripe not initialized. Check your environment variables.");
            return;
        }

        console.log(`Iniciando checkout para el plan: ${priceId} (Usuario: ${userId})`);

        // Simulación: En un entorno real, aquí haríamos:
        // const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        //     body: { priceId, userId }
        // });
        // window.location.assign(data.url);

        alert("Redirigiendo a Stripe Checkout (Simulado)... En una app real, aquí verías la pasarela de pago.");

        // Simulación de éxito inmediato para desarrollo
        return true;
    },

    /**
     * Redirige al portal de gestión de suscripciones de Stripe.
     */
    async redirectToCustomerPortal(customerId: string) {
        console.log(`Redirigiendo al portal de Stripe para el cliente: ${customerId}`);

        // Simulación:
        // const { data } = await supabase.functions.invoke('create-portal-link', {
        //     body: { customerId }
        // });
        // window.location.assign(data.url);

        alert("Redirigiendo al Portal de Gestión (Simulado)...");
    }
};
