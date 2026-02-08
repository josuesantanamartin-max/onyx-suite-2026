import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUserStore } from '../../store/useUserStore';
import { useLifeStore } from '../../store/useLifeStore';
import { Transaction } from '@/types';
import {
    Plus, Settings, Calendar as CalendarIcon,
    Home, Wallet, Heart, ShoppingCart, Utensils,
    ArrowRight, TrendingUp, TrendingDown, Clock,
    Sparkles, AlertTriangle, Zap, Coffee, Sunset, Moon, Activity,
    ChevronLeft, ChevronRight, PieChart as PieChartIcon, Loader2, X
} from 'lucide-react';

import { analyzeFinances } from '../../services/geminiService';

// Finance Widget Imports
// Widget Architecture
import { WIDGET_REGISTRY, WIDGET_CONFIG, DashboardDataProps } from './WidgetRegistry';
import SmartInsightWidget from './SmartInsightWidget';

const GREETINGS = {
    morning: { text: 'Buenos días', sub: 'Comienza tu día con éxito.', icon: Coffee },
    afternoon: { text: 'Buenas tardes', sub: 'Mantén el ritmo de hoy.', icon: Sunset },
    evening: { text: 'Buenas noches', sub: 'Revisa tus logros de hoy.', icon: Moon },
};

const OnyxCentral: React.FC = () => {
    const [isEditingLayout, setIsEditingLayout] = useState(false);

    // NEW: Time navigation state (like FinanceSummary)
    const [timeMode, setTimeMode] = useState<'MONTH' | 'YEAR'>('MONTH');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Store Data
    const { transactions, accounts, debts, goals, categories, budgets } = useFinanceStore();
    const { weeklyPlans, pantryItems, shoppingList, familyMembers } = useLifeStore();
    const { setActiveApp, setFinanceActiveTab, setLifeActiveTab, language, currency, dashboardWidgets, setDashboardWidgets, theme, setTheme } = useUserStore();

    // Navigation Handler
    const handleNavigate = (app: string, tab?: string) => {
        setActiveApp(app);
        if (app === 'finance' && tab) setFinanceActiveTab(tab);
        if (app === 'life' && tab) setLifeActiveTab(tab);
    };

    const currentMonthISO = selectedDate.toISOString().slice(0, 7);
    const hour = selectedDate.getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const greeting = GREETINGS[timeOfDay];

    // --- Time Navigation Helpers ---
    const navigateTime = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        if (timeMode === 'MONTH') {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        } else {
            newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        }
        setSelectedDate(newDate);
    };

    const getDateLabel = () => {
        if (timeMode === 'MONTH') {
            return selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        } else {
            return selectedDate.getFullYear().toString();
        }
    };

    // --- CALCULATIONS ---
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const currentPeriodTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        if (timeMode === 'YEAR') {
            return tDate.getFullYear() === year;
        } else {
            return tDate.getFullYear() === year && tDate.getMonth() === month;
        }
    });

    const monthlyIncome = currentPeriodTransactions
        .filter(t => t.type === 'INCOME' && t.category !== 'Transferencia')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const monthlyExpenses = currentPeriodTransactions
        .filter(t => t.type === 'EXPENSE' && t.category !== 'Transferencia')
        .reduce((acc, curr) => acc + curr.amount, 0);

    // NEW: Handler for category filtering from chart
    const handleFilterByCategory = (category: string, subCategory?: string) => {
        setActiveApp('finance');
        setFinanceActiveTab('transactions');
    };



    // --- DYNAMIC WIDGETS ---
    const sortedWidgets = useMemo(() => {
        return [...dashboardWidgets].sort((a, b) => a.order - b.order);
    }, [dashboardWidgets]);

    const toggleWidgetVisibility = (id: string) => {
        const newWidgets = dashboardWidgets.map(w =>
            w.id === id ? { ...w, visible: !w.visible } : w
        );
        setDashboardWidgets(newWidgets);
    };

    const moveWidget = (id: string, direction: 'up' | 'down') => {
        const index = dashboardWidgets.findIndex(w => w.id === id);
        if (index === -1) return;

        const newWidgets = [...dashboardWidgets];
        const current = newWidgets[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        if (swapIndex >= 0 && swapIndex < newWidgets.length) {
            // Swap orders
            const tempOrder = current.order;
            current.order = newWidgets[swapIndex].order;
            newWidgets[swapIndex].order = tempOrder;

            // Re-sort entire array to be safe
            newWidgets.sort((a, b) => a.order - b.order);
            setDashboardWidgets(newWidgets);
        }
    };

    const widgetProps: DashboardDataProps = {
        transactions,
        accounts,
        debts,
        goals,
        categories,
        budgets,
        monthlyIncome,
        monthlyExpenses,
        onNavigate: handleNavigate,
        selectedDate,
        timeMode,
        onFilter: handleFilterByCategory,
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-primary font-bold text-xs uppercase tracking-widest mb-1.5 focus:outline-none">
                        <greeting.icon className="w-4 h-4" /> {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <h1 className="text-4xl font-black text-onyx-950 tracking-tight dark:text-white">Onyx Central</h1>
                    <p className="text-sm font-medium text-onyx-400 mt-1">{greeting.text}, Josué. {greeting.sub}</p>
                </div>

                <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-2">
                        {/* Time Navigation */}
                        <div className="flex items-center gap-2 bg-white dark:bg-onyx-900 border border-onyx-100 dark:border-onyx-800 rounded-xl p-1 shadow-sm">
                            <button
                                onClick={() => setTimeMode('MONTH')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${timeMode === 'MONTH' ? 'bg-indigo-primary text-white' : 'text-onyx-400 hover:text-onyx-900 dark:text-onyx-500 dark:hover:text-onyx-200'}`}
                            >
                                Mes
                            </button>
                            <button
                                onClick={() => setTimeMode('YEAR')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${timeMode === 'YEAR' ? 'bg-indigo-primary text-white' : 'text-onyx-400 hover:text-onyx-900 dark:text-onyx-500 dark:hover:text-onyx-200'}`}
                            >
                                Año
                            </button>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-onyx-900 border border-onyx-100 dark:border-onyx-800 rounded-xl p-1 shadow-sm">
                            <button onClick={() => navigateTime('prev')} className="p-2 hover:bg-onyx-50 dark:hover:bg-onyx-800 rounded-lg transition-colors">
                                <ChevronLeft className="w-4 h-4 text-onyx-400" />
                            </button>
                            <span className="text-xs font-bold text-onyx-700 dark:text-onyx-200 uppercase tracking-widest px-3 min-w-[120px] text-center">
                                {getDateLabel()}
                            </span>
                            <button onClick={() => navigateTime('next')} className="p-2 hover:bg-onyx-50 dark:hover:bg-onyx-800 rounded-lg transition-colors">
                                <ChevronRight className="w-4 h-4 text-onyx-400" />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">

                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-3 rounded-2xl bg-white dark:bg-onyx-900 text-onyx-400 hover:text-onyx-900 dark:text-onyx-500 dark:hover:text-onyx-200 border border-onyx-100 dark:border-onyx-800 shadow-sm transition-all"
                            title="Cambiar Tema"
                        >
                            {theme === 'dark' ? <Sunset className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={() => setIsEditingLayout(!isEditingLayout)}
                            className={`p-3 rounded-2xl transition-all ${isEditingLayout ? 'bg-indigo-soft text-indigo-primary' : 'bg-white dark:bg-onyx-900 text-onyx-400 hover:text-onyx-900 dark:text-onyx-500 dark:hover:text-onyx-200 border border-onyx-100 dark:border-onyx-800 shadow-sm'}`}
                            title="Personalizar Dashboard"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>




            {/* Layout Editing Controls */}
            {isEditingLayout && (
                <div className="mb-8 p-6 bg-indigo-soft/50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 animate-fade-in-up">
                    <h3 className="text-sm font-black text-indigo-primary uppercase tracking-widest mb-4">Widgets Disponibles</h3>
                    <div className="flex flex-wrap gap-3">
                        {dashboardWidgets.filter(w => !w.visible).map(widget => (
                            <button
                                key={widget.id}
                                onClick={() => toggleWidgetVisibility(widget.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-onyx-800 rounded-xl shadow-sm text-xs font-bold text-onyx-600 dark:text-onyx-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                                {WIDGET_CONFIG[widget.id]?.label || widget.id}
                            </button>
                        ))}
                        {dashboardWidgets.every(w => w.visible) && (
                            <span className="text-xs text-onyx-400 italic">Todos los widgets están visibles</span>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* SMART INSIGHT WIDGET (Always Visible) */}
                <div className="animate-fade-in-up">
                    <SmartInsightWidget onNavigate={(app, tab) => {
                        if (app === 'LIFE') {
                            setActiveApp('life');
                            setLifeActiveTab(tab || 'kitchen-recipes');
                        } else if (app === 'FINANCE') {
                            setActiveApp('finance');
                            setFinanceActiveTab(tab || 'transactions');
                        }
                    }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {sortedWidgets.filter(w => w.visible).map((widget) => {
                        const WidgetComponent = WIDGET_REGISTRY[widget.id];
                        const config = WIDGET_CONFIG[widget.id] || { colSpan: 'col-span-12', label: widget.id };

                        // If widget code missing or configuration missing
                        if (!WidgetComponent) return null;

                        return (
                            <div key={widget.id} className={`${config.colSpan} relative group`}>
                                {isEditingLayout && (
                                    <div className="absolute top-4 right-4 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-onyx-800/90 backdrop-blur-sm p-1.5 rounded-xl shadow-sm border border-onyx-100 dark:border-onyx-700">
                                        <button onClick={() => moveWidget(widget.id, 'up')} className="p-1.5 hover:bg-onyx-100 dark:hover:bg-onyx-700 rounded-lg text-onyx-500">
                                            <ChevronLeft className="w-3 h-3 rotate-90" />
                                        </button>
                                        <button onClick={() => moveWidget(widget.id, 'down')} className="p-1.5 hover:bg-onyx-100 dark:hover:bg-onyx-700 rounded-lg text-onyx-500">
                                            <ChevronRight className="w-3 h-3 rotate-90" />
                                        </button>
                                        <div className="w-px h-3 bg-onyx-200 dark:bg-onyx-700 mx-1 self-center"></div>
                                        <button onClick={() => toggleWidgetVisibility(widget.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-500">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                                <WidgetComponent {...widgetProps} />
                            </div>
                        );
                    })}
                </div>
            </div>


        </div>
    );
};

export default OnyxCentral;
