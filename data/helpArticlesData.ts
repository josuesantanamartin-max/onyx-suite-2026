/**
 * Help Articles Data
 * Expanded content library with multi-language support
 */

export interface HelpArticle {
    id: string;
    title: {
        ES: string;
        EN: string;
        FR: string;
    };
    category: {
        ES: string;
        EN: string;
        FR: string;
    };
    content: {
        ES: string;
        EN: string;
        FR: string;
    };
    tags: string[];
    relatedArticles?: string[];
}

export const helpArticlesData: HelpArticle[] = [
    // GETTING STARTED
    {
        id: 'getting-started',
        title: {
            ES: 'Primeros Pasos con Onyx Suite',
            EN: 'Getting Started with Onyx Suite',
            FR: 'Premiers Pas avec Onyx Suite'
        },
        category: {
            ES: 'Inicio',
            EN: 'Getting Started',
            FR: 'Démarrage'
        },
        content: {
            ES: `# Bienvenido a Onyx Suite 2026

## ¿Qué es Onyx Suite?
Onyx Suite es tu asistente personal integral que combina gestión financiera, planificación de vida y organización del hogar en una sola aplicación potenciada por IA.

## Configuración Inicial
1. **Crea tu cuenta** - Regístrate con email o Google
2. **Completa tu perfil** - Añade información básica
3. **Conecta tus datos** - Importa transacciones o empieza desde cero
4. **Explora los módulos** - Finanzas, Vida, Dashboard

## Módulos Principales
- **💰 Finanzas**: Cuentas, transacciones, presupuestos, metas
- **🏠 Vida**: Recetas, despensa, lista de compras, viajes
- **📊 Dashboard**: Vista general personalizable
- **🎯 Metas**: Objetivos financieros y de vida`,
            EN: `# Welcome to Onyx Suite 2026

## What is Onyx Suite?
Onyx Suite is your comprehensive personal assistant that combines financial management, life planning, and home organization in a single AI-powered application.

## Initial Setup
1. **Create your account** - Sign up with email or Google
2. **Complete your profile** - Add basic information
3. **Connect your data** - Import transactions or start from scratch
4. **Explore modules** - Finance, Life, Dashboard

## Main Modules
- **💰 Finance**: Accounts, transactions, budgets, goals
- **🏠 Life**: Recipes, pantry, shopping list, trips
- **📊 Dashboard**: Customizable overview
- **🎯 Goals**: Financial and life objectives`,
            FR: `# Bienvenue dans Onyx Suite 2026

## Qu'est-ce qu'Onyx Suite?
Onyx Suite est votre assistant personnel complet qui combine gestion financière, planification de vie et organisation domestique dans une seule application alimentée par l'IA.

## Configuration Initiale
1. **Créez votre compte** - Inscrivez-vous avec email ou Google
2. **Complétez votre profil** - Ajoutez des informations de base
3. **Connectez vos données** - Importez des transactions ou commencez de zéro
4. **Explorez les modules** - Finances, Vie, Tableau de bord

## Modules Principaux
- **💰 Finances**: Comptes, transactions, budgets, objectifs
- **🏠 Vie**: Recettes, garde-manger, liste de courses, voyages
- **📊 Tableau de bord**: Vue d'ensemble personnalisable
- **🎯 Objectifs**: Objectifs financiers et de vie`
        },
        tags: ['inicio', 'configuración', 'tutorial', 'getting started', 'setup'],
        relatedArticles: ['dashboard-customization', 'import-transactions']
    },

    // FINANCE ARTICLES
    {
        id: 'import-transactions',
        title: {
            ES: 'Cómo Importar Transacciones desde CSV',
            EN: 'How to Import Transactions from CSV',
            FR: 'Comment Importer des Transactions depuis CSV'
        },
        category: {
            ES: 'Finanzas',
            EN: 'Finance',
            FR: 'Finances'
        },
        content: {
            ES: `# Importar Transacciones desde CSV

## Formatos Soportados
Onyx Suite acepta archivos CSV de la mayoría de bancos españoles.

## Pasos para Importar
1. Ve a **Finanzas → Transacciones**
2. Click en **Importar CSV**
3. Selecciona tu archivo
4. Revisa la vista previa
5. Confirma la importación

## Formato Recomendado
\`\`\`csv
Fecha,Concepto,Importe,Categoría
2026-02-01,Supermercado,45.50,Comida
2026-02-02,Gasolina,60.00,Transporte
\`\`\`

## Mapeo Automático
El sistema detecta automáticamente:
- Fechas en múltiples formatos
- Categorías basadas en conceptos
- Importes positivos/negativos`,
            EN: `# Import Transactions from CSV

## Supported Formats
Onyx Suite accepts CSV files from most Spanish banks.

## Import Steps
1. Go to **Finance → Transactions**
2. Click **Import CSV**
3. Select your file
4. Review preview
5. Confirm import

## Recommended Format
\`\`\`csv
Date,Description,Amount,Category
2026-02-01,Supermarket,45.50,Food
2026-02-02,Gas,60.00,Transport
\`\`\`

## Automatic Mapping
The system automatically detects:
- Dates in multiple formats
- Categories based on descriptions
- Positive/negative amounts`,
            FR: `# Importer des Transactions depuis CSV

## Formats Supportés
Onyx Suite accepte les fichiers CSV de la plupart des banques espagnoles.

## Étapes d'Importation
1. Allez dans **Finances → Transactions**
2. Cliquez sur **Importer CSV**
3. Sélectionnez votre fichier
4. Examinez l'aperçu
5. Confirmez l'importation

## Format Recommandé
\`\`\`csv
Date,Description,Montant,Catégorie
2026-02-01,Supermarché,45.50,Nourriture
2026-02-02,Essence,60.00,Transport
\`\`\`

## Mappage Automatique
Le système détecte automatiquement:
- Dates dans plusieurs formats
- Catégories basées sur les descriptions
- Montants positifs/négatifs`
        },
        tags: ['csv', 'importar', 'transacciones', 'banco', 'import', 'transactions'],
        relatedArticles: ['categorize-transactions', 'manage-accounts']
    },

    {
        id: 'create-budget',
        title: {
            ES: 'Crear y Gestionar Presupuestos',
            EN: 'Create and Manage Budgets',
            FR: 'Créer et Gérer des Budgets'
        },
        category: {
            ES: 'Finanzas',
            EN: 'Finance',
            FR: 'Finances'
        },
        content: {
            ES: `# Gestión de Presupuestos

## Crear un Presupuesto
1. Ve a **Finanzas → Presupuestos**
2. Click en **Nuevo Presupuesto**
3. Selecciona categoría (Comida, Transporte, etc.)
4. Define límite mensual
5. Guarda

## Tipos de Presupuesto
- **Mensual**: Se reinicia cada mes
- **Anual**: Límite para todo el año

## Seguimiento
- **Barra de progreso**: Visual del gasto actual
- **Alertas**: Notificaciones al 80% y 100%
- **Histórico**: Comparación con meses anteriores

## Consejos
- Empieza con categorías grandes
- Ajusta según tu historial
- Usa la IA para sugerencias`,
            EN: `# Budget Management

## Create a Budget
1. Go to **Finance → Budgets**
2. Click **New Budget**
3. Select category (Food, Transport, etc.)
4. Define monthly limit
5. Save

## Budget Types
- **Monthly**: Resets each month
- **Annual**: Limit for the entire year

## Tracking
- **Progress bar**: Visual of current spending
- **Alerts**: Notifications at 80% and 100%
- **History**: Comparison with previous months

## Tips
- Start with large categories
- Adjust based on your history
- Use AI for suggestions`,
            FR: `# Gestion des Budgets

## Créer un Budget
1. Allez dans **Finances → Budgets**
2. Cliquez sur **Nouveau Budget**
3. Sélectionnez la catégorie (Nourriture, Transport, etc.)
4. Définissez la limite mensuelle
5. Enregistrez

## Types de Budget
- **Mensuel**: Se réinitialise chaque mois
- **Annuel**: Limite pour toute l'année

## Suivi
- **Barre de progression**: Visuel des dépenses actuelles
- **Alertes**: Notifications à 80% et 100%
- **Historique**: Comparaison avec les mois précédents

## Conseils
- Commencez avec de grandes catégories
- Ajustez selon votre historique
- Utilisez l'IA pour des suggestions`
        },
        tags: ['presupuesto', 'límites', 'categorías', 'budget', 'limits'],
        relatedArticles: ['categorize-transactions', 'financial-goals']
    },

    {
        id: 'retirement-planning',
        title: {
            ES: 'Planificador de Jubilación',
            EN: 'Retirement Planner',
            FR: 'Planificateur de Retraite'
        },
        category: {
            ES: 'Finanzas',
            EN: 'Finance',
            FR: 'Finances'
        },
        content: {
            ES: `# Planificador de Jubilación

## Configurar tu Plan
1. Ve a **Finanzas → Jubilación**
2. Ingresa datos:
   - Edad actual
   - Edad de retiro deseada
   - Ahorros actuales
   - Aportación mensual
3. Ajusta retorno esperado e inflación

## Interpretación de Resultados
- **Capital Acumulado**: Total al retirarte
- **Ingreso Mensual**: Sostenible sin tocar capital
- **Años de Cobertura**: Duración de tus ahorros

## Recomendaciones
El sistema te sugiere:
- Aumentar aportaciones
- Ajustar edad de retiro
- Optimizar inversiones`,
            EN: `# Retirement Planner

## Configure Your Plan
1. Go to **Finance → Retirement**
2. Enter data:
   - Current age
   - Desired retirement age
   - Current savings
   - Monthly contribution
3. Adjust expected return and inflation

## Interpreting Results
- **Accumulated Capital**: Total at retirement
- **Monthly Income**: Sustainable without touching capital
- **Years of Coverage**: Duration of your savings

## Recommendations
The system suggests:
- Increase contributions
- Adjust retirement age
- Optimize investments`,
            FR: `# Planificateur de Retraite

## Configurer Votre Plan
1. Allez dans **Finances → Retraite**
2. Entrez les données:
   - Âge actuel
   - Âge de retraite souhaité
   - Épargne actuelle
   - Contribution mensuelle
3. Ajustez le rendement attendu et l'inflation

## Interprétation des Résultats
- **Capital Accumulé**: Total à la retraite
- **Revenu Mensuel**: Durable sans toucher au capital
- **Années de Couverture**: Durée de votre épargne

## Recommandations
Le système suggère:
- Augmenter les contributions
- Ajuster l'âge de la retraite
- Optimiser les investissements`
        },
        tags: ['jubilación', 'ahorro', 'planificación', 'retirement', 'savings'],
        relatedArticles: ['financial-goals', 'investment-tracking']
    },

    // Add more articles as needed...
    // I'll add a few more key ones

    {
        id: 'meal-planning',
        title: {
            ES: 'Planificación de Comidas',
            EN: 'Meal Planning',
            FR: 'Planification des Repas'
        },
        category: {
            ES: 'Vida',
            EN: 'Life',
            FR: 'Vie'
        },
        content: {
            ES: `# Planificación de Comidas

## Crear un Plan Semanal
1. Ve a **Vida → Cocina**
2. Click en **Plan Semanal**
3. Arrastra recetas a cada día
4. Genera lista de compras automática

## Generar Recetas con IA
1. Click en **Generar Receta**
2. Describe lo que quieres
3. La IA crea la receta completa
4. Guarda en tu colección

## Gestión de Despensa
- Añade ingredientes que tienes
- Marca cuando se acaben
- Recibe sugerencias de recetas

## Lista de Compras
- Generada automáticamente del plan
- Agrupa por categorías
- Calcula precios estimados`,
            EN: `# Meal Planning

## Create a Weekly Plan
1. Go to **Life → Kitchen**
2. Click **Weekly Plan**
3. Drag recipes to each day
4. Generate shopping list automatically

## Generate Recipes with AI
1. Click **Generate Recipe**
2. Describe what you want
3. AI creates complete recipe
4. Save to your collection

## Pantry Management
- Add ingredients you have
- Mark when they run out
- Receive recipe suggestions

## Shopping List
- Automatically generated from plan
- Grouped by categories
- Calculates estimated prices`,
            FR: `# Planification des Repas

## Créer un Plan Hebdomadaire
1. Allez dans **Vie → Cuisine**
2. Cliquez sur **Plan Hebdomadaire**
3. Faites glisser les recettes vers chaque jour
4. Générez automatiquement la liste de courses

## Générer des Recettes avec l'IA
1. Cliquez sur **Générer une Recette**
2. Décrivez ce que vous voulez
3. L'IA crée une recette complète
4. Enregistrez dans votre collection

## Gestion du Garde-Manger
- Ajoutez les ingrédients que vous avez
- Marquez quand ils sont épuisés
- Recevez des suggestions de recettes

## Liste de Courses
- Générée automatiquement à partir du plan
- Groupée par catégories
- Calcule les prix estimés`
        },
        tags: ['recetas', 'cocina', 'despensa', 'ia', 'recipes', 'cooking', 'pantry'],
        relatedArticles: ['ai-recipe-generator', 'pantry-management']
    },

    {
        id: 'dashboard-customization',
        title: {
            ES: 'Personalizar tu Dashboard',
            EN: 'Customize Your Dashboard',
            FR: 'Personnaliser Votre Tableau de Bord'
        },
        category: {
            ES: 'Dashboard',
            EN: 'Dashboard',
            FR: 'Tableau de Bord'
        },
        content: {
            ES: `# Personalización del Dashboard

## Modo Edición
1. Click en **Editar Dashboard**
2. Arrastra widgets para reordenar
3. Redimensiona widgets
4. Guarda cambios

## Añadir Widgets
1. Click en **Galería de Widgets**
2. Explora widgets disponibles:
   - Resumen Financiero
   - Salud Financiera
   - Próximos Pagos
   - Metas Activas
   - Plan Semanal
3. Click para añadir

## Layouts Predefinidos
- **Finanzas**: Enfocado en dinero
- **Vida**: Recetas y hogar
- **Balanceado**: Mix de todo

## Guardar Layouts
- Guarda múltiples configuraciones
- Cambia entre layouts fácilmente
- Comparte con familia (próximamente)`,
            EN: `# Dashboard Customization

## Edit Mode
1. Click **Edit Dashboard**
2. Drag widgets to reorder
3. Resize widgets
4. Save changes

## Add Widgets
1. Click **Widget Gallery**
2. Explore available widgets:
   - Financial Summary
   - Financial Health
   - Upcoming Payments
   - Active Goals
   - Weekly Plan
3. Click to add

## Predefined Layouts
- **Finance**: Money-focused
- **Life**: Recipes and home
- **Balanced**: Mix of everything

## Save Layouts
- Save multiple configurations
- Switch between layouts easily
- Share with family (coming soon)`,
            FR: `# Personnalisation du Tableau de Bord

## Mode Édition
1. Cliquez sur **Modifier le Tableau de Bord**
2. Faites glisser les widgets pour réorganiser
3. Redimensionnez les widgets
4. Enregistrez les modifications

## Ajouter des Widgets
1. Cliquez sur **Galerie de Widgets**
2. Explorez les widgets disponibles:
   - Résumé Financier
   - Santé Financière
   - Paiements à Venir
   - Objectifs Actifs
   - Plan Hebdomadaire
3. Cliquez pour ajouter

## Layouts Prédéfinis
- **Finances**: Axé sur l'argent
- **Vie**: Recettes et maison
- **Équilibré**: Mix de tout

## Enregistrer les Layouts
- Enregistrez plusieurs configurations
- Changez facilement entre les layouts
- Partagez avec la famille (bientôt)`
        },
        tags: ['dashboard', 'widgets', 'personalización', 'customization'],
        relatedArticles: ['getting-started', 'widget-gallery']
    },

    {
        id: 'privacy-settings',
        title: {
            ES: 'Configuración de Privacidad',
            EN: 'Privacy Settings',
            FR: 'Paramètres de Confidentialité'
        },
        category: {
            ES: 'Configuración',
            EN: 'Settings',
            FR: 'Paramètres'
        },
        content: {
            ES: `# Privacidad y Datos

## Gestión de Cookies
1. Ve a **Configuración → Privacidad**
2. Ajusta preferencias:
   - Cookies esenciales (siempre activas)
   - Analytics (opcional)
   - Marketing (opcional)

## Exportar tus Datos
1. **Configuración → Privacidad**
2. Click en **Exportar Datos**
3. Descarga archivo JSON
4. Incluye todas tus transacciones, recetas, etc.

## Eliminar Cuenta
1. **Configuración → Privacidad**
2. **Eliminar Cuenta**
3. Período de gracia de 30 días
4. Cancelable durante ese tiempo

## Tus Derechos GDPR
- Acceso a tus datos
- Rectificación
- Eliminación
- Portabilidad
- Oposición al procesamiento`,
            EN: `# Privacy and Data

## Cookie Management
1. Go to **Settings → Privacy**
2. Adjust preferences:
   - Essential cookies (always active)
   - Analytics (optional)
   - Marketing (optional)

## Export Your Data
1. **Settings → Privacy**
2. Click **Export Data**
3. Download JSON file
4. Includes all your transactions, recipes, etc.

## Delete Account
1. **Settings → Privacy**
2. **Delete Account**
3. 30-day grace period
4. Cancelable during that time

## Your GDPR Rights
- Access to your data
- Rectification
- Deletion
- Portability
- Opposition to processing`,
            FR: `# Confidentialité et Données

## Gestion des Cookies
1. Allez dans **Paramètres → Confidentialité**
2. Ajustez les préférences:
   - Cookies essentiels (toujours actifs)
   - Analytics (optionnel)
   - Marketing (optionnel)

## Exporter Vos Données
1. **Paramètres → Confidentialité**
2. Cliquez sur **Exporter les Données**
3. Téléchargez le fichier JSON
4. Inclut toutes vos transactions, recettes, etc.

## Supprimer le Compte
1. **Paramètres → Confidentialité**
2. **Supprimer le Compte**
3. Période de grâce de 30 jours
4. Annulable pendant cette période

## Vos Droits RGPD
- Accès à vos données
- Rectification
- Suppression
- Portabilité
- Opposition au traitement`
        },
        tags: ['privacidad', 'gdpr', 'datos', 'cookies', 'privacy', 'data'],
        relatedArticles: ['account-security', 'data-export']
    },

    {
        id: 'troubleshooting',
        title: {
            ES: 'Solución de Problemas Comunes',
            EN: 'Common Troubleshooting',
            FR: 'Dépannage Courant'
        },
        category: {
            ES: 'Ayuda',
            EN: 'Help',
            FR: 'Aide'
        },
        content: {
            ES: `# Solución de Problemas

## La app no carga
1. Limpia caché del navegador
2. Verifica conexión a internet
3. Intenta en modo incógnito
4. Contacta soporte si persiste

## No puedo importar CSV
- Verifica formato del archivo
- Asegúrate que sea .csv
- Revisa que tenga columnas: Fecha, Concepto, Importe
- Prueba con archivo de ejemplo

## Mis datos no se guardan
- Verifica que estés autenticado
- Revisa conexión a internet
- Espera a que aparezca confirmación
- Recarga la página

## La IA no responde
- Verifica que tengas créditos
- Revisa tu conexión
- Intenta con prompt más simple
- Contacta soporte

## Contacto
- Email: support@onyxsuite.com
- Chat en vivo (próximamente)`,
            EN: `# Troubleshooting

## App not loading
1. Clear browser cache
2. Check internet connection
3. Try incognito mode
4. Contact support if it persists

## Cannot import CSV
- Verify file format
- Make sure it's .csv
- Check it has columns: Date, Description, Amount
- Try with example file

## My data is not saving
- Verify you are authenticated
- Check internet connection
- Wait for confirmation to appear
- Reload the page

## AI not responding
- Verify you have credits
- Check your connection
- Try with simpler prompt
- Contact support

## Contact
- Email: support@onyxsuite.com
- Live chat (coming soon)`,
            FR: `# Dépannage

## L'application ne charge pas
1. Videz le cache du navigateur
2. Vérifiez la connexion internet
3. Essayez le mode incognito
4. Contactez le support si cela persiste

## Impossible d'importer CSV
- Vérifiez le format du fichier
- Assurez-vous que c'est .csv
- Vérifiez qu'il a les colonnes: Date, Description, Montant
- Essayez avec le fichier d'exemple

## Mes données ne sont pas enregistrées
- Vérifiez que vous êtes authentifié
- Vérifiez la connexion internet
- Attendez que la confirmation apparaisse
- Rechargez la page

## L'IA ne répond pas
- Vérifiez que vous avez des crédits
- Vérifiez votre connexion
- Essayez avec un prompt plus simple
- Contactez le support

## Contact
- Email: support@onyxsuite.com
- Chat en direct (bientôt)`
        },
        tags: ['problemas', 'errores', 'ayuda', 'soporte', 'troubleshooting', 'help', 'support'],
        relatedArticles: ['import-transactions', 'privacy-settings']
    }
];
