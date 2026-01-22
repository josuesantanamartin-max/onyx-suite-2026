
import { createGeminiClient } from "./geminiProxy";
import { Transaction, Account, Debt, Ingredient, Trip, Budget, Goal, Recipe } from '../types';

// Gemini Model Configuration
// Change this to switch between models easily:
// - 'gemini-2.0-flash-exp' for Gemini 2.0 Flash (experimental, fast, works with current API)
// - 'gemini-1.5-flash' for Gemini 1.5 Flash (stable, fast, cheaper)
// Note: 'gemini-1.5-pro' is NOT supported in the current API version (v1beta)
const GEMINI_MODEL = 'gemini-2.0-flash-exp';

// Helper maps
const CURRENCY_MAP = { EUR: '€', USD: '$', GBP: '£' };

const LANG_PROMPTS = {
  ES: {
    role: "Actúa como un experto asesor financiero personal.",
    context: "Analiza los siguientes datos financieros de un usuario.",
    output: "Proporciona un análisis conciso en formato HTML simple (usa <strong>, <ul>, <li>, <br>) con los siguientes puntos:",
    points: [
      "Observaciones Clave: Salud financiera general y estado por cuentas.",
      "Análisis de Gastos: Detecta patrones o gastos innecesarios.",
      "Estado de Presupuestos: Evalúa si se están cumpliendo los límites.",
      "Progreso de Metas: Comentario sobre el avance de los objetivos.",
      "Sugerencias de Ahorro: Acciones concretas para mejorar.",
      "Gestión de Deuda: Consejo rápido sobre cómo abordarla (si aplica)."
    ],
    tone: "Mantén un tono profesional pero alentador. No uses Markdown, usa etiquetas HTML básicas.",
    currencyLabel: "Moneda",
    error: "Hubo un error al conectar con el asistente financiero. Inténtalo más tarde.",
    apiKeyError: "Error: No se ha encontrado la clave API de Gemini."
  },
  EN: {
    role: "Act as an expert personal financial advisor.",
    context: "Analyze the following financial data for a user.",
    output: "Provide a concise analysis in simple HTML format (use <strong>, <ul>, <li>, <br>) covering the following points:",
    points: [
      "Key Observations: Overall financial health and account status.",
      "Expense Analysis: Detect patterns or unnecessary expenses.",
      "Budget Status: Evaluate if limits are being met.",
      "Goal Progress: Comment on the progress of objectives.",
      "Savings Suggestions: Concrete actions to improve.",
      "Debt Management: Quick advice on how to address it (if applicable)."
    ],
    tone: "Keep a professional yet encouraging tone. Do not use Markdown, use basic HTML tags.",
    currencyLabel: "Currency",
    error: "There was an error connecting to the financial assistant. Please try again later.",
    apiKeyError: "Error: Gemini API Key not found."
  },
  FR: {
    role: "Agissez en tant qu'expert conseiller financier personnel.",
    context: "Analysez les données financières suivantes d'un utilisateur.",
    output: "Fournissez une analyse concise au format HTML simple (utilisez <strong>, <ul>, <li>, <br>) couvrant les points suivants :",
    points: [
      "Observations Clés : Santé financière globale et état des comptes.",
      "Analyse des Dépenses : Détectez des modèles ou des dépenses inutiles.",
      "État des Budgets : Évaluez si les limites sont respectées.",
      "Progrès des Objectifs : Commentaire sur l'avancement des objectifs.",
      "Suggestions d'Épargne : Actions concrètes pour améliorer.",
      "Gestión de la Dette : Conseil rapide sur la façon de l'aborder (si applicable)."
    ],
    tone: "Gardez un ton professionnel mais encourageant. N'utilisez pas de Markdown, utilisez des balises HTML de base.",
    currencyLabel: "Devise",
    error: "Une erreur s'est produite lors de la connexion à l'assistant financier. Veuillez réessayer plus tard.",
    apiKeyError: "Erreur : Clé API Gemini introuvable."
  }
};

// Robust JSON Cleaner
const cleanJSON = (text: string) => {
  const firstOpen = text.indexOf('{');
  const firstArray = text.indexOf('[');
  let startIndex = -1;

  if (firstOpen > -1 && firstArray > -1) startIndex = Math.min(firstOpen, firstArray);
  else if (firstOpen > -1) startIndex = firstOpen;
  else if (firstArray > -1) startIndex = firstArray;

  const lastClose = text.lastIndexOf('}');
  const lastArray = text.lastIndexOf(']');
  let endIndex = -1;

  if (lastClose > -1 && lastArray > -1) endIndex = Math.max(lastClose, lastArray);
  else if (lastClose > -1) endIndex = lastClose;
  else if (lastArray > -1) endIndex = lastArray;

  if (startIndex > -1 && endIndex > -1) {
    return text.substring(startIndex, endIndex + 1);
  }
  return text; // Fallback
};

// --- OPTIMIZED IMAGE COMPRESSION (WebP) ---
// This drastically reduces file size while maintaining quality to prevent LocalStorage crashes
export const compressBase64Image = (base64Str: string, maxWidth = 1024, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate aspect ratio
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Convert to WebP for better compression efficiency
        const compressed = canvas.toDataURL('image/webp', quality);
        resolve(compressed);
      } else {
        resolve("");
      }
    };
    img.onerror = () => {
      resolve("");
    };
  });
};

// --- FINANCE ANALYSIS ---
export const analyzeFinances = async (
  transactions: Transaction[],
  accounts: Account[],
  debts: Debt[],
  budgets: Budget[],
  goals: Goal[],
  language: 'ES' | 'EN' | 'FR' = 'ES',
  currency: 'EUR' | 'USD' | 'GBP' = 'EUR'
): Promise<string> => {
  const ai = createGeminiClient();
  const t = LANG_PROMPTS[language];
  const currencySymbol = CURRENCY_MAP[currency];

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const debtTotal = debts.reduce((acc, d) => acc + d.remainingBalance, 0);

  const accountStats = transactions.reduce((acc, t) => {
    if (!acc[t.accountId]) {
      acc[t.accountId] = { income: 0, expense: 0 };
    }
    if (t.type === 'INCOME') {
      acc[t.accountId].income += t.amount;
    } else {
      acc[t.accountId].expense += t.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  const accountBreakdown = accounts.map(acc => {
    const stats = accountStats[acc.id] || { income: 0, expense: 0 };
    const name = acc.bankName ? `${acc.bankName} - ${acc.name}` : acc.name;
    return `- ${name}: Balance ${currencySymbol}${acc.balance.toFixed(2)} (Ingresos: +${currencySymbol}${stats.income.toFixed(2)} / Gastos: -${currencySymbol}${stats.expense.toFixed(2)})`;
  }).join('\n');

  const expensesByCategory = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topExpenses = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cat, amount]) => `- ${cat}: ${currencySymbol}${amount.toFixed(2)}`)
    .join('\n');

  // Budget Analysis Prep
  const budgetSummary = budgets.map(b => {
    return `- ${b.category} (${b.subCategory || 'General'}): Limit ${currencySymbol}${b.limit}`;
  }).join('\n');

  // Goals Analysis Prep
  const goalsSummary = goals.map(g => {
    const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount * 100).toFixed(1) : 0;
    return `- ${g.name}: ${currencySymbol}${g.currentAmount} / ${currencySymbol}${g.targetAmount} (${progress}%)`;
  }).join('\n');

  const prompt = `
    ${t.role}
    ${t.currencyLabel}: ${currency} (${currencySymbol})
    ${t.context}
    
    DATA SUMMARY:
    - Net Worth (Total Balance): ${currencySymbol}${totalBalance.toFixed(2)}
    - Period Income: ${currencySymbol}${income.toFixed(2)}
    - Period Expenses: ${currencySymbol}${expense.toFixed(2)}
    - Total Debt: ${currencySymbol}${debtTotal.toFixed(2)}

    BREAKDOWN BY ACCOUNT (Balance | Period Flow):
    ${accountBreakdown}

    TOP EXPENSES (Categories):
    ${topExpenses}

    ACTIVE BUDGETS:
    ${budgetSummary}

    ACTIVE GOALS:
    ${goalsSummary}

    RECENT TRANSACTIONS (Sample):
    ${JSON.stringify(transactions.slice(0, 5).map(t => ({
    date: t.date,
    desc: t.description,
    amount: t.amount,
    type: t.type,
    category: t.category
  })))}

    INSTRUCTIONS:
    ${t.output}
    ${t.points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

    ${t.tone}
    IMPORTANT: Respond ONLY in ${language === 'ES' ? 'SPANISH' : language === 'FR' ? 'FRENCH' : 'ENGLISH'}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error (Finance):", error);
    return t.error;
  }
};

// --- TRIP PLANNING (Travel) ---
export const planTripWithAI = async (
  userInput: string,
  language: 'ES' | 'EN' | 'FR'
): Promise<(Partial<Trip> & { imagePrompt?: string }) | null> => {
  const ai = createGeminiClient();
  const today = new Date().toISOString().split('T')[0];

  const prompt = `
    Act as an elite travel agency AI with access to real-time data via Google Search.
    User Request: "${userInput}"
    Current Date: ${today}
    Language: ${language}

    TASK:
    1. SEARCH for REAL flights and hotels matching the user's request.
    2. Suggest a destination if missing.
    3. Construct a complete itinerary.

    OUTPUT FORMAT:
    Return ONLY a raw JSON object. 
    Structure:
    {
      "destination": "City Name",
      "country": "Country Name",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "budget": 1500,
      "imagePrompt": "A description to generate a cover image for this place",
      "flights": [ ... ],
      "accommodations": [ ... ],
      "itinerary": [ ... ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });

    const text = response.text || '';
    const jsonStr = cleanJSON(text);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Trip Planning Error:", e);
    return null;
  }
};

// --- IMAGE GENERATION (Suite Wide) ---
// UPDATED: Uses URL-based generation to prevent memory crashes with Base64
export const generateImage = async (prompt: string, aspectRatio: string = "4:3"): Promise<{ imageUrl?: string; error?: string }> => {
  const seed = Math.floor(Math.random() * 1000000);
  const width = aspectRatio === "16:9" ? 1280 : aspectRatio === "9:16" ? 720 : 1024;
  const height = aspectRatio === "16:9" ? 720 : aspectRatio === "9:16" ? 1280 : 1024;

  // Enhanced prompt for professional food photography
  const enhancedPrompt = `${prompt}, professional food photography, award winning, studio soft lighting, appetizing, highly detailed, 8k, bokeh, cinematic composition, depth of field, vibrant colors, michelin star plating, editorial style`;
  const encodedPrompt = encodeURIComponent(enhancedPrompt);

  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

  // No artificial delay needed for URL construction
  return { imageUrl };
};

// --- RECEIPT PARSING (Kitchen) ---
export const parseReceiptImage = async (base64Image: string): Promise<Partial<Ingredient>[]> => {
  const ai = createGeminiClient();

  // Increased compression for receipt scanning to ensure speed
  const compressedInput = await compressBase64Image(base64Image, 800, 0.5);
  if (!compressedInput) return [];

  const base64Data = compressedInput.split(',')[1];

  const prompt = `
    Analyze this supermarket receipt image.
    Extract the grocery items purchased.
    For each item, identify:
    1. Name (concise, e.g., "Milk", "Apples")
    2. Quantity (estimate number or weight if visible, default to 1)
    3. Unit (e.g., "pcs", "kg", "l", "g". Default to "pcs")
    4. Category (MUST be one of: "Vegetables", "Fruits", "Dairy", "Meat", "Pantry", "Spices", "Frozen")

    Return ONLY a raw JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/webp', data: base64Data } },
          { text: prompt }
        ]
      }
    });

    const text = response.text || '';
    const jsonStr = cleanJSON(text);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Receipt Parsing Error:", e);
    return [];
  }
};

// --- CHEF AI: RECIPE FROM INGREDIENTS ---
export const generateRecipesFromIngredients = async (
  ingredients: string[],
  language: string
): Promise<Recipe[]> => {
  const ai = createGeminiClient();

  const prompt = `
    Act as a Michelin star chef.
    I have these ingredients: ${ingredients.join(', ')}.
    
    Create 3 distinct, delicious recipes using some or all of these ingredients. You can assume I have basic staples (salt, pepper, oil, water).
    
    CRITERIA:
    - Language: ${language}
    - Format: JSON Array of Recipe Objects.
    
    Recipe Object Structure:
    {
      "name": "Creative Name",
      "prepTime": number (minutes),
      "calories": number (approx),
      "tags": ["Dinner", "Healthy", etc],
      "baseServings": number,
      "ingredients": [ { "name": "Ingrediente", "quantity": number, "unit": "g/pcs" } ],
      "instructions": [ "Step 1", "Step 2" ]
    }

    Return ONLY raw JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const text = response.text || '';
    const jsonStr = cleanJSON(text);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Chef AI Error:", e);
    return [];
  }
};

// --- CHEF AI: RECIPE FROM IMAGE ---
export const generateRecipesFromImage = async (
  base64Image: string,
  language: string
): Promise<Recipe[]> => {
  const ai = createGeminiClient();

  // Use the new efficient compression
  const compressedInput = await compressBase64Image(`data:image/jpeg;base64,${base64Image}`, 1024, 0.7);
  const cleanBase64 = compressedInput.split(',')[1];

  const prompt = `
    Analyze this food image. Identify the main ingredients or dish.
    Then, suggest 2 recipes that can be made with these items or how to prepare this specific dish perfectly.
    
    CRITERIA:
    - Language: ${language}
    - Format: JSON Array of Recipe Objects.
    
    Recipe Object Structure:
    {
      "name": "Creative Name",
      "prepTime": number (minutes),
      "calories": number (approx),
      "tags": ["Dinner", "Healthy", etc],
      "baseServings": number,
      "ingredients": [ { "name": "Ingrediente", "quantity": number, "unit": "g/pcs" } ],
      "instructions": [ "Step 1", "Step 2" ]
    }

    Return ONLY raw JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/webp', data: cleanBase64 } },
          { text: prompt }
        ]
      }
    });
    const text = response.text || '';
    const jsonStr = cleanJSON(text);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Chef AI Image Error:", e);
    return [];
  }
};

// --- MEAL PLANNING (Optimized for Stability) ---
export const generateMealPlan = async (
  criteria: {
    startDate: string;
    days: number;
    diet: string;
    goal: string;
    difficulty: string;
    exclusions?: string;
    mealTypes?: string[];
    courses?: { lunch: number; dinner: number };
  },
  pantryItems: Ingredient[],
  language: 'ES' | 'EN' | 'FR'
): Promise<any> => {
  const ai = createGeminiClient();

  const pantrySummary = pantryItems.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
  const mealsToGenerate = criteria.mealTypes && criteria.mealTypes.length > 0 ? criteria.mealTypes.join(', ') : 'breakfast, lunch, dinner';

  // Explicit instruction for courses
  const courseInstructions = criteria.courses
    ? `For LUNCH generate ${criteria.courses.lunch || 1} distinct dishes (Starter, Main). For DINNER generate ${criteria.courses.dinner || 1} distinct dishes.`
    : '';

  const prompt = `
    Act as a Michelin star chef and nutritionist.
    Generate a CREATIVE and VARIED meal plan for ${criteria.days} days starting from ${criteria.startDate}.
    
    CRITERIA:
    - Language: ${language}
    - Diet: ${criteria.diet}
    - Goal: ${criteria.goal}
    - Meals to Include: ${mealsToGenerate}
    - Structure details: ${courseInstructions}
    - IMPORTANT: Ensure recipes are NOT repetitive. Use seasonal ingredients.
    
    CONTEXT:
    - Current Pantry: ${pantrySummary} (Use these to minimize shopping, but prioritize quality/taste)

    OUTPUT FORMAT:
    Return strictly a JSON object. 
    IMPORTANT: Provide FULL DETAILS for each recipe (Ingredients & Instructions).
    'courseType' MUST be one of: 'STARTER', 'MAIN', 'DESSERT', 'SIDE', 'DRINK'.
    
    Structure:
    {
      "YYYY-MM-DD": {
        "breakfast": [ 
           { 
             "name": "Avocado Toast with Poached Egg", 
             "calories": 350, 
             "prepTime": 10, 
             "courseType": "MAIN",
             "ingredients": [ {"name": "Bread", "quantity": 2, "unit": "slice"}, {"name": "Egg", "quantity": 1, "unit": "pc"} ],
             "instructions": ["Toast bread.", "Poach egg.", "Assemble."]
           }
        ],
        "lunch": [ 
           { 
             "name": "Quinoa Salad", 
             "calories": 400, 
             "prepTime": 20, 
             "courseType": "STARTER",
             "ingredients": [...],
             "instructions": [...]
           },
           { ... }
        ],
        "dinner": [ ... ]
      },
      ...
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const text = response.text || '';
    const jsonStr = cleanJSON(text);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Meal Plan Gen Error:", e);
    return null;
  }
};

// --- RECIPE HYDRATION (Lazy Loading) ---
export const getRecipeDetails = async (recipeName: string, language: string): Promise<Partial<Recipe> | null> => {
  const ai = createGeminiClient();

  const prompt = `
        Create a detailed recipe for: "${recipeName}".
        Language: ${language}.
        Return ONLY a JSON object with:
        {
            "ingredients": [ { "name": "Item", "quantity": 1, "unit": "pc" } ],
            "instructions": [ "Step 1", "Step 2" ]
        }
    `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt
    });
    const text = response.text || '';
    return JSON.parse(cleanJSON(text));
  } catch (e) {
    console.error("Recipe Hydration Error:", e);
    return null;
  }
};

// --- GENERIC CHAT (Suite Wide) ---
export const askAI = async (prompt: string): Promise<string> => {
  const ai = createGeminiClient();

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    return response.text || "";
  } catch (e) {
    console.error("Gemini Chat Error:", e);
    return "Error connecting to AI.";
  }
};

// --- SMART INSIGHTS (Cross-Module Intelligence) ---
export const generateSmartInsight = async (
  financialContext: {
    topCategories: string[];
    monthlySpending: number;
    currency: string;
  },
  pantryItems: string[],
  language: 'ES' | 'EN' | 'FR'
): Promise<{
  title: string;
  insight: string;
  savingsEstimate: string;
  actionableRecipe?: { name: string; matchReason: string };
} | null> => {
  const ai = createGeminiClient();

  const prompt = `
    ACT as a financial lifestyle optimizer.
    
    INPUT DATA:
    1. Financials: User spends most on [${financialContext.topCategories.join(', ')}]. Total monthly spend: ${financialContext.currency}${financialContext.monthlySpending}.
    2. Pantry Inventory: [${pantryItems.join(', ')}].
    
    GOAL:
    Find a specific correlation between their spending and their pantry to save money.
    Example: "High restaurant spend" + "Pasta in pantry" -> "You spent €200 on dining out. You have pasta! Cook Carbonara tonight."
    
    OUTPUT FORMAT:
    JSON Object ONLY:
    {
      "title": "Short, punchy title (e.g., 'Stop Ordering Out')",
      "insight": "1-sentence specific observation.",
      "savingsEstimate": "Estimated monthly savings (e.g., '€50-€100')",
      "actionableRecipe": { "name": "Recipe Name", "matchReason": "Why this fits (e.g., 'Uses your heavy cream')" }
    }
    
    Language: ${language}
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const text = response.text || '';
    return JSON.parse(cleanJSON(text));
  } catch (e) {
    console.error("Smart Insight Error:", e);
    return null;
  }
};
// --- SMART CATEGORIZATION (Auto-tagging) ---
export const suggestCategory = async (
  description: string,
  categories: string[]
): Promise<string | null> => {
  const ai = createGeminiClient();

  const prompt = `
    Match this transaction description to the best available category.
    Description: "${description}"
    Available Categories: ${categories.join(', ')}
    
    Return ONLY the exact category name from the list. If unsure, return "Otros".
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const text = response.text?.trim() || '';
    // Security check: ensure the answer is actually in the list
    if (categories.includes(text)) return text;
    return null;
  } catch (e) {
    console.error("Smart Categorization Error:", e);
    return null;
  }
};

// --- LIFE ANALYSIS (Pantry, Meal Plans, Shopping, Trips) ---
export const analyzeLife = async (
  pantryItems: Ingredient[],
  mealPlans: any[],
  shoppingList: Ingredient[],
  trips: Trip[],
  language: 'ES' | 'EN' | 'FR'
): Promise<string> => {
  const ai = createGeminiClient();

  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return language === 'ES'
      ? 'Error: No se ha encontrado la clave API de Gemini.'
      : 'Error: Gemini API Key not found.';
  }

  const t = LANG_PROMPTS[language];

  // Prepare pantry summary
  const pantryCategories = pantryItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pantrySummary = Object.entries(pantryCategories)
    .map(([cat, count]) => `- ${cat}: ${count} items`)
    .join('\n');

  // Prepare shopping list summary
  const shoppingSummary = shoppingList.length > 0
    ? shoppingList.slice(0, 10).map(item => `- ${item.name} (${item.quantity} ${item.unit})`).join('\n')
    : 'No items in shopping list';

  // Prepare meal plans summary
  const mealPlansSummary = mealPlans.length > 0
    ? `${mealPlans.length} meal plans created`
    : 'No meal plans';

  // Prepare trips summary
  const tripsSummary = trips.length > 0
    ? trips.map(t => `- ${t.destination} (${t.startDate} to ${t.endDate}): Budget ${t.budget}€`).join('\n')
    : 'No trips planned';

  const prompt = `
    Act as an expert life management and household organization advisor.
    Language: ${language}
    
    Analyze the following life management data for a user:
    
    PANTRY INVENTORY:
    Total Items: ${pantryItems.length}
    ${pantrySummary}
    
    SHOPPING LIST:
    ${shoppingSummary}
    
    MEAL PLANNING:
    ${mealPlansSummary}
    
    TRAVEL PLANS:
    ${tripsSummary}
    
    INSTRUCTIONS:
    Provide a concise analysis in simple HTML format (use <strong>, <ul>, <li>, <br>) covering:
    
    1. Pantry Status: Assess inventory health and identify missing essentials
    2. Shopping Optimization: Suggest ways to optimize shopping based on pantry
    3. Meal Planning: Comment on meal organization and variety
    4. Travel Preparation: Advice on upcoming trips and budgeting
    5. Waste Reduction: Tips to avoid food waste based on current inventory
    6. Cost Savings: Actionable suggestions to save money on groceries and household
    
    Keep a helpful and encouraging tone. Do not use Markdown, use basic HTML tags.
    IMPORTANT: Respond ONLY in ${language === 'ES' ? 'SPANISH' : language === 'FR' ? 'FRENCH' : 'ENGLISH'}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error (Life):", error);
    return t.error;
  }
};
