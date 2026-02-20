import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUserStore } from '../../store/useUserStore';
import { useLifeStore } from '../../store/useLifeStore';
import {
    Settings, ChevronLeft, ChevronRight, Coffee, Sunset, Moon, LayoutGrid
} from 'lucide-react';
import { DashboardLayout, WidgetCategory } from '../../types';

import { WIDGET_REGISTRY, WIDGET_CONFIG, DashboardDataProps, getColSpanClass } from './WidgetRegistry';
import { getWidgetCategory } from './widgetCategories';
import WidgetWrapper from './WidgetWrapper';
import LayoutSelector from './LayoutSelector';
import WidgetGallery from './WidgetGallery';
import EditModeToolbar from './EditModeToolbar';
import SmartInsightWidget from './SmartInsightWidget';
import { useDashboardSync } from '../../hooks/useDashboardSync';
import CreateLayoutModal from './CreateLayoutModal';
import GlobalSearch from '../ui/GlobalSearch';
import { Search } from 'lucide-react';
import SampleDataBanner from '../common/SampleDataBanner';

const GREETINGS = {
    morning: { text: 'Buenos días', sub: 'Comienza tu día con éxito.', icon: Coffee },
    afternoon: { text: 'Buenas tardes', sub: 'Mantén el ritmo de hoy.', icon: Sunset },
    evening: { text: 'Buenas noches', sub: 'Revisa tus logros de hoy.', icon: Moon },
};

const CustomizableDashboard: React.FC = () => {
    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // Drag-to-reorder state
    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const {
        dashboardLayouts,
        activeLayoutId,
        isEditMode,
        setEditMode,
        saveLayout,
        setActiveLayout,
        setActiveApp,
        setFinanceActiveTab,
        setLifeActiveTab,
        theme,
        setTheme,
    } = useUserStore();

    const { transactions, accounts, debts, goals, categories, budgets } = useFinanceStore();
    const { weeklyPlans, pantryItems, shoppingList, familyMembers } = useLifeStore();

    // Sincronización con Supabase
    useDashboardSync();

    const [timeMode, setTimeMode] = useState<'MONTH' | 'YEAR'>('MONTH');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    // Ordered widget IDs for current layout (drives drag-reorder)
    const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<WidgetCategory>('ALL');
    const { hasCompletedOnboarding } = useUserStore();

    // Check for tour on mount
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

    // Sync widgetOrder when layout changes or edit mode begins
    React.useEffect(() => {
        if (activeLayout) {
            setWidgetOrder(activeLayout.widgets.map(w => w.i));
        }
    }, [activeLayout?.id, activeLayout?.widgets.length]);

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const greeting = GREETINGS[timeOfDay];

    // Navigation Handler
    const handleNavigate = (app: string, tab?: string) => {
        setActiveApp(app);
        if (app === 'finance' && tab) setFinanceActiveTab(tab);
        if (app === 'life' && tab) setLifeActiveTab(tab);
    };

    // Time Navigation
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

    // Calculations
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

    // Ordered + filtered widget list for rendering
    const visibleWidgets = useMemo(() => {
        if (!activeLayout) return [];
        const widgetMap = new Map(activeLayout.widgets.map(w => [w.i, w]));

        // Use current order (respects drag reorder), fall back to layout order
        const ordered = widgetOrder.length > 0 ? widgetOrder : activeLayout.widgets.map(w => w.i);

        return ordered
            .map(id => widgetMap.get(id))
            .filter((w): w is NonNullable<typeof w> => {
                if (!w) return false;
                if (!isEditMode && w.visible === false) return false;
                if (activeCategory !== 'ALL' && getWidgetCategory(w.i) !== activeCategory) return false;
                return true;
            });
    }, [activeLayout, widgetOrder, isEditMode, activeCategory]);

    // ── Drag-to-reorder handlers ──────────────────────────────────────────
    const handleDragStart = useCallback((id: string) => {
        dragItem.current = id;
        setDraggingId(id);
    }, []);

    const handleDragEnter = useCallback((id: string) => {
        dragOverItem.current = id;
        setDragOverId(id);
    }, []);

    const handleDragEnd = useCallback(() => {
        if (dragItem.current && dragOverItem.current && dragItem.current !== dragOverItem.current) {
            setWidgetOrder(prev => {
                const items = [...prev];
                const fromIdx = items.indexOf(dragItem.current!);
                const toIdx = items.indexOf(dragOverItem.current!);
                if (fromIdx === -1 || toIdx === -1) return prev;
                items.splice(fromIdx, 1);
                items.splice(toIdx, 0, dragItem.current!);
                return items;
            });
        }
        dragItem.current = null;
        dragOverItem.current = null;
        setDraggingId(null);
        setDragOverId(null);
    }, []);

    // ── Save / Cancel ─────────────────────────────────────────────────────
    const handleSaveLayout = () => {
        if (!activeLayout) return;

        // Apply current widget order back to the layout
        const reordered = widgetOrder
            .map(id => activeLayout.widgets.find(w => w.i === id))
            .filter((w): w is NonNullable<typeof w> => !!w);

        saveLayout({
            ...activeLayout,
            widgets: reordered,
        });

        setEditMode(false);
        setIsGalleryOpen(false);
    };

    const handleCancelEdit = () => {
        // Reset order to saved layout
        if (activeLayout) setWidgetOrder(activeLayout.widgets.map(w => w.i));
        setEditMode(false);
        setIsGalleryOpen(false);
    };

    // Crear layout personalizado
    const handleCreateLayout = (name: string, description: string) => {
        if (!activeLayout) return;

        const newLayout: DashboardLayout = {
            id: `custom-${Date.now()}`,
            name,
            description,
            isDefault: false,
            widgets: activeLayout.widgets,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        saveLayout(newLayout);
        setActiveLayout(newLayout.id);
    };

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

    if (!activeLayout) {
        return <div className="p-10 text-center text-onyx-400">No layout selected</div>;
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar pb-32">
            {/* Sample Data Banner */}
            <SampleDataBanner />

            <div className="p-6 md:p-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-primary font-bold text-xs uppercase tracking-widest mb-1.5">
                            <greeting.icon className="w-4 h-4" /> {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                        <h1 id="header-title" className="text-4xl font-black text-onyx-950 tracking-tight dark:text-white">Onyx Central</h1>
                        <p className="text-sm font-medium text-onyx-400 mt-1">{greeting.text}, Josué. {greeting.sub}</p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center gap-2">
                            {/* Time Navigation */}
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
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-3 rounded-2xl bg-white dark:bg-onyx-900 text-onyx-400 hover:text-indigo-primary dark:text-onyx-500 dark:hover:text-indigo-400 border border-onyx-100 dark:border-onyx-800 shadow-sm transition-all group"
                                title="Buscar (CMD+K)"
                            >
                                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>

                            <button
                                id="theme-toggle"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-3 rounded-2xl bg-white dark:bg-onyx-900 text-onyx-400 hover:text-onyx-900 dark:text-onyx-500 dark:hover:text-onyx-200 border border-onyx-100 dark:border-onyx-800 shadow-sm transition-all"
                                title="Cambiar Tema"
                            >
                                {theme === 'dark' ? <Sunset className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            <LayoutSelector />

                            {!isEditMode ? (
                                <button
                                    id="edit-mode-btn"
                                    onClick={() => setEditMode(true)}
                                    className="px-4 py-2 bg-indigo-primary text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    Personalizar
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
                </header>

                {/* Category Filter Tabs */}
                <div id="widget-filters" className="flex items-center gap-4 mb-8 max-w-7xl mx-auto">
                    <div className="bg-white dark:bg-onyx-900 p-1.5 rounded-xl border border-onyx-100 dark:border-onyx-800 shadow-sm inline-flex">
                        <button
                            onClick={() => setActiveCategory('ALL')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeCategory === 'ALL'
                                ? 'bg-indigo-primary text-white shadow-sm'
                                : 'text-onyx-400 hover:text-onyx-900 dark:text-onyx-500 dark:hover:text-onyx-200 hover:bg-onyx-50 dark:hover:bg-onyx-800'
                                }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setActiveCategory('FINANCE')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeCategory === 'FINANCE'
                                ? 'bg-indigo-primary text-white shadow-sm'
                                : 'text-onyx-400 hover:text-onyx-900 dark:text-onyx-500 dark:hover:text-onyx-200 hover:bg-onyx-50 dark:hover:bg-onyx-800'
                                }`}
                        >
                            Finanzas
                        </button>
                        <button
                            onClick={() => setActiveCategory('LIFE')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeCategory === 'LIFE'
                                ? 'bg-indigo-primary text-white shadow-sm'
                                : 'text-onyx-400 hover:text-onyx-900 dark:text-onyx-500 dark:hover:text-onyx-200 hover:bg-onyx-50 dark:hover:bg-onyx-800'
                                }`}
                        >
                            Vida
                        </button>
                    </div>
                </div>

                <div className="space-y-8 max-w-7xl mx-auto relative">
                    {/* Edit Mode Banner */}
                    {isEditMode && (
                        <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl animate-fade-in-up">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-300">
                                <LayoutGrid className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-semibold">
                                    <span className="font-black">Modo Edición activo.</span>{' '}
                                    Arrastra los widgets por la barra superior para reordenarlos. Los tamaños se ajustan automáticamente.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsGalleryOpen(true)}
                                className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-primary text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-colors"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                Ver galería
                            </button>
                        </div>
                    )}

                    {/* Smart Insight Widget (Always Visible) */}
                    <div id="smart-insight-widget" className="animate-fade-in-up">
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

                    {/* ── CSS Auto-Sizing Grid ───────────────────────────────────────── */}
                    <div className="grid grid-cols-12 gap-4 auto-rows-auto">
                        {visibleWidgets.map((item) => {
                            const WidgetComponent = WIDGET_REGISTRY[item.i];
                            if (!WidgetComponent) return null;

                            const config = WIDGET_CONFIG[item.i];
                            const colSpanClass = getColSpanClass(config?.size ?? 'half');
                            const isDragging = draggingId === item.i;
                            const isOver = dragOverId === item.i;

                            return (
                                <div
                                    key={item.i}
                                    className={`${colSpanClass} transition-all duration-200 ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'} ${isOver && isEditMode ? 'ring-2 ring-indigo-400 ring-offset-2 rounded-2xl' : ''}`}
                                    draggable={isEditMode}
                                    onDragStart={() => handleDragStart(item.i)}
                                    onDragEnter={() => handleDragEnter(item.i)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <WidgetWrapper
                                        widgetId={item.i}
                                        isEditMode={isEditMode}
                                    >
                                        <WidgetComponent {...widgetProps} />
                                    </WidgetWrapper>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <GlobalSearch
                    isOpen={isSearchOpen}
                    onClose={() => setIsSearchOpen(false)}
                />
            </div>

            {/* Widget Gallery Panel */}
            <WidgetGallery
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
            />
        </div>
    );
};

export default CustomizableDashboard;
