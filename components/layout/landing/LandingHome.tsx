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
            a: 'La mayoría de apps se centran en una sola área. Onyx Suite es única porque conecta tus finanzas con tu vida real. Por ejemplo, si planeas un viaje, Onyx te muestra automáticamente el impacto en tu presupuesto mensual. Si añades recetas al menú semanal, calcula el coste total y lo compara con tu presupuesto de alimentación.'
        },
        {
            q: '¿Mis datos están seguros?',
            a: 'Absolutamente. Utilizamos encriptación de extremo a extremo con los mismos estándares que los bancos (AES-256). Tus datos financieros y documentos personales están protegidos con autenticación biométrica. Nunca vendemos ni compartimos tu información con terceros.'
        },
        {
            q: '¿Necesito conectar mis cuentas bancarias?',
            a: 'No es obligatorio. Puedes registrar transacciones manualmente o importar extractos bancarios. Sin embargo, la conexión bancaria automática (disponible próximamente) te ahorrará tiempo y proporcionará datos en tiempo real para análisis más precisos.'
        },
        {
            q: '¿Funciona en todos mis dispositivos?',
            a: 'Sí. Onyx Suite se sincroniza automáticamente entre tu móvil, tablet y ordenador. Los cambios que hagas en un dispositivo aparecen instantáneamente en los demás. Puedes empezar a planificar tu menú en el móvil y terminarlo en el ordenador.'
        },
        {
            q: '¿Hay límite en el número de transacciones o recetas?',
            a: 'No. Puedes registrar transacciones ilimitadas, crear todos los presupuestos que necesites, y guardar tantas recetas como quieras. El plan gratuito incluye todas las funcionalidades principales sin restricciones artificiales.'
        },
        {
            q: '¿Puedo usar Onyx Suite para gestionar finanzas familiares?',
            a: 'Sí. El plan Pro permite hasta 5 usuarios con permisos personalizables. Puedes compartir presupuestos, menús semanales y calendarios familiares, mientras mantienes ciertas transacciones o documentos privados.'
        },
        {
            q: '¿Qué pasa si cancelo mi suscripción?',
            a: 'Puedes exportar todos tus datos en cualquier momento (CSV, PDF). Si cancelas el plan Pro, volverás automáticamente al plan gratuito manteniendo acceso a tus datos históricos, aunque con algunas funciones avanzadas limitadas.'
        }
    ];

    const comparisonFeatures = [
        { feature: 'Gestión de Transacciones', manual: true, other: true, onyx: true },
        { feature: 'Presupuestos Inteligentes', manual: false, other: true, onyx: true },
        { feature: 'Análisis con IA', manual: false, other: false, onyx: true },
        { feature: 'Planificación de Menús', manual: false, other: false, onyx: true },
        { feature: 'Gestión de Despensa', manual: false, other: false, onyx: true },
        { feature: 'Conexión Finanzas-Vida', manual: false, other: false, onyx: true },
        { feature: 'Calculadora de Deudas', manual: false, other: true, onyx: true },
        { feature: 'Sincronización Multi-Dispositivo', manual: false, other: true, onyx: true },
        { feature: 'Bóveda de Documentos', manual: false, other: false, onyx: true },
        { feature: 'Soporte Familiar (5 usuarios)', manual: false, other: false, onyx: true }
    ];

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 mb-8 shadow-sm">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                        <span className="text-[10px] font-bold text-gray-600 tracking-wide uppercase">{t.heroBadge}</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-gray-900 mb-8 leading-[0.95] whitespace-pre-line">{t.heroTitle}</h1>
                    <p className="text-xl md:text-2xl text-gray-500 max-w-4xl mx-auto mb-6 leading-relaxed font-light whitespace-pre-line">{t.heroSubtitle}</p>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
                        La única plataforma que conecta tus <strong>finanzas</strong> con tu <strong>vida real</strong>. Gestiona presupuestos, elimina deudas, planifica menús y organiza viajes, todo desde un mismo lugar.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => setShowLoginModal(true)} className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 hover:-translate-y-1">{t.ctaStart} <ArrowRight className="w-5 h-5" /></button>
                        <button onClick={() => handleScrollToSection('how-it-works')} className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all">Ver Cómo Funciona</button>
                    </div>
                    <p className="text-sm text-gray-400 mt-6">Gratis para siempre • Sin tarjeta requerida • Configuración en 2 minutos</p>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-12 bg-white border-y border-gray-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '2 Módulos', label: 'Finanzas + Vida' },
                            { value: '26+', label: 'Características' },
                            { value: '100%', label: 'Seguro y Privado' },
                            { value: 'IA', label: 'Análisis Inteligente' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-1">{stat.value}</div>
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
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
                                color: 'blue'
                            },
                            {
                                step: '2',
                                title: 'Onyx Analiza y Sugiere',
                                desc: 'La IA analiza tus patrones de gasto, detecta suscripciones olvidadas, y genera menús semanales basados en tu presupuesto.',
                                icon: Sparkles,
                                color: 'purple'
                            },
                            {
                                step: '3',
                                title: 'Toma Decisiones Inteligentes',
                                desc: 'Recibe alertas proactivas, visualiza el impacto de tus decisiones, y alcanza tus metas financieras más rápido.',
                                icon: TrendingUp,
                                color: 'emerald'
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-3xl p-8 relative border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                                <div className={`absolute -top-4 left-8 w-12 h-12 bg-${item.color}-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg`}>
                                    {item.step}
                                </div>
                                <div className={`w-16 h-16 bg-${item.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-6`}>
                                    <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-center">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Apps (Pillars) Section */}
            <section id="features" className="py-24 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">{t.pillarsTitle}</h2>
                        <p className="text-lg text-gray-500">{t.pillarsSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
                        {/* Finance Card */}
                        <button onClick={() => onNavigate('FINANCE')} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group relative overflow-hidden flex flex-col justify-between text-left h-[450px]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-blue-950 rounded-2xl flex items-center justify-center mb-8 text-white shadow-xl group-hover:scale-110 transition-transform"><PiggyBank className="w-8 h-8" /></div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">Módulo Finanzas</h3>
                                <p className="text-gray-500 text-lg leading-relaxed mb-6">{PRODUCT_DETAILS_BY_LANG[language].finance.description}</p>
                                <ul className="space-y-2">
                                    {[
                                        { icon: Target, text: 'Metas de ahorro con progreso visual' },
                                        { icon: CreditCard, text: 'Eliminación de deudas estratégica' },
                                        { icon: BarChart3, text: 'Análisis predictivo con IA' }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <item.icon className="w-4 h-4 text-blue-600" />
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative z-10 font-bold text-blue-600 flex items-center gap-2">Explorar Detalles <ArrowRight className="w-4 h-4" /></div>
                        </button>
                        {/* Life Card */}
                        <button onClick={() => onNavigate('LIFE')} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all group relative overflow-hidden flex flex-col justify-between text-left h-[450px]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-8 text-white shadow-xl group-hover:scale-110 transition-transform"><Heart className="w-8 h-8" /></div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">Módulo Vida</h3>
                                <p className="text-gray-500 text-lg leading-relaxed mb-6">{PRODUCT_DETAILS_BY_LANG[language].vida.description}</p>
                                <ul className="space-y-2">
                                    {[
                                        { icon: Utensils, text: 'Planificador IA de menús semanales' },
                                        { icon: ShoppingCart, text: 'Listas de compra automáticas' },
                                        { icon: Archive, text: 'Bóveda segura de documentos' }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <item.icon className="w-4 h-4 text-purple-600" />
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative z-10 font-bold text-purple-600 flex items-center gap-2">Explorar Detalles <ArrowRight className="w-4 h-4" /></div>
                        </button>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
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
                                        <th className="px-6 py-4 text-center text-sm font-bold text-blue-600 bg-blue-50">Onyx Suite</th>
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
                                            <td className="px-6 py-4 text-center bg-blue-50/50">
                                                {item.onyx && <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Grid */}
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-bold tracking-tight mb-4">{t.benefitsTitle}</h2>
                        <p className="text-lg text-gray-500">{t.benefitsSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Fingerprint, title: "Seguridad Biométrica", desc: "Tus datos financieros y documentos protegidos con la máxima encriptación." },
                            { icon: Cloud, title: "Multi-Dispositivo", desc: "Sincronización instantánea entre tu móvil, tablet y ordenador." },
                            { icon: BarChart3, title: "IA Proactiva", desc: "No solo registra, analiza y te ayuda a tomar decisiones inteligentes." },
                            { icon: Smartphone, title: "Diseño Nativo", desc: "Una experiencia fluida pensada para el uso diario e intuitivo." }
                        ].map((benefit, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:-translate-y-1 transition-all">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm"><benefit.icon className="w-6 h-6 text-black" /></div>
                                <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
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
                                    {openFaq === i ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-5 text-gray-600 leading-relaxed animate-fade-in">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4 tracking-tight text-gray-900">{t.pricingTitle}</h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-12">{t.pricingSubtitle}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Monthly Plan */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all flex flex-col text-left group">
                            <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-6 w-fit tracking-wider">{t.basicPlan}</span>
                            <div className="flex items-center gap-2 mb-2"><h3 className="text-5xl font-bold text-gray-900">{t.basicPrice}</h3><span className="text-gray-400 font-bold">{t.perMonth}</span></div>
                            <p className="text-gray-500 text-sm mb-8">{t.basicDesc}</p>
                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-gray-900" /><span className="text-gray-700">{t.userSingle}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-gray-900" /><span className="text-gray-700">{t.accessAll}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-gray-900" /><span className="text-gray-700">{t.vaultBasic}</span></div>
                            </div>
                            <button onClick={() => setShowLoginModal(true)} className="w-full py-4 rounded-2xl border border-gray-300 font-bold hover:bg-gray-50 transition-all text-gray-900">{t.ctaStart}</button>
                        </div>
                        {/* Annual Plan */}
                        <div className="bg-black text-white rounded-3xl p-8 border border-black shadow-2xl flex flex-col text-left relative transform md:-translate-y-4 scale-105 z-10">
                            <div className="absolute top-4 right-4 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">BEST VALUE</div>
                            <span className="bg-gray-800 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-6 w-fit tracking-wider">{t.proPlan}</span>
                            <div className="flex items-center gap-2 mb-2"><h3 className="text-5xl font-bold">{t.proPrice}</h3><span className="text-gray-400 font-bold">{t.perYear}</span></div>
                            <p className="text-gray-400 text-sm mb-8">{t.proDesc}</p>
                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><span className="font-bold">{t.userFamily}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><span>{t.accessShared}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><span>{t.juniorFeat}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><span>Soporte Prioritario 24/7</span></div>
                            </div>
                            <button onClick={() => setShowLoginModal(true)} className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all shadow-lg hover:scale-[1.02]">{t.ctaStart}</button>
                            <p className="text-[10px] text-gray-500 text-center mt-4 uppercase tracking-widest font-bold">{t.singlePayment}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
