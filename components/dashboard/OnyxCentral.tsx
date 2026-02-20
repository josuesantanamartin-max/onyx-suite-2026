import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUserStore } from '../../store/useUserStore';
import { useLifeStore } from '../../store/useLifeStore';
import {
    Plus, Settings, Calendar as CalendarIcon,
    Home, Wallet, Heart, ShoppingCart, Utensils,
    ArrowRight, TrendingUp, TrendingDown, Clock,
    Sparkles, AlertTriangle, Zap, Coffee, Sunset, Moon, Activity,
    ChevronLeft, ChevronRight, PieChart as PieChartIcon, Loader2, X,
    GripVertical, ArrowUp, ArrowDown, LayoutDashboard, Search,
    CheckCircle2, Eye, EyeOff, ListFilter
} from 'lucide-react';

import { analyzeFinances } from '../../services/geminiService';

// Widget Architecture
import { WIDGET_REGISTRY, WIDGET_CONFIG, DashboardDataProps, getColSpanClass } from './WidgetRegistry';
import SmartInsightWidget from './SmartInsightWidget';

// Widget category mapping (inline to avoid import issues)
const WIDGET_CATEGORIES: Record<string, 'FINANCE' | 'LIFE'> = {
    'NET_WORTH': 'FINANCE',
    'MONTHLY_FLOW': 'FINANCE',
    'CATEGORY_CHART': 'FINANCE',
    'EXPLORER': 'FINANCE',
    'ACTIVE_GOALS': 'FINANCE',
    'ACTIVE_DEBTS': 'FINANCE',
    'SPENDING_FORECAST': 'FINANCE',
    'BUDGET_STATUS': 'FINANCE',
    'PROJECTION_WIDGET': 'FINANCE',
    'TIMELINE_EVOLUTION': 'FINANCE',
    'FINANCIAL_HEALTH': 'FINANCE',
    'UPCOMING_PAYMENTS': 'FINANCE',
    'ANNUAL_COMPARISON': 'FINANCE',
    'MONTHLY_GOALS': 'FINANCE',
    'ACCOUNTS_SUMMARY': 'FINANCE',
    'TODAY_MENU': 'LIFE',
    'SHOPPING_LIST': 'LIFE',
    'SHOPPING_LIST_FULL': 'LIFE',
    'FAMILY_AGENDA': 'LIFE',
    'RECIPE_FAVORITES': 'LIFE',
    'WEEKLY_PLAN': 'LIFE',
    'UPCOMING_TRIPS': 'LIFE',
    'FAMILY_TASKS': 'LIFE',
    'CRITICAL_INVENTORY': 'LIFE',
};

const GREETINGS = {
    morning: { text: 'Buenos días', sub: 'Comienza tu día con éxito.', icon: Coffee },
    afternoon: { text: 'Buenas tardes', sub: 'Mantén el ritmo de hoy.', icon: Sunset },
    evening: { text: 'Buenas noches', sub: 'Revisa tus logros de hoy.', icon: Moon },
};

type CategoryFilter = 'ALL' | 'FINANCE' | 'LIFE';

const OnyxCentral: React.FC = () => {
    const [isEditingLayout, setIsEditingLayout] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Time navigation state
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
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const greeting = GREETINGS[timeOfDay];

    // --- Time Navigation ---
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

    // --- Calculations ---
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

    const handleFilterByCategory = (category: string, subCategory?: string) => {
        setActiveApp('finance');
        setFinanceActiveTab('transactions');
    };

    // --- Widget management ---
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
        const sorted = [...dashboardWidgets].sort((a, b) => a.order - b.order);
        const index = sorted.findIndex(w => w.id === id);
        if (index === -1) return;

        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= sorted.length) return;

        const newWidgets = sorted.map(w => ({ ...w }));
        const tempOrder = newWidgets[index].order;
        newWidgets[index].order = newWidgets[swapIndex].order;
        newWidgets[swapIndex].order = tempOrder;

        setDashboardWidgets(newWidgets);
    };

    // Widgets not yet visible — shown in the panel
    const hiddenWidgets = useMemo(() => {
        return dashboardWidgets
            .filter(w => !w.visible)
            .filter(w => {
                const cat = WIDGET_CATEGORIES[w.id];
                if (categoryFilter === 'ALL') return true;
                return cat === categoryFilter;
            })
            .filter(w => {
                if (!searchQuery) return true;
                const label = WIDGET_CONFIG[w.id]?.label || w.id;
                return label.toLowerCase().includes(searchQuery.toLowerCase());
            });
    }, [dashboardWidgets, categoryFilter, searchQuery]);

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

    const visibleSorted = sortedWidgets.filter(w => w.visible);

    return (
        <div className="h-full overflow-y-auto custom-scrollbar pb-32">

            {/* ─── EDIT MODE BANNER ──────────────────────────────────────────── */}
            {isEditingLayout && (
                <div className="sticky top-0 z-40 flex items-center justify-between gap-4 px-6 py-3 bg-indigo-primary text-white shadow-lg animate-fade-in-up">
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-4 h-4 opacity-80" />
                        <span className="text-sm font-bold tracking-wide">Modo Edición Activo</span>
                        <span className="hidden sm:inline text-xs opacity-70">· Usa las flechas para reordenar, o el botón × para ocultar un widget</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditingLayout(false)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Listo
                        </button>
                    </div>
                </div>
            )}

            <div className="p-6 md:p-10">

                {/* ─── HEADER ────────────────────────────────────────────────── */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-primary font-bold text-xs uppercase tracking-widest mb-1.5">
                            <greeting.icon className="w-4 h-4" />
                            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                        <h1 className="text-4xl font-black text-onyx-950 tracking-tight dark:text-white">Onyx Central</h1>
                        <p className="text-sm font-medium text-onyx-400 mt-1">{greeting.text}, Josué. {greeting.sub}</p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center gap-2">
                            {/* Time Mode Toggle */}
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

                            {/* Date Navigator */}
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
                            {/* Theme Toggle */}
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-3 rounded-2xl bg-white dark:bg-onyx-900 text-onyx-400 hover:text-onyx-900 dark:text-onyx-500 dark:hover:text-onyx-200 border border-onyx-100 dark:border-onyx-800 shadow-sm transition-all"
                                title="Cambiar Tema"
                            >
                                {theme === 'dark' ? <Sunset className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {/* Edit Layout Toggle */}
                            <button
                                onClick={() => { setIsEditingLayout(!isEditingLayout); setSearchQuery(''); }}
                                className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${isEditingLayout
                                    ? 'bg-indigo-primary text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-white dark:bg-onyx-900 text-onyx-500 hover:text-onyx-900 dark:text-onyx-400 dark:hover:text-onyx-200 border border-onyx-100 dark:border-onyx-800 shadow-sm'
                                    }`}
                                title="Organizar Dashboard"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="hidden sm:inline">Organizar</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* ─── EDIT MODE WIDGET PANEL ────────────────────────────────── */}
                {isEditingLayout && (
                    <div className="mb-8 rounded-3xl border-2 border-dashed border-indigo-primary/30 bg-indigo-soft/30 dark:bg-indigo-900/10 overflow-hidden animate-fade-in-up">

                        {/* Panel Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-indigo-100 dark:border-indigo-900/40">
                            <div>
                                <h3 className="text-sm font-black text-indigo-primary uppercase tracking-widest">Widgets disponibles</h3>
                                <p className="text-xs text-onyx-400 mt-0.5">Haz clic en un widget para añadirlo al dashboard</p>
                            </div>

                            {/* Search */}
                            <div className="relative w-full sm:w-56">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-onyx-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Buscar widget..."
                                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-onyx-800 border border-onyx-200 dark:border-onyx-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-primary/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex gap-1 px-6 pt-4 pb-2">
                            {(['ALL', 'FINANCE', 'LIFE'] as CategoryFilter[]).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${categoryFilter === cat
                                        ? 'bg-indigo-primary text-white'
                                        : 'text-onyx-400 hover:text-onyx-700 dark:hover:text-onyx-200'
                                        }`}
                                >
                                    {cat === 'ALL' && <ListFilter className="w-3 h-3" />}
                                    {cat === 'FINANCE' && <Wallet className="w-3 h-3" />}
                                    {cat === 'LIFE' && <Heart className="w-3 h-3" />}
                                    {cat === 'ALL' ? 'Todos' : cat === 'FINANCE' ? 'Finanzas' : 'Vida'}
                                </button>
                            ))}

                            <span className="ml-auto text-xs text-onyx-400 self-center">
                                {hiddenWidgets.length} disponible{hiddenWidgets.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Widget Cards */}
                        <div className="px-6 pb-6 pt-2">
                            {hiddenWidgets.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {hiddenWidgets.map(widget => {
                                        const config = WIDGET_CONFIG[widget.id];
                                        const cat = WIDGET_CATEGORIES[widget.id];
                                        return (
                                            <button
                                                key={widget.id}
                                                onClick={() => toggleWidgetVisibility(widget.id)}
                                                className="group flex flex-col items-center gap-2.5 p-4 bg-white dark:bg-onyx-800 rounded-2xl shadow-sm hover:shadow-md border border-onyx-100 dark:border-onyx-700 hover:border-indigo-primary/40 transition-all hover:scale-[1.03]"
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${cat === 'LIFE'
                                                    ? 'bg-rose-50 dark:bg-rose-900/20 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30'
                                                    : 'bg-indigo-soft dark:bg-indigo-900/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50'
                                                    }`}>
                                                    {cat === 'LIFE'
                                                        ? <Heart className="w-5 h-5 text-rose-500" />
                                                        : <Wallet className="w-5 h-5 text-indigo-primary" />
                                                    }
                                                </div>
                                                <span className="text-xs font-bold text-onyx-700 dark:text-onyx-200 text-center leading-tight">
                                                    {config?.label || widget.id}
                                                </span>
                                                <div className="flex items-center gap-1 text-indigo-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus className="w-3 h-3" />
                                                    <span className="text-xs font-bold">Añadir</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-soft dark:bg-indigo-900/30 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-primary" />
                                    </div>
                                    <p className="text-sm font-bold text-onyx-500 dark:text-onyx-400">
                                        {searchQuery ? 'No se encontraron resultados' : 'Todos los widgets están visibles'}
                                    </p>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="text-xs text-indigo-primary hover:underline"
                                        >
                                            Limpiar búsqueda
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── MAIN CONTENT ──────────────────────────────────────────── */}
                <div className="space-y-8 max-w-7xl mx-auto">

                    {/* Smart Insights (always visible) */}
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

                    {/* Dynamic Widget Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {visibleSorted.map((widget, idx) => {
                            const WidgetComponent = WIDGET_REGISTRY[widget.id];
                            const config = WIDGET_CONFIG[widget.id];
                            const colSpan = getColSpanClass(config?.size ?? 'full');
                            const cat = WIDGET_CATEGORIES[widget.id];

                            if (!WidgetComponent) return null;

                            const isFirst = idx === 0;
                            const isLast = idx === visibleSorted.length - 1;

                            return (
                                <div
                                    key={widget.id}
                                    className={`${colSpan} relative transition-all duration-200 ${isEditingLayout
                                        ? 'rounded-3xl ring-2 ring-indigo-primary/25 ring-dashed'
                                        : ''
                                        }`}
                                >
                                    {/* Edit Mode Overlay Controls */}
                                    {isEditingLayout && (
                                        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-white/95 dark:bg-onyx-900/95 backdrop-blur-sm rounded-t-3xl border-b border-indigo-100 dark:border-indigo-900/40">
                                            {/* Widget Label + grip */}
                                            <div className="flex items-center gap-2 min-w-0">
                                                <GripVertical className="w-4 h-4 text-onyx-300 dark:text-onyx-600 flex-shrink-0" />
                                                <span className="text-xs font-bold text-onyx-500 dark:text-onyx-400 truncate">
                                                    {config.label}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex-shrink-0 ${cat === 'LIFE'
                                                    ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500'
                                                    : 'bg-indigo-soft dark:bg-indigo-900/30 text-indigo-primary'
                                                    }`}>
                                                    {cat === 'LIFE' ? 'Vida' : 'Finanzas'}
                                                </span>
                                            </div>

                                            {/* Reorder + Hide actions */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => moveWidget(widget.id, 'up')}
                                                    disabled={isFirst}
                                                    title="Subir"
                                                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-onyx-100 dark:hover:bg-onyx-800 text-onyx-400 dark:text-onyx-500 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-bold hidden sm:inline">Subir</span>
                                                </button>
                                                <button
                                                    onClick={() => moveWidget(widget.id, 'down')}
                                                    disabled={isLast}
                                                    title="Bajar"
                                                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-onyx-100 dark:hover:bg-onyx-800 text-onyx-400 dark:text-onyx-500 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-bold hidden sm:inline">Bajar</span>
                                                </button>
                                                <div className="w-px h-4 bg-onyx-200 dark:bg-onyx-700 mx-1" />
                                                <button
                                                    onClick={() => toggleWidgetVisibility(widget.id)}
                                                    title="Ocultar widget"
                                                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-onyx-400 hover:text-red-500 dark:text-onyx-500 dark:hover:text-red-400 transition-colors"
                                                >
                                                    <EyeOff className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-bold hidden sm:inline">Ocultar</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Widget Content — push down when in edit mode to make room for overlay */}
                                    <div className={isEditingLayout ? 'pt-[44px]' : ''}>
                                        <WidgetComponent {...widgetProps} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State when no widgets visible */}
                    {visibleSorted.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in-up">
                            <div className="w-16 h-16 bg-onyx-100 dark:bg-onyx-800 rounded-3xl flex items-center justify-center">
                                <LayoutDashboard className="w-8 h-8 text-onyx-300 dark:text-onyx-600" />
                            </div>
                            <div className="text-center">
                                <p className="text-base font-bold text-onyx-500 dark:text-onyx-400">No hay widgets visibles</p>
                                <p className="text-sm text-onyx-400 dark:text-onyx-500 mt-1">
                                    Activa el modo edición para añadir widgets a tu dashboard
                                </p>
                            </div>
                            <button
                                onClick={() => setIsEditingLayout(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-primary text-white rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-500/20"
                            >
                                <Plus className="w-4 h-4" />
                                Añadir widgets
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnyxCentral;
