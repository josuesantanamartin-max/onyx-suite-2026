import React from 'react';
import { Budget, Transaction } from '@/types';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface BudgetStatusWidgetProps {
    budgets: Budget[];
    transactions: Transaction[];
    currentIncome: number; // For percentage based budgets
    currency: string;
    selectedDate: Date;
    timeMode: 'MONTH' | 'YEAR';
}

const BudgetStatusWidget: React.FC<BudgetStatusWidgetProps> = ({ budgets, transactions, currentIncome, currency, selectedDate, timeMode }) => {

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    };

    // Calculate spent amount for a given category and optional subcategory
    const calculateSpent = (category: string, subCategory?: string) => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        return transactions
            .filter(t => {
                const tDate = new Date(t.date);
                const isSamePeriod = timeMode === 'MONTH'
                    ? (tDate.getFullYear() === year && tDate.getMonth() === month)
                    : (tDate.getFullYear() === year);

                return isSamePeriod && t.type === 'EXPENSE' && t.category === category && (subCategory ? t.subCategory === subCategory : true);
            })
            .reduce((sum, t) => sum + t.amount, 0);
    };

    // Group budgets by category
    const groupedBudgets = budgets.reduce((acc, budget) => {
        if (!acc[budget.category]) {
            acc[budget.category] = {
                totalLimit: 0,
                totalSpent: 0,
                subcategories: [],
                hasCategoryBudget: false
            };
        }

        // Calculate effective limit
        let limit = budget.limit;
        if (budget.budgetType === 'PERCENTAGE' && budget.percentage) {
            limit = (currentIncome * budget.percentage) / 100;
        }

        // Calculate spent for this specific budget (category + subCategory if exists)
        const spent = calculateSpent(budget.category, budget.subCategory);

        if (budget.subCategory) {
            // It's a subcategory budget
            acc[budget.category].subcategories.push({
                name: budget.subCategory,
                limit,
                spent,
                percentage: limit > 0 ? (spent / limit) * 100 : 0
            });
        } else {
            // It's a category-level budget
            acc[budget.category].totalLimit = limit;
            acc[budget.category].hasCategoryBudget = true;
        }

        return acc;
    }, {} as Record<string, { totalLimit: number; totalSpent: number; subcategories: Array<{ name: string; limit: number; spent: number; percentage: number }>; hasCategoryBudget: boolean }>);

    // Calculate total spent for each category and sum subcategory limits if no category budget exists
    Object.keys(groupedBudgets).forEach(category => {
        groupedBudgets[category].totalSpent = calculateSpent(category);

        // If no category-level budget exists, sum the subcategory limits
        if (!groupedBudgets[category].hasCategoryBudget && groupedBudgets[category].subcategories.length > 0) {
            groupedBudgets[category].totalLimit = groupedBudgets[category].subcategories.reduce((sum, sub) => sum + sub.limit, 0);
        }
    });

    // Sort categories by percentage used
    const sortedCategories = Object.entries(groupedBudgets).sort((a, b) => {
        const aPercentage = a[1].totalLimit > 0 ? (a[1].totalSpent / a[1].totalLimit) * 100 : 0;
        const bPercentage = b[1].totalLimit > 0 ? (b[1].totalSpent / b[1].totalLimit) * 100 : 0;
        return bPercentage - aPercentage;
    });

    if (sortedCategories.length === 0) {
        return (
            <div className="bg-white p-8 rounded-onyx border border-onyx-100 shadow-sm">
                <div className="flex flex-col items-center justify-center text-center opacity-50 py-16">
                    <Activity className="w-12 h-12 text-onyx-200 mb-3" />
                    <p className="text-sm font-bold text-onyx-400 uppercase tracking-widest">Sin presupuestos activos</p>
                    <p className="text-xs text-onyx-300 mt-1">Define presupuestos para controlar tus gastos</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-onyx border border-onyx-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-onyx-950 tracking-tight">Control de Presupuestos</h3>
                    </div>
                    <p className="text-xs font-semibold text-onyx-400 uppercase tracking-widest">
                        {timeMode === 'MONTH'
                            ? selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                            : selectedDate.getFullYear()}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {sortedCategories.map(([category, data]) => {
                    const categoryPercentage = data.totalLimit > 0 ? (data.totalSpent / data.totalLimit) * 100 : 0;
                    const hasSubcategories = data.subcategories.length > 0;

                    return (
                        <div key={category} className="p-6 bg-onyx-50/50 rounded-2xl border border-onyx-100 hover:bg-white hover:shadow-sm transition-all">
                            {/* Category Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left: Category Summary */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-xs font-black text-onyx-400 uppercase tracking-[0.15em]">
                                            {category}
                                        </span>
                                        <span className={`text-2xl font-black ${categoryPercentage > 100 ? 'text-red-500' :
                                            categoryPercentage > 80 ? 'text-amber-500' : 'text-emerald-500'
                                            }`}>
                                            {categoryPercentage.toFixed(0)}%
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-bold text-onyx-950">
                                            {formatMoney(data.totalSpent)}
                                        </span>
                                        <span className="text-sm font-bold text-onyx-400">
                                            de {formatMoney(data.totalLimit)}
                                        </span>
                                    </div>

                                    <div className="w-full bg-onyx-100 h-3 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${categoryPercentage > 100 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                                categoryPercentage > 80 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                                    'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                }`}
                                            style={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                                        ></div>
                                    </div>

                                    {categoryPercentage > 100 && (
                                        <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <p className="text-xs font-bold">
                                                Excedido en {formatMoney(data.totalSpent - data.totalLimit)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Subcategories */}
                                <div className="space-y-3">
                                    {hasSubcategories ? (
                                        <>
                                            <span className="block text-[10px] font-black text-onyx-400 uppercase tracking-[0.15em] mb-2">
                                                Subcategorías
                                            </span>
                                            {data.subcategories.sort((a, b) => b.percentage - a.percentage).map((sub, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-onyx-100">
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-onyx-600">{sub.name}</p>
                                                        <p className="text-[10px] text-onyx-400 mt-0.5">
                                                            {formatMoney(sub.spent)} / {formatMoney(sub.limit)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-20 bg-onyx-100 h-2 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${sub.percentage > 100 ? 'bg-red-500' :
                                                                    sub.percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                                                    }`}
                                                                style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={`text-sm font-black min-w-[45px] text-right ${sub.percentage > 100 ? 'text-red-500' :
                                                            sub.percentage > 80 ? 'text-amber-500' : 'text-emerald-500'
                                                            }`}>
                                                            {sub.percentage.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-40">
                                            <p className="text-xs font-semibold text-onyx-400">Sin subcategorías definidas</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetStatusWidget;
