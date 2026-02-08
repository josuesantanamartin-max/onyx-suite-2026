import React from 'react';
import { Info, Sparkles, X, Trash2 } from 'lucide-react';
import { useSampleData } from '../../hooks/useSampleData';

/**
 * Banner that appears when sample data is loaded
 * Informs user they're viewing example data and provides options
 */
const SampleDataBanner: React.FC = () => {
    const {
        isSampleDataLoaded,
        isBannerDismissed,
        clearAllData,
        dismissBanner,
        isLoading,
    } = useSampleData();

    // Don't show banner if sample data isn't loaded or if dismissed
    if (!isSampleDataLoaded || isBannerDismissed) {
        return null;
    }

    const handleStartWithMyData = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos de ejemplo? Esta acción no se puede deshacer.')) {
            clearAllData();
        }
    };

    return (
        <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                            <Sparkles size={24} className="text-white" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                                    <Info size={18} />
                                    Estás viendo datos de ejemplo
                                </h3>
                                <p className="text-sm text-white/90 leading-relaxed">
                                    Hemos cargado datos de muestra para que puedas explorar todas las funcionalidades de Onyx Suite.
                                    Cuando estés listo, puedes comenzar con tus propios datos.
                                </p>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={dismissBanner}
                                className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                                aria-label="Cerrar banner"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                onClick={handleStartWithMyData}
                                disabled={isLoading}
                                className="
                                    inline-flex items-center gap-2 px-4 py-2 
                                    bg-white text-indigo-600 font-semibold rounded-lg
                                    hover:bg-gray-50 transition-all duration-200
                                    shadow-md hover:shadow-lg
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                "
                            >
                                <Trash2 size={16} />
                                Comenzar con mis datos
                            </button>

                            <button
                                onClick={dismissBanner}
                                disabled={isLoading}
                                className="
                                    inline-flex items-center gap-2 px-4 py-2
                                    bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg
                                    hover:bg-white/20 transition-all duration-200
                                    border border-white/30
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                "
                            >
                                Mantener datos de ejemplo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>
    );
};

export default SampleDataBanner;
