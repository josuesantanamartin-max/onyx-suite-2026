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
import NetWorthCard from '../features/finance/dashboard/widgets/NetWorthCard';
import MonthlyFlowWidget from '../features/finance/dashboard/widgets/MonthlyFlowWidget';
import ActiveGoalsWidget from '../features/finance/dashboard/widgets/ActiveGoalsWidget';
import ActiveDebtsWidget from '../features/finance/dashboard/widgets/ActiveDebtsWidget';
import CategoryDistributionChart from '../features/finance/dashboard/widgets/CategoryDistributionChart';
import BudgetStatusWidget from '../features/finance/dashboard/widgets/BudgetStatusWidget';
import TransactionExplorer from '../features/finance/dashboard/widgets/TransactionExplorer';
import QuickActionsFooter from '../features/finance/dashboard/widgets/QuickActionsFooter';

const GREETINGS = {
    morning: { text: 'Buenos días', sub: 'Comienza tu día con éxito.', icon: Coffee },
    afternoon: { text: 'Buenas tardes', sub: 'Mantén el ritmo de hoy.', icon: Sunset },
    evening: { text: 'Buenas noches', sub: 'Revisa tus logros de hoy.', icon: Moon },
};

const OnyxCentral: React.FC = () => {
    const [isEditingLayout, setIsEditingLayout] = useState(false);

    // AI Analysis State
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAnalysisVisible, setIsAnalysisVisible] = useState(false);

    // NEW: Time navigation state (like FinanceSummary)
    const [timeMode, setTimeMode] = useState<'MONTH' | 'YEAR'>('MONTH');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Store Data
    const { transactions, accounts, debts, goals, categories, budgets } = useFinanceStore();
    const { weeklyPlan, pantryItems, shoppingList, familyMembers } = useLifeStore();
    const { setActiveApp, setFinanceActiveTab, setLifeActiveTab, language, currency } = useUserStore();

    // Navigation Handler
    const handleNavigate = (app: string, tab?: string) => {
        setActiveApp(app);
        if (app === 'finance' && tab) setFinanceActiveTab(tab);
        if (app === 'life' && tab) setLifeActiveTab(tab);
    };

    // NEW: Proper formatEUR with dots for thousands
    const formatEUR = (amount: number) => new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);

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

    const lowStockItems = pantryItems.filter(item => item.lowStockThreshold && item.quantity <= item.lowStockThreshold);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayMeals = weeklyPlan[todayStr] || { breakfast: [], lunch: [], dinner: [] };

    // NEW: Handler for category filtering from chart
    const handleFilterByCategory = (category: string, subCategory?: string) => {
        setActiveApp('finance');
        setFinanceActiveTab('transactions');
        // The filter will be applied via onViewTransactions or similar mechanism
    };

    const handleGeminiAnalysis = async () => {
        setIsAnalyzing(true);
        // Clean previous analysis to allow re-run effect
        setAnalysis(null);
        try {
            const result = await analyzeFinances(transactions, accounts, debts, budgets, goals, language, currency);
            setAnalysis(result);
            setIsAnalysisVisible(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 pb-32">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <div className="flex items-center gap-2 text-indigo-primary font-bold text-xs uppercase tracking-widest mb-1.5 focus:outline-none">
                        <greeting.icon className="w-4 h-4" /> {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <h1 className="text-4xl font-black text-onyx-950 tracking-tight">Onyx Central</h1>
                    <p className="text-sm font-medium text-onyx-400 mt-1">{greeting.text}, Josué. {greeting.sub}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleGeminiAnalysis} disabled={isAnalyzing} className="flex items-center gap-2 bg-onyx-950 text-white hover:bg-onyx-800 px-5 py-3 rounded-2xl transition-all shadow-lg font-bold text-sm">
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-yellow-300" />}
                        {isAnalyzing ? 'Analizando...' : 'Análisis AI'}
                    </button>
                    <button onClick={() => setIsEditingLayout(!isEditingLayout)} className={`p-3 rounded-2xl transition-all ${isEditingLayout ? 'bg-indigo-soft text-indigo-primary' : 'bg-white text-onyx-400 hover:text-onyx-900 border border-onyx-100 shadow-sm hover:shadow-md'}`}>
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="space-y-12 max-w-7xl mx-auto">

                {/* ACTIVIDAD FINANCIERA (Merged Section) */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-onyx-950 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-primary rounded-xl"><PieChartIcon className="w-5 h-5" /></div>
                            Actividad Financiera
                        </h2>
                        <div className="flex items-center gap-4">
                            {/* Time Navigation */}
                            <div className="flex items-center gap-2 bg-white border border-onyx-100 rounded-xl p-1 shadow-sm">
                                <button
                                    onClick={() => setTimeMode('MONTH')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${timeMode === 'MONTH' ? 'bg-indigo-primary text-white' : 'text-onyx-400 hover:text-onyx-900'}`}
                                >
                                    Mes
                                </button>
                                <button
                                    onClick={() => setTimeMode('YEAR')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${timeMode === 'YEAR' ? 'bg-indigo-primary text-white' : 'text-onyx-400 hover:text-onyx-900'}`}
                                >
                                    Año
                                </button>
                            </div>
                            <div className="flex items-center gap-2 bg-white border border-onyx-100 rounded-xl p-1 shadow-sm">
                                <button onClick={() => navigateTime('prev')} className="p-2 hover:bg-onyx-50 rounded-lg transition-colors">
                                    <ChevronLeft className="w-4 h-4 text-onyx-400" />
                                </button>
                                <span className="text-xs font-bold text-onyx-700 uppercase tracking-widest px-3 min-w-[120px] text-center">
                                    {getDateLabel()}
                                </span>
                                <button onClick={() => navigateTime('next')} className="p-2 hover:bg-onyx-50 rounded-lg transition-colors">
                                    <ChevronRight className="w-4 h-4 text-onyx-400" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Financial Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                        <NetWorthCard
                            accounts={accounts}
                            debts={debts}
                            monthlyIncome={monthlyIncome}
                            monthlyExpenses={monthlyExpenses}
                            onNavigate={handleNavigate}
                        />
                        <MonthlyFlowWidget
                            monthlyIncome={monthlyIncome}
                            monthlyExpenses={monthlyExpenses}
                        />
                    </div>

                    {/* MOVED: Goals and Debts */}
                    {(goals.length > 0 || debts.length > 0) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {goals.length > 0 && <ActiveGoalsWidget goals={goals} onNavigate={handleNavigate} />}
                            {debts.length > 0 && <ActiveDebtsWidget debts={debts} onNavigate={handleNavigate} />}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Category Distribution Chart - Full Width */}
                        <CategoryDistributionChart
                            transactions={transactions}
                            onNavigate={handleNavigate}
                            selectedDate={selectedDate}
                            timeMode={timeMode}
                            onFilter={handleFilterByCategory}
                        />

                        {/* Budget Status - Above Transactions */}
                        {budgets.length > 0 && (
                            <BudgetStatusWidget
                                budgets={budgets}
                                transactions={transactions}
                                currentIncome={monthlyIncome}
                                currency="EUR"
                                selectedDate={selectedDate}
                                timeMode={timeMode}
                            />
                        )}

                        {/* Transaction Explorer (Compact) - Below Budget */}
                        <TransactionExplorer
                            transactions={transactions}
                            categories={categories}
                            onNavigate={handleNavigate}
                            compact={true}
                        />
                    </div>
                </section>

                {/* 3. VIDA Y HOGAR */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-onyx-950 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Heart className="w-5 h-5" /></div>
                            Vida y Hogar
                        </h2>
                        <button onClick={() => handleNavigate('life', 'overview')} className="text-xs font-bold text-onyx-400 hover:text-emerald-600 flex items-center gap-1.5 transition-colors">
                            Gestionar Vida <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Menú del Día */}
                        <div className="lg:col-span-8 bg-white text-onyx-900 p-8 rounded-[2.5rem] relative overflow-hidden group border border-onyx-100 shadow-sm hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Plan Gourmet</p>
                                        <h3 className="text-2xl font-black tracking-tight text-onyx-950">Menú de Hoy</h3>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <Utensils className="w-5 h-5 text-emerald-600" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {[
                                        { key: 'breakfast', label: 'Desayuno', time: '08:30', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
                                        { key: 'lunch', label: 'Comida', time: '14:00', icon: Sunset, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                                        { key: 'dinner', label: 'Cena', time: '21:00', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' }
                                    ].map(meal => (
                                        <div
                                            key={meal.key}
                                            onClick={() => {
                                                const mealItem = todayMeals[meal.key as keyof typeof todayMeals]?.[0];
                                                if (mealItem) {
                                                    useLifeStore.getState().setRecipeToOpen(mealItem);
                                                    handleNavigate('life', 'kitchen-recipes');
                                                }
                                            }}
                                            className={`p-5 rounded-2xl border transition-all cursor-pointer group/item ${meal.bg} ${meal.border} hover:shadow-sm`}
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <meal.icon className={`w-4 h-4 ${meal.color}`} />
                                                <span className="text-[10px] font-black text-onyx-400 uppercase tracking-widest">{meal.time}</span>
                                            </div>
                                            <p className="text-[10px] font-black text-onyx-400 uppercase tracking-widest mb-1">{meal.label}</p>
                                            <p className="font-bold text-sm text-onyx-900 truncate group-hover/item:text-indigo-primary transition-colors">
                                                {todayMeals[meal.key as keyof typeof todayMeals]?.length > 0
                                                    ? todayMeals[meal.key as keyof typeof todayMeals][0].name
                                                    : 'No planeado'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Estado Despensa & Lista */}
                        <div className="lg:col-span-4 grid grid-cols-1 gap-6">
                            <div className={`p-6 rounded-[2.5rem] border transition-all ${lowStockItems.length > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-onyx-100 shadow-sm'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className={`text-xs font-black uppercase tracking-widest ${lowStockItems.length > 0 ? 'text-red-600' : 'text-onyx-400'}`}>Despensa</h4>
                                    <ShoppingCart className={`w-5 h-5 ${lowStockItems.length > 0 ? 'text-red-500 animate-bounce' : 'text-onyx-200'}`} />
                                </div>
                                <h3 className={`text-3xl font-black mb-1 ${lowStockItems.length > 0 ? 'text-red-600' : 'text-onyx-950'}`}>
                                    {lowStockItems.length} <span className="text-sm font-bold opacity-40">Items bajos</span>
                                </h3>
                                <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest">
                                    {shoppingList.length} artículos en la lista de compra
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-[2.5rem] border border-onyx-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-all" onClick={() => handleNavigate('life', 'kitchen-inventory')}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                                        <CalendarIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-onyx-950 text-sm">Agenda Familiar</h4>
                                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest">{familyMembers.length} miembros activos</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-onyx-200 group-hover:text-indigo-primary group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* FOOTER DE ACCIONES RÁPIDAS */}
                <QuickActionsFooter onNavigate={handleNavigate} />

            </div>

            {/* AI ANALYSIS MODAL/DRAWER */}
            {isAnalysisVisible && analysis && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsAnalysisVisible(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h3 className="text-lg font-black text-blue-950 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                {language === 'ES' ? 'Análisis Financiero IA' : 'AI Financial Analysis'}
                            </h3>
                            <button onClick={() => setIsAnalysisVisible(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/50">
                            <div
                                className="prose prose-sm prose-blue max-w-none text-gray-600 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                                dangerouslySetInnerHTML={{ __html: analysis }}
                            />
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setIsAnalysisVisible(false)} className="px-5 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors">
                                {language === 'ES' ? 'Cerrar' : 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnyxCentral;
