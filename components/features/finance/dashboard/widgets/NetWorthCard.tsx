import React from 'react';
import { motion } from 'framer-motion';
import { Transaction, Account, Debt } from '../../../../../types';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Coins } from 'lucide-react';
import { Card } from '../../../../ui/Card';

interface NetWorthCardProps {
    accounts: Account[];
    debts: Debt[];
    monthlyIncome: number;
    monthlyExpenses: number;
    onNavigate: (app: string, tab?: string) => void;
}

const formatEUR = (amount: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

const NetWorthCard: React.FC<NetWorthCardProps> = ({ accounts, debts, monthlyIncome, monthlyExpenses, onNavigate }) => {
    const liquidAssets = accounts.filter(a => a.type === 'BANK' || a.type === 'CASH' || a.type === 'WALLET').reduce((acc, curr) => acc + curr.balance, 0);
    const investedAssets = accounts.filter(a => a.type === 'INVESTMENT').reduce((acc, curr) => acc + curr.balance, 0);

    const totalAssets = accounts.filter(a => a.type !== 'CREDIT').reduce((acc, curr) => acc + curr.balance, 0);
    const totalLiabilities = accounts.filter(a => a.type === 'CREDIT').reduce((acc, curr) => acc + Math.abs(curr.balance), 0);
    const totalDebtBalance = debts.reduce((acc, d) => acc + d.remainingBalance, 0);
    const totalDebt = totalLiabilities + totalDebtBalance;

    const netWorth = totalAssets - totalDebt;
    const cashFlow = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (cashFlow / monthlyIncome) * 100 : 0;

    return (
        <Card onClick={() => onNavigate('finance', 'dashboard')} className="col-span-1 md:col-span-12 lg:col-span-8 p-10 cursor-pointer group relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/30 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            <div className="flex justify-between items-start mb-12 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-onyx-50 dark:bg-onyx-800 text-onyx-600 dark:text-onyx-300 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-primary transition-colors"><Wallet className="w-5 h-5" /></div>
                        <span className="text-[10px] font-bold text-onyx-400 dark:text-onyx-500 uppercase tracking-[0.2em]">Patrimonio Global</span>
                    </div>
                    <div className="flex items-baseline gap-4 mt-2">
                        <h3 className="text-5xl font-bold text-onyx-950 dark:text-white tracking-tight">{formatEUR(netWorth)}</h3>
                        {cashFlow > 0 ? (
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-emerald-100/50 h-full flex flex-col">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span className="translate-y-[0.5px]">+{savingsRate.toFixed(1)}%</span>
                            </div>
                        ) : (
                            <div className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-red-100/50 h-full flex flex-col">
                                <ArrowDownRight className="w-3.5 h-3.5" />
                                <span className="translate-y-[0.5px]">Déficit</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                <div className="p-6 bg-onyx-50/50 dark:bg-onyx-800/50 border border-onyx-100/30 dark:border-onyx-700/30 rounded-2xl group-hover:bg-white dark:group-hover:bg-onyx-800 group-hover:border-onyx-100 dark:group-hover:border-onyx-700 group-hover:shadow-md transition-all duration-500">
                    <p className="text-[10px] font-bold text-onyx-400 dark:text-onyx-500 uppercase tracking-[0.15em] mb-3 flex items-center gap-2.5">
                        <Coins className="w-3.5 h-3.5 opacity-40" />
                        Liquidez
                    </p>
                    <p className="text-2xl font-bold text-onyx-900 dark:text-white tracking-tight">{formatEUR(liquidAssets)}</p>
                </div>
                <div className="p-6 bg-onyx-50/50 dark:bg-onyx-800/50 border border-onyx-100/30 dark:border-onyx-700/30 rounded-2xl group-hover:bg-white dark:group-hover:bg-onyx-800 group-hover:border-onyx-100 dark:group-hover:border-onyx-700 group-hover:shadow-md transition-all duration-500">
                    <p className="text-[10px] font-bold text-onyx-400 dark:text-onyx-500 uppercase tracking-[0.15em] mb-3 flex items-center gap-2.5">
                        <TrendingUp className="w-3.5 h-3.5 opacity-40" />
                        Inversión
                    </p>
                    <p className="text-2xl font-bold text-onyx-900 dark:text-white tracking-tight">{formatEUR(investedAssets)}</p>
                </div>
                <div className="p-6 bg-onyx-50/50 dark:bg-onyx-800/50 border border-onyx-100/30 dark:border-onyx-700/30 rounded-2xl group-hover:bg-white dark:group-hover:bg-onyx-800 group-hover:border-onyx-100 dark:group-hover:border-onyx-700 group-hover:shadow-md transition-all duration-500">
                    <p className="text-[10px] font-bold text-onyx-400 dark:text-onyx-500 uppercase tracking-[0.15em] mb-3 flex items-center gap-2.5 text-red-400">
                        <TrendingDown className="w-3.5 h-3.5 opacity-60" />
                        Pasivo
                    </p>
                    <p className="text-2xl font-bold text-red-500 tracking-tight">-{formatEUR(totalDebt)}</p>
                </div>
            </div>
        </Card>
    );
};

export default NetWorthCard;
