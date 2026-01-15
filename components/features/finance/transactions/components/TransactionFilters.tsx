
import React from 'react';
import { Search, Filter, Calendar, Layers, X, ChevronDown } from 'lucide-react';
import { Account, CategoryStructure } from '@/types';

interface TransactionFiltersProps {
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    filterDate: string;
    setFilterDate: (d: string) => void;
    filterCategory: string;
    setFilterCategory: (c: string) => void;
    filterSubCategory: string;
    setFilterSubCategory: (s: string) => void;
    filterType: '' | 'INCOME' | 'EXPENSE';
    setFilterType: (t: '' | 'INCOME' | 'EXPENSE') => void;
    filterAccountId: string;
    setFilterAccountId: (id: string) => void;
    showRecurringOnly: boolean;
    setShowRecurringOnly: (b: boolean) => void;
    viewMode: 'MONTH' | 'YEAR';
    setViewMode: (v: 'MONTH' | 'YEAR') => void;
    categories: CategoryStructure[];
    accounts: Account[];
    clearFilters: () => void;
    activeFiltersCount: number;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
    searchTerm, setSearchTerm, filterDate, setFilterDate, filterCategory, setFilterCategory,
    filterSubCategory, setFilterSubCategory, filterType, setFilterType, filterAccountId, setFilterAccountId,
    showRecurringOnly, setShowRecurringOnly, viewMode, setViewMode, categories, accounts, clearFilters, activeFiltersCount
}) => {

    const availableSubCategories = categories.find(c => c.name === filterCategory)?.subCategories || [];

    return (
        <div className="bg-white p-10 rounded-onyx border border-onyx-100 shadow-sm mb-10 relative overflow-hidden group/filters">
            <div className="absolute top-0 left-0 w-80 h-80 bg-onyx-50/30 rounded-full blur-[100px] opacity-0 group-hover/filters:opacity-100 transition-opacity pointer-events-none"></div>

            <div className="flex flex-col xl:flex-row gap-8 justify-between items-start xl:items-center relative z-10">
                {/* Search */}
                <div className="w-full xl:w-[450px] relative group/search">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-onyx-400 group-focus-within/search:text-indigo-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar transacciones por concepto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-onyx-50 border border-onyx-100 rounded-2xl text-[13px] font-bold text-onyx-950 placeholder:text-onyx-300 focus:bg-white focus:ring-4 focus:ring-indigo-primary/5 focus:border-indigo-primary/20 outline-none transition-all shadow-inner"
                    />
                </div>

                {/* Filters Group */}
                <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                    {/* Date Picker */}
                    <div className="flex items-center gap-4 bg-onyx-50 border border-onyx-100 rounded-2xl px-5 py-2.5 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all relative group/date">
                        <Calendar className="w-4 h-4 text-onyx-400 group-hover/date:text-indigo-primary transition-colors" />
                        <input
                            type={viewMode === 'MONTH' ? 'month' : 'number'}
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="bg-transparent border-none text-[11px] font-bold text-onyx-950 outline-none w-32 cursor-pointer uppercase tracking-widest"
                        />
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex bg-onyx-50 p-1.5 rounded-2xl border border-onyx-100 shadow-inner">
                        <button onClick={() => setViewMode('MONTH')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${viewMode === 'MONTH' ? 'bg-white shadow-lg text-onyx-950 border border-onyx-100' : 'text-onyx-400 hover:text-onyx-600'}`}>Mes</button>
                        <button onClick={() => setViewMode('YEAR')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${viewMode === 'YEAR' ? 'bg-white shadow-lg text-onyx-950 border border-onyx-100' : 'text-onyx-400 hover:text-onyx-600'}`}>Año</button>
                    </div>

                    {/* Category Filter */}
                    <div className="relative group/sel">
                        <Layers className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${filterCategory ? 'text-indigo-primary' : 'text-onyx-400'}`} />
                        <select
                            value={filterCategory}
                            onChange={(e) => { setFilterCategory(e.target.value); setFilterSubCategory(''); }}
                            className={`appearance-none pl-12 pr-12 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer transition-all ${filterCategory ? 'bg-indigo-50 border-indigo-primary/20 text-indigo-primary shadow-sm' : 'bg-onyx-50 border-onyx-100 text-onyx-400 hover:bg-white hover:border-indigo-100 hover:shadow-md'}`}
                        >
                            <option value="">Categoría</option>
                            {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform group-hover/sel:translate-y-[-40%] ${filterCategory ? 'text-indigo-primary' : 'text-onyx-400'}`} />
                    </div>

                    {filterCategory && availableSubCategories.length > 0 && (
                        <div className="relative animate-fade-in group/sub">
                            <select
                                value={filterSubCategory}
                                onChange={(e) => setFilterSubCategory(e.target.value)}
                                className={`appearance-none pl-6 pr-12 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer transition-all ${filterSubCategory ? 'bg-indigo-50 border-indigo-primary/20 text-indigo-primary shadow-sm' : 'bg-onyx-50 border-onyx-100 text-onyx-400 hover:bg-white hover:border-indigo-100 hover:shadow-md'}`}
                            >
                                <option value="">Subcategoría</option>
                                {availableSubCategories.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform group-hover/sub:translate-y-[-40%] ${filterSubCategory ? 'text-indigo-primary' : 'text-onyx-400'}`} />
                        </div>
                    )}

                    {/* Type Filter */}
                    <div className="relative group/type">
                        <Filter className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${filterType ? 'text-indigo-primary' : 'text-onyx-400'}`} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className={`appearance-none pl-12 pr-12 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer transition-all ${filterType ? 'bg-indigo-50 border-indigo-primary/20 text-indigo-primary shadow-sm' : 'bg-onyx-50 border-onyx-100 text-onyx-400 hover:bg-white hover:border-indigo-100 hover:shadow-md'}`}
                        >
                            <option value="">Tipo</option>
                            <option value="INCOME">Ingresos</option>
                            <option value="EXPENSE">Gastos</option>
                        </select>
                        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform group-hover/type:translate-y-[-40%] ${filterType ? 'text-indigo-primary' : 'text-onyx-400'}`} />
                    </div>

                    {/* Account Filter */}
                    <div className="relative group/acc">
                        <select
                            value={filterAccountId}
                            onChange={(e) => setFilterAccountId(e.target.value)}
                            className={`appearance-none pl-6 pr-12 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer transition-all ${filterAccountId ? 'bg-indigo-50 border-indigo-primary/20 text-indigo-primary shadow-sm' : 'bg-onyx-50 border-onyx-100 text-onyx-400 hover:bg-white hover:border-indigo-100 hover:shadow-md'}`}
                        >
                            <option value="">Cuenta</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform group-hover/acc:translate-y-[-40%] ${filterAccountId ? 'text-indigo-primary' : 'text-onyx-400'}`} />
                    </div>

                    {/* Clear Filters Button */}
                    {activeFiltersCount > 0 && (
                        <button onClick={clearFilters} className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-red-100 hover:shadow-lg transition-all active:scale-95">
                            <X className="w-4 h-4" /> Limpiar ({activeFiltersCount})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


export default TransactionFilters;

