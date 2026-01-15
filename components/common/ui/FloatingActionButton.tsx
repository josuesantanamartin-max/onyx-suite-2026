import React from 'react';
import { Plus, Zap, ScanLine, ShoppingCart, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, Carrot } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { QuickActionType } from '../../../types';

const FloatingActionButton: React.FC = () => {
    const {
        isFabOpen, setFabOpen,
        setQuickAction,
        setActiveApp,
        setFinanceActiveTab, setLifeActiveTab,
    } = useUserStore();

    // FAB Actions Logic
    const triggerAction = (type: QuickActionType) => {
        setQuickAction({ type, timestamp: Date.now() });
        setFabOpen(false);

        // Navigation Logic based on Action
        if (type === 'ADD_EXPENSE' || type === 'ADD_INCOME' || type === 'ADD_TRANSFER') {
            setActiveApp('finance');
            setFinanceActiveTab('transactions');
        } else if (type === 'ADD_INGREDIENT' || type === 'SCAN_RECEIPT') {
            setActiveApp('life');
            setLifeActiveTab('kitchen-pantry'); // Corrected to match App.tsx logic
        } else if (type === 'ADD_SHOPPING_ITEM') {
            setActiveApp('life');
            setLifeActiveTab('kitchen-list');
        } else if (type === 'ADD_TASK') {
            setActiveApp('life');
            setLifeActiveTab('family');
        }
    };

    return (
        <>
            {isFabOpen && <div className="fixed inset-0 bg-onyx-950/10 backdrop-blur-md z-40 animate-fade-in" onClick={() => setFabOpen(false)}></div>}

            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3 pointer-events-none">
                {isFabOpen && (
                    <div className="flex flex-col items-end gap-3 mb-4 pointer-events-auto pb-2 pr-1">
                        <button onClick={() => triggerAction('ADD_EXPENSE')} className="group flex items-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-onyx-100 shadow-sm text-[11px] font-bold text-onyx-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap">Registrar Gasto</span>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-lg border border-onyx-100 flex items-center justify-center text-onyx-400 group-hover:text-red-500 group-hover:border-red-100 group-hover:scale-105 transition-all duration-300"><ArrowDownCircle className="w-5 h-5" /></div>
                        </button>
                        <button onClick={() => triggerAction('ADD_INCOME')} className="group flex items-center gap-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-onyx-100 shadow-sm text-[11px] font-bold text-onyx-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap">Nuevo Ingreso</span>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-lg border border-onyx-100 flex items-center justify-center text-onyx-400 group-hover:text-emerald-500 group-hover:border-emerald-100 group-hover:scale-105 transition-all duration-300"><ArrowUpCircle className="w-5 h-5" /></div>
                        </button>
                        <button onClick={() => triggerAction('ADD_TRANSFER')} className="group flex items-center gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-onyx-100 shadow-sm text-[11px] font-bold text-onyx-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap">Transferencia</span>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-lg border border-onyx-100 flex items-center justify-center text-onyx-400 group-hover:text-indigo-primary group-hover:border-indigo-50 transition-all duration-300"><ArrowRightLeft className="w-5 h-5" /></div>
                        </button>
                        <div className="h-px w-20 bg-onyx-200/50 my-1 mr-4 animate-fade-in" style={{ animationDelay: '0.08s' }}></div>
                        <button onClick={() => triggerAction('ADD_SHOPPING_ITEM')} className="group flex items-center gap-4 animate-slide-up" style={{ animationDelay: '0.08s' }}>
                            <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-onyx-100 shadow-sm text-[11px] font-bold text-onyx-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap">Lista de Compra</span>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-lg border border-onyx-100 flex items-center justify-center text-onyx-400 group-hover:text-emerald-500 group-hover:scale-105 transition-all duration-300"><ShoppingCart className="w-5 h-5" /></div>
                        </button>
                        <button onClick={() => triggerAction('SCAN_RECEIPT')} className="group flex items-center gap-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                            <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-onyx-100 shadow-sm text-[11px] font-bold text-onyx-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap">Escanear Ticket</span>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-lg border border-onyx-100 flex items-center justify-center text-onyx-400 group-hover:text-purple-500 group-hover:scale-105 transition-all duration-300"><ScanLine className="w-5 h-5" /></div>
                        </button>
                    </div>
                )}
                <button
                    onClick={() => setFabOpen(!isFabOpen)}
                    className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 pointer-events-auto z-50 relative ${isFabOpen ? 'bg-onyx-950 text-white rotate-45' : 'bg-onyx-950 text-white hover:bg-black'}`}
                >
                    <Plus className="w-7 h-7 transition-transform duration-500" />
                </button>
            </div>
        </>
    );
};

export default FloatingActionButton;
