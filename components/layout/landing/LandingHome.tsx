import React, { useState } from 'react';
import {
    PiggyBank, Heart, ArrowRight, Check, Sparkles, LayoutDashboard,
    Smartphone, BarChart3, Fingerprint, Cloud, Zap, Shield, Users,
    TrendingUp, Clock, Globe, ChevronDown, ChevronUp, X, Minus, CheckCircle2,
    Utensils, Calendar, Archive, Target, CreditCard, ShoppingCart
} from 'lucide-react';
import { Language } from '../../../types';
import { PRODUCT_DETAILS_BY_LANG } from './landingData';

interface LandingHomeProps {
    t: any;
    language: Language;
    setShowLoginModal: (show: boolean) => void;
    onNavigate: (view: 'HOME' | 'FINANCE' | 'LIFE') => void;
}

export const LandingHome: React.FC<LandingHomeProps> = ({
    t,
    language,
    setShowLoginModal,
    onNavigate
}) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');

    const handleScrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };

    const faqs = [
        {
            q: '¿Qué es Onyx Suite exactamente?',
            a: 'Onyx Suite es una plataforma integral que unifica la gestión financiera personal y la organización del hogar en un solo lugar. Combina un sistema operativo financiero completo (presupuestos, deudas, inversiones) con herramientas inteligentes para la vida diaria (planificación de menús, gestión de despensa, viajes).'
        },
        {
            q: '¿Cómo se diferencia de otras apps de finanzas o gestión del hogar?',
            a: 'La mayoría de apps se centran en una sola área. Onyx Suite es única porque conecta tus finanzas con tu vida real. Por ejemplo, si planeas un viaje, Onyx te muestra automáticamente el impacto en tu presupuesto mensual.'
        },
        {
            q: '¿Mis datos están seguros?',
            a: 'Absolutamente. Utilizamos encriptación de extremo a extremo con los mismos estándares que los bancos (AES-256). Tus datos financieros y documentos personales están protegidos con autenticación biométrica. Nunca vendemos ni compartimos tu información con terceros.'
        },
        {
            q: '¿Necesito conectar mis cuentas bancarias?',
            a: 'No es obligatorio. Puedes registrar transacciones manualmente o importar extractos bancarios. Sin embargo, la conexión bancaria automática (disponible próximamente) te ahorrará tiempo y proporcionará datos en tiempo real.'
        },
        {
            q: '¿Funciona en todos mis dispositivos?',
            a: 'Sí. Onyx Suite se sincroniza automáticamente entre tu móvil, tablet y ordenador. Los cambios que hagas en un dispositivo aparecen instantáneamente en los demás.'
        },
        {
            q: '¿Hay límite en el número de transacciones o recetas?',
            a: 'No. Puedes registrar transacciones ilimitadas, crear todos los presupuestos que necesites, y guardar tantas recetas como quieras.'
        },
        {
            q: '¿Puedo usar Onyx Suite para gestionar finanzas familiares?',
            a: 'Sí. El plan Pro permite hasta 5 usuarios con permisos personalizables. Puedes compartir presupuestos, menús semanales y calendarios familiares.'
        },
        {
            q: '¿Qué pasa si cancelo mi suscripción?',
            a: 'Puedes exportar todos tus datos en cualquier momento (CSV, PDF). Si cancelas el plan Pro, volverás automáticamente al plan gratuito manteniendo acceso a tus datos históricos.'
        }
    ];

    const comparisonFeatures = [
        { feature: 'Gestión de Transacciones', manual: true, other: true, onyx: true },
        { feature: 'Presupuestos Inteligentes con IA', manual: false, other: true, onyx: true },
        { feature: 'Análisis Predictivo con IA', manual: false, other: false, onyx: true },
        { feature: 'Importación CSV / Extractos', manual: false, other: true, onyx: true },
        { feature: 'Planificador de Menús con IA', manual: false, other: false, onyx: true },
        { feature: 'Gestión de Despensa e Inventario', manual: false, other: false, onyx: true },
        { feature: 'Conexión Finanzas ↔ Vida Real', manual: false, other: false, onyx: true },
        { feature: 'Calculadora de Deudas (Avalancha/Bola)', manual: false, other: true, onyx: true },
        { feature: 'Dashboard Personalizable (Drag & Drop)', manual: false, other: false, onyx: true },
        { feature: 'Modo Colaborativo Familiar', manual: false, other: false, onyx: true },
        { feature: 'Simulador de Jubilación', manual: false, other: false, onyx: true },
        { feature: 'Bóveda Digital de Documentos', manual: false, other: false, onyx: true },
        { feature: 'Planificador de Viajes con IA', manual: false, other: false, onyx: true },
        { feature: 'Centro de Ayuda Multilingüe', manual: false, other: true, onyx: true },
        { feature: 'Privacidad GDPR Completa', manual: false, other: false, onyx: true },
        { feature: 'Soporte Familiar (5 usuarios)', manual: false, other: false, onyx: true }
    ];

    return (
        <div className="animate-fade-in">

            {/* ── Hero Section — Dark Premium ── */}
            <section className="relative pt-32 pb-28 px-6 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950">
                {/* Ambient orbs */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    {/* Live badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                        </span>
                        <span className="text-[11px] font-bold text-white/80 tracking-widest uppercase">{t.heroBadge}</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-[0.95] whitespace-pre-line">{t.heroTitle}</h1>
                    <p className="text-xl md:text-2xl text-indigo-200 max-w-4xl mx-auto mb-6 leading-relaxed font-light whitespace-pre-line">{t.heroSubtitle}</p>
                    <p className="text-lg text-white/60 max-w-3xl mx-auto mb-12">
                        La única plataforma que conecta tus <strong className="text-white">finanzas</strong> con tu <strong className="text-white">vida real</strong>. Gestiona presupuestos, elimina deudas, planifica menús y organiza viajes, todo desde un mismo lugar.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:from-indigo-400 hover:to-violet-500 transition-all shadow-xl shadow-indigo-500/30 hover:-translate-y-1"
                        >
                            {t.ctaStart} <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleScrollToSection('how-it-works')}
                            className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
                        >
                            Ver Cómo Funciona
                        </button>
                    </div>
                    <p className="text-sm text-white/40 mt-6">14 días de prueba gratis • Sin compromiso • Después desde 2,99€/mes</p>
                </div>
            </section>

            {/* ── Stats Bar ── */}
            <section className="py-12 bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '2 Módulos', label: 'Finanzas + Vida' },
                            { value: '40+', label: 'Características' },
                            { value: '100%', label: 'GDPR y Privacidad' },
                            { value: 'IA', label: 'Análisis Inteligente' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-black text-indigo-600 mb-1">{stat.value}</div>
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section id="how-it-works" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
                            <Zap className="w-4 h-4" />
                            Cómo Funciona
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">De Caos a Claridad en 3 Pasos</h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Empieza a tomar control de tus finanzas y tu vida en minutos, no en horas.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                step: '1',
                                title: 'Conecta Tu Realidad',
                                desc: 'Registra tus cuentas bancarias, tarjetas, inversiones y deudas. Añade tu despensa actual y preferencias alimentarias.',
                                icon: LayoutDashboard,
                                gradient: 'from-indigo-600 to-indigo-800',
                                iconBg: 'bg-indigo-100',
                                iconColor: 'text-indigo-600'
                            },
                            {
                                step: '2',
                                title: 'Onyx Analiza y Sugiere',
                                desc: 'La IA analiza tus patrones de gasto, detecta suscripciones olvidadas, y genera menús semanales basados en tu presupuesto.',
                                icon: Sparkles,
                                gradient: 'from-violet-600 to-violet-800',
                                iconBg: 'bg-violet-100',
                                iconColor: 'text-violet-600'
                            },
                            {
                                step: '3',
                                title: 'Toma Decisiones Inteligentes',
                                desc: 'Recibe alertas proactivas, visualiza el impacto de tus decisiones, y alcanza tus metas financieras más rápido.',
                                icon: TrendingUp,
                                gradient: 'from-emerald-600 to-emerald-800',
                                iconBg: 'bg-emerald-100',
                                iconColor: 'text-emerald-600'
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-3xl p-8 relative border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                                <div className={`absolute -top-4 left-8 w-12 h-12 bg-gradient-to-br ${item.gradient} text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg`}>
                                    {item.step}
                                </div>
                                <div className={`w-16 h-16 ${item.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 mt-6`}>
                                    <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-center">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Module Pillars ── */}
            <section id="features" className="py-24 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">{t.pillarsTitle}</h2>
                        <p className="text-lg text-gray-500">{t.pillarsSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
                        {/* Finance Card */}
                        <button onClick={() => onNavigate('FINANCE')} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group relative overflow-hidden flex flex-col justify-between text-left h-[450px]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-2xl flex items-center justify-center mb-8 text-white shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                    <PiggyBank className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">Módulo Finanzas</h3>
                                <p className="text-gray-500 text-lg leading-relaxed mb-6">{PRODUCT_DETAILS_BY_LANG[language].finance.description}</p>
                                <ul className="space-y-2">
                                    {[
                                        { icon: Target, text: 'Metas de ahorro con progreso visual' },
                                        { icon: CreditCard, text: 'Eliminación de deudas estratégica' },
                                        { icon: BarChart3, text: 'Análisis predictivo con IA' },
                                        { icon: TrendingUp, text: 'Simulador de jubilación e inversiones' },
                                        { icon: Calendar, text: 'Importación CSV y categorización IA' }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <item.icon className="w-4 h-4 text-indigo-600" />
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative z-10 font-bold text-indigo-600 flex items-center gap-2">Explorar Detalles <ArrowRight className="w-4 h-4" /></div>
                        </button>

                        {/* Life Card */}
                        <button onClick={() => onNavigate('LIFE')} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-violet-200 transition-all group relative overflow-hidden flex flex-col justify-between text-left h-[450px]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-800 rounded-2xl flex items-center justify-center mb-8 text-white shadow-xl shadow-violet-500/30 group-hover:scale-110 transition-transform">
                                    <Heart className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">Módulo Vida</h3>
                                <p className="text-gray-500 text-lg leading-relaxed mb-6">{PRODUCT_DETAILS_BY_LANG[language].vida.description}</p>
                                <ul className="space-y-2">
                                    {[
                                        { icon: Utensils, text: 'Planificador IA de menús semanales' },
                                        { icon: ShoppingCart, text: 'Listas de compra y despensa automáticas' },
                                        { icon: Archive, text: 'Bóveda segura de documentos' },
                                        { icon: Globe, text: 'Planificador de viajes con IA' },
                                        { icon: Calendar, text: 'Calendario familiar integrado' }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <item.icon className="w-4 h-4 text-violet-600" />
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative z-10 font-bold text-violet-600 flex items-center gap-2">Explorar Detalles <ArrowRight className="w-4 h-4" /></div>
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Comparison Table ── */}
            <section className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por Qué Onyx Suite?</h2>
                        <p className="text-lg text-gray-500">Comparación con métodos tradicionales y otras aplicaciones</p>
                    </div>
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Característica</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-500">Manual<br />(Excel)</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-500">Otras Apps</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-indigo-600 bg-indigo-50">Onyx Suite</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {comparisonFeatures.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.feature}</td>
                                            <td className="px-6 py-4 text-center">
                                                {item.manual ? <CheckCircle2 className="w-5 h-5 text-gray-400 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.other ? <CheckCircle2 className="w-5 h-5 text-gray-400 mx-auto" /> : <Minus className="w-5 h-5 text-gray-300 mx-auto" />}
                                            </td>
                                            <td className="px-6 py-4 text-center bg-indigo-50/50">
                                                {item.onyx && <CheckCircle2 className="w-5 h-5 text-indigo-600 mx-auto" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Benefits Grid ── */}
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-bold tracking-tight mb-4">{t.benefitsTitle}</h2>
                        <p className="text-lg text-gray-500">{t.benefitsSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Fingerprint, title: "Seguridad GDPR", desc: "Privacidad completa: consentimiento de cookies, exportación de datos y eliminación de cuenta con período de gracia." },
                            { icon: Cloud, title: "Multi-Dispositivo", desc: "Sincronización instantánea entre tu móvil, tablet y ordenador." },
                            { icon: BarChart3, title: "IA Proactiva", desc: "Presupuestos IA, análisis predictivo, categorización automática y simulador de jubilación." },
                            { icon: Smartphone, title: "Diseño Nativo", desc: "Una experiencia fluida pensada para el uso diario e intuitivo." },
                            { icon: Users, title: "Modo Colaborativo", desc: "Hasta 5 miembros familiares con roles y permisos personalizables." },
                            { icon: LayoutDashboard, title: "Dashboard Personalizable", desc: "Drag & drop para organizar tus widgets. Onyx Insights con IA integrada." },
                            { icon: Globe, title: "Multilingüe", desc: "Disponible en Español, English y Français. Centro de Ayuda en 3 idiomas." },
                            { icon: Shield, title: "Importación Flexible", desc: "Importa extractos bancarios CSV con vinculación automática a tus cuentas." }
                        ].map((benefit, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:-translate-y-1 transition-all group">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-violet-100 rounded-2xl flex items-center justify-center mb-6 group-hover:from-indigo-100 group-hover:to-violet-200 transition-all">
                                    <benefit.icon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h2>
                        <p className="text-lg text-gray-500">Todo lo que necesitas saber sobre Onyx Suite</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-bold text-gray-900 pr-4">{faq.q}</span>
                                    {openFaq === i ? <ChevronUp className="w-5 h-5 text-indigo-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-5 text-gray-600 leading-relaxed animate-fade-in border-t border-gray-100 pt-4">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <section id="pricing" className="py-24 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4 tracking-tight text-gray-900">{t.pricingTitle}</h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8">{t.pricingSubtitle}</p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <span className={`text-sm font-bold ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>{t.billingMonthly}</span>
                        <button
                            onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                            className="w-14 h-8 bg-indigo-600 rounded-full p-1 relative transition-colors duration-300"
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 ${billingPeriod === 'annual' ? 'translate-x-6' : ''}`} />
                        </button>
                        <span className={`text-sm font-bold ${billingPeriod === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
                            {t.billingAnnual} <span className="text-emerald-500 text-xs ml-1">({t.savePercent})</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

                        {/* TIER 1: TRIAL */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all flex flex-col text-left group">
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-6 w-fit tracking-wider">{t.trialPeriod}</span>
                            <h3 className="text-xl font-bold mb-2">{t.trialPlan}</h3>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-5xl font-bold text-gray-900">{t.trialPrice}</span>
                            </div>
                            <p className="text-gray-500 text-sm mb-8">{t.trialDesc}</p>
                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-indigo-600" /><span className="text-gray-700">{t.featUser1}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-indigo-600" /><span className="text-gray-700">{t.featAccess}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-indigo-600" /><span className="text-gray-700">14 días</span></div>
                            </div>
                            <button onClick={() => setShowLoginModal(true)} className="w-full py-4 rounded-2xl border-2 border-indigo-200 font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all text-indigo-700">{t.trialCta}</button>
                        </div>

                        {/* TIER 2: PERSONAL */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all flex flex-col text-left group relative">
                            {billingPeriod === 'annual' && (
                                <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-bl-2xl rounded-tr-2xl uppercase tracking-wider">
                                    -45%
                                </div>
                            )}
                            <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-6 w-fit tracking-wider">{t.personalPlan}</span>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-5xl font-bold text-gray-900">
                                    {billingPeriod === 'monthly' ? t.personalPriceMonthly : t.personalPriceAnnual}
                                </h3>
                                <span className="text-gray-400 font-bold text-xs">
                                    {billingPeriod === 'monthly' ? t.perMonth : t.perYear}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mb-8">{t.personalDesc}</p>
                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-gray-900" /><span className="text-gray-700">{t.featUser1}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-gray-900" /><span className="text-gray-700">{t.featAccess}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-gray-900" /><span className="text-gray-700">{t.featVault}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-gray-900" /><span className="text-gray-700">{t.featJunior}</span></div>
                            </div>
                            <button onClick={() => setShowLoginModal(true)} className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all">{t.personalCta}</button>
                        </div>

                        {/* TIER 3: FAMILY — indigo premium */}
                        <div className="bg-gradient-to-br from-indigo-900 to-violet-950 text-white rounded-3xl p-8 shadow-xl shadow-indigo-500/20 flex flex-col text-left relative transform md:-translate-y-4 md:scale-105 z-10">
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/30">BEST VALUE</div>
                            <span className="bg-white/10 text-white/80 text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-6 w-fit tracking-wider border border-white/20">{t.familyPlan}</span>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-5xl font-bold">
                                    {billingPeriod === 'monthly' ? t.familyPriceMonthly : t.familyPriceAnnual}
                                </h3>
                                <span className="text-indigo-300 font-bold text-xs">
                                    {billingPeriod === 'monthly' ? t.perMonth : t.perYear}
                                </span>
                            </div>
                            <p className="text-indigo-300 text-sm mb-8">{t.familyDesc}</p>
                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><span className="font-bold">{t.featUser5}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><span>{t.featShared}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><span>{t.featJunior}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><span>{t.featPriority}</span></div>
                            </div>
                            <button onClick={() => setShowLoginModal(true)} className="w-full py-4 rounded-2xl bg-white text-indigo-900 font-bold hover:bg-indigo-50 transition-all shadow-lg hover:scale-[1.02]">{t.familyCta}</button>
                            {billingPeriod === 'annual' && (
                                <p className="text-[10px] text-indigo-400 text-center mt-4 uppercase tracking-widest font-bold">{t.singlePayment}</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-24 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 right-1/3 w-[400px] h-[300px] bg-violet-600/20 rounded-full blur-[80px]" />
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">¿Listo para transformar tu vida financiera?</h2>
                    <p className="text-indigo-200 max-w-2xl mx-auto mb-10 text-lg">
                        Únete a la plataforma que conecta tus finanzas con tu vida real.
                    </p>
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-indigo-400 hover:to-violet-500 transition-all shadow-xl shadow-indigo-500/30 hover:-translate-y-1 inline-flex items-center gap-3"
                    >
                        Comenzar Gratis <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-sm text-white/40 mt-6">Sin tarjeta de crédito requerida • Configuración en 2 minutos</p>
                </div>
            </section>
        </div>
    );
};
