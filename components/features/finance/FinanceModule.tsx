import React, { useState } from 'react';
import { useUserStore } from '../../../store/useUserStore';

import Transactions from './transactions/Transactions';
import Debts from './Debts';
import Goals from './Goals';
import Accounts from './Accounts';
import Budgets from './Budgets';
import { Wallet, Menu, CreditCard, PieChart, Target, ReceiptEuro } from 'lucide-react';

interface FinanceModuleProps {
    onMenuClick: () => void;
    onNavigate: (app: string, tab?: string) => void;
}

const FinanceModule: React.FC<FinanceModuleProps> = ({ onMenuClick }) => {

    const {
        financeActiveTab: activeTab,
        setFinanceActiveTab: setActiveTab,
    } = useUserStore();

    const renderNav = () => (
        <div className="bg-white border-b border-onyx-100 px-10 py-3 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0 relative z-10 shadow-sm">
            <button onClick={() => setActiveTab('transactions')} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'transactions' ? 'bg-onyx-950 text-white shadow-lg shadow-onyx-950/20 scale-105' : 'text-onyx-400 hover:text-onyx-900 hover:bg-onyx-50'}`}>Movimientos</button>
            <button onClick={() => setActiveTab('accounts')} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'accounts' ? 'bg-onyx-950 text-white shadow-lg shadow-onyx-950/20 scale-105' : 'text-onyx-400 hover:text-onyx-900 hover:bg-onyx-50'}`}>Cuentas</button>
            <button onClick={() => setActiveTab('budgets')} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'budgets' ? 'bg-onyx-950 text-white shadow-lg shadow-onyx-950/20 scale-105' : 'text-onyx-400 hover:text-onyx-900 hover:bg-onyx-50'}`}>Presupuestos</button>
            <button onClick={() => setActiveTab('goals')} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'goals' ? 'bg-onyx-950 text-white shadow-lg shadow-onyx-950/20 scale-105' : 'text-onyx-400 hover:text-onyx-900 hover:bg-onyx-50'}`}>Metas</button>
            <button onClick={() => setActiveTab('debts')} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'debts' ? 'bg-onyx-950 text-white shadow-lg shadow-onyx-950/20 scale-105' : 'text-onyx-400 hover:text-onyx-900 hover:bg-onyx-50'}`}>Deudas</button>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'transactions': return <Transactions />;
            case 'accounts': return <Accounts onViewTransactions={(id) => { setActiveTab('transactions'); }} />;
            case 'budgets': return <Budgets onViewTransactions={(c, s) => { setActiveTab('transactions'); }} />;
            case 'goals': return <Goals />;
            case 'debts': return <Debts />;
            default: return <Transactions />;
        }
    };

    return (
        <div className="flex h-full flex-col bg-[#FAFAFA]">
            <header className="md:hidden bg-white border-b border-onyx-100 p-6 flex justify-between items-center z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-onyx-950 rounded-xl flex items-center justify-center shadow-lg shadow-onyx-950/20">
                        <Wallet className="text-white w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-onyx-950 text-base leading-none uppercase tracking-tight">Onyx <span className="text-indigo-primary">Finanzas</span></span>
                        <span className="text-[8px] font-bold text-onyx-300 uppercase tracking-[0.2em] mt-1">Management Suite</span>
                    </div>
                </div>
                <button onClick={onMenuClick} className="p-2 text-onyx-400 hover:text-onyx-900 transition-colors"><Menu className="w-6 h-6" /></button>
            </header>

            {renderNav()}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto py-10 px-6 md:px-10">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default FinanceModule;
