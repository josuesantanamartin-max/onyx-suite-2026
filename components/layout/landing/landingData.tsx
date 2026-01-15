import {
    PiggyBank, Utensils, Heart, Calendar, ArrowRight, Check,
    Zap, Shield, Play, Home, Plane, Lock, Sparkles,
    Layers, ArrowLeft, ChevronRight, Globe, Users, ChevronDown, TrendingDown, CreditCard, LayoutDashboard,
    Smartphone, BarChart3, Fingerprint, Cloud, LogIn
} from 'lucide-react';
import React from 'react';
import { Language } from '../../../types';

type ProductKey = 'finance' | 'vida' | 'dashboard';

// Helper components
export const WalletIconMock = ({ className }: { className?: string }) => <CreditCard className={ className } />;

export const LANDING_TEXTS = {
    ES: {
        heroBadge: "Onyx Suite 2.0: Sistema Integral Inteligente",
        heroTitle: "Tu vida, simplificada.\nTodo bajo control.",
        heroSubtitle: "La plataforma definitiva que unifica tus finanzas, tu hogar, tu nutrición y tus viajes.\nDeja de usar 10 apps diferentes. Pásate al sistema que lo conecta todo.",
        ctaStart: "Empezar Ahora",
        ctaDemo: "Probar Demo (Sin Cuenta)",
        pillarsTitle: "El Ecosistema Onyx",
        pillarsSubtitle: "No son apps sueltas. Son módulos conectados por un cerebro central.",
        ecosystemTag: "Onyx Sync™",
        ecosystemTitle: "Tu centro de mando\nhiper-conectado.",
        ecosystemDesc: "Imagina que tu calendario de cenas sabe tu presupuesto de supermercado. Onyx lo hace posible. Una visión 360° de tu vida en tiempo real.",
        benefitsTitle: "Diseñado para la Tranquilidad Mental",
        benefitsSubtitle: "Recupera el control de tu tiempo y tu dinero con una herramienta profesional.",
        pricingTitle: "Inversión Inteligente",
        pricingSubtitle: "Elige la flexibilidad mensual o el máximo ahorro anual. Acceso completo siempre.",
        promoBadge: "🔥 Oferta: Plan Anual sale a 1,66€/mes",
        basicPlan: "Mensual",
        basicPrice: "2,99€",
        basicDesc: "Flexibilidad total sin compromisos.",
        proPlan: "Anual (Recomendado)",
        proPrice: "19,99€",
        proDesc: "Ahorra un 45% vs plan mensual.",
        userSingle: "Hasta 2 Usuarios",
        userFamily: "Hasta 6 Usuarios (Familia)",
        accessAll: "Acceso Total al Sistema",
        accessShared: "Roles y Permisos Avanzados",
        vaultBasic: "Bóveda Digital Segura",
        vaultShared: "Bóveda Compartida Familiar",
        juniorFeat: "Modo Junior & Educación Financiera",
        btnEnter: "Entrar",
        btnFree: "Probar Gratis",
        backToSuite: "Volver al Sistema",
        startWith: "Explorar",
        navPillars: "Módulos",
        navEco: "Dashboard",
        navPricing: "Precios",
        perYear: "/ año",
        perMonth: "/ mes",
        singlePayment: "Pago Anual Único",
        loginGoogle: "Continuar con Google",
        loginApple: "Continuar con Apple"
    },
    EN: {
        heroBadge: "Onyx Suite 2.0: Integral Smart System",
        heroTitle: "Your life, simplified.\nEverything under control.",
        heroSubtitle: "The ultimate platform unifying your finances, home, nutrition, and travel.\nStop using 10 different apps. Switch to the system that connects it all.",
        ctaStart: "Get Started",
        ctaDemo: "Try Demo (No Account)",
        pillarsTitle: "The Onyx Ecosystem",
        pillarsSubtitle: "Not just apps. Modules connected by a central brain.",
        ecosystemTag: "Onyx Sync™",
        ecosystemTitle: "Your hyper-connected\ncommand center.",
        ecosystemDesc: "Imagine your dinner calendar knowing your grocery budget. Onyx makes it possible. A 360° view of your life in real-time.",
        benefitsTitle: "Designed for Peace of Mind",
        benefitsSubtitle: "Reclaim control of your time and money with a professional tool.",
        pricingTitle: "Smart Investment",
        pricingSubtitle: "Choose monthly flexibility or maximum annual savings. Full access always.",
        promoBadge: "🔥 Offer: Annual Plan comes to €1.66/month",
        basicPlan: "Monthly",
        basicPrice: "€2.99",
        basicDesc: "Total flexibility, no commitments.",
        proPlan: "Annual (Recommended)",
        proPrice: "€19.99",
        proDesc: "Save 45% vs monthly plan.",
        userSingle: "Up to 2 Users",
        userFamily: "Up to 6 Users (Family)",
        accessAll: "Full System Access",
        accessShared: "Advanced Roles & Permissions",
        vaultBasic: "Secure Digital Vault",
        vaultShared: "Shared Family Vault",
        juniorFeat: "Junior Mode & Financial Education",
        btnEnter: "Log In",
        btnFree: "Try Free",
        backToSuite: "Back to System",
        startWith: "Explore",
        navPillars: "Modules",
        navEco: "Dashboard",
        navPricing: "Pricing",
        perYear: "/ year",
        perMonth: "/ month",
        singlePayment: "Single Annual Payment",
        loginGoogle: "Continue with Google",
        loginApple: "Continue with Apple"
    },
    FR: {
        heroBadge: "Onyx Suite 2.0 : Système Intégral Intelligent",
        heroTitle: "Votre vie, simplifiée.\nTout sous contrôle.",
        heroSubtitle: "La plateforme ultime unifiant vos finances, votre maison, votre nutrition et vos voyages.\nArrêtez d'utiliser 10 applications différentes. Passez au système qui connecte tout.",
        ctaStart: "Commencer",
        ctaDemo: "Démo (Sans Compte)",
        pillarsTitle: "L'Écosystème Onyx",
        pillarsSubtitle: "Pas seulement des applications. Des modules connectés par un cerveau central.",
        ecosystemTag: "Onyx Sync™",
        ecosystemTitle: "Votre centre de commande\nhyper-connecté.",
        ecosystemDesc: "Imaginez que votre calendrier de dîners connaisse votre budget d'épicerie. Onyx le rend possible. Une vue à 360° de votre vie en temps réel.",
        benefitsTitle: "Conçu pour la Tranquillité d'Esprit",
        benefitsSubtitle: "Reprenez le contrôle de votre temps et de votre argent avec un outil professionnel.",
        pricingTitle: "Investissement Intelligent",
        pricingSubtitle: "Choisissez la flexibilité mensuelle ou l'économie annuelle maximale. Accès complet toujours.",
        promoBadge: "🔥 Offre : Plan Annuel revient à 1,66€/mois",
        basicPlan: "Mensuel",
        basicPrice: "2,99€",
        basicDesc: "Flexibilité totale sans engagement.",
        proPlan: "Annuel (Recommandé)",
        proPrice: "19,99€",
        proDesc: "Économisez 45% vs plan mensuel.",
        userSingle: "Jusqu'à 2 Utilisateurs",
        userFamily: "Jusqu'à 6 Utilisateurs (Famille)",
        accessAll: "Accès Complet Système",
        accessShared: "Rôles et Permissions Avancés",
        vaultBasic: "Coffre-fort Numérique Sécurisé",
        vaultShared: "Coffre Partagé Familial",
        juniorFeat: "Mode Junior & Éducation Financière",
        btnEnter: "Connexion",
        btnFree: "Essai Gratuit",
        backToSuite: "Retour au Système",
        startWith: "Explorer",
        navPillars: "Modules",
        navEco: "Dashboard",
        navPricing: "Tarifs",
        perYear: "/ an",
        perMonth: "/ mois",
        singlePayment: "Paiement Annuel Unique",
        loginGoogle: "Continuer avec Google",
        loginApple: "Continuer avec Apple"
    }
};

export const PRODUCT_DETAILS_BY_LANG: Record<Language, Record<ProductKey, any>> = {
    ES: {
        finance: {
            title: "Módulo Finanzas",
            subtitle: "Patrimonio Inteligente",
            description: "No es solo un control de gastos. Es tu CFO personal.",
            features: [
                { title: "Smart Categorization", desc: "La IA entiende si es 'Ocio' o 'Necesidad' automáticamente." },
                { title: "Deuda Zero", desc: "Estrategias personalizadas para eliminar pasivos rápidamente." },
                { title: "Simulador de Futuro", desc: "¿Qué pasa si invierto 100€ más al mes? Onyx te lo dice." },
                { title: "Límites Reales", desc: "Presupuestos que se adaptan a tu día a día, no al revés." }
            ],
            integrations: ["Proyecta impacto de viajes en tu ahorro", "Sincroniza tickets de compra de cocina"]
        },
        vida: {
            title: "Módulo Vida",
            subtitle: "Tu Hogar en Autopilot",
            description: "Recupera 5 horas a la semana automatizando las tareas invisibles.",
            features: [
                { title: "Chef IA", desc: "Genera menús basados en lo que tienes en la nevera." },
                { title: "Viajes Colaborativos", desc: "Itinerarios compartidos donde todos suman ideas." },
                { title: "Bóveda Encriptada", desc: "Tus contratos y pasaportes, seguros y a mano." },
                { title: "Academia Junior", desc: "Enseña a tus hijos el valor del dinero jugando." }
            ],
            integrations: ["Descuenta ingredientes comprados del presupuesto", "Planifica comidas según eventos de agenda"]
        },
        dashboard: {
            title: "Dashboard Global",
            subtitle: "La Vista del Águila",
            description: "El único lugar donde ves tu dinero, tu tiempo y tu salud a la vez.",
            features: [
                { title: "Mañana Inteligente", desc: "Resumen diario: qué pagar, qué comer y dónde ir." },
                { title: "Salud Financiera", desc: "Indicadores en tiempo real de tu estabilidad." },
                { title: "Teletransporte", desc: "Salta de revisar una factura a planear un viaje en 1 click." },
                { title: "Onyx Brain", desc: "Insights proactivos: 'Gastas mucho en café este mes'." }
            ],
            integrations: ["El cerebro que conecta todos los órganos del sistema"]
        }
    },
    EN: {
        finance: {
            title: "Finance Module",
            subtitle: "Intelligent Wealth",
            description: "Not just expense tracking. It's your personal CFO.",
            features: [
                { title: "Smart Categorization", desc: "AI understands if it's 'Leisure' or 'Necessity' automatically." },
                { title: "Zero Debt", desc: "Custom strategies to eliminate liabilities quickly." },
                { title: "Future Simulator", desc: "What if I invest €100 more? Onyx tells you." },
                { title: "Real Limits", desc: "Budgets that adapt to your day, not the other way around." }
            ],
            integrations: ["Projects travel impact on savings", "Syncs kitchen grocery receipts"]
        },
        vida: {
            title: "Life Module",
            subtitle: "Home on Autopilot",
            description: "Reclaim 5 hours a week simply by automating invisible tasks.",
            features: [
                { title: "AI Chef", desc: "Generates menus based on what's in your fridge." },
                { title: "Collaborative Travel", desc: "Shared itineraries where everyone contributes." },
                { title: "Encrypted Vault", desc: "Your contracts and passports, safe and handy." },
                { title: "Junior Academy", desc: "Teach your kids the value of money through play." }
            ],
            integrations: ["Deducts ingredients from budget", "Plans meals based on calendar events"]
        },
        dashboard: {
            title: "Global Dashboard",
            subtitle: "Eagle Eye View",
            description: "The only place where you see your money, time, and health at once.",
            features: [
                { title: "Smart Morning", desc: "Daily digest: what to pay, what to eat, where to go." },
                { title: "Financial Health", desc: "Real-time indicators of your stability." },
                { title: "Teleport", desc: "Jump from checking a bill to planning a trip in 1 click." },
                { title: "Onyx Brain", desc: "Proactive insights: 'High coffee spending this month'." }
            ],
            integrations: ["The brain connecting all organs of the system"]
        }
    },
    FR: {
        finance: {
            title: "Module Finances",
            subtitle: "Patrimoine Intelligent",
            description: "Plus qu'un suivi de dépenses. Votre DAF personnel.",
            features: [
                { title: "Catégorisation IA", desc: "L'IA comprend si c'est 'Loisir' ou 'Nécessité'." },
                { title: "Dette Zéro", desc: "Stratégies personnalisées pour éliminer les passifs." },
                { title: "Simulateur Futur", desc: "Et si j'investis 100€ de plus ? Onyx vous le dit." },
                { title: "Limites Réelles", desc: "Des budgets qui s'adaptent à votre quotidien." }
            ],
            integrations: ["Projette l'impact voyage sur l'épargne", "Synchro tickets cuisine"]
        },
        vida: {
            title: "Module Vie",
            subtitle: "Maison en Autopilote",
            description: "Gagnez 5h par semaine en automatisant l'invisible.",
            features: [
                { title: "Chef IA", desc: "Menus basés sur le contenu du frigo." },
                { title: "Voyages Collaboratifs", desc: "Itinéraires partagés où chacun contribue." },
                { title: "Coffre Chiffré", desc: "Contrats et passeports, sûrs et à portée de main." },
                { title: "Académie Junior", desc: "Apprenez la valeur de l'argent par le jeu." }
            ],
            integrations: ["Déduit ingrédients du budget", "Planifie repas selon agenda"]
        },
        dashboard: {
            title: "Dashboard Global",
            subtitle: "Vue d'Aigle",
            description: "Le seul endroit pour voir argent, temps et santé ensemble.",
            features: [
                { title: "Matin Malin", desc: "Résumé : à payer, à manger, où aller." },
                { title: "Santé Financière", desc: "Indicateurs de stabilité en temps réel." },
                { title: "Téléportation", desc: "Passez d'une facture à un voyage en 1 clic." },
                { title: "Cerveau Onyx", desc: "Insights proactifs : 'Trop de café ce mois-ci'." }
            ],
            integrations: ["Le cerveau connectant tout le système"]
        }
    }
};
