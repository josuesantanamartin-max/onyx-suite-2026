import React, { useState } from 'react';
import { ExternalLink, CreditCard, Check, AlertCircle, Info } from 'lucide-react';
import { useSubscription } from '../../../hooks/useSubscription';

/**
 * Componente de prueba para el Portal del Cliente de Stripe
 * Este componente permite probar fácilmente la funcionalidad del portal
 */
export const StripePortalTest: React.FC = () => {
    const { subscription, loading, manageBilling } = useSubscription();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOpenPortal = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await manageBilling();
            // Si llegamos aquí sin error, el usuario será redirigido automáticamente
        } catch (err: any) {
            console.error('Error opening portal:', err);
            setError(err.message || 'Error al abrir el portal de Stripe');
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-8">
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-8 border border-gray-200 dark:border-onyx-800 shadow-lg">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 dark:bg-onyx-800 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-onyx-800 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="bg-white dark:bg-onyx-900 rounded-3xl p-8 border border-gray-200 dark:border-onyx-800 shadow-lg">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        Portal del Cliente de Stripe
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Prueba la integración del Portal del Cliente
                    </p>
                </div>

                {/* Subscription Info */}
                <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white dark:bg-onyx-800 rounded-xl shadow-sm">
                            <CreditCard className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">
                                Plan Actual: {subscription?.tier || 'FREE'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Estado: {subscription?.status || 'NONE'}
                            </p>
                        </div>
                    </div>

                    {subscription?.tier !== 'FREE' && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Suscripción activa
                                </span>
                            </div>
                            {subscription?.currentPeriodEnd && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        Próxima renovación: {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES')}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-red-900 dark:text-red-200 text-sm">Error</p>
                            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="mb-6 p-6 bg-gray-50 dark:bg-onyx-800 rounded-2xl border border-gray-200 dark:border-onyx-700">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                        ¿Qué puedes hacer en el Portal?
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>Ver y descargar tus facturas</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>Actualizar tu método de pago</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>Cancelar tu suscripción (si está activa)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>Actualizar tu información de facturación</span>
                        </li>
                    </ul>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleOpenPortal}
                    disabled={isLoading || subscription?.tier === 'FREE'}
                    className={`w-full py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-3 ${isLoading || subscription?.tier === 'FREE'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Abriendo Portal...
                        </>
                    ) : (
                        <>
                            <ExternalLink className="w-5 h-5" />
                            Abrir Portal del Cliente
                        </>
                    )}
                </button>

                {subscription?.tier === 'FREE' && (
                    <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Necesitas una suscripción activa para acceder al portal
                    </p>
                )}

                {/* Debug Info (solo en desarrollo) */}
                {import.meta.env.DEV && (
                    <details className="mt-6 p-4 bg-gray-100 dark:bg-onyx-950 rounded-xl text-xs">
                        <summary className="font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                            Debug Info (solo visible en desarrollo)
                        </summary>
                        <pre className="mt-2 text-gray-600 dark:text-gray-400 overflow-auto">
                            {JSON.stringify(subscription, null, 2)}
                        </pre>
                    </details>
                )}

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        Guía de Pruebas
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                        Aprende a probar el flujo de checkout, portal de cliente y webhooks paso a paso.
                    </p>
                    <a
                        href="/docs/STRIPE_PORTAL_TEST_GUIDE.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Ver Guía de Pruebas
                    </a>
                </div>
            </div>
        </div>
    );
};

export default StripePortalTest;
