import React, { useState, useMemo, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import type { Layout, LayoutItem } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUserStore } from '../../store/useUserStore';
import { useLifeStore } from '../../store/useLifeStore';
import {
    Settings, ChevronLeft, ChevronRight, Coffee, Sunset, Moon, LayoutGrid
} from 'lucide-react';
import { DashboardLayout, WidgetCategory } from '../../types';

import { WIDGET_REGISTRY, WIDGET_CONFIG, DashboardDataProps } from './WidgetRegistry';
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
    const [resizeTooltip, setResizeTooltip] = useState<{ w: number; h: number } | null>(null);

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
    const [tempLayout, setTempLayout] = useState<any[]>([]);
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

    // Convert WidgetLayout[] to Layout[] for react-grid-layout
    const gridLayout = useMemo(() => {
        if (!activeLayout) return [];
        return activeLayout.widgets.map(w => ({
            i: w.i,
            x: w.x,
            y: w.y,
            w: w.w,
            h: w.h,
            minW: w.minW,
            minH: w.minH,
            maxW: w.maxW,
            maxH: w.maxH,
            static: !isEditMode,
            visible: w.visible !== false,
        })) as any[];
    }, [activeLayout, isEditMode]);

    const filteredGridLayout = useMemo(() => {
        return gridLayout.filter(item => {
            if (!isEditMode && item.visible === false) return false;
            if (activeCategory === 'ALL') return true;
            return getWidgetCategory(item.i) === activeCategory;
        });
    }, [gridLayout, activeCategory, isEditMode]);

    const handleLayoutChange = (newLayout: Layout) => {
        if (!isEditMode) return;

        const mergedLayout = newLayout.map(item => {
            const original = gridLayout.find(w => w.i === item.i);
            return {
                ...item,
                visible: original?.visible ?? true
            };
        });

        setTempLayout(mergedLayout);
    };

    // Show resize tooltip briefly
    const handleResizeStop = useCallback((_layout: readonly LayoutItem[], _oldItem: LayoutItem, newItem: LayoutItem | null) => {
        if (!newItem) return;
        setResizeTooltip({ w: newItem.w, h: newItem.h });
        setTimeout(() => setResizeTooltip(null), 2000);
    }, []);

    const handleSaveLayout = () => {
        if (!activeLayout) return;

        const updatedItemsMap = new Map(tempLayout.map(item => [item.i, item]));

        const updatedWidgets = activeLayout.widgets.map(w => {
            const updatedItem = updatedItemsMap.get(w.i);
            if (updatedItem) {
                return {
                    ...w,
                    x: updatedItem.x,
                    y: updatedItem.y,
                    w: updatedItem.w,
                    h: updatedItem.h,
                };
            }
            return w;
        });

        saveLayout({
            ...activeLayout,
            widgets: updatedWidgets,
        });

        setEditMode(false);
        setIsGalleryOpen(false);
    };

    const handleCancelEdit = () => {
        setTempLayout([]);
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

    // Exportar layout
    const handleExportLayout = () => {
        if (!activeLayout) return;

        const dataStr = JSON.stringify(activeLayout, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeLayout.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        link.click();

        URL.revokeObjectURL(url);
    };

    // Importar layout
    const handleImportLayout = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const layout: DashboardLayout = JSON.parse(text);

                layout.id = `imported-${Date.now()}`;
                layout.createdAt = new Date().toISOString();
                layout.updatedAt = new Date().toISOString();

                saveLayout(layout);
                setActiveLayout(layout.id);
            } catch (error) {
                console.error('Error importing layout:', error);
                alert('Error al importar el layout. Verifica que el archivo sea válido.');
            }
        };

        input.click();
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
                                    Arrastra los widgets por la barra superior para reorganizarlos. Usa las esquinas para redimensionarlos.
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

                    {/* Grid Layout */}
                    <div className={`relative dashboard-grid-container ${isEditMode ? 'edit-mode' : ''}`}>
                        <GridLayout
                            className="layout"
                            layout={filteredGridLayout}
                            width={1200}
                            gridConfig={{
                                cols: 12,
                                rowHeight: 80,
                            }}
                            dragConfig={{
                                enabled: isEditMode,
                                handle: ".drag-handle",
                            }}
                            resizeConfig={{
                                enabled: isEditMode,
                            }}
                            onLayoutChange={handleLayoutChange}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onResizeStop={handleResizeStop as any}
                        >
                            {filteredGridLayout.map((item) => {
                                const WidgetComponent = WIDGET_REGISTRY[(item as any).i];
                                if (!WidgetComponent) return null;

                                return (
                                    <div key={(item as any).i}>
                                        <WidgetWrapper
                                            widgetId={(item as any).i}
                                            isEditMode={isEditMode}
                                        >
                                            <WidgetComponent {...widgetProps} />
                                        </WidgetWrapper>
                                    </div>
                                );
                            })}
                        </GridLayout>

                        {/* Resize Tooltip */}
                        {resizeTooltip && (
                            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-onyx-900 dark:bg-white text-white dark:text-onyx-900 rounded-2xl shadow-2xl text-sm font-bold animate-fade-in-up pointer-events-none">
                                <span className="text-indigo-300 dark:text-indigo-600">{resizeTooltip.w}</span>
                                <span className="text-onyx-400 dark:text-onyx-500 text-xs">col ×</span>
                                <span className="text-indigo-300 dark:text-indigo-600">{resizeTooltip.h}</span>
                                <span className="text-onyx-400 dark:text-onyx-500 text-xs">fil</span>
                            </div>
                        )}
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
