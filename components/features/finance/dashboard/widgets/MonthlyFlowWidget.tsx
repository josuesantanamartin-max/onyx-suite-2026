
import React from 'react';
import { Activity, ArrowUpRight } from 'lucide-react';

interface MonthlyFlowWidgetProps {
    monthlyIncome: number;
    monthlyExpenses: number;
}

const formatEUR = (amount: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

const MonthlyFlowWidget: React.FC<MonthlyFlowWidgetProps> = ({ monthlyIncome, monthlyExpenses }) => {
    const cashFlow = monthlyIncome - monthlyExpenses;

    return (
        <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-white p-8 rounded-onyx border border-onyx-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-onyx-50/50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold text-onyx-950 flex items-center gap-3">
                        <div className="p-2 bg-onyx-50 text-onyx-400 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-primary transition-colors"><Activity className="w-4 h-4" /></div>
                        Flujo Mensual
                    </h3>
                    <div className={`px-3 py-1 rounded-lg border text-[10px] font-bold ${cashFlow >= 0
                        ? 'text-emerald-600 bg-emerald-50/50 border-emerald-100/50'
                        : 'text-red-600 bg-red-50/50 border-red-100/50'
                        }`}>
                        {cashFlow > 0 ? '+' : ''}{formatEUR(cashFlow)}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center p-5 bg-onyx-50/30 rounded-2xl border border-onyx-100/50 hover:bg-white hover:shadow-sm transition-all duration-300">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-onyx-400 uppercase tracking-[0.15em]">Ingresos</span>
                            <span className="text-lg font-bold text-onyx-950 tracking-tight">{formatEUR(monthlyIncome)}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-5 bg-onyx-50/30 rounded-2xl border border-onyx-100/50 hover:bg-white hover:shadow-sm transition-all duration-300">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-onyx-400 uppercase tracking-[0.15em]">Gastos</span>
                            <span className="text-lg font-bold text-onyx-950 tracking-tight">{formatEUR(monthlyExpenses)}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center">
                            <Activity className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyFlowWidget;
