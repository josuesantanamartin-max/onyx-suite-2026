import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUserStore } from '../../store/useUserStore';
import { useLifeStore } from '../../store/useLifeStore';
import {
    Settings, ChevronLeft, ChevronRight, Coffee, Sunset, Moon, LayoutGrid, Search, Bell
} from 'lucide-react';
import { DashboardLayout, WidgetCategory } from '../../types';

import { WIDGET_CONFIG, DashboardDataProps, WidgetSize } from './WidgetRegistry';
import { getWidgetCategory } from './widgetCategories';
import DropZoneGrid from './DropZoneGrid';
import LayoutSelector from './LayoutSelector';
import WidgetGallery from './WidgetGallery';
import EditModeToolbar from './EditModeToolbar';
import SmartInsightWidget from './SmartInsightWidget';
import { useDashboardSync } from '../../hooks/useDashboardSync';
import CreateLayoutModal from './CreateLayoutModal';
import GlobalSearch from '../ui/GlobalSearch';
import SampleDataBanner from '../common/SampleDataBanner';

const GREETINGS = {
    morning: { text: 'Buenos días', sub: 'Comienza el día con claridad.', icon: Coffee },
    afternoon: { text: 'Buenas tardes', sub: 'Mantén el ritmo.', icon: Sunset },
    evening: { text: 'Buenas noches', sub: 'Revisa tus logros de hoy.', icon: Moon },
};

const CustomizableDashboard: React.FC = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<WidgetCategory>('ALL');

    // Drag state
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [widgetOrder, setWidgetOrder] = useState<string[]>([]);

    const {
        dashboardLayouts, activeLayoutId, isEditMode,
        setEditMode, saveLayout, setActiveLayout,
        setActiveApp, setFinanceActiveTab, setLifeActiveTab,
        theme, setTheme, hasCompletedOnboarding,
    } = useUserStore();

    const { transactions, accounts, debts, goals, categories, budgets } = useFinanceStore();
    const { weeklyPlans, pantryItems, shoppingList, familyMembers } = useLifeStore();

    useDashboardSync();

    const [timeMode, setTimeMode] = useState<'MONTH' | 'YEAR'>('MONTH');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Tour
    React.useEffect(() => {
        const hasSeenTour = localStorage.getItem('onyx_has_seen_tour');
        if (hasCompletedOnboarding && !hasSeenTour) {
            setTimeout(() => {
                import('./DashboardTour').then(mod => mod.startDashboardTour());
                localStorage.setItem('onyx_has_seen_tour', 'true');
            }, 1000);
        }
    }, [hasCompletedOnboarding]);

    const activeLayout = useMemo(
        () => dashboardLayouts.find(l => l.id === activeLayoutId),
        [dashboardLayouts, activeLayoutId]
    );

    // Sync order when layout changes
    React.useEffect(() => {
        if (activeLayout) setWidgetOrder(activeLayout.widgets.map(w => w.i));
    }, [activeLayout?.id, activeLayout?.widgets.length]);

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const greeting = GREETINGS[timeOfDay];

    const handleNavigate = (app: string, tab?: string) => {
        setActiveApp(app);
        if (app === 'finance' && tab) setFinanceActiveTab(tab);
        if (app === 'life' && tab) setLifeActiveTab(tab);
    };

    const navigateTime = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        if (timeMode === 'MONTH') newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        else newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        setSelectedDate(newDate);
    };

    const getDateLabel = () => timeMode === 'MONTH'
        ? selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        : selectedDate.getFullYear().toString();

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const currentPeriodTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return timeMode === 'YEAR'
            ? tDate.getFullYear() === year
            : tDate.getFullYear() === year && tDate.getMonth() === month;
    });

    const monthlyIncome = currentPeriodTransactions
        .filter(t => t.type === 'INCOME' && t.category !== 'Transferencia')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const monthlyExpenses = currentPeriodTransactions
        .filter(t => t.type === 'EXPENSE' && t.category !== 'Transferencia')
        .reduce((acc, curr) => acc + curr.amount, 0);

    // Filtered + ordered widget items
    const filteredItems = useMemo(() => {
        if (!activeLayout) return [];
        return activeLayout.widgets.filter(w => {
            if (!isEditMode && w.visible === false) return false;
            if (activeCategory !== 'ALL' && getWidgetCategory(w.i) !== activeCategory) return false;
            return true;
        });
    }, [activeLayout, isEditMode, activeCategory]);

    const filteredOrder = useMemo(() => {
        const ids = new Set(filteredItems.map(w => w.i));
        return widgetOrder.filter(id => ids.has(id));
    }, [filteredItems, widgetOrder]);

    // Drag handlers (passed to DropZoneGrid)
    const handleDragStart = useCallback((id: string) => setDraggingId(id), []);
    const handleDragEnd = useCallback(() => setDraggingId(null), []);

    const handleReorder = useCallback((fromId: string, toId: string) => {
        setWidgetOrder(prev => {
            const items = [...prev];
            const fromIdx = items.indexOf(fromId);
            const toIdx = items.indexOf(toId);
            if (fromIdx === -1 || toIdx === -1) return prev;
            items.splice(fromIdx, 1);
            items.splice(toIdx, 0, fromId);
            return items;
        });
    }, []);

    // Save / Cancel
    const handleSaveLayout = () => {
        if (!activeLayout) return;
        const reordered = widgetOrder
            .map(id => activeLayout.widgets.find(w => w.i === id))
            .filter((w): w is NonNullable<typeof w> => !!w);
        saveLayout({ ...activeLayout, widgets: reordered });
        setEditMode(false);
        setIsGalleryOpen(false);
    };

    const handleCancelEdit = () => {
        if (activeLayout) setWidgetOrder(activeLayout.widgets.map(w => w.i));
        setEditMode(false);
        setIsGalleryOpen(false);
    };

    const handleCreateLayout = (name: string, description: string) => {
        if (!activeLayout) return;
        const newLayout: DashboardLayout = {
            id: `custom-${Date.now()}`,
            name, description,
            isDefault: false,
            widgets: activeLayout.widgets,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        saveLayout(newLayout);
        setActiveLayout(newLayout.id);
    };

    const widgetProps: DashboardDataProps = {
        transactions, accounts, debts, goals, categories, budgets,
        monthlyIncome, monthlyExpenses,
        onNavigate: handleNavigate,
        selectedDate, timeMode,
        onFilter: () => { setActiveApp('finance'); setFinanceActiveTab('transactions'); },
    };

    if (!activeLayout) return <div className="p-10 text-center text-onyx-400">No layout selected</div>;

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <SampleDataBanner />

            {/* ── Top Bar ──────────────────────────────────────────────────── */}
            <div className="sticky top-0 z-30 px-6 md:px-10 py-3.5 bg-white/90 dark:bg-onyx-950/90 backdrop-blur-xl border-b border-onyx-100/80 dark:border-onyx-800/60 flex items-center justify-between gap-4">
                {/* Left: greeting */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 shrink-0">
                        <greeting.icon className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="min-w-0 hidden sm:block">
                        <h1 id="header-title" className="text-base font-black text-onyx-900 dark:text-white tracking-tight leading-none truncate">
                            Onyx Central
                        </h1>
                        <p className="text-[11px] text-onyx-400 dark:text-onyx-500 mt-0.5 truncate">
                            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>

                {/* Center: time navigation */}
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center bg-onyx-100 dark:bg-onyx-800 rounded-xl p-0.5">
                        <button
                            onClick={() => setTimeMode('MONTH')}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${timeMode === 'MONTH' ? 'bg-white dark:bg-onyx-700 shadow-sm text-onyx-900 dark:text-white' : 'text-onyx-400 dark:text-onyx-500 hover:text-onyx-700'}`}
                        >Mes</button>
                        <button
                            onClick={() => setTimeMode('YEAR')}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${timeMode === 'YEAR' ? 'bg-white dark:bg-onyx-700 shadow-sm text-onyx-900 dark:text-white' : 'text-onyx-400 dark:text-onyx-500 hover:text-onyx-700'}`}
                        >Año</button>
                    </div>
                    <div className="flex items-center gap-1 bg-white dark:bg-onyx-800 border border-onyx-100 dark:border-onyx-700 rounded-xl px-1 shadow-sm">
                        <button onClick={() => navigateTime('prev')} className="p-1.5 hover:bg-onyx-50 dark:hover:bg-onyx-700 rounded-lg transition-colors">
                            <ChevronLeft className="w-3.5 h-3.5 text-onyx-400" />
                        </button>
                        <span className="text-[11px] font-bold text-onyx-700 dark:text-onyx-200 capitalize px-2 min-w-[110px] text-center">
                            {getDateLabel()}
                        </span>
                        <button onClick={() => navigateTime('next')} className="p-1.5 hover:bg-onyx-50 dark:hover:bg-onyx-700 rounded-lg transition-colors">
                            <ChevronRight className="w-3.5 h-3.5 text-onyx-400" />
                        </button>
                    </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="p-2.5 rounded-xl text-onyx-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all group"
                        title="Buscar"
                    >
                        <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        id="theme-toggle"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2.5 rounded-xl text-onyx-400 hover:text-onyx-700 dark:hover:text-onyx-200 hover:bg-onyx-100 dark:hover:bg-onyx-800 transition-all"
                        title="Tema"
                    >
                        {theme === 'dark' ? <Sunset className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <LayoutSelector />
                    {!isEditMode ? (
                        <button
                            id="edit-mode-btn"
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[12px] transition-colors shadow-md shadow-indigo-500/25"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Personalizar</span>
                        </button>
                    ) : (
                        <EditModeToolbar
                            onSave={handleSaveLayout}
                            onCancel={handleCancelEdit}
                            onAddWidget={() => setIsGalleryOpen(true)}
                        />
                    )}
                </div>
            </div>

            <div className="px-6 md:px-10 pt-8 pb-28 max-w-screen-2xl mx-auto">
                {/* Category Filter — pill tabs */}
                <div id="widget-filters" className="flex items-center gap-2 mb-7">
                    {(['ALL', 'FINANCE', 'LIFE'] as WidgetCategory[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat
                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300 dark:shadow-indigo-900'
                                : 'text-onyx-400 dark:text-onyx-500 hover:text-onyx-700 dark:hover:text-onyx-300 hover:bg-onyx-100 dark:hover:bg-onyx-800'
                                }`}
                        >
                            {cat === 'ALL' ? 'Todos' : cat === 'FINANCE' ? 'Finanzas' : 'Vida'}
                        </button>
                    ))}
                </div>

                <div className="space-y-7">
                    {/* Edit Mode Banner */}
                    {isEditMode && (
                        <div className="flex items-center gap-3 p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl animate-fade-in-up">
                            <LayoutGrid className="w-4 h-4 text-indigo-500 shrink-0" />
                            <p className="text-[12px] font-semibold text-indigo-700 dark:text-indigo-300">
                                <span className="font-black">Modo Edición.</span>{' '}
                                Arrastra widgets entre ellos para reordenar, o suéltalos en las zonas de abajo para cambiar su tamaño.
                            </p>
                            <button
                                onClick={() => setIsGalleryOpen(true)}
                                className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                <LayoutGrid className="w-3 h-3" />
                                Galería
                            </button>
                        </div>
                    )}

                    {/* Smart Insight */}
                    <div id="smart-insight-widget" className="animate-fade-in-up">
                        <SmartInsightWidget onNavigate={(app, tab) => {
                            if (app === 'LIFE') { setActiveApp('life'); setLifeActiveTab(tab || 'kitchen-recipes'); }
                            else if (app === 'FINANCE') { setActiveApp('finance'); setFinanceActiveTab(tab || 'transactions'); }
                        }} />
                    </div>

                    {/* Drop Zone Grid — widgets + zone targets */}
                    <DropZoneGrid
                        widgetItems={filteredItems}
                        widgetOrder={filteredOrder}
                        isEditMode={isEditMode}
                        draggingId={draggingId}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        widgetProps={widgetProps}
                        onReorder={handleReorder}
                    />
                </div>
            </div>

            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <WidgetGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
        </div>
    );
};

export default CustomizableDashboard;
