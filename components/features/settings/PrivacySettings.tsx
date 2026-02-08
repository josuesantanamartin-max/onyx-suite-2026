import React, { useState } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useLifeStore } from '../../../store/useLifeStore';
import {
    Shield, Download, Trash2, Cookie, Brain, AlertTriangle,
    FileJson, Check, X, Clock, Calendar
} from 'lucide-react';

const PrivacySettings: React.FC = () => {
    const {
        language,
        cookiePreferences,
        setCookiePreferences,
        aiPreferences,
        setAIPreferences,
        accountDeletionScheduled,
        scheduleAccountDeletion,
        cancelAccountDeletion,
        lastDataExport,
        setLastDataExport,
        userProfile
    } = useUserStore();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
    const [deleteConfirmChecked, setDeleteConfirmChecked] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const texts = {
        ES: {
            title: 'Privacidad y Datos',
            subtitle: 'Gestiona tu información personal y preferencias de privacidad',
            dataManagement: {
                title: 'Gestión de Datos',
                desc: 'Exporta o elimina tus datos personales',
                exportBtn: 'Exportar Mis Datos',
                exportDesc: 'Descarga una copia completa de todos tus datos en formato JSON',
                lastExport: 'Última exportación',
                never: 'Nunca',
                exporting: 'Exportando...',
                exportSuccess: 'Datos exportados correctamente'
            },
            cookies: {
                title: 'Preferencias de Cookies',
                desc: 'Controla qué cookies se utilizan',
                essential: 'Cookies Esenciales',
                essentialDesc: 'Necesarias para el funcionamiento básico',
                analytics: 'Cookies de Análisis',
                analyticsDesc: 'Ayudan a mejorar la aplicación',
                marketing: 'Cookies de Marketing',
                marketingDesc: 'Para contenido personalizado',
                alwaysActive: 'Siempre activas',
                saved: 'Preferencias guardadas'
            },
            ai: {
                title: 'Funciones de IA',
                desc: 'Controla cómo se usa la IA en tu experiencia',
                recommendations: 'Recomendaciones IA',
                recommendationsDesc: 'Recibe sugerencias personalizadas basadas en tu actividad',
                dataUsage: 'Uso de Datos para IA',
                dataUsageDesc: 'Permitir que tus datos ayuden a mejorar los modelos de IA',
                saved: 'Configuración de IA actualizada'
            },
            account: {
                title: 'Gestión de Cuenta',
                desc: 'Opciones de eliminación de cuenta',
                deleteBtn: 'Eliminar Mi Cuenta',
                deleteDesc: 'Eliminar permanentemente tu cuenta y todos los datos asociados',
                scheduledTitle: 'Eliminación Programada',
                scheduledDesc: 'Tu cuenta está programada para eliminarse el',
                cancelBtn: 'Cancelar Eliminación',
                daysRemaining: 'días restantes',
                modalTitle: 'Eliminar Cuenta',
                modalDesc: 'Esta acción programará tu cuenta para eliminación en 30 días. Durante este período puedes cancelar la eliminación.',
                modalWarning: 'Se eliminarán permanentemente:',
                modalList: [
                    'Todas tus transacciones y cuentas financieras',
                    'Planificaciones de comidas y listas de compra',
                    'Configuraciones y preferencias',
                    'Datos de colaboración familiar'
                ],
                modalConfirm: 'Para confirmar, escribe tu email:',
                modalCheckbox: 'Entiendo que esta acción no se puede deshacer',
                modalScheduleBtn: 'Programar Eliminación',
                modalCancelBtn: 'Cancelar',
                scheduledSuccess: 'Cuenta programada para eliminación',
                cancelSuccess: 'Eliminación cancelada'
            }
        },
        EN: {
            title: 'Privacy & Data',
            subtitle: 'Manage your personal information and privacy preferences',
            dataManagement: {
                title: 'Data Management',
                desc: 'Export or delete your personal data',
                exportBtn: 'Export My Data',
                exportDesc: 'Download a complete copy of all your data in JSON format',
                lastExport: 'Last export',
                never: 'Never',
                exporting: 'Exporting...',
                exportSuccess: 'Data exported successfully'
            },
            cookies: {
                title: 'Cookie Preferences',
                desc: 'Control which cookies are used',
                essential: 'Essential Cookies',
                essentialDesc: 'Required for basic functionality',
                analytics: 'Analytics Cookies',
                analyticsDesc: 'Help improve the application',
                marketing: 'Marketing Cookies',
                marketingDesc: 'For personalized content',
                alwaysActive: 'Always active',
                saved: 'Preferences saved'
            },
            ai: {
                title: 'AI Features',
                desc: 'Control how AI is used in your experience',
                recommendations: 'AI Recommendations',
                recommendationsDesc: 'Receive personalized suggestions based on your activity',
                dataUsage: 'Data Usage for AI',
                dataUsageDesc: 'Allow your data to help improve AI models',
                saved: 'AI settings updated'
            },
            account: {
                title: 'Account Management',
                desc: 'Account deletion options',
                deleteBtn: 'Delete My Account',
                deleteDesc: 'Permanently delete your account and all associated data',
                scheduledTitle: 'Scheduled Deletion',
                scheduledDesc: 'Your account is scheduled for deletion on',
                cancelBtn: 'Cancel Deletion',
                daysRemaining: 'days remaining',
                modalTitle: 'Delete Account',
                modalDesc: 'This action will schedule your account for deletion in 30 days. During this period you can cancel the deletion.',
                modalWarning: 'The following will be permanently deleted:',
                modalList: [
                    'All your transactions and financial accounts',
                    'Meal plans and shopping lists',
                    'Settings and preferences',
                    'Family collaboration data'
                ],
                modalConfirm: 'To confirm, type your email:',
                modalCheckbox: 'I understand this action cannot be undone',
                modalScheduleBtn: 'Schedule Deletion',
                modalCancelBtn: 'Cancel',
                scheduledSuccess: 'Account scheduled for deletion',
                cancelSuccess: 'Deletion cancelled'
            }
        },
        FR: {
            title: 'Confidentialité et Données',
            subtitle: 'Gérez vos informations personnelles et préférences de confidentialité',
            dataManagement: {
                title: 'Gestion des Données',
                desc: 'Exportez ou supprimez vos données personnelles',
                exportBtn: 'Exporter Mes Données',
                exportDesc: 'Téléchargez une copie complète de toutes vos données au format JSON',
                lastExport: 'Dernière exportation',
                never: 'Jamais',
                exporting: 'Exportation...',
                exportSuccess: 'Données exportées avec succès'
            },
            cookies: {
                title: 'Préférences de Cookies',
                desc: 'Contrôlez quels cookies sont utilisés',
                essential: 'Cookies Essentiels',
                essentialDesc: 'Nécessaires pour les fonctionnalités de base',
                analytics: 'Cookies d\'Analyse',
                analyticsDesc: 'Aident à améliorer l\'application',
                marketing: 'Cookies Marketing',
                marketingDesc: 'Pour du contenu personnalisé',
                alwaysActive: 'Toujours actifs',
                saved: 'Préférences enregistrées'
            },
            ai: {
                title: 'Fonctionnalités IA',
                desc: 'Contrôlez comment l\'IA est utilisée',
                recommendations: 'Recommandations IA',
                recommendationsDesc: 'Recevez des suggestions personnalisées',
                dataUsage: 'Utilisation des Données pour l\'IA',
                dataUsageDesc: 'Permettre à vos données d\'améliorer les modèles d\'IA',
                saved: 'Paramètres IA mis à jour'
            },
            account: {
                title: 'Gestion du Compte',
                desc: 'Options de suppression de compte',
                deleteBtn: 'Supprimer Mon Compte',
                deleteDesc: 'Supprimer définitivement votre compte et toutes les données',
                scheduledTitle: 'Suppression Programmée',
                scheduledDesc: 'Votre compte est programmé pour suppression le',
                cancelBtn: 'Annuler la Suppression',
                daysRemaining: 'jours restants',
                modalTitle: 'Supprimer le Compte',
                modalDesc: 'Cette action programmera votre compte pour suppression dans 30 jours.',
                modalWarning: 'Sera définitivement supprimé:',
                modalList: [
                    'Toutes vos transactions et comptes financiers',
                    'Plans de repas et listes de courses',
                    'Paramètres et préférences',
                    'Données de collaboration familiale'
                ],
                modalConfirm: 'Pour confirmer, tapez votre email:',
                modalCheckbox: 'Je comprends que cette action est irréversible',
                modalScheduleBtn: 'Programmer la Suppression',
                modalCancelBtn: 'Annuler',
                scheduledSuccess: 'Compte programmé pour suppression',
                cancelSuccess: 'Suppression annulée'
            }
        }
    };

    const t = texts[language as keyof typeof texts] || texts['ES'];

    const handleExportData = () => {
        setIsExporting(true);

        // Gather all data
        const data = {
            metadata: {
                version: '1.0',
                exportDate: new Date().toISOString(),
                userId: userProfile?.id || 'demo',
                gdprCompliant: true,
                dataRetentionPolicy: 'Data is retained as long as your account is active',
                dpoContact: 'dpo@onyxsuite.com'
            },
            userData: {
                profile: userProfile,
                preferences: {
                    language: useUserStore.getState().language,
                    currency: useUserStore.getState().currency,
                    theme: useUserStore.getState().theme,
                },
                cookiePreferences: cookiePreferences,
                aiPreferences: aiPreferences,
            },
            financeData: {
                transactions: useFinanceStore.getState().transactions,
                accounts: useFinanceStore.getState().accounts,
                budgets: useFinanceStore.getState().budgets,
                goals: useFinanceStore.getState().goals,
                debts: useFinanceStore.getState().debts,
                categories: useFinanceStore.getState().categories,
            },
            lifeData: {
                pantryItems: useLifeStore.getState().pantryItems,
                shoppingList: useLifeStore.getState().shoppingList,
                familyMembers: useLifeStore.getState().familyMembers,
                weeklyPlans: useLifeStore.getState().weeklyPlans,
            },
            dashboardData: {
                layouts: useUserStore.getState().dashboardLayouts,
                widgets: useUserStore.getState().dashboardWidgets,
            },
            automationData: {
                rules: useUserStore.getState().automationRules,
            }
        };

        // Create and download file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `onyx_data_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Update last export time
        const now = new Date().toISOString();
        setLastDataExport(now);

        setTimeout(() => {
            setIsExporting(false);
            alert(t.dataManagement.exportSuccess);
        }, 1000);
    };

    const toggleCookiePreference = (key: 'analytics' | 'marketing') => {
        if (!cookiePreferences) return;

        const updated = {
            ...cookiePreferences,
            [key]: !cookiePreferences[key],
            timestamp: new Date().toISOString()
        };
        setCookiePreferences(updated);
        localStorage.setItem('onyx_cookie_preferences', JSON.stringify(updated));

        setTimeout(() => alert(t.cookies.saved), 300);
    };

    const toggleAIPreference = (key: 'enableRecommendations' | 'allowDataUsage') => {
        setAIPreferences({ [key]: !aiPreferences[key] });
        setTimeout(() => alert(t.ai.saved), 300);
    };

    const handleScheduleDeletion = () => {
        if (deleteConfirmEmail !== userProfile?.email && deleteConfirmEmail !== 'demo@onyxsuite.com') {
            alert('Email incorrecto');
            return;
        }

        if (!deleteConfirmChecked) {
            alert('Debes confirmar que entiendes las consecuencias');
            return;
        }

        scheduleAccountDeletion();
        setShowDeleteModal(false);
        setDeleteConfirmEmail('');
        setDeleteConfirmChecked(false);
        alert(t.account.scheduledSuccess);
    };

    const handleCancelDeletion = () => {
        cancelAccountDeletion();
        alert(t.account.cancelSuccess);
    };

    const getDaysRemaining = () => {
        if (!accountDeletionScheduled) return 0;
        const deletionDate = new Date(accountDeletionScheduled);
        const now = new Date();
        const diff = deletionDate.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="max-w-3xl space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
            </div>

            {/* Data Management Section */}
            <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-gray-200 dark:border-onyx-800 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-onyx-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                            <FileJson className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{t.dataManagement.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.dataManagement.desc}</p>
                </div>

                <div className="p-6 space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-onyx-800 rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                                    {t.dataManagement.exportBtn}
                                </h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t.dataManagement.exportDesc}
                                </p>
                                {lastDataExport && (
                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        {t.dataManagement.lastExport}: {new Date(lastDataExport).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleExportData}
                            disabled={isExporting}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            {isExporting ? t.dataManagement.exporting : t.dataManagement.exportBtn}
                        </button>
                    </div>
                </div>
            </div>

            {/* Cookie Preferences Section */}
            <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-gray-200 dark:border-onyx-800 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-onyx-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <Cookie className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{t.cookies.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.cookies.desc}</p>
                </div>

                <div className="p-6 space-y-3">
                    {/* Essential Cookies */}
                    <div className="p-4 bg-gray-50 dark:bg-onyx-800 rounded-xl flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <h5 className="font-bold text-sm text-gray-900 dark:text-white">{t.cookies.essential}</h5>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t.cookies.essentialDesc}</p>
                        </div>
                        <span className="px-2 py-1 bg-gray-200 dark:bg-onyx-700 text-[10px] font-bold text-gray-600 dark:text-gray-400 rounded-md uppercase tracking-wider">
                            {t.cookies.alwaysActive}
                        </span>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="p-4 bg-white dark:bg-onyx-800 rounded-xl border border-gray-200 dark:border-onyx-700 flex items-start justify-between">
                        <div className="flex-1">
                            <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{t.cookies.analytics}</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t.cookies.analyticsDesc}</p>
                        </div>
                        <button
                            onClick={() => toggleCookiePreference('analytics')}
                            className={`relative w-12 h-6 rounded-full transition-colors ${cookiePreferences?.analytics
                                    ? 'bg-indigo-600'
                                    : 'bg-gray-300 dark:bg-onyx-700'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${cookiePreferences?.analytics ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="p-4 bg-white dark:bg-onyx-800 rounded-xl border border-gray-200 dark:border-onyx-700 flex items-start justify-between">
                        <div className="flex-1">
                            <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{t.cookies.marketing}</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t.cookies.marketingDesc}</p>
                        </div>
                        <button
                            onClick={() => toggleCookiePreference('marketing')}
                            className={`relative w-12 h-6 rounded-full transition-colors ${cookiePreferences?.marketing
                                    ? 'bg-indigo-600'
                                    : 'bg-gray-300 dark:bg-onyx-700'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${cookiePreferences?.marketing ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Features Section */}
            <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-gray-200 dark:border-onyx-800 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-onyx-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{t.ai.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.ai.desc}</p>
                </div>

                <div className="p-6 space-y-3">
                    {/* AI Recommendations */}
                    <div className="p-4 bg-white dark:bg-onyx-800 rounded-xl border border-gray-200 dark:border-onyx-700 flex items-start justify-between">
                        <div className="flex-1">
                            <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{t.ai.recommendations}</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t.ai.recommendationsDesc}</p>
                        </div>
                        <button
                            onClick={() => toggleAIPreference('enableRecommendations')}
                            className={`relative w-12 h-6 rounded-full transition-colors ${aiPreferences.enableRecommendations
                                    ? 'bg-blue-600'
                                    : 'bg-gray-300 dark:bg-onyx-700'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${aiPreferences.enableRecommendations ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* AI Data Usage */}
                    <div className="p-4 bg-white dark:bg-onyx-800 rounded-xl border border-gray-200 dark:border-onyx-700 flex items-start justify-between">
                        <div className="flex-1">
                            <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{t.ai.dataUsage}</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t.ai.dataUsageDesc}</p>
                        </div>
                        <button
                            onClick={() => toggleAIPreference('allowDataUsage')}
                            className={`relative w-12 h-6 rounded-full transition-colors ${aiPreferences.allowDataUsage
                                    ? 'bg-blue-600'
                                    : 'bg-gray-300 dark:bg-onyx-700'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${aiPreferences.allowDataUsage ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Account Management Section */}
            <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-red-200 dark:border-red-900 overflow-hidden">
                <div className="p-6 border-b border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h4 className="font-bold text-red-900 dark:text-red-200">{t.account.title}</h4>
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-300">{t.account.desc}</p>
                </div>

                <div className="p-6">
                    {accountDeletionScheduled ? (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800">
                            <div className="flex items-start gap-3 mb-3">
                                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                                <div className="flex-1">
                                    <h5 className="font-bold text-sm text-orange-900 dark:text-orange-200 mb-1">
                                        {t.account.scheduledTitle}
                                    </h5>
                                    <p className="text-xs text-orange-700 dark:text-orange-300">
                                        {t.account.scheduledDesc} {new Date(accountDeletionScheduled).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-2">
                                        {getDaysRemaining()} {t.account.daysRemaining}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCancelDeletion}
                                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                {t.account.cancelBtn}
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl">
                            <h5 className="font-bold text-sm text-red-900 dark:text-red-200 mb-1">
                                {t.account.deleteBtn}
                            </h5>
                            <p className="text-xs text-red-700 dark:text-red-300 mb-4">
                                {t.account.deleteDesc}
                            </p>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t.account.deleteBtn}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-onyx-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-red-900 dark:text-red-200">
                                        {t.account.modalTitle}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmEmail('');
                                        setDeleteConfirmChecked(false);
                                    }}
                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {t.account.modalDesc}
                            </p>

                            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl">
                                <p className="text-xs font-bold text-red-900 dark:text-red-200 mb-2">
                                    {t.account.modalWarning}
                                </p>
                                <ul className="space-y-1">
                                    {t.account.modalList.map((item, idx) => (
                                        <li key={idx} className="text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                                            <span className="text-red-500 mt-0.5">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    {t.account.modalConfirm}
                                </label>
                                <input
                                    type="email"
                                    value={deleteConfirmEmail}
                                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                                    placeholder={userProfile?.email || 'demo@onyxsuite.com'}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-onyx-800 border border-gray-200 dark:border-onyx-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>

                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="delete-confirm"
                                    checked={deleteConfirmChecked}
                                    onChange={(e) => setDeleteConfirmChecked(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                />
                                <label htmlFor="delete-confirm" className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                    {t.account.modalCheckbox}
                                </label>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-onyx-800 bg-gray-50 dark:bg-onyx-900 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmEmail('');
                                    setDeleteConfirmChecked(false);
                                }}
                                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-onyx-800 hover:bg-gray-300 dark:hover:bg-onyx-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-all"
                            >
                                {t.account.modalCancelBtn}
                            </button>
                            <button
                                onClick={handleScheduleDeletion}
                                disabled={!deleteConfirmChecked || deleteConfirmEmail !== (userProfile?.email || 'demo@onyxsuite.com')}
                                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t.account.modalScheduleBtn}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrivacySettings;
