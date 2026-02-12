/**
 * FAQ Data for Help Center
 * Organized by category with multi-language support
 */

export interface FAQ {
    id: string;
    question: {
        ES: string;
        EN: string;
        FR: string;
    };
    answer: {
        ES: string;
        EN: string;
        FR: string;
    };
    category: string;
    tags: string[];
}

export const faqData: FAQ[] = [
    // CUENTA Y SUSCRIPCIÓN
    {
        id: 'faq-account-create',
        question: {
            ES: '¿Cómo creo una cuenta en Onyx Suite?',
            EN: 'How do I create an Onyx Suite account?',
            FR: 'Comment créer un compte Onyx Suite?'
        },
        answer: {
            ES: 'Puedes crear una cuenta de dos formas: 1) Click en "Registrarse" e ingresa tu email y contraseña, o 2) Usa "Continuar con Google" para registro rápido. Después completa tu perfil con información básica.',
            EN: 'You can create an account in two ways: 1) Click "Sign Up" and enter your email and password, or 2) Use "Continue with Google" for quick registration. Then complete your profile with basic information.',
            FR: 'Vous pouvez créer un compte de deux manières: 1) Cliquez sur "S\'inscrire" et entrez votre email et mot de passe, ou 2) Utilisez "Continuer avec Google" pour une inscription rapide. Ensuite, complétez votre profil avec des informations de base.'
        },
        category: 'account',
        tags: ['cuenta', 'registro', 'google']
    },
    {
        id: 'faq-subscription-plans',
        question: {
            ES: '¿Cuáles son los planes de suscripción disponibles?',
            EN: 'What subscription plans are available?',
            FR: 'Quels sont les plans d\'abonnement disponibles?'
        },
        answer: {
            ES: 'Onyx Suite ofrece tres modalidades: 1) Prueba Gratuita (14 días) - Acceso total para probarla, 2) Onyx Personal (2.99€/mes) - Para uso individual con funciones avanzadas, y 3) Onyx Familia (3.99€/mes) - Hasta 5 usuarios, roles, colaboración en tiempo real y soporte prioritario.',
            EN: 'Onyx Suite offers three options: 1) Free Trial (14 days) - Full access to try it out, 2) Onyx Personal (€2.99/month) - For individual use with advanced features, and 3) Onyx Family (€3.99/month) - Up to 5 users, roles, real-time collaboration, and priority support.',
            FR: 'Onyx Suite propose trois options : 1) Essai Gratuit (14 jours) - Accès complet pour tester, 2) Onyx Personnel (2,99€/mois) - Pour usage individuel avec fonctionnalités avancées, et 3) Onyx Famille (3,99€/mois) - Jusqu\'à 5 utilisateurs, rôles, collaboration en temps réel et support prioritaire.'
        },
        category: 'account',
        tags: ['suscripción', 'planes', 'precio']
    },
    {
        id: 'faq-change-plan',
        question: {
            ES: '¿Puedo cambiar mi plan en cualquier momento?',
            EN: 'Can I change my plan at any time?',
            FR: 'Puis-je changer mon plan à tout moment?'
        },
        answer: {
            ES: 'Sí, puedes actualizar o degradar tu plan en cualquier momento desde Configuración → Suscripción. Los cambios se aplican inmediatamente y se prorratean según corresponda.',
            EN: 'Yes, you can upgrade or downgrade your plan at any time from Settings → Subscription. Changes apply immediately and are prorated accordingly.',
            FR: 'Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment depuis Paramètres → Abonnement. Les changements s\'appliquent immédiatement et sont calculés au prorata.'
        },
        category: 'account',
        tags: ['plan', 'cambiar', 'actualizar']
    },
    {
        id: 'faq-cancel-subscription',
        question: {
            ES: '¿Cómo cancelo mi suscripción?',
            EN: 'How do I cancel my subscription?',
            FR: 'Comment annuler mon abonnement?'
        },
        answer: {
            ES: 'Ve a Configuración → Suscripción → Gestionar Suscripción. Puedes cancelar en cualquier momento y seguirás teniendo acceso hasta el final del período de facturación actual.',
            EN: 'Go to Settings → Subscription → Manage Subscription. You can cancel at any time and will retain access until the end of your current billing period.',
            FR: 'Allez dans Paramètres → Abonnement → Gérer l\'abonnement. Vous pouvez annuler à tout moment et conserverez l\'accès jusqu\'à la fin de votre période de facturation actuelle.'
        },
        category: 'account',
        tags: ['cancelar', 'suscripción']
    },
    {
        id: 'faq-delete-account',
        question: {
            ES: '¿Puedo eliminar mi cuenta permanentemente?',
            EN: 'Can I permanently delete my account?',
            FR: 'Puis-je supprimer définitivement mon compte?'
        },
        answer: {
            ES: 'Sí, ve a Configuración → Privacidad → Eliminar Cuenta. Hay un período de gracia de 30 días durante el cual puedes cancelar la eliminación. Después de 30 días, todos tus datos se eliminan permanentemente.',
            EN: 'Yes, go to Settings → Privacy → Delete Account. There is a 30-day grace period during which you can cancel the deletion. After 30 days, all your data is permanently deleted.',
            FR: 'Oui, allez dans Paramètres → Confidentialité → Supprimer le compte. Il y a une période de grâce de 30 jours pendant laquelle vous pouvez annuler la suppression. Après 30 jours, toutes vos données sont définitivement supprimées.'
        },
        category: 'account',
        tags: ['eliminar', 'cuenta', 'borrar']
    },

    // FINANZAS
    {
        id: 'faq-import-csv',
        question: {
            ES: '¿Qué formato debe tener mi archivo CSV para importar transacciones?',
            EN: 'What format should my CSV file have to import transactions?',
            FR: 'Quel format doit avoir mon fichier CSV pour importer des transactions?'
        },
        answer: {
            ES: 'El CSV debe tener columnas: Fecha, Concepto, Importe. Opcionalmente: Categoría, Cuenta. El sistema detecta automáticamente fechas en formatos DD/MM/YYYY, YYYY-MM-DD, etc. Los importes pueden ser positivos (ingresos) o negativos (gastos).',
            EN: 'The CSV must have columns: Date, Description, Amount. Optionally: Category, Account. The system automatically detects dates in formats DD/MM/YYYY, YYYY-MM-DD, etc. Amounts can be positive (income) or negative (expenses).',
            FR: 'Le CSV doit avoir des colonnes: Date, Description, Montant. En option: Catégorie, Compte. Le système détecte automatiquement les dates aux formats DD/MM/YYYY, YYYY-MM-DD, etc. Les montants peuvent être positifs (revenus) ou négatifs (dépenses).'
        },
        category: 'finance',
        tags: ['csv', 'importar', 'formato']
    },
    {
        id: 'faq-categorize-transactions',
        question: {
            ES: '¿Cómo categoriza la IA mis transacciones?',
            EN: 'How does AI categorize my transactions?',
            FR: 'Comment l\'IA catégorise-t-elle mes transactions?'
        },
        answer: {
            ES: 'La IA analiza el concepto de cada transacción y la compara con patrones conocidos. Por ejemplo, "Mercadona" se categoriza automáticamente como "Comida". Puedes corregir categorizaciones y la IA aprenderá de tus preferencias.',
            EN: 'AI analyzes each transaction\'s description and compares it with known patterns. For example, "Mercadona" is automatically categorized as "Food". You can correct categorizations and the AI will learn from your preferences.',
            FR: 'L\'IA analyse la description de chaque transaction et la compare avec des modèles connus. Par exemple, "Mercadona" est automatiquement catégorisé comme "Nourriture". Vous pouvez corriger les catégorisations et l\'IA apprendra de vos préférences.'
        },
        category: 'finance',
        tags: ['ia', 'categorías', 'automático']
    },
    {
        id: 'faq-budget-alerts',
        question: {
            ES: '¿Cuándo recibo alertas de presupuesto?',
            EN: 'When do I receive budget alerts?',
            FR: 'Quand est-ce que je reçois des alertes de budget?'
        },
        answer: {
            ES: 'Recibes alertas automáticas cuando alcanzas el 80% y 100% de tu presupuesto. También puedes configurar alertas personalizadas en Configuración → Automatización.',
            EN: 'You receive automatic alerts when you reach 80% and 100% of your budget. You can also configure custom alerts in Settings → Automation.',
            FR: 'Vous recevez des alertes automatiques lorsque vous atteignez 80% et 100% de votre budget. Vous pouvez également configurer des alertes personnalisées dans Paramètres → Automatisation.'
        },
        category: 'finance',
        tags: ['presupuesto', 'alertas', 'notificaciones']
    },
    {
        id: 'faq-multiple-accounts',
        question: {
            ES: '¿Puedo gestionar múltiples cuentas bancarias?',
            EN: 'Can I manage multiple bank accounts?',
            FR: 'Puis-je gérer plusieurs comptes bancaires?'
        },
        answer: {
            ES: 'Sí, puedes añadir todas las cuentas que necesites en Finanzas → Cuentas. Cada transacción se vincula a una cuenta específica y puedes ver el saldo consolidado o por cuenta individual.',
            EN: 'Yes, you can add as many accounts as you need in Finance → Accounts. Each transaction is linked to a specific account and you can view consolidated or individual account balances.',
            FR: 'Oui, vous pouvez ajouter autant de comptes que nécessaire dans Finances → Comptes. Chaque transaction est liée à un compte spécifique et vous pouvez voir le solde consolidé ou par compte individuel.'
        },
        category: 'finance',
        tags: ['cuentas', 'múltiples', 'bancos']
    },
    {
        id: 'faq-recurring-transactions',
        question: {
            ES: '¿Cómo funcionan las transacciones recurrentes?',
            EN: 'How do recurring transactions work?',
            FR: 'Comment fonctionnent les transactions récurrentes?'
        },
        answer: {
            ES: 'Al crear una transacción, marca "Recurrente" y selecciona la frecuencia (diaria, semanal, mensual, anual). El sistema creará automáticamente las transacciones futuras según el patrón definido.',
            EN: 'When creating a transaction, check "Recurring" and select the frequency (daily, weekly, monthly, annual). The system will automatically create future transactions according to the defined pattern.',
            FR: 'Lors de la création d\'une transaction, cochez "Récurrent" et sélectionnez la fréquence (quotidienne, hebdomadaire, mensuelle, annuelle). Le système créera automatiquement les transactions futures selon le modèle défini.'
        },
        category: 'finance',
        tags: ['recurrente', 'automático', 'repetir']
    },
    {
        id: 'faq-retirement-calculator',
        question: {
            ES: '¿Qué datos necesito para el planificador de jubilación?',
            EN: 'What data do I need for the retirement planner?',
            FR: 'Quelles données ai-je besoin pour le planificateur de retraite?'
        },
        answer: {
            ES: 'Necesitas: edad actual, edad de retiro deseada, ahorros actuales, aportación mensual, retorno esperado (%), e inflación esperada (%). El sistema calcula tu capital acumulado, ingreso mensual sostenible y años de cobertura.',
            EN: 'You need: current age, desired retirement age, current savings, monthly contribution, expected return (%), and expected inflation (%). The system calculates your accumulated capital, sustainable monthly income, and years of coverage.',
            FR: 'Vous avez besoin de: âge actuel, âge de retraite souhaité, épargne actuelle, contribution mensuelle, rendement attendu (%), et inflation attendue (%). Le système calcule votre capital accumulé, revenu mensuel durable et années de couverture.'
        },
        category: 'finance',
        tags: ['jubilación', 'ahorro', 'planificación']
    },
    {
        id: 'faq-goals-tracking',
        question: {
            ES: '¿Cómo hago seguimiento de mis metas financieras?',
            EN: 'How do I track my financial goals?',
            FR: 'Comment suivre mes objectifs financiers?'
        },
        answer: {
            ES: 'Crea una meta en Finanzas → Metas, define el monto objetivo y fecha límite. Puedes hacer aportaciones manuales o vincular una cuenta de ahorro. El dashboard muestra tu progreso con barras visuales y proyecciones.',
            EN: 'Create a goal in Finance → Goals, define the target amount and deadline. You can make manual contributions or link a savings account. The dashboard shows your progress with visual bars and projections.',
            FR: 'Créez un objectif dans Finances → Objectifs, définissez le montant cible et la date limite. Vous pouvez faire des contributions manuelles ou lier un compte d\'épargne. Le tableau de bord affiche votre progression avec des barres visuelles et des projections.'
        },
        category: 'finance',
        tags: ['metas', 'objetivos', 'ahorro']
    },
    {
        id: 'faq-debt-management',
        question: {
            ES: '¿Puedo gestionar mis deudas en Onyx Suite?',
            EN: 'Can I manage my debts in Onyx Suite?',
            FR: 'Puis-je gérer mes dettes dans Onyx Suite?'
        },
        answer: {
            ES: 'Sí, en Finanzas → Deudas puedes registrar préstamos, tarjetas de crédito, hipotecas, etc. Ingresa el monto total, tasa de interés y plazo. El sistema calcula pagos mensuales, intereses totales y te sugiere estrategias de pago.',
            EN: 'Yes, in Finance → Debts you can register loans, credit cards, mortgages, etc. Enter the total amount, interest rate, and term. The system calculates monthly payments, total interest, and suggests payment strategies.',
            FR: 'Oui, dans Finances → Dettes vous pouvez enregistrer des prêts, cartes de crédit, hypothèques, etc. Entrez le montant total, le taux d\'intérêt et la durée. Le système calcule les paiements mensuels, les intérêts totaux et suggère des stratégies de paiement.'
        },
        category: 'finance',
        tags: ['deudas', 'préstamos', 'crédito']
    },

    // VIDA Y HOGAR
    {
        id: 'faq-meal-planning',
        question: {
            ES: '¿Cómo creo un plan semanal de comidas?',
            EN: 'How do I create a weekly meal plan?',
            FR: 'Comment créer un plan de repas hebdomadaire?'
        },
        answer: {
            ES: 'Ve a Vida → Cocina → Plan Semanal. Arrastra recetas desde tu colección a cada día de la semana. Puedes generar automáticamente una lista de compras con todos los ingredientes necesarios.',
            EN: 'Go to Life → Kitchen → Weekly Plan. Drag recipes from your collection to each day of the week. You can automatically generate a shopping list with all necessary ingredients.',
            FR: 'Allez dans Vie → Cuisine → Plan Hebdomadaire. Faites glisser des recettes de votre collection vers chaque jour de la semaine. Vous pouvez générer automatiquement une liste de courses avec tous les ingrédients nécessaires.'
        },
        category: 'life',
        tags: ['recetas', 'plan', 'semanal']
    },
    {
        id: 'faq-ai-recipes',
        question: {
            ES: '¿Cómo genero recetas con IA?',
            EN: 'How do I generate recipes with AI?',
            FR: 'Comment générer des recettes avec l\'IA?'
        },
        answer: {
            ES: 'En Vida → Recetas, click en "Generar con IA". Describe lo que quieres (ej: "pasta vegetariana para 4 personas") y la IA creará una receta completa con ingredientes, pasos e información nutricional.',
            EN: 'In Life → Recipes, click "Generate with AI". Describe what you want (e.g., "vegetarian pasta for 4 people") and AI will create a complete recipe with ingredients, steps, and nutritional information.',
            FR: 'Dans Vie → Recettes, cliquez sur "Générer avec IA". Décrivez ce que vous voulez (par ex., "pâtes végétariennes pour 4 personnes") et l\'IA créera une recette complète avec ingrédients, étapes et informations nutritionnelles.'
        },
        category: 'life',
        tags: ['ia', 'recetas', 'generar']
    },
    {
        id: 'faq-pantry-management',
        question: {
            ES: '¿Para qué sirve la gestión de despensa?',
            EN: 'What is pantry management for?',
            FR: 'À quoi sert la gestion du garde-manger?'
        },
        answer: {
            ES: 'Registra los ingredientes que tienes en casa con cantidades y fechas de caducidad. El sistema te sugiere recetas basadas en lo que tienes disponible y te alerta cuando algo está por caducar.',
            EN: 'Register the ingredients you have at home with quantities and expiration dates. The system suggests recipes based on what you have available and alerts you when something is about to expire.',
            FR: 'Enregistrez les ingrédients que vous avez à la maison avec les quantités et dates d\'expiration. Le système suggère des recettes basées sur ce que vous avez disponible et vous alerte lorsque quelque chose est sur le point d\'expirer.'
        },
        category: 'life',
        tags: ['despensa', 'inventario', 'ingredientes']
    },
    {
        id: 'faq-shopping-list',
        question: {
            ES: '¿La lista de compras se genera automáticamente?',
            EN: 'Is the shopping list generated automatically?',
            FR: 'La liste de courses est-elle générée automatiquement?'
        },
        answer: {
            ES: 'Sí, al crear un plan semanal, la lista de compras se genera automáticamente con todos los ingredientes necesarios. Se agrupan por categorías (frutas, lácteos, etc.) y puedes marcar items como comprados.',
            EN: 'Yes, when creating a weekly plan, the shopping list is automatically generated with all necessary ingredients. They are grouped by categories (fruits, dairy, etc.) and you can mark items as purchased.',
            FR: 'Oui, lors de la création d\'un plan hebdomadaire, la liste de courses est automatiquement générée avec tous les ingrédients nécessaires. Ils sont regroupés par catégories (fruits, produits laitiers, etc.) et vous pouvez marquer les articles comme achetés.'
        },
        category: 'life',
        tags: ['compras', 'lista', 'automático']
    },
    {
        id: 'faq-cooking-mode',
        question: {
            ES: '¿Qué es el Modo Cocina?',
            EN: 'What is Cooking Mode?',
            FR: 'Qu\'est-ce que le Mode Cuisine?'
        },
        answer: {
            ES: 'Es una vista paso a paso optimizada para cocinar. Muestra cada instrucción en pantalla completa con texto grande, temporizadores integrados y navegación por voz. Ideal para seguir recetas sin tocar el dispositivo.',
            EN: 'It\'s a step-by-step view optimized for cooking. Shows each instruction in full screen with large text, integrated timers, and voice navigation. Ideal for following recipes without touching the device.',
            FR: 'C\'est une vue étape par étape optimisée pour cuisiner. Affiche chaque instruction en plein écran avec un texte large, des minuteries intégrées et une navigation vocale. Idéal pour suivre des recettes sans toucher l\'appareil.'
        },
        category: 'life',
        tags: ['cocina', 'modo', 'recetas']
    },

    // PRIVACIDAD Y SEGURIDAD
    {
        id: 'faq-data-security',
        question: {
            ES: '¿Cómo se protegen mis datos financieros?',
            EN: 'How is my financial data protected?',
            FR: 'Comment mes données financières sont-elles protégées?'
        },
        answer: {
            ES: 'Todos tus datos se cifran en tránsito (HTTPS) y en reposo (AES-256). Usamos Supabase con autenticación segura. Nunca almacenamos credenciales bancarias. Cumplimos con GDPR y normativas de protección de datos.',
            EN: 'All your data is encrypted in transit (HTTPS) and at rest (AES-256). We use Supabase with secure authentication. We never store banking credentials. We comply with GDPR and data protection regulations.',
            FR: 'Toutes vos données sont cryptées en transit (HTTPS) et au repos (AES-256). Nous utilisons Supabase avec authentification sécurisée. Nous ne stockons jamais les identifiants bancaires. Nous respectons le RGPD et les réglementations de protection des données.'
        },
        category: 'privacy',
        tags: ['seguridad', 'cifrado', 'protección']
    },
    {
        id: 'faq-data-export',
        question: {
            ES: '¿Puedo exportar todos mis datos?',
            EN: 'Can I export all my data?',
            FR: 'Puis-je exporter toutes mes données?'
        },
        answer: {
            ES: 'Sí, ve a Configuración → Privacidad → Exportar Datos. Recibirás un archivo JSON con todas tus transacciones, recetas, configuraciones, etc. Es tu derecho bajo GDPR tener acceso completo a tus datos.',
            EN: 'Yes, go to Settings → Privacy → Export Data. You will receive a JSON file with all your transactions, recipes, settings, etc. It is your right under GDPR to have full access to your data.',
            FR: 'Oui, allez dans Paramètres → Confidentialité → Exporter les données. Vous recevrez un fichier JSON avec toutes vos transactions, recettes, paramètres, etc. C\'est votre droit sous le RGPD d\'avoir un accès complet à vos données.'
        },
        category: 'privacy',
        tags: ['exportar', 'datos', 'gdpr']
    },
    {
        id: 'faq-cookies',
        question: {
            ES: '¿Qué cookies utiliza Onyx Suite?',
            EN: 'What cookies does Onyx Suite use?',
            FR: 'Quels cookies Onyx Suite utilise-t-il?'
        },
        answer: {
            ES: 'Usamos cookies esenciales (autenticación, preferencias), analytics (opcional, para mejorar la app) y marketing (opcional). Puedes gestionar tus preferencias en Configuración → Privacidad → Cookies.',
            EN: 'We use essential cookies (authentication, preferences), analytics (optional, to improve the app), and marketing (optional). You can manage your preferences in Settings → Privacy → Cookies.',
            FR: 'Nous utilisons des cookies essentiels (authentification, préférences), analytics (optionnel, pour améliorer l\'application) et marketing (optionnel). Vous pouvez gérer vos préférences dans Paramètres → Confidentialité → Cookies.'
        },
        category: 'privacy',
        tags: ['cookies', 'privacidad', 'gdpr']
    },
    {
        id: 'faq-data-sharing',
        question: {
            ES: '¿Comparten mis datos con terceros?',
            EN: 'Do you share my data with third parties?',
            FR: 'Partagez-vous mes données avec des tiers?'
        },
        answer: {
            ES: 'No. Tus datos financieros y personales nunca se venden ni comparten con terceros. Solo usamos servicios esenciales (Supabase para almacenamiento, Stripe para pagos) que cumplen con GDPR.',
            EN: 'No. Your financial and personal data is never sold or shared with third parties. We only use essential services (Supabase for storage, Stripe for payments) that comply with GDPR.',
            FR: 'Non. Vos données financières et personnelles ne sont jamais vendues ni partagées avec des tiers. Nous utilisons uniquement des services essentiels (Supabase pour le stockage, Stripe pour les paiements) conformes au RGPD.'
        },
        category: 'privacy',
        tags: ['privacidad', 'terceros', 'compartir']
    },
    {
        id: 'faq-2fa',
        question: {
            ES: '¿Puedo activar autenticación de dos factores?',
            EN: 'Can I enable two-factor authentication?',
            FR: 'Puis-je activer l\'authentification à deux facteurs?'
        },
        answer: {
            ES: 'Sí, ve a Configuración → Seguridad → Autenticación de Dos Factores. Puedes usar una app como Google Authenticator o Authy para generar códigos de seguridad adicionales al iniciar sesión.',
            EN: 'Yes, go to Settings → Security → Two-Factor Authentication. You can use an app like Google Authenticator or Authy to generate additional security codes when logging in.',
            FR: 'Oui, allez dans Paramètres → Sécurité → Authentification à deux facteurs. Vous pouvez utiliser une application comme Google Authenticator ou Authy pour générer des codes de sécurité supplémentaires lors de la connexion.'
        },
        category: 'privacy',
        tags: ['2fa', 'seguridad', 'autenticación']
    },
    {
        id: 'faq-gdpr-rights',
        question: {
            ES: '¿Cuáles son mis derechos bajo GDPR?',
            EN: 'What are my rights under GDPR?',
            FR: 'Quels sont mes droits sous le RGPD?'
        },
        answer: {
            ES: 'Tienes derecho a: 1) Acceder a tus datos, 2) Rectificar datos incorrectos, 3) Eliminar tus datos ("derecho al olvido"), 4) Portabilidad (exportar), 5) Oponerte al procesamiento, 6) Limitar el procesamiento. Contacta support@onyxsuite.com para ejercer estos derechos.',
            EN: 'You have the right to: 1) Access your data, 2) Rectify incorrect data, 3) Delete your data ("right to be forgotten"), 4) Portability (export), 5) Object to processing, 6) Limit processing. Contact support@onyxsuite.com to exercise these rights.',
            FR: 'Vous avez le droit de: 1) Accéder à vos données, 2) Rectifier les données incorrectes, 3) Supprimer vos données ("droit à l\'oubli"), 4) Portabilité (exporter), 5) Vous opposer au traitement, 6) Limiter le traitement. Contactez support@onyxsuite.com pour exercer ces droits.'
        },
        category: 'privacy',
        tags: ['gdpr', 'derechos', 'privacidad']
    },

    // PROBLEMAS TÉCNICOS
    {
        id: 'faq-app-not-loading',
        question: {
            ES: 'La aplicación no carga, ¿qué hago?',
            EN: 'The app is not loading, what do I do?',
            FR: 'L\'application ne charge pas, que faire?'
        },
        answer: {
            ES: '1) Verifica tu conexión a internet, 2) Limpia la caché del navegador (Ctrl+Shift+Del), 3) Intenta en modo incógnito, 4) Prueba otro navegador, 5) Si persiste, contacta support@onyxsuite.com con detalles del error.',
            EN: '1) Check your internet connection, 2) Clear browser cache (Ctrl+Shift+Del), 3) Try incognito mode, 4) Try another browser, 5) If it persists, contact support@onyxsuite.com with error details.',
            FR: '1) Vérifiez votre connexion internet, 2) Videz le cache du navigateur (Ctrl+Shift+Del), 3) Essayez le mode incognito, 4) Essayez un autre navigateur, 5) Si cela persiste, contactez support@onyxsuite.com avec les détails de l\'erreur.'
        },
        category: 'technical',
        tags: ['error', 'carga', 'problema']
    },
    {
        id: 'faq-data-not-saving',
        question: {
            ES: 'Mis cambios no se guardan, ¿por qué?',
            EN: 'My changes are not saving, why?',
            FR: 'Mes modifications ne sont pas enregistrées, pourquoi?'
        },
        answer: {
            ES: 'Verifica: 1) Que estés autenticado (no en modo demo), 2) Tu conexión a internet es estable, 3) Espera el mensaje de confirmación antes de salir, 4) Revisa que no haya errores en la consola del navegador (F12).',
            EN: 'Check: 1) You are authenticated (not in demo mode), 2) Your internet connection is stable, 3) Wait for confirmation message before leaving, 4) Check for errors in browser console (F12).',
            FR: 'Vérifiez: 1) Vous êtes authentifié (pas en mode démo), 2) Votre connexion internet est stable, 3) Attendez le message de confirmation avant de quitter, 4) Vérifiez les erreurs dans la console du navigateur (F12).'
        },
        category: 'technical',
        tags: ['guardar', 'datos', 'problema']
    },
    {
        id: 'faq-csv-import-error',
        question: {
            ES: 'Error al importar CSV, ¿qué reviso?',
            EN: 'CSV import error, what should I check?',
            FR: 'Erreur d\'importation CSV, que vérifier?'
        },
        answer: {
            ES: 'Verifica: 1) El archivo es .csv (no .xlsx), 2) Tiene columnas Fecha, Concepto, Importe, 3) Las fechas están en formato válido, 4) Los importes son números (usa punto para decimales), 5) El archivo no está corrupto. Prueba con el archivo de ejemplo.',
            EN: 'Check: 1) File is .csv (not .xlsx), 2) Has columns Date, Description, Amount, 3) Dates are in valid format, 4) Amounts are numbers (use dot for decimals), 5) File is not corrupted. Try with the example file.',
            FR: 'Vérifiez: 1) Le fichier est .csv (pas .xlsx), 2) A des colonnes Date, Description, Montant, 3) Les dates sont dans un format valide, 4) Les montants sont des nombres (utilisez un point pour les décimales), 5) Le fichier n\'est pas corrompu. Essayez avec le fichier d\'exemple.'
        },
        category: 'technical',
        tags: ['csv', 'importar', 'error']
    },
    {
        id: 'faq-ai-not-responding',
        question: {
            ES: 'La IA no responde o da error, ¿qué pasa?',
            EN: 'AI is not responding or giving error, what\'s wrong?',
            FR: 'L\'IA ne répond pas ou donne une erreur, qu\'est-ce qui ne va pas?'
        },
        answer: {
            ES: 'Posibles causas: 1) Verifica tu conexión, 2) Intenta con un prompt más simple, 3) Revisa que tengas créditos de IA disponibles (plan Familia), 4) El servicio puede estar temporalmente saturado, espera unos minutos.',
            EN: 'Possible causes: 1) Check your connection, 2) Try with a simpler prompt, 3) Check you have AI credits available (Family plan), 4) Service may be temporarily saturated, wait a few minutes.',
            FR: 'Causes possibles: 1) Vérifiez votre connexion, 2) Essayez avec un prompt plus simple, 3) Vérifiez que vous avez des crédits IA disponibles (plan Famille), 4) Le service peut être temporairement saturé, attendez quelques minutes.'
        },
        category: 'technical',
        tags: ['ia', 'error', 'problema']
    },
    {
        id: 'faq-mobile-issues',
        question: {
            ES: '¿Por qué la app se ve mal en móvil?',
            EN: 'Why does the app look bad on mobile?',
            FR: 'Pourquoi l\'application a-t-elle l\'air mauvaise sur mobile?'
        },
        answer: {
            ES: 'Onyx Suite es responsive y debería funcionar bien en móvil. Si ves problemas: 1) Actualiza tu navegador, 2) Rota la pantalla, 3) Prueba en Chrome/Safari, 4) Limpia caché. Si persiste, envía screenshot a soporte.',
            EN: 'Onyx Suite is responsive and should work well on mobile. If you see issues: 1) Update your browser, 2) Rotate screen, 3) Try Chrome/Safari, 4) Clear cache. If it persists, send screenshot to support.',
            FR: 'Onyx Suite est responsive et devrait bien fonctionner sur mobile. Si vous voyez des problèmes: 1) Mettez à jour votre navigateur, 2) Faites pivoter l\'écran, 3) Essayez Chrome/Safari, 4) Videz le cache. Si cela persiste, envoyez une capture d\'écran au support.'
        },
        category: 'technical',
        tags: ['móvil', 'responsive', 'diseño']
    },
    {
        id: 'faq-password-reset',
        question: {
            ES: 'Olvidé mi contraseña, ¿cómo la recupero?',
            EN: 'I forgot my password, how do I recover it?',
            FR: 'J\'ai oublié mon mot de passe, comment le récupérer?'
        },
        answer: {
            ES: 'En la pantalla de login, click en "¿Olvidaste tu contraseña?". Ingresa tu email y recibirás un link para resetearla. El link expira en 1 hora. Si no recibes el email, revisa spam o contacta soporte.',
            EN: 'On the login screen, click "Forgot your password?". Enter your email and you will receive a link to reset it. The link expires in 1 hour. If you don\'t receive the email, check spam or contact support.',
            FR: 'Sur l\'écran de connexion, cliquez sur "Mot de passe oublié?". Entrez votre email et vous recevrez un lien pour le réinitialiser. Le lien expire dans 1 heure. Si vous ne recevez pas l\'email, vérifiez les spams ou contactez le support.'
        },
        category: 'technical',
        tags: ['contraseña', 'recuperar', 'resetear']
    }
];

export const faqCategories = {
    account: {
        ES: 'Cuenta y Suscripción',
        EN: 'Account & Subscription',
        FR: 'Compte et Abonnement'
    },
    finance: {
        ES: 'Finanzas',
        EN: 'Finance',
        FR: 'Finances'
    },
    life: {
        ES: 'Vida y Hogar',
        EN: 'Life & Home',
        FR: 'Vie et Maison'
    },
    privacy: {
        ES: 'Privacidad y Seguridad',
        EN: 'Privacy & Security',
        FR: 'Confidentialité et Sécurité'
    },
    technical: {
        ES: 'Problemas Técnicos',
        EN: 'Technical Issues',
        FR: 'Problèmes Techniques'
    }
};
