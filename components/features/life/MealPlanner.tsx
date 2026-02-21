import React, { useState } from 'react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useUserStore } from '../../../store/useUserStore';
import { Recipe, WeeklyPlanState, MealTime, Language } from '../../../types';
import { ChevronLeft, ChevronRight, Wand2, Coffee, Sunset, Moon, X, Loader2, BookOpen, GripVertical, Search, ChefHat, MoreHorizontal, Plus, Copy, Trash2, ClipboardPaste, Clipboard, MoreVertical, PlusCircle, Calendar, LayoutGrid, List, ShoppingCart, Flame, Sparkles } from 'lucide-react';
import { generateMealPlan, generateImage, getRecipeDetails } from '../../../services/geminiService';
import { getIngredientCategory } from '../../../utils/foodUtils';

interface MealPlannerProps {
    onOpenRecipe: (recipe: Recipe) => void;
}

const DEFAULT_FOOD_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";

const AI_OPTIONS: Record<string, Record<string, Record<Language, string>>> = {
    diet: {
        'Omnivore': { ES: 'Omnívoro', EN: 'Omnivore', FR: 'Omnivore' },
        'Vegetarian': { ES: 'Vegetariano', EN: 'Vegetarian', FR: 'Végétarien' },
        'Vegan': { ES: 'Vegano', EN: 'Vegan', FR: 'Végétalien' },
        'Keto': { ES: 'Keto', EN: 'Keto', FR: 'Céto' },
        'Paleo': { ES: 'Paleo', EN: 'Paleo', FR: 'Paléo' },
    },
    goal: {
        'Balanced': { ES: 'Balanceado', EN: 'Balanced', FR: 'Équilibré' },
        'LowCarb': { ES: 'Bajo en Carbohidratos', EN: 'Low Carb', FR: 'Faible en glucides' },
        'HighProtein': { ES: 'Alto en Proteína', EN: 'High Protein', FR: 'Riche en protéines' },
        'BudgetFriendly': { ES: 'Económico', EN: 'Budget Friendly', FR: 'Économique' },
        'QuickEasy': { ES: 'Rápido y Fácil', EN: 'Quick & Easy', FR: 'Rapide & Facile' },
    },
    difficulty: {
        'Any': { ES: 'Cualquiera', EN: 'Any', FR: 'Peu importe' },
        'Beginner': { ES: 'Principiante (< 30 min)', EN: 'Beginner (< 30 min)', FR: 'Débutant (< 30 min)' },
        'Intermediate': { ES: 'Intermedio (30-60 min)', EN: 'Intermediate (30-60 min)', FR: 'Intermédiaire (30-60 min)' },
        'Advanced': { ES: 'Avanzado (> 60 min)', EN: 'Advanced (> 60 min)', FR: 'Avancé (> 60 min)' },
    }
};

const COURSE_LABELS: Record<string, string> = {
    'STARTER': '1er Plato',
    'MAIN': '2º Plato',
    'DESSERT': 'Postre',
    'SIDE': 'Acomp.',
    'DRINK': 'Bebida'
};

const COURSE_ORDER = ['STARTER', 'MAIN', 'SIDE', 'DESSERT', 'DRINK'];

type ViewMode = 'week' | 'biweek' | 'month';

const generatePlanDates = (startDate: Date, mode: ViewMode): Date[] => {
    const start = new Date(startDate);
    const day = start.getDay();
    // Monday as start of week
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    // For month view, start from the 1st of the month based on the input date
    if (mode === 'month') {
        const firstDay = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const firstDayOfWeek = firstDay.getDay();
        const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Mon=0, Sun=6
        start.setTime(firstDay.getTime() - (offset * 24 * 60 * 60 * 1000));
    }

    const count = mode === 'week' ? 7 : mode === 'biweek' ? 14 : 35; // 5 weeks for month view
    const range = [];
    for (let i = 0; i < count; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        range.push(d);
    }
    return range;
};

export const MealPlanner: React.FC<MealPlannerProps> = ({ onOpenRecipe }) => {

    const { weeklyPlans, setWeeklyPlans, recipes, setRecipes, pantryItems, shoppingList, setShoppingList } = useLifeStore();
    const { language } = useUserStore();

    // Adapter: Convert Array to Map for backward compatibility within this component
    const weeklyPlan = React.useMemo(() => {
        const map: WeeklyPlanState = {};
        weeklyPlans.forEach(plan => {
            plan.meals.forEach(meal => {
                const date = meal.date;
                if (!map[date]) map[date] = { breakfast: [], lunch: [], dinner: [] };

                const recipeItem: Recipe = {
                    id: meal.recipeId,
                    name: meal.recipeName,
                    baseServings: meal.servings,
                    prepTime: 30,
                    calories: meal.calories || 0,
                    image: meal.image,
                    ingredients: meal.ingredients || [],
                    instructions: meal.instructions || [],
                    tags: [],
                    rating: 0,
                    courseType: meal.courseType,
                };
                map[date][meal.type].push(recipeItem);
            });
        });
        return map;
    }, [weeklyPlans]);

    // Adapter for setWeeklyPlan to maintain backward compatibility with component logic
    const setWeeklyPlan = (updater: any) => {
        const currentMap = weeklyPlan;
        const newMap = typeof updater === 'function' ? updater(currentMap) : updater;

        // Convert to array
        const newPlans = [...weeklyPlans]; // Start with current state to preserve IDs

        // Helper to get plan for date
        const getPlanIndex = (date: string) => {
            const targetDate = new Date(date);
            const day = targetDate.getDay();
            const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
            const weekStart = new Date(targetDate.setDate(diff)).toISOString().split('T')[0];
            let idx = newPlans.findIndex(p => p.weekStart === weekStart);
            if (idx === -1) {
                newPlans.push({ id: Math.random().toString(36).substr(2, 9), weekStart, meals: [] });
                idx = newPlans.length - 1;
            }
            return idx;
        };

        Object.entries(newMap).forEach(([date, dayPlan]: [string, any]) => {
            const idx = getPlanIndex(date);
            const plan = newPlans[idx];

            // Remove old meals for this date from the plan
            plan.meals = plan.meals.filter(m => m.date !== date);

            // Add new meals
            (['breakfast', 'lunch', 'dinner'] as const).forEach(type => {
                if (dayPlan[type]) {
                    dayPlan[type].forEach((recipe: any) => {
                        const dayOfWeek = new Date(date).getDay();
                        plan.meals.push({
                            date,
                            dayOfWeek,
                            type,
                            recipeId: recipe.id,
                            recipeName: recipe.name,
                            servings: recipe.baseServings || 2,
                            completed: recipe.completed || false,
                            courseType: recipe.courseType || 'MAIN',
                            calories: recipe.calories,
                            image: recipe.image,
                            ingredients: recipe.ingredients || [],
                            instructions: recipe.instructions || []
                        });
                    });
                }
            });
        });

        setWeeklyPlans(newPlans);
    };

    const [plannerDate, setPlannerDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
    const [isRecipeDrawerOpen, setIsRecipeDrawerOpen] = useState(false);
    const [isSmartOptimizing, setIsSmartOptimizing] = useState(false);
    const [recipeSearch, setRecipeSearch] = useState('');

    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiStatus, setAiStatus] = useState('');
    const [aiCriteria, setAiCriteria] = useState({
        days: 7, diet: 'Omnivore', goal: 'Balanced', difficulty: 'Any', exclusions: ''
    });
    const [aiMealTypes, setAiMealTypes] = useState({ breakfast: true, lunch: true, dinner: true });
    // Default courses per meal
    const [aiCourses, setAiCourses] = useState({ lunch: 2, dinner: 1 });
    const [loadingRecipeId, setLoadingRecipeId] = useState<string | null>(null);

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [openDayMenuId, setOpenDayMenuId] = useState<string | null>(null); // New state for day menu
    const [copiedDay, setCopiedDay] = useState<{ plan: any, date: string } | null>(null);
    const [draggingItem, setDraggingItem] = useState<{ date: string, meal: MealTime, index: number } | null>(null);
    const [quickAddTarget, setQuickAddTarget] = useState<{ date: string, meal: MealTime } | null>(null);
    const [quickAddSearch, setQuickAddSearch] = useState('');
    const [dragOverSlot, setDragOverSlot] = useState<{ date: string; meal: MealTime } | null>(null);

    // Shopping List Integration
    const [itemsToBuy, setItemsToBuy] = useState<any[]>([]);
    const [isListGenerated, setIsListGenerated] = useState(false);

    const days = generatePlanDates(plannerDate, viewMode);

    // Helper to categorize ingredients for shopping list
    const getIngredientCategory = (ingredientName: string): string => {
        const name = ingredientName.toLowerCase();
        if (name.includes('pollo') || name.includes('ternera') || name.includes('cerdo') || name.includes('pescado') || name.includes('gambas') || name.includes('salmón') || name.includes('carne') || name.includes('marisco')) return 'Carnes y Pescados';
        if (name.includes('leche') || name.includes('queso') || name.includes('yogur') || name.includes('mantequilla') || name.includes('nata') || name.includes('lácteo')) return 'Lácteos';
        if (name.includes('huevo')) return 'Huevos';
        if (name.includes('arroz') || name.includes('pasta') || name.includes('pan') || name.includes('harina') || name.includes('patata') || name.includes('quinoa') || name.includes('legumbre') || name.includes('lentejas') || name.includes('garbanzos')) return 'Cereales y Legumbres';
        if (name.includes('tomate') || name.includes('cebolla') || name.includes('zanahoria') || name.includes('lechuga') || name.includes('pimiento') || name.includes('brócoli') || name.includes('espinacas') || name.includes('verdura') || name.includes('hortaliza')) return 'Verduras';
        if (name.includes('manzana') || name.includes('plátano') || name.includes('naranja') || name.includes('fresa') || name.includes('uva') || name.includes('fruta')) return 'Frutas';
        if (name.includes('aceite') || name.includes('sal') || name.includes('pimienta') || name.includes('especias') || name.includes('vinagre') || name.includes('salsa') || name.includes('azúcar') || name.includes('miel')) return 'Condimentos y Salsas';
        if (name.includes('agua') || name.includes('zumo') || name.includes('refresco') || name.includes('vino') || name.includes('cerveza')) return 'Bebidas';
        if (name.includes('galletas') || name.includes('chocolate') || name.includes('dulces') || name.includes('postre')) return 'Dulces y Snacks';
        if (name.includes('limpieza') || name.includes('jabón') || name.includes('papel') || name.includes('detergente')) return 'Hogar y Limpieza';
        if (name.includes('cuidado personal') || name.includes('champú') || name.includes('gel') || name.includes('pasta de dientes')) return 'Cuidado Personal';
        return 'Otros';
    };

    // --- SMART SHOPPING LIST LOGIC ---
    const recalculateShoppingList = (currentPlan: WeeklyPlanState) => {
        // 1. Calculate TOTAL needed in the entire plan, tracking source recipes
        const planTotals: Record<string, { quantity: number; unit: string; recipes: Set<string> }> = {};

        // Helper to normalize to grams/ml
        const getNormalizedQuantity = (q: number, u: string) => {
            const unit = u.toLowerCase().trim();
            if (unit === 'kg') return q * 1000;
            if (unit === 'l') return q * 1000;
            return q;
        };

        const getNormalizedUnit = (u: string) => {
            const unit = u.toLowerCase().trim();
            if (unit === 'kg' || unit === 'g') return 'g';
            if (unit === 'l' || unit === 'ml') return 'ml';
            return unit;
        };

        // Aggregate all ingredients from the plan
        Object.values(currentPlan).forEach(day => {
            (['breakfast', 'lunch', 'dinner'] as MealTime[]).forEach(meal => {
                day[meal]?.forEach(r => {
                    r.ingredients?.forEach(ing => {
                        const normName = ing.name.toLowerCase().trim();
                        const normUnit = getNormalizedUnit(ing.unit);
                        const normQty = getNormalizedQuantity(ing.quantity, ing.unit);

                        if (!planTotals[normName]) {
                            planTotals[normName] = { quantity: 0, unit: normUnit, recipes: new Set() };
                        }
                        // Only add if units are compatible (basic check)
                        if (planTotals[normName].unit === normUnit) {
                            planTotals[normName].quantity += normQty;
                            planTotals[normName].recipes.add(r.name);
                        }
                    });
                });
            });
        });

        // 2. Generate New List based on Plan - Pantry
        const newSmartItems: any[] = [];

        Object.entries(planTotals).forEach(([name, data]) => {
            // Check Pantry
            const pantryItem = pantryItems.find(p => p.name.toLowerCase().trim() === name);
            let pantryStock = 0;
            if (pantryItem && getNormalizedUnit(pantryItem.unit) === data.unit) {
                pantryStock = getNormalizedQuantity(pantryItem.quantity, pantryItem.unit);
            }

            const missing = data.quantity - pantryStock;

            if (missing > 0) {
                const recipeNames = Array.from(data.recipes).join(', ');
                const category = getIngredientCategory(name);

                newSmartItems.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
                    quantity: parseFloat(missing.toFixed(2)),
                    unit: data.unit,
                    checked: false,
                    category: category,
                    source: {
                        type: 'SMART_PLAN',
                        recipeName: recipeNames
                    }
                });
            }
        });

        // 3. Update Store - We won't auto-update here anymore to allow user validation
        // Instead, we return the candidate list
        return newSmartItems;
    };

    // Legacy helper kept for drag-and-drop auto-updates, but now we prefer manual button
    const legacyRecalculate = (currentPlan: WeeklyPlanState) => {
        // This is a no-op for now as we want manual confirmation
    };

    // --- UX HELPERS ---
    const handleCopyDay = (dateKey: string) => {
        const dayPlan = weeklyPlan[dateKey];
        if (dayPlan) {
            setCopiedDay({ plan: dayPlan, date: dateKey });
            setOpenDayMenuId(null);
        }
    };

    const handlePasteDay = (targetDateKey: string) => {
        if (!copiedDay) return;
        setWeeklyPlan((prev: WeeklyPlanState) => {
            const newPlan = {
                ...prev,
                [targetDateKey]: JSON.parse(JSON.stringify(copiedDay.plan)) // Deep copy
            };
            const items = recalculateShoppingList(newPlan);
            setItemsToBuy(items);
            setIsListGenerated(true);
            return newPlan;
        });
        setCopiedDay(null);
        setOpenDayMenuId(null);
    };

    const handleClearDay = (dateKey: string) => {
        if (window.confirm('¿Borrar todo el plan de este día?')) {
            setWeeklyPlan((prev: WeeklyPlanState) => {
                const newPlan = { ...prev };
                delete newPlan[dateKey];
                const items = recalculateShoppingList(newPlan);
                setItemsToBuy(items);
                setIsListGenerated(true);
                return newPlan;
            });
        }
        setOpenDayMenuId(null);
    };

    const handleQuickAddRecipe = (recipe: Recipe) => {
        if (!quickAddTarget) return;
        const { date, meal } = quickAddTarget;

        setWeeklyPlan((prev: WeeklyPlanState) => {
            const newPlan = { ...prev };
            if (!newPlan[date]) newPlan[date] = { breakfast: [], lunch: [], dinner: [] };

            const newRecipe = { ...recipe, id: Math.random().toString(36).substr(2, 9) };
            // Auto-course logic
            if (meal !== 'breakfast') {
                const existing = newPlan[date][meal] || [];
                const hasStarter = existing.some((r: Recipe) => r.courseType === 'STARTER');
                newRecipe.courseType = hasStarter ? 'MAIN' : 'STARTER';
            } else {
                newRecipe.courseType = 'MAIN';
            }

            newPlan[date] = {
                ...newPlan[date],
                [meal]: [...(newPlan[date][meal] || []), newRecipe]
            };

            // Trigger Smart Shopping List with the NEW plan
            const items = recalculateShoppingList(newPlan);
            setItemsToBuy(items);
            setIsListGenerated(true);

            return newPlan;
        });

        setQuickAddTarget(null);
        setQuickAddSearch('');
    };

    const handlePrevPlanner = () => {
        const newDate = new Date(plannerDate);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
        else if (viewMode === 'biweek') newDate.setDate(newDate.getDate() - 14);
        else newDate.setDate(newDate.getDate() - 7);
        setPlannerDate(newDate);
    };

    const handleNextPlanner = () => {
        const newDate = new Date(plannerDate);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
        else if (viewMode === 'biweek') newDate.setDate(newDate.getDate() + 14);
        else newDate.setDate(newDate.getDate() + 7);
        setPlannerDate(newDate);
    };

    const handleDragStart = (e: React.DragEvent, recipe: Recipe, origin?: { date: string, meal: MealTime, index: number }) => {
        const data = JSON.stringify({ recipe, origin });
        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.effectAllowed = origin ? 'move' : 'copy';

        if (origin) {
            setDraggingItem(origin);
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggingItem(null);
    };

    const handleDragOver = (e: React.DragEvent, targetDate: string, targetMeal: MealTime) => {
        e.preventDefault();

        // Determine drop effect
        const isFromPlanner = !!draggingItem;
        e.dataTransfer.dropEffect = isFromPlanner ? 'move' : 'copy';

        setDragOverSlot(prev =>
            prev?.date === targetDate && prev?.meal === targetMeal ? prev : { date: targetDate, meal: targetMeal }
        );
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if actually leaving the slot (not entering a child)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverSlot(null);
        }
    };

    const handleDrop = (e: React.DragEvent, targetDateKey: string, targetMeal: MealTime) => {
        e.preventDefault();
        setDragOverSlot(null);
        setDraggingItem(null);

        const data = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const { recipe, origin } = JSON.parse(data);

            setWeeklyPlan((prev: WeeklyPlanState) => {
                const newPlan = { ...prev };
                if (origin) {
                    const oldDay = newPlan[origin.date];
                    if (oldDay && oldDay[origin.meal as MealTime]) {
                        const newList = [...oldDay[origin.meal as MealTime]];
                        newList.splice(origin.index, 1);
                        newPlan[origin.date] = { ...oldDay, [origin.meal]: newList };
                    }
                }

                if (!newPlan[targetDateKey]) {
                    newPlan[targetDateKey] = { breakfast: [], lunch: [], dinner: [] };
                }
                const targetDay = newPlan[targetDateKey];

                const recipeToAdd = origin ? recipe : { ...recipe, id: Math.random().toString(36).substr(2, 9) };

                if (!recipeToAdd.courseType && targetMeal !== 'breakfast') {
                    const existing = targetDay[targetMeal] || [];
                    const hasStarter = existing.some((r: Recipe) => r.courseType === 'STARTER');
                    recipeToAdd.courseType = hasStarter ? 'MAIN' : 'STARTER';
                } else if (!recipeToAdd.courseType) {
                    recipeToAdd.courseType = 'MAIN';
                }

                targetDay[targetMeal] = [...(targetDay[targetMeal] || []), recipeToAdd];
                newPlan[targetDateKey] = targetDay;

                const items = recalculateShoppingList(newPlan);
                setItemsToBuy(items);
                setIsListGenerated(true);

                return newPlan;
            });

        } catch (error) {
            console.error("Error processing drop:", error);
        }
    };

    const updateCourseType = (dateKey: string, mealTime: MealTime, index: number, newType: NonNullable<Recipe['courseType']>) => {
        setWeeklyPlan((prev: WeeklyPlanState) => {
            const day = prev[dateKey];
            if (!day) return prev;
            const newList = [...day[mealTime]];
            if (newList[index]) {
                newList[index] = { ...newList[index], courseType: newType };
            }
            return { ...prev, [dateKey]: { ...day, [mealTime]: newList } };
        });
    };

    const handleGenerateMenu = async () => {
        setAiGenerating(true);
        setAiStatus('Diseñando menú...');

        const startDate = new Date().toISOString().split('T')[0];
        try {
            const lowFreshness = pantryItems.filter(i => {
                if (!i.expiryDate) return false;
                const days = (new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                return days < 3;
            });

            const smartGoal = isSmartOptimizing && lowFreshness.length > 0
                ? `${aiCriteria.goal}. Priorizar y aprovechar los siguientes ingredientes que caducan pronto: ${lowFreshness.map(i => i.name).join(', ')}.`
                : aiCriteria.goal;

            const result: any = await generateMealPlan({
                startDate,
                days: aiCriteria.days,
                diet: aiCriteria.diet,
                goal: smartGoal,
                difficulty: aiCriteria.difficulty,
                exclusions: aiCriteria.exclusions,
                mealTypes: Object.keys(aiMealTypes).filter(k => aiMealTypes[k as keyof typeof aiMealTypes]),
                courses: aiCourses
            }, pantryItems, language as any);

            if (result) {
                setAiStatus('Finalizando...');
                // Generate images for all recipes in background/parallel to avoid blocking UI too long
                // But since we removed delay, we can try to do it effectively. 
                // However, doing 20 awaits might still tick.
                // Better approach: Assign them async or just construct since it's fast now.

                const processRecipes = async () => {
                    const newRecipesList: Recipe[] = [];
                    const dates = Object.keys(result);
                    const tempPlanUpdate: WeeklyPlanState = {};

                    for (const date of dates) {
                        const dayPlan = result[date];
                        if (!dayPlan) continue;

                        const processList = async (list: any[]) => {
                            return await Promise.all((Array.isArray(list) ? list : []).map(async (r: any) => {
                                let imgUrl = undefined;
                                try {
                                    const imgRes = await generateImage(r.name);
                                    imgUrl = imgRes.imageUrl;
                                } catch (e) { }

                                const newRecipe: Recipe = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    name: r.name,
                                    calories: r.calories || 0,
                                    prepTime: r.prepTime || 30,
                                    baseServings: 2,
                                    ingredients: r.ingredients || [], // Use the full data
                                    instructions: r.instructions || [], // Use the full data
                                    tags: ['AI Generated'],
                                    image: imgUrl,
                                    rating: 0,
                                    courseType: r.courseType || 'MAIN'
                                };
                                newRecipesList.push(newRecipe);
                                return newRecipe;
                            }));
                        };

                        tempPlanUpdate[date] = {
                            breakfast: await processList(dayPlan.breakfast),
                            lunch: await processList(dayPlan.lunch),
                            dinner: await processList(dayPlan.dinner),
                        };
                    }

                    setRecipes((prev: Recipe[]) => [...prev, ...newRecipesList]);
                    setWeeklyPlan((prev: WeeklyPlanState) => {
                        const finalPlan = { ...prev, ...tempPlanUpdate };
                        // Calculate shopping list candidates immediately
                        const needed = recalculateShoppingList(finalPlan);
                        setItemsToBuy(needed || []);
                        setIsListGenerated(false);
                        return finalPlan;
                    });
                    setIsAiMenuOpen(false);
                    setIsListGenerated(true);
                };

                processRecipes();

            } else {
                alert("Error generando el plan.");
            }
        } catch (err) {
            console.error(err);
            alert("Error generando el plan.");
        }
        setAiGenerating(false);
        setAiStatus('');
    };

    const handleConfirmShoppingList = () => {
        setShoppingList((prev: any[]) => {
            // Basic merge: add unique items
            const currentNames = new Set(prev.map(i => i.name.toLowerCase().trim()));
            const toAdd = itemsToBuy.filter(i => !currentNames.has(i.name.toLowerCase().trim()));
            return [...prev, ...toAdd];
        });
        setIsListGenerated(false);
        alert(`¡Añadidos ${itemsToBuy.length} productos a la lista de compra!`);
    };

    const handleRecipeClick = async (recipe: Recipe) => {
        let updatedRecipe = { ...recipe };
        let hasUpdates = false;
        setLoadingRecipeId(recipe.id);

        if (!updatedRecipe.image) {
            try {
                const imgRes = await generateImage(updatedRecipe.name);
                if (imgRes.imageUrl) {
                    updatedRecipe.image = imgRes.imageUrl;
                    hasUpdates = true;
                }
            } catch (e) { console.error(e); }
        }

        if (updatedRecipe.ingredients.length === 0 && updatedRecipe.instructions.length === 0) {
            const details = await getRecipeDetails(updatedRecipe.name, language as any);
            if (details) {
                updatedRecipe = { ...updatedRecipe, ...details };
                hasUpdates = true;
            }
        }

        if (hasUpdates) {
            setRecipes((prev: Recipe[]) => prev.map(r => r.id === recipe.id ? updatedRecipe : r));
            setWeeklyPlan((currentPlan: WeeklyPlanState) => {
                const updatedPlan = { ...currentPlan };
                Object.keys(updatedPlan).forEach(dateKey => {
                    (['breakfast', 'lunch', 'dinner'] as MealTime[]).forEach(meal => {
                        if (updatedPlan[dateKey]?.[meal]) {
                            updatedPlan[dateKey][meal] = updatedPlan[dateKey][meal].map(m =>
                                m.id === recipe.id ? updatedRecipe : m
                            );
                        }
                    });
                });
                return updatedPlan;
            });
        }

        setLoadingRecipeId(null);
        onOpenRecipe(updatedRecipe);
    };

    const removeRecipeFromPlan = (dateKey: string, mealTime: MealTime, index: number) => {
        setWeeklyPlan((prev: WeeklyPlanState) => {
            const day = prev[dateKey];
            if (!day) return prev;

            // Get the recipe being removed
            const removedRecipe = day[mealTime][index];

            // Remove from plan
            const newList = [...day[mealTime]];
            newList.splice(index, 1);
            const newPlan = { ...prev, [dateKey]: { ...day, [mealTime]: newList } };

            // Update shopping list quantities
            if (removedRecipe && removedRecipe.ingredients) {
                const { shoppingList, setShoppingList } = useLifeStore.getState();

                // Calculate total quantities needed from remaining recipes
                const remainingQuantities = new Map<string, number>();
                Object.values(newPlan).forEach(dayPlan => {
                    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
                        dayPlan[meal as MealTime]?.forEach(recipe => {
                            recipe.ingredients?.forEach(ing => {
                                const key = ing.name.toLowerCase();
                                const current = remainingQuantities.get(key) || 0;
                                remainingQuantities.set(key, current + (parseFloat(String(ing.quantity)) || 0));
                            });
                        });
                    });
                });

                // Update shopping list: subtract quantities or remove if no longer needed
                const updatedShoppingList = shoppingList.map(item => {
                    const key = item.name.toLowerCase();
                    const removedIngredient = removedRecipe.ingredients.find(
                        ing => ing.name.toLowerCase() === key
                    );

                    if (removedIngredient) {
                        const removedQty = parseFloat(String(removedIngredient.quantity)) || 0;
                        const remainingQty = remainingQuantities.get(key) || 0;

                        if (remainingQty > 0) {
                            // Other recipes still need this ingredient, subtract the removed quantity
                            return {
                                ...item,
                                quantity: Math.max(0, item.quantity - removedQty)
                            };
                        } else {
                            // No other recipe needs this ingredient, mark for removal
                            return null;
                        }
                    }

                    return item;
                }).filter(item => item !== null && item.quantity > 0);

                setShoppingList(updatedShoppingList as typeof shoppingList);
            }

            return newPlan;
        });
    };

    // Meal type config for colors
    const MEAL_CONFIG = {
        breakfast: { label: 'Desayuno', accent: 'amber', icon: <Coffee className="w-3 h-3" /> },
        lunch: { label: 'Almuerzo', accent: 'emerald', icon: <Sunset className="w-3 h-3" /> },
        dinner: { label: 'Cena', accent: 'indigo', icon: <Moon className="w-3 h-3" /> },
    };

    const MEAL_COLORS: Record<string, { bg: string; text: string; border: string; dropBg: string; dropBorder: string }> = {
        breakfast: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dropBg: 'bg-amber-50/80', dropBorder: 'border-amber-400' },
        lunch: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dropBg: 'bg-emerald-50/80', dropBorder: 'border-emerald-400' },
        dinner: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', dropBg: 'bg-indigo-50/80', dropBorder: 'border-indigo-400' },
    };

    return (
        <div className="h-full flex flex-col space-y-5 animate-fade-in pb-20 relative">
            <div className="flex justify-between items-center shrink-0 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    {/* Navigation */}
                    <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                        <button onClick={handlePrevPlanner} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <div className="px-4 flex items-center font-black text-xs text-gray-800 min-w-[160px] justify-center">
                            {viewMode === 'month'
                                ? plannerDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^./, s => s.toUpperCase())
                                : `${days[0]?.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} — ${days[days.length - 1]?.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            }
                        </div>
                        <button onClick={handleNextPlanner} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>

                    {/* Today Button */}
                    <button
                        onClick={() => setPlannerDate(new Date())}
                        className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm uppercase tracking-widest"
                    >
                        Hoy
                    </button>

                    {/* View Mode Selector */}
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>Semana</button>
                        <button onClick={() => setViewMode('biweek')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'biweek' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>Quincena</button>
                        <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>Mes</button>
                    </div>

                    <button
                        onClick={() => {
                            const lowFreshness = pantryItems.filter(i => {
                                if (!i.expiryDate) return false;
                                const days = (new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                                return days < 3;
                            });
                            if (lowFreshness.length === 0) {
                                alert("¡Todo está fresco! No hay necesidad de optimizar por caducidad ahora mismo.");
                                return;
                            }
                            setIsSmartOptimizing(true);
                            setIsAiMenuOpen(true);
                        }}
                        className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-100 transition-all active:scale-95 shadow-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5" /> Optimizar
                    </button>

                    <button
                        onClick={() => {
                            setIsSmartOptimizing(false);
                            setIsAiMenuOpen(true);
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-[0_8px_20px_rgba(147,51,234,0.3)] hover:-translate-y-0.5 transition-all active:scale-95 shadow-md"
                    >
                        <Wand2 className="w-3.5 h-3.5" /> IA
                    </button>
                </div>

                <button onClick={() => setIsRecipeDrawerOpen(!isRecipeDrawerOpen)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 ${isRecipeDrawerOpen ? 'bg-emerald-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)]' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 shadow-sm'}`}>
                    <BookOpen className="w-3.5 h-3.5" /> {isRecipeDrawerOpen ? 'Cerrar' : 'Recetario'}
                </button>

                {isListGenerated && itemsToBuy.length > 0 && (
                    <button
                        onClick={handleConfirmShoppingList}
                        className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 hover:shadow-lg transition-all active:scale-95 animate-bounce-slow shadow-md"
                    >
                        <ShoppingCart className="w-3.5 h-3.5" /> Sincronizar Lista ({itemsToBuy.length})
                    </button>
                )}
            </div>

            {aiGenerating && (
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-center justify-center gap-3 animate-pulse">
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    <span className="text-xs font-black text-purple-700 uppercase tracking-widest">{aiStatus}</span>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden gap-4">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className={`gap-3 transition-all duration-500 ${viewMode === 'week' || viewMode === 'biweek' ? 'grid grid-cols-7 min-w-[1200px]' : 'grid grid-cols-7 gap-2'}`}>
                        {days.map(date => {
                            const dateKey = date.toISOString().split('T')[0];
                            const dayPlan = weeklyPlan[dateKey] || { breakfast: [], lunch: [], dinner: [] };
                            const isToday = new Date().toDateString() === date.toDateString();
                            const isCurrentMonth = viewMode === 'month' ? date.getMonth() === plannerDate.getMonth() : true;
                            const totalItems = Object.values(dayPlan).reduce((s, arr) => s + arr.length, 0);

                            return (
                                <div key={dateKey} className={`rounded-3xl border flex flex-col gap-2 transition-all duration-300 relative group/day
                                    ${viewMode === 'month' ? 'min-h-[130px] p-2' : viewMode === 'biweek' ? 'min-h-[280px] p-3' : 'min-h-[480px] p-4'}
                                    ${!isCurrentMonth ? 'opacity-35 bg-gray-50 grayscale' : isToday ? 'bg-white border-emerald-300 shadow-[0_0_0_2px_rgba(16,185,129,0.15),0_4px_16px_rgba(16,185,129,0.08)]' : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'}
                                `}>
                                    {/* Day Header */}
                                    <div className={`flex justify-between items-center pb-2 ${viewMode !== 'month' ? 'border-b border-gray-50' : ''}`}>
                                        <div>
                                            <p className={`text-[9px] font-black uppercase tracking-[0.25em] mb-0.5 ${isToday ? 'text-emerald-500' : 'text-gray-300'}`}>
                                                {date.toLocaleDateString(language === 'ES' ? 'es-ES' : language === 'FR' ? 'fr-FR' : 'en-US', { weekday: 'short' })}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`font-black leading-none ${viewMode === 'month' ? 'text-base' : 'text-xl'} ${isToday ? 'text-emerald-600' : 'text-gray-800'}`}>
                                                    {date.getDate()}
                                                </span>
                                                {isToday && <span className="text-[7px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">Hoy</span>}
                                                {totalItems > 0 && viewMode === 'month' && <span className="text-[7px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">{totalItems}</span>}
                                            </div>
                                        </div>

                                        {/* Daily Macros Summary (New Premium Feature) */}
                                        {viewMode !== 'month' && (
                                            <div className="hidden md:flex flex-col items-end opacity-60 group-hover/day:opacity-100 transition-opacity">
                                                <div className="flex gap-2 text-[8px] font-black uppercase tracking-tighter">
                                                    <span className="text-blue-600">{Math.round(Object.values(dayPlan).flat().reduce((s, r) => s + (r.macros?.protein || 0), 0))}g P</span>
                                                    <span className="text-orange-600">{Math.round(Object.values(dayPlan).flat().reduce((s, r) => s + (r.macros?.carbs || 0), 0))}g C</span>
                                                    <span className="text-emerald-600">{Math.round(Object.values(dayPlan).flat().reduce((s, r) => s + (r.macros?.fat || 0), 0))}g G</span>
                                                </div>
                                                <div className="mt-1 flex gap-1 items-center">
                                                    <Flame className="w-2.5 h-2.5 text-orange-400" />
                                                    <span className="text-[9px] font-black text-gray-400">{Math.round(Object.values(dayPlan).flat().reduce((s, r) => s + (r.calories || 0), 0))} Kcal</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="relative">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setOpenDayMenuId(openDayMenuId === dateKey ? null : dateKey); }}
                                                className={`p-1 rounded-lg text-gray-200 hover:text-gray-500 hover:bg-gray-50 transition-all opacity-0 group-hover/day:opacity-100 ${openDayMenuId === dateKey ? '!opacity-100 bg-gray-100 text-gray-500' : ''}`}
                                            >
                                                <MoreHorizontal className="w-3.5 h-3.5" />
                                            </button>
                                            {openDayMenuId === dateKey && (
                                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-1 w-28 z-50 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => handleCopyDay(dateKey)} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-gray-50 text-[10px] font-bold text-gray-600 flex items-center gap-2"><Copy className="w-3 h-3" /> Copiar</button>
                                                    {copiedDay && <button onClick={() => handlePasteDay(dateKey)} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-[10px] font-bold text-emerald-600 flex items-center gap-2"><ClipboardPaste className="w-3 h-3" /> Pegar</button>}
                                                    <button onClick={() => handleClearDay(dateKey)} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-[10px] font-bold text-red-600 flex items-center gap-2"><Trash2 className="w-3 h-3" /> Limpiar</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {(['breakfast', 'lunch', 'dinner'] as MealTime[]).map(meal => {
                                        const mealCfg = MEAL_CONFIG[meal];
                                        const mealColors = MEAL_COLORS[meal];
                                        const items = dayPlan[meal] || [];
                                        const sortedIndices = items.map((_, i) => i).sort((a, b) => {
                                            const typeA = items[a].courseType || 'MAIN';
                                            const typeB = items[b].courseType || 'MAIN';
                                            return COURSE_ORDER.indexOf(typeA) - COURSE_ORDER.indexOf(typeB);
                                        });
                                        const isDropTarget = dragOverSlot?.date === dateKey && dragOverSlot?.meal === meal;

                                        if (viewMode === 'month' && items.length === 0) return null;

                                        return (
                                            <div
                                                key={meal}
                                                onDragOver={(e) => handleDragOver(e, dateKey, meal)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, dateKey, meal)}
                                                className={`grow shrink-0 rounded-2xl border flex flex-col gap-1.5 transition-all duration-200 relative group/slot
                                                    ${viewMode === 'month' ? 'min-h-[36px] p-1.5' : 'min-h-[130px] p-2.5'}
                                                    ${isDropTarget
                                                        ? `${mealColors.dropBg} ${mealColors.dropBorder} border-2 shadow-md scale-[1.01]`
                                                        : items.length === 0
                                                            ? 'bg-gray-50/60 border-dashed border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                            : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
                                                    }`}
                                            >
                                                {/* Meal label */}
                                                {viewMode !== 'month' && (
                                                    <div className={`flex items-center gap-1 px-1 ${items.length > 0 ? mealColors.text : 'text-gray-300'} transition-colors group-hover/slot:${mealColors.text}`}>
                                                        {mealCfg.icon}
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">{mealCfg.label}</span>
                                                    </div>
                                                )}

                                                {sortedIndices.map((originalIndex) => {
                                                    const recipe = items[originalIndex];
                                                    return (
                                                        <div
                                                            key={`${recipe.id}-${originalIndex}`}
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, recipe, { date: dateKey, meal, index: originalIndex })}
                                                            onDragEnd={handleDragEnd}
                                                            className={`bg-white rounded-xl border border-gray-100 group relative cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-[1.02] transition-all select-none
                                                                ${draggingItem?.date === dateKey && draggingItem?.meal === meal && draggingItem?.index === originalIndex ? 'opacity-20 grayscale border-dashed border-emerald-300 scale-95' : ''}
                                                                ${viewMode === 'month' ? 'p-1' : 'p-2'}
                                                            `}
                                                        >
                                                            <div className="flex gap-2 items-center" onClick={() => handleRecipeClick(recipe)} style={{ cursor: 'pointer' }}>
                                                                {viewMode !== 'month' && (
                                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden shrink-0 shadow-sm ring-1 ring-gray-100">
                                                                        {loadingRecipeId === recipe.id ? (
                                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100/50"><Loader2 className="w-4 h-4 animate-spin text-emerald-500" /></div>
                                                                        ) : (
                                                                            <img src={recipe.image || DEFAULT_FOOD_IMG} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    {viewMode !== 'month' && (
                                                                        <span className={`text-[7px] font-black px-1 py-0.5 rounded-md uppercase tracking-widest ${recipe.courseType === 'STARTER' ? 'bg-blue-50 text-blue-500' : recipe.courseType === 'DESSERT' ? 'bg-pink-50 text-pink-500' : 'bg-gray-50 text-gray-400'}`}>
                                                                            {COURSE_LABELS[recipe.courseType || 'MAIN']}
                                                                        </span>
                                                                    )}
                                                                    <h5 className={`font-black text-gray-800 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors mt-1 ${viewMode === 'month' ? 'text-[9px]' : 'text-[13px] tracking-tight'}`}>{recipe.name}</h5>
                                                                </div>
                                                            </div>

                                                            {/* Context Menu */}
                                                            {viewMode !== 'month' && (
                                                                <div className="absolute top-2 right-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === `${dateKey}-${meal}-${originalIndex}` ? null : `${dateKey}-${meal}-${originalIndex}`); }}
                                                                        className="p-1 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                                                                    >
                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                    </button>

                                                                    {openMenuId === `${dateKey}-${meal}-${originalIndex}` && (
                                                                        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 w-32 z-50 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                                                                            <div className="flex gap-1 mb-1 p-1 bg-gray-50 rounded-lg justify-center">
                                                                                <button title="1er Plato" onClick={() => updateCourseType(dateKey, meal, originalIndex, 'STARTER')} className={`w-4 h-4 rounded-full border ${recipe.courseType === 'STARTER' ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`} />
                                                                                <button title="2º Plato" onClick={() => updateCourseType(dateKey, meal, originalIndex, 'MAIN')} className={`w-4 h-4 rounded-full border ${recipe.courseType === 'MAIN' ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'}`} />
                                                                                <button title="Postre" onClick={() => updateCourseType(dateKey, meal, originalIndex, 'DESSERT')} className={`w-4 h-4 rounded-full border ${recipe.courseType === 'DESSERT' ? 'bg-pink-500 border-pink-500' : 'bg-white border-gray-300'}`} />
                                                                            </div>
                                                                            <button onClick={() => { handleRecipeClick(recipe); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-[10px] font-bold text-gray-600 flex items-center gap-2"><BookOpen className="w-3 h-3" /> Ver</button>
                                                                            <button onClick={() => { removeRecipeFromPlan(dateKey, meal, originalIndex); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-[10px] font-bold text-red-600 flex items-center gap-2"><Trash2 className="w-3 h-3" /> Eliminar</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {/* QUICK ADD BUTTON - Hide in month view to save space */}
                                                {viewMode !== 'month' && (
                                                    <button
                                                        onClick={() => setQuickAddTarget({ date: dateKey, meal })}
                                                        className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-2 flex items-center justify-center gap-2 text-gray-300 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all opacity-0 group-hover/slot:opacity-100 mt-auto"
                                                    >
                                                        <PlusCircle className="w-4 h-4" /> <span className="text-[9px] font-black uppercase tracking-widest">Añadir</span>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {isRecipeDrawerOpen && (
                    <div className="w-80 bg-white border-l border-gray-100 p-6 flex flex-col gap-4 shadow-xl shrink-0 animate-slide-up">
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-black text-gray-900 text-lg tracking-tight">Recetario</h3>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar receta..."
                                value={recipeSearch}
                                onChange={(e) => setRecipeSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                            {recipes.filter(r => r.name.toLowerCase().includes(recipeSearch.toLowerCase())).map(recipe => (
                                <div
                                    key={recipe.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, recipe)}
                                    className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing flex items-center gap-3 transition-all hover:-translate-y-1"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                        <img src={recipe.image || DEFAULT_FOOD_IMG} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{recipe.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{recipe.prepTime}m • {recipe.calories}kcal</p>
                                    </div>
                                    <GripVertical className="w-4 h-4 text-gray-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {
                isAiMenuOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                                    <Wand2 className="w-6 h-6 text-purple-600" /> Planificador IA
                                </h3>
                                <button onClick={() => setIsAiMenuOpen(false)} className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-full"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <p className="text-xs font-medium text-gray-500 leading-relaxed">Crea un plan personalizado basado en tus objetivos y despensa.</p>

                                {/* Course Selection */}
                                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                    <label className="block text-[10px] font-black text-purple-700 uppercase tracking-[0.2em] mb-3">Estilo de Menú</label>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-700">Platos en Almuerzo</span>
                                            <div className="flex bg-white rounded-lg border border-purple-200 p-0.5">
                                                {[1, 2].map(n => (
                                                    <button key={n} onClick={() => setAiCourses(prev => ({ ...prev, lunch: n }))} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${aiCourses.lunch === n ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-purple-600'}`}>
                                                        {n === 1 ? 'Único' : '1º y 2º'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-700">Platos en Cena</span>
                                            <div className="flex bg-white rounded-lg border border-purple-200 p-0.5">
                                                {[1, 2].map(n => (
                                                    <button key={n} onClick={() => setAiCourses(prev => ({ ...prev, dinner: n }))} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${aiCourses.dinner === n ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-purple-600'}`}>
                                                        {n === 1 ? 'Único' : '1º y 2º'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Duración</label>
                                    <div className="flex gap-2">
                                        {[3, 7, 30].map(days => (
                                            <button key={days} onClick={() => setAiCriteria({ ...aiCriteria, days })} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${aiCriteria.days === days ? 'bg-purple-600 text-white border-purple-600 shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:bg-purple-50'}`}>{days} Días</button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Comidas a incluir</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setAiMealTypes(prev => ({ ...prev, breakfast: !prev.breakfast }))} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 flex flex-col items-center justify-center gap-2 transition-all ${aiMealTypes.breakfast ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}><Coffee className="w-5 h-5" /> Desayuno</button>
                                        <button onClick={() => setAiMealTypes(prev => ({ ...prev, lunch: !prev.lunch }))} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 flex flex-col items-center justify-center gap-2 transition-all ${aiMealTypes.lunch ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}><Sunset className="w-5 h-5" /> Almuerzo</button>
                                        <button onClick={() => setAiMealTypes(prev => ({ ...prev, dinner: !prev.dinner }))} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 flex flex-col items-center justify-center gap-2 transition-all ${aiMealTypes.dinner ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}><Moon className="w-5 h-5" /> Cena</button>
                                    </div>
                                </div>

                                {(['diet', 'goal', 'difficulty'] as const).map((optionKey) => {
                                    const options = AI_OPTIONS[optionKey] || {};
                                    return (
                                        <div key={optionKey}>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                                {optionKey === 'diet' ? 'Dieta' : optionKey === 'goal' ? 'Objetivo' : 'Dificultad'}
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.keys(options).map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => setAiCriteria({ ...aiCriteria, [optionKey]: opt })}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${aiCriteria[optionKey as keyof typeof aiCriteria] === opt ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:bg-purple-50'}`}
                                                    >
                                                        {options[opt][language as Language] || options[opt]['EN']}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}

                                <button
                                    type="button"
                                    onClick={handleGenerateMenu}
                                    disabled={aiGenerating || (!aiMealTypes.breakfast && !aiMealTypes.lunch && !aiMealTypes.dinner)}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {aiGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                                    {aiGenerating ? aiStatus : 'Generar Plan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {quickAddTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setQuickAddTarget(null)}>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-gray-100 bg-white">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <PlusCircle className="w-5 h-5 text-emerald-600" /> Añadir a {quickAddTarget.meal === 'breakfast' ? 'Desayuno' : quickAddTarget.meal === 'lunch' ? 'Almuerzo' : 'Cena'}
                            </h3>
                            <div className="mt-4 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Buscar en tus recetas..."
                                    value={quickAddSearch}
                                    onChange={(e) => setQuickAddSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                            {recipes.filter(r => r.name.toLowerCase().includes(quickAddSearch.toLowerCase())).map(recipe => (
                                <button
                                    key={recipe.id}
                                    onClick={() => handleQuickAddRecipe(recipe)}
                                    className="w-full text-left bg-white p-3 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 flex items-center gap-3 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                        <img src={recipe.image || DEFAULT_FOOD_IMG} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xs font-bold text-gray-900">{recipe.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{recipe.calories} kcal • {recipe.prepTime} min</p>
                                    </div>
                                    <Plus className="w-4 h-4 text-gray-300 group-hover:text-emerald-600" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
