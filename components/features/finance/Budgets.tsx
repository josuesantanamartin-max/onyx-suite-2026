import React, { useState, useMemo, useEffect } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { Budget } from '../../../types';
import {
    PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import {
    Plus, Pencil, Trash2, X, AlertTriangle,
    ShoppingBag, Home, Car, Coffee, HeartPulse, Zap, Landmark, HelpCircle,
    Utensils, ChevronRight, Wand2, Check, RefreshCw
} from 'lucide-react';

interface BudgetsProps {
    onViewTransactions: (category: string, subCategory?: string) => void;
}

interface SmartSuggestion {
    category: string;
    subCategory?: string;
    avgSpend: number;
    incomeShare: number; // percentage 0-100
    suggestedLimit: number;
    suggestedPercentage: number;
    isSelected: boolean;
    mode: 'FIXED' | 'PERCENTAGE';
}

const Budgets: React.FC<BudgetsProps> = ({ onViewTransactions }) => {
    const {
        budgets, setBudgets,
        transactions, categories
    } = useFinanceStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Smart Budget State
    const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
    const [analysisPeriod, setAnalysisPeriod] = useState<number>(6); // Months to analyze (6 or 12)

    // Form State
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [limit, setLimit] = useState('');
    const [period, setPeriod] = useState<Budget['period']>('MONTHLY');
    const [budgetType, setBudgetType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
    const [percentage, setPercentage] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const expenseCategories = useMemo(() => categories.filter(c => c.type === 'EXPENSE'), [categories]);

    const formatEUR = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

    const isDateInRange = (dateStr: string, budget: Budget) => {
        const tDate = new Date(dateStr);
        const now = new Date();

        if (budget.period === 'CUSTOM' && budget.startDate && budget.endDate) {
            const start = new Date(budget.startDate);
            const end = new Date(budget.endDate);
            return tDate >= start && tDate <= end;
        }

        if (budget.period === 'YEARLY') {
            const budgetYear = budget.startDate ? new Date(budget.startDate).getFullYear() : now.getFullYear();
            return tDate.getFullYear() === budgetYear;
        }

        // MONTHLY
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    };

    const getSpentAmount = (budget: Budget) => {
        return transactions.filter(t => t.type === 'EXPENSE' && t.category === budget.category && (budget.subCategory ? t.subCategory === budget.subCategory : true) && isDateInRange(t.date, budget)).reduce((sum, t) => sum + t.amount, 0);
    };

    const getEffectiveLimit = (budget: Budget) => {
        if (budget.budgetType === 'PERCENTAGE' && budget.percentage) {
            const income = transactions.filter(t => t.type === 'INCOME' && isDateInRange(t.date, budget)).reduce((sum, t) => sum + t.amount, 0);
            return (income * budget.percentage) / 100;
        }
        return budget.limit;
    };

    const budgetItems = budgets.map(b => {
        const spent = getSpentAmount(b);
        const effectiveLimit = getEffectiveLimit(b);
        const percentageUsed = effectiveLimit > 0 ? (spent / effectiveLimit) * 100 : 0;
        return { ...b, spent, effectiveLimit, percentageUsed, isExceeded: spent > effectiveLimit };
    });

    // Sorting: Yearly budgets at bottom
    const sortedBudgets = [...budgetItems].sort((a, b) => {
        if (a.period === b.period) return 0;
        return a.period === 'YEARLY' ? 1 : -1;
    });

    const groupedBudgets = sortedBudgets.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof budgetItems>);

    const totalEffectiveBudget = budgetItems.reduce((sum, b) => sum + b.effectiveLimit, 0);
    const totalSpentInBudgets = budgetItems.reduce((sum, b) => sum + b.spent, 0);
    const totalPercentage = totalEffectiveBudget > 0 ? (totalSpentInBudgets / totalEffectiveBudget) * 100 : 0;

    const getCategoryIcon = (catName: string) => {
        switch (catName) {
            case 'Vivienda': return <Home className="w-5 h-5" />;
            case 'Alimentación': return <Utensils className="w-5 h-5" />;
            case 'Transporte': return <Car className="w-5 h-5" />;
            case 'Servicios': return <Zap className="w-5 h-5" />;
            case 'Ocio': return <Coffee className="w-5 h-5" />;
            case 'Salud': return <HeartPulse className="w-5 h-5" />;
            case 'Compras': return <ShoppingBag className="w-5 h-5" />;
            default: return <HelpCircle className="w-5 h-5" />;
        }
    };

    const resetForm = () => {
        setCategory(''); setSubCategory(''); setLimit(''); setPeriod('MONTHLY');
        setBudgetType('FIXED'); setPercentage(''); setStartDate(''); setEndDate('');
        setSelectedYear(new Date().getFullYear());
        setEditingId(null); setIsModalOpen(false);
    };

    const handleEditClick = (budget: Budget) => {
        setCategory(budget.category); setSubCategory(budget.subCategory || '');
        setLimit(budget.limit.toString()); setPeriod(budget.period);
        setBudgetType(budget.budgetType); setPercentage(budget.percentage?.toString() || '');
        setStartDate(budget.startDate || ''); setEndDate(budget.endDate || '');
        if (budget.period === 'YEARLY' && budget.startDate) {
            setSelectedYear(new Date(budget.startDate).getFullYear());
        }
        setEditingId(budget.id); setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let finalStart = startDate;
        let finalEnd = endDate;

        if (period === 'YEARLY') {
            finalStart = `${selectedYear}-01-01`;
            finalEnd = `${selectedYear}-12-31`;
        }

        const budgetData: any = {
            category,
            subCategory: subCategory || undefined,
            limit: parseFloat(limit) || 0,
            period,
            budgetType,
            percentage: parseFloat(percentage) || undefined,
            startDate: finalStart || undefined,
            endDate: finalEnd || undefined
        };

        if (editingId) {
            setBudgets((prev: Budget[]) => prev.map(b => b.id === editingId ? { ...budgetData, id: editingId } : b));
        } else {
            const newBudget = { ...budgetData, id: Math.random().toString(36).substr(2, 9) };
            setBudgets((prev: Budget[]) => [...prev, newBudget]);
        }
        resetForm();
    };

    const onDeleteBudget = (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
            setBudgets((prev: Budget[]) => prev.filter(b => b.id !== id));
        }
    };

    // --- SMART BUDGET ANALYZER ---
    const handleAnalyzeAndSuggest = (overridePeriod?: number) => {
        const periodToUse = overridePeriod || analysisPeriod;
        const today = new Date();
        const cutoffDate = new Date(today.getFullYear(), today.getMonth() - periodToUse, 1);

        const historyTx = transactions.filter(t => new Date(t.date) >= cutoffDate && new Date(t.date) < new Date(today.getFullYear(), today.getMonth(), 1));

        if (historyTx.length === 0) {
            setSmartSuggestions([]);
            return;
        }

        const totalIncome = historyTx.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
        const monthlyAvgIncome = totalIncome / periodToUse;

        const expenseSums: Record<string, number> = {};

        historyTx.filter(t => t.type === 'EXPENSE').forEach(t => {
            if (t.category !== 'Transferencia' && t.category !== 'Deudas') {
                const key = t.subCategory ? `${t.category}:::${t.subCategory}` : `${t.category}:::`;
                expenseSums[key] = (expenseSums[key] || 0) + t.amount;
            }
        });

        const newSuggestions: SmartSuggestion[] = [];

        Object.entries(expenseSums).forEach(([key, totalSpend]) => {
            const [cat, sub] = key.split(':::');
            const avgSpend = totalSpend / periodToUse;

            if (avgSpend < 10) return;

            const suggestedLimit = Math.ceil((avgSpend * 1.10) / 10) * 10;
            const share = monthlyAvgIncome > 0 ? (avgSpend / monthlyAvgIncome) * 100 : 0;
            const suggestedPercentage = parseFloat(share.toFixed(1));

            const exists = budgets.some(b =>
                b.category === cat &&
                (b.subCategory || '') === sub &&
                b.period === 'MONTHLY'
            );

            if (!exists) {
                newSuggestions.push({
                    category: cat,
                    subCategory: sub || undefined,
                    avgSpend,
                    incomeShare: share,
                    suggestedLimit,
                    suggestedPercentage,
                    isSelected: true,
                    mode: 'FIXED'
                });
            }
        });

        setSmartSuggestions(newSuggestions.sort((a, b) => b.avgSpend - a.avgSpend));
    };

    const handleApplySuggestions = () => {
        const selected = smartSuggestions.filter(s => s.isSelected);
        const newBudgets = selected.map(s => ({
            id: Math.random().toString(36).substr(2, 9),
            category: s.category,
            subCategory: s.subCategory,
            limit: s.mode === 'FIXED' ? s.suggestedLimit : 0,
            period: 'MONTHLY' as Budget['period'],
            budgetType: s.mode,
            percentage: s.mode === 'PERCENTAGE' ? s.suggestedPercentage : undefined
        }));
        setBudgets((prev: Budget[]) => [...prev, ...newBudgets]);
        setIsAutoModalOpen(false);
    };

    const changeAnalysisPeriod = (months: number) => {
        setAnalysisPeriod(months);
        handleAnalyzeAndSuggest(months);
    };

    useEffect(() => {
        if (isAutoModalOpen) {
            handleAnalyzeAndSuggest();
        }
    }, [isAutoModalOpen]);

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-onyx-950 tracking-tight">Presupuestos</h2>
                    <p className="text-xs font-semibold text-onyx-400 mt-2 uppercase tracking-[0.2em]">Control de Límite Inteligente</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => setIsAutoModalOpen(true)} className="flex items-center gap-2.5 bg-indigo-50 text-indigo-primary hover:bg-indigo-primary hover:text-white px-6 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-sm border border-indigo-100/50">
                        <Wand2 className="w-4 h-4" /> <span className="hidden sm:inline">Creador Inteligente</span>
                    </button>
                    <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2.5 bg-onyx-950 hover:bg-onyx-800 text-white px-6 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-onyx-950/20">
                        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Crear Límite</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1 md:col-span-2 bg-white p-10 rounded-onyx shadow-sm border border-onyx-100 flex flex-col justify-center relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-onyx-50/50 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <div className="relative z-10">
                        <p className="text-onyx-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">Gasto total bajo presupuesto</p>
                        <div className="flex items-baseline gap-4">
                            <span className="text-5xl font-bold text-onyx-950 tracking-tight">{formatEUR(totalSpentInBudgets)}</span>
                            <span className="text-sm font-bold text-onyx-300">/ {formatEUR(totalEffectiveBudget)}</span>
                        </div>
                        <div className="mt-10">
                            <div className="flex justify-between text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">
                                <span>Uso global de recursos</span>
                                <span className={totalPercentage > 90 ? 'text-red-500' : 'text-onyx-950'}>{totalPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-onyx-50 rounded-full h-2.5 overflow-hidden border border-onyx-100/30 shadow-inner">
                                <div className={`h-full rounded-full transition-all duration-1000 ease-out ${totalPercentage > 95 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-onyx-950 shadow-[0_0_12px_rgba(2,6,23,0.3)]'}`} style={{ width: `${Math.min(totalPercentage, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-10 rounded-onyx shadow-sm border border-onyx-100 flex flex-col items-center justify-center group hover:shadow-lg transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-50/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-onyx-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-6 relative z-10">Salud Global</p>
                    <div className="relative w-36 h-36 flex items-center justify-center z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'G', value: totalSpentInBudgets },
                                        { name: 'R', value: Math.max(0, totalEffectiveBudget - totalSpentInBudgets) }
                                    ]}
                                    innerRadius={45}
                                    outerRadius={65}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {[0, 1].map((_, i) => (
                                        <Cell key={i} fill={i === 0 ? '#020617' : '#F1F5F9'} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-onyx-950">{(100 - totalPercentage).toFixed(0)}%</span>
                            <span className="text-[8px] font-bold text-onyx-300 uppercase tracking-widest mt-1">Disp.</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-600 mt-6 uppercase tracking-[0.15em] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50 z-10">Estado Saludable</p>
                </div>
            </div>


            <div className="space-y-8 mt-12">
                {Object.keys(groupedBudgets).sort().map(catName => {
                    const categoryItems = groupedBudgets[catName];
                    const generalBudget = categoryItems.find(b => !b.subCategory);
                    const listItems = categoryItems.filter(b => b.subCategory);

                    const totalCatSpent = categoryItems.reduce((acc, item) => acc + item.spent, 0);
                    const totalCatLimit = categoryItems.reduce((acc, item) => acc + item.effectiveLimit, 0);
                    const catPercentage = totalCatLimit > 0 ? (totalCatSpent / totalCatLimit) * 100 : 0;

                    return (
                        <div key={catName} className="bg-white rounded-onyx shadow-sm border border-onyx-100 overflow-hidden hover:shadow-xl transition-all duration-500 group/cat">
                            <div className="p-8 bg-white border-b border-onyx-50 flex flex-col sm:flex-row justify-between items-center gap-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-onyx-50/50 to-transparent opacity-0 group-hover/cat:opacity-100 transition-opacity"></div>
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="p-5 bg-onyx-50 text-onyx-950 rounded-2xl shadow-inner group-hover/cat:bg-indigo-50 group-hover/cat:text-indigo-primary transition-colors">{getCategoryIcon(catName)}</div>
                                    <div>
                                        <h3 className="text-2xl font-bold tracking-tight text-onyx-950 flex items-center gap-3">
                                            {catName}
                                            {generalBudget && (
                                                <button
                                                    onClick={() => handleEditClick(generalBudget)}
                                                    className="p-2 bg-onyx-50/50 text-onyx-400 hover:text-indigo-primary hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                                    title="Editar Presupuesto Global"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </h3>
                                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mt-2">
                                            {categoryItems.length} {categoryItems.length === 1 ? 'Límite Activo' : 'Límites Activos'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right relative z-10">
                                    <p className={`text-4xl font-bold tracking-tight ${totalCatSpent > totalCatLimit ? 'text-red-500' : 'text-onyx-950'}`}>{formatEUR(totalCatSpent)}</p>
                                    <div className="mt-2 flex items-center justify-end gap-3">
                                        {generalBudget && generalBudget.budgetType === 'PERCENTAGE' ? (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
                                                <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-widest">AUTO {generalBudget.percentage}%</span>
                                                <span className="text-[9px] text-onyx-300 font-bold">• ~{formatEUR(totalCatLimit)}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest">Límite {formatEUR(totalCatLimit)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="px-10 py-3 bg-onyx-50/30">
                                <div className="w-full bg-onyx-100 rounded-full h-1.5 overflow-hidden border border-onyx-200/20">
                                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${totalCatSpent > totalCatLimit ? 'bg-red-500' : 'bg-onyx-950'}`} style={{ width: `${Math.min(catPercentage, 100)}%` }}></div>
                                </div>
                            </div>

                            <div className="divide-y divide-onyx-50">
                                {listItems.length > 0 ? listItems.map(item => (
                                    <div key={item.id} className="p-8 hover:bg-onyx-50/40 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between group/item gap-6">
                                        <div className="flex items-center gap-6 flex-1 w-full">
                                            <div className={`w-1.5 h-12 rounded-full shrink-0 transition-all duration-500 ${item.isExceeded ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] scale-y-110' : 'bg-onyx-100 group-hover/item:bg-indigo-300'}`}></div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="font-bold text-onyx-950 text-base group-hover/item:text-indigo-primary transition-colors">{item.subCategory}</span>
                                                    {item.budgetType === 'PERCENTAGE' && <span className="text-[8px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-bold border border-indigo-100 uppercase tracking-widest">AUTO {item.percentage}%</span>}
                                                    <span className={`text-[8px] px-2 py-1 rounded-md font-bold border uppercase tracking-widest ${item.period === 'YEARLY' ? 'bg-onyx-950 text-white border-onyx-950' : 'bg-white text-onyx-400 border-onyx-200'
                                                        }`}>
                                                        {item.period === 'YEARLY' ? 'ANUAL' : item.period === 'CUSTOM' ? 'PERSONALIZADO' : 'MENSUAL'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 w-full max-w-sm">
                                                    <div className="flex-1 bg-onyx-100 rounded-full h-1.5 overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${item.isExceeded ? 'bg-red-500' : 'bg-onyx-400 group-hover/item:bg-indigo-400'}`} style={{ width: `${Math.min(item.percentageUsed, 100)}%` }}></div>
                                                    </div>
                                                    <span className={`text-[10px] font-bold w-10 text-right ${item.isExceeded ? 'text-red-500' : 'text-onyx-400'}`}>{item.percentageUsed.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-10 w-full sm:w-auto">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-onyx-950 tracking-tight">{formatEUR(item.spent)}</div>
                                                <div className="text-[10px] font-bold text-onyx-300 uppercase tracking-widest mt-1">Límite {formatEUR(item.effectiveLimit)}</div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 translate-x-4 group-hover/item:translate-x-0 transition-all duration-300">
                                                <button onClick={() => onViewTransactions(item.category, item.subCategory)} className="p-3 bg-white text-onyx-400 hover:text-indigo-primary hover:shadow-md border border-onyx-100 rounded-xl transition-all"><RefreshCw className="w-4 h-4" /></button>
                                                <button onClick={() => handleEditClick(item)} className="p-3 bg-white text-onyx-400 hover:text-onyx-950 hover:shadow-md border border-onyx-100 rounded-xl transition-all"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => onDeleteBudget(item.id)} className="p-3 bg-white text-onyx-400 hover:text-red-600 hover:shadow-md border border-onyx-100 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-6 text-center text-[11px] font-bold text-onyx-200 uppercase tracking-[0.2em] italic bg-onyx-50/20">
                                        Presupuesto global aplicado
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>


            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-onyx-950/40 backdrop-blur-md p-4 animate-fade-in text-onyx-950">
                    <div className="bg-white rounded-onyx shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col border border-onyx-100 relative shadow-indigo-500/10">
                        <div className="bg-white px-10 py-8 flex justify-between items-center border-b border-onyx-50 sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight flex items-center gap-4">
                                    <div className="p-3 rounded-xl shadow-sm bg-indigo-50 text-indigo-primary">
                                        {editingId ? <Pencil className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                                    </div>
                                    {editingId ? 'Editar Límite' : 'Nuevo Límite'}
                                </h3>
                                <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mt-2 ml-16">Planificación de control de gastos</p>
                            </div>
                            <button onClick={resetForm} className="text-onyx-400 hover:text-onyx-950 transition-all p-2.5 hover:bg-onyx-50 rounded-xl">
                                <X className="w-7 h-7" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Categoría de Gasto</label>
                                    <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-onyx-950 transition-all focus:bg-white focus:ring-4 focus:ring-indigo-primary/5 outline-none shadow-inner cursor-pointer">
                                        <option value="">Seleccionar categoría...</option>
                                        {expenseCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Subcategoría (Opcional)</label>
                                    <select value={subCategory} onChange={e => setSubCategory(e.target.value)} disabled={!category} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-onyx-950 disabled:opacity-40 transition-all focus:bg-white focus:ring-4 focus:ring-indigo-primary/5 outline-none shadow-inner cursor-pointer">
                                        <option value="">Global (Toda la categoría)</option>
                                        {expenseCategories.find(c => c.name === category)?.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Ciclo del Periodo</label>
                                    <select value={period} onChange={e => setPeriod(e.target.value as any)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-onyx-950 transition-all focus:bg-white focus:ring-4 focus:ring-indigo-primary/5 outline-none shadow-inner cursor-pointer">
                                        <option value="MONTHLY">Mensual</option>
                                        <option value="YEARLY">Anual</option>
                                        <option value="CUSTOM">Personalizado</option>
                                    </select>
                                </div>

                                {period === 'YEARLY' ? (
                                    <div>
                                        <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Año Fiscal</label>
                                        <input type="number" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-onyx-950 transition-all focus:bg-white focus:ring-4 focus:ring-indigo-primary/5 outline-none shadow-inner" />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Metodología</label>
                                        <select value={budgetType} onChange={e => setBudgetType(e.target.value as any)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-onyx-950 transition-all focus:bg-white focus:ring-4 focus:ring-indigo-primary/5 outline-none shadow-inner cursor-pointer">
                                            <option value="FIXED">Importe Fijo (€)</option>
                                            <option value="PERCENTAGE">Porcentual (%)</option>
                                        </select>
                                    </div>
                                )}

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">{budgetType === 'FIXED' ? 'Límite de Gasto (€)' : 'Afectación a Ingresos (%)'}</label>
                                    <div className="relative group/input">
                                        <input required type="number" step={budgetType === 'PERCENTAGE' ? "0.1" : "1"} value={budgetType === 'FIXED' ? limit : percentage} onChange={e => budgetType === 'FIXED' ? setLimit(e.target.value) : setPercentage(e.target.value)} className="w-full p-6 bg-onyx-50 border border-onyx-100 rounded-3xl font-bold text-4xl text-onyx-950 focus:bg-white focus:ring-4 focus:ring-indigo-primary/5 outline-none transition-all text-center shadow-inner" />
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-onyx-300 font-bold text-2xl group-focus-within/input:text-indigo-primary transition-colors">{budgetType === 'FIXED' ? '€' : '%'}</div>
                                    </div>
                                </div>

                                {period === 'CUSTOM' && (
                                    <>
                                        <div>
                                            <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Fecha Inicio</label>
                                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-onyx-950 outline-none shadow-inner" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Fecha Fin</label>
                                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-onyx-950 outline-none shadow-inner" />
                                        </div>
                                    </>
                                )}
                            </div>
                            <button type="submit" className="w-full bg-onyx-950 hover:bg-onyx-800 text-white py-6 rounded-3xl font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-onyx-950/20 transition-all active:scale-95 group relative overflow-hidden">
                                <span className="relative z-10">{editingId ? 'Guardar Cambios' : 'Activar Límite de Gasto'}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-primary/0 via-white/5 to-indigo-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            </button>
                        </form>
                    </div>
                </div>
            )}


            {/* Smart Budget Creator Modal */}
            {isAutoModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-onyx-950/40 backdrop-blur-md p-4 animate-fade-in text-onyx-950">
                    <div className="bg-white rounded-onyx shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-onyx-100 relative shadow-indigo-500/10">
                        <div className="bg-white px-10 py-8 flex justify-between items-center border-b border-onyx-50 sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight flex items-center gap-4">
                                    <div className="p-3 rounded-xl shadow-sm bg-indigo-50 text-indigo-primary">
                                        <Wand2 className="w-6 h-6" />
                                    </div>
                                    Asistente de Presupuesto
                                </h3>
                                <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mt-2 ml-16">Optimización mediante patrones de gasto</p>
                            </div>
                            <button onClick={() => setIsAutoModalOpen(false)} className="text-onyx-400 hover:text-onyx-950 transition-all p-2.5 hover:bg-onyx-50 rounded-xl">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 bg-onyx-50/10 custom-scrollbar">
                            <div className="flex justify-center mb-12">
                                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-onyx-100 flex gap-2">
                                    <button onClick={() => changeAnalysisPeriod(6)} className={`px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${analysisPeriod === 6 ? 'bg-onyx-950 text-white shadow-lg' : 'text-onyx-400 hover:text-onyx-950'}`}>Últimos 6 Meses</button>
                                    <button onClick={() => changeAnalysisPeriod(12)} className={`px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${analysisPeriod === 12 ? 'bg-onyx-950 text-white shadow-lg' : 'text-onyx-400 hover:text-onyx-950'}`}>Año Completo</button>
                                </div>
                            </div>

                            {smartSuggestions.length === 0 ? (
                                <div className="text-center py-24 text-onyx-400 flex flex-col items-center">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-onyx-50 rounded-full animate-ping opacity-20"></div>
                                        <RefreshCw className="w-12 h-12 absolute inset-0 m-auto animate-spin-slow opacity-20" />
                                        <Wand2 className="w-6 h-6 absolute inset-0 m-auto text-indigo-primary" />
                                    </div>
                                    <p className="font-bold text-lg mt-10 text-onyx-950 tracking-tight">Analizando flujos monetarios...</p>
                                    <p className="text-[10px] mt-2 text-onyx-400 font-bold uppercase tracking-widest">Extrayendo inteligencia financiera de {analysisPeriod} meses</p>
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto space-y-12">
                                    <div className="bg-indigo-primary text-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 flex items-start gap-8 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-48 h-full bg-white/5 skew-x-12 translate-x-10"></div>
                                        <div className="p-4 bg-white/10 rounded-2xl shrink-0"><Check className="w-7 h-7" /></div>
                                        <div>
                                            <h4 className="font-bold text-xl mb-3 tracking-tight">Cálculo de sugestiones completado</h4>
                                            <p className="text-indigo-50 leading-relaxed font-semibold opacity-80 text-sm">
                                                Hemos detectado patrones recurrentes en tu economía. Selecciona los límites que deseas aplicar para consolidar tu salud financiera.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest border-b border-onyx-100 pb-3">Sugerencias para activar ({smartSuggestions.filter(s => s.isSelected).length})</p>
                                        <div className="grid grid-cols-1 gap-4">
                                            {smartSuggestions.map((s, idx) => (
                                                <div key={`${s.category}-${s.subCategory || 'main'}`} className={`bg-white p-8 rounded-3xl border transition-all duration-500 overflow-hidden group/item ${s.isSelected ? 'border-indigo-200 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-50/50' : 'border-onyx-100 opacity-50 grayscale hover:opacity-75'}`}>
                                                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                                        <div className="flex items-center gap-6 flex-1 w-full">
                                                            <div className="relative">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={s.isSelected}
                                                                    onChange={() => {
                                                                        const newSuggestions = [...smartSuggestions];
                                                                        newSuggestions[idx].isSelected = !newSuggestions[idx].isSelected;
                                                                        setSmartSuggestions(newSuggestions);
                                                                    }}
                                                                    className="w-8 h-8 rounded-xl text-indigo-primary focus:ring-4 focus:ring-indigo-primary/10 cursor-pointer border-onyx-200 transition-all checked:scale-110"
                                                                />
                                                            </div>
                                                            <div className={`p-4 rounded-2xl shadow-inner transition-colors ${s.isSelected ? 'bg-indigo-50 text-indigo-primary' : 'bg-onyx-50 text-onyx-400'}`}>
                                                                {getCategoryIcon(s.category)}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 flex-wrap">
                                                                    <h5 className="font-bold text-onyx-950 text-lg tracking-tight">{s.category}</h5>
                                                                    {s.subCategory && <span className="text-[9px] font-bold text-onyx-400 bg-onyx-50 px-3 py-1 rounded-lg border border-onyx-100/50 uppercase tracking-widest">{s.subCategory}</span>}
                                                                </div>
                                                                <p className="text-[10px] text-onyx-400 font-bold uppercase tracking-[0.15em] mt-2 flex items-center gap-2">
                                                                    Media mensual detectada: <span className="text-onyx-900 font-bold">{formatEUR(s.avgSpend)}</span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex bg-onyx-50 p-1.5 rounded-2xl border border-onyx-100/50 shadow-inner w-full md:w-auto">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newSuggestions = [...smartSuggestions];
                                                                    newSuggestions[idx].mode = 'FIXED';
                                                                    setSmartSuggestions(newSuggestions);
                                                                }}
                                                                className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${s.mode === 'FIXED' ? 'bg-white text-onyx-950 shadow-lg' : 'text-onyx-400 hover:text-onyx-600'}`}
                                                            >
                                                                Fijo: {formatEUR(s.suggestedLimit)}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newSuggestions = [...smartSuggestions];
                                                                    newSuggestions[idx].mode = 'PERCENTAGE';
                                                                    setSmartSuggestions(newSuggestions);
                                                                }}
                                                                className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${s.mode === 'PERCENTAGE' ? 'bg-indigo-primary text-white shadow-lg' : 'text-onyx-400 hover:text-onyx-600'}`}
                                                            >
                                                                Calculado: {s.suggestedPercentage}%
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-10 border-t border-onyx-50 bg-white sticky bottom-0 z-10">
                            <button onClick={handleApplySuggestions} className="w-full bg-onyx-950 hover:bg-onyx-800 text-white py-6 rounded-3xl font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-onyx-950/20 transition-all active:scale-95 flex items-center justify-center gap-4 group relative overflow-hidden">
                                <Check className="w-6 h-6 transition-transform group-hover:scale-125" />
                                <span className="relative z-10">Consolidar {smartSuggestions.filter(s => s.isSelected).length} Presupuestos seleccionados</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
