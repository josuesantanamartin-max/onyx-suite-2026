import React, { useState } from 'react';
import { Check, Zap, Rocket, Shield, Crown, Loader2 } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { useSubscription } from '../../../hooks/useSubscription';
import { stripeService } from '../../../services/stripeService';
import Toast from '../../common/Toast'; // Assuming Toast context or hook is available, or use alert for MVP



const PricingSection: React.FC = () => {
    const { userProfile, subscription } = useUserStore();
    const { subscribeToPlan } = useSubscription();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const plans = [
        {
            name: 'Prueba Gratuita',
            price: '0€',
            description: '14 días con acceso completo para que pruebes Onyx Suite.',
            features: [
                'Acceso completo durante 14 días',
                'Hasta 3 cuentas bancarias',
                'Hasta 500 transacciones',
                'IA limitada (10 generaciones/mes)',
                'Un solo usuario'
            ],
            icon: <Shield className="w-6 h-6 text-gray-400" />,
            buttonText: subscription.plan === 'FREE' ? 'Plan Actual' : 'Seleccionar',
            disabled: subscription.plan === 'FREE',
            highlight: false
        },
        {
            name: 'Personal',
            price: '2,99€',
            period: '/mes',
            annualPrice: '19,99€/año',
            annualNote: 'Ahorra 45% con el pago anual',
            description: 'Todo el poder de Onyx para un solo usuario.',
            features: [
                'Cuentas y transacciones ilimitadas',
                'Presupuestos y metas ilimitadas',
                'Onyx Intelligence (IA ilimitada)',
                'Dashboard Personalizable',
                'Bóveda Digital Segura',
                'Modo Offline',
                'Soporte por email'
            ],
            icon: <Zap className="w-6 h-6 text-yellow-500" />,
            buttonText: subscription.plan === 'PERSONAL' ? 'Plan Actual' : 'Suscribirse',
            disabled: subscription.plan === 'PERSONAL',
            highlight: true
        },
        {
            name: 'Familia',
            price: '3,99€',
            period: '/mes',
            annualPrice: '24,99€/año',
            annualNote: 'Ahorra 48% con el pago anual',
            description: 'Para familias que quieren gestionar juntos.',
            features: [
                'Todo lo del plan Personal',
                'Hasta 5 miembros familiares',
                'Modo Colaborativo y Roles',
                'Espacios compartidos en tiempo real',
                'Modo Junior (Educación Financiera)',
                'Soporte Prioritario (12h)',
                '20 backups y 10 layouts de dashboard'
            ],
            icon: <Crown className="w-6 h-6 text-purple-500" />,
            buttonText: subscription.plan === 'FAMILIA' ? 'Plan Actual' : 'Suscribirse',
            disabled: subscription.plan === 'FAMILIA',
            highlight: false
        }
    ];

    const handleSubscribe = async (planName: string, billingPeriod: 'monthly' | 'annual' = 'monthly') => {
        if (!userProfile?.id) {
            alert("Por favor, inicia sesión para suscribirte.");
            return;
        }

        setIsLoading(planName);
        try {
            if (planName === 'Personal') {
                await subscribeToPlan('PERSONAL', billingPeriod);
            } else if (planName === 'Familia') {
                await subscribeToPlan('FAMILIA', billingPeriod);
            }
        } catch (error) {
            console.error(error);
            alert("Error al iniciar el pago. Por favor intenta de nuevo.");
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="py-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
                    Impulsa tu Gestión con Onyx Pro
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Elige el plan que mejor se adapte a tus necesidades y desbloquea el verdadero poder de la inteligencia financiera.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`relative p-8 rounded-3xl border transition-all duration-300 transform hover:-translate-y-2 ${plan.highlight
                            ? 'bg-black text-white border-black shadow-2xl scale-105 z-10'
                            : 'bg-white text-gray-900 border-gray-100 shadow-xl'
                            }`}
                    >
                        {plan.highlight && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                Recomendado
                            </div>
                        )}

                        <div className="mb-6 flex items-center justify-between">
                            <div className={`p-3 rounded-2xl ${plan.highlight ? 'bg-white/10' : 'bg-gray-50'}`}>
                                {plan.icon}
                            </div>
                            <span className={`text-2xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                                {plan.price}<span className="text-sm font-normal text-gray-400">{plan.period}</span>
                            </span>
                        </div>
                        {plan.annualPrice && (
                            <div className={`text-xs mb-2 px-3 py-1 rounded-full inline-block ${plan.highlight ? 'bg-yellow-400/20 text-yellow-300' : 'bg-green-50 text-green-600'}`}>
                                o {plan.annualPrice} · {plan.annualNote}
                            </div>
                        )}

                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <p className={`text-sm mb-6 ${plan.highlight ? 'text-gray-300' : 'text-gray-500'}`}>
                            {plan.description}
                        </p>

                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <div className={`mt-1 p-0.5 rounded-full ${plan.highlight ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span className={`text-sm ${plan.highlight ? 'text-gray-200' : 'text-gray-600'}`}>
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSubscribe(plan.name)}
                            disabled={plan.disabled || !!isLoading}
                            className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${plan.highlight
                                ? 'bg-white text-black hover:bg-gray-100 disabled:opacity-50'
                                : 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400'
                                }`}
                        >
                            {isLoading === plan.name ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                plan.buttonText
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 rounded-3xl bg-blue-50 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-blue-900">¿Quieres una demo personalizada?</h4>
                        <p className="text-sm text-blue-700">Explora Onyx Suite con un experto y descubre cómo organizar tu vida.</p>
                    </div>
                </div>
                <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                    Agendar Demo
                </button>
            </div>
        </div>
    );
};

export default PricingSection;
