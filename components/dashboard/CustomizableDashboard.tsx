import React, { useState, useMemo } from 'react';
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUserStore } from '../../store/useUserStore';
import { useLifeStore } from '../../store/useLifeStore';
import {
    Settings, ChevronLeft, ChevronRight, Coffee, Sunset, Moon
} from 'lucide-react';
import { DashboardLayout } from '../../types';

import { WIDGET_REGISTRY, WIDGET_CONFIG, DashboardDataProps } from './WidgetRegistry';
import WidgetWrapper from './WidgetWrapper';
import LayoutSelector from './LayoutSelector';
import WidgetGallery from './WidgetGallery';
import EditModeToolbar from './EditModeToolbar';
import SmartInsightWidget from './SmartInsightWidget';
import { useDashboardSync } from '../../hooks/useDashboardSync';
import CreateLayoutModal from './CreateLayoutModal';

const GREETINGS = {
    morning: { text: 'Buenos días', sub: 'Comienza tu día con éxito.', icon: Coffee },
    afternoon: { text: 'Buenas tardes', sub: 'Mantén el ritmo de hoy.', icon: Sunset },
    evening: { text: 'Buenas noches', sub: 'Revisa tus logros de hoy.', icon: Moon },
};

const CustomizableDashboard: React.FC = () => {
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
    const { weeklyPlan, pantryItems, shoppingList, familyMembers } = useLifeStore();

    // Sincronización con Supabase
    useDashboardSync();

    const [timeMode, setTimeMode] = useState<'MONTH' | 'YEAR'>('MONTH');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [tempLayout, setTempLayout] = useState<Layout>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
        }));
    }, [activeLayout, isEditMode]);

    const handleLayoutChange = (newLayout: Layout) => {
        if (!isEditMode) return;
        setTempLayout(newLayout);
    };

    const handleSaveLayout = () => {
        if (!activeLayout) return;

        const updatedWidgets = tempLayout.map(item => ({
            i: (item as any).i,
            x: (item as any).x,
            y: (item as any).y,
            w: (item as any).w,
            h: (item as any).h,
            minW: (item as any).minW,
            minH: (item as any).minH,
            maxW: (item as any).maxW,
            maxH: (item as any).maxH,
        }));

        saveLayout({
            ...activeLayout,
            widgets: updatedWidgets,
        });

        setEditMode(false);
    };

    const handleCancelEdit = () => {
        setTempLayout([]);
        setEditMode(false);
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

                // Generar nuevo ID para evitar conflictos
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
        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 pb-32">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-primary font-bold text-xs uppercase tracking-widest mb-1.5">
                        <greeting.icon className="w-4 h-4" /> {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <h1 className="text-4xl font-black text-onyx-950 tracking-tight dark:text-white">Onyx Central</h1>
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
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-3 rounded-2xl bg-white dark:bg-onyx-900 text-onyx-400 hover:text-onyx-900 dark:text-onyx-500 dark:hover:text-onyx-200 border border-onyx-100 dark:border-onyx-800 shadow-sm transition-all"
                            title="Cambiar Tema"
                        >
                            {theme === 'dark' ? <Sunset className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <LayoutSelector />

                        {!isEditMode ? (
                            <button
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
                            />
                        )}
                    </div>
                </div>
            </header>

            {/* Widget Gallery (only in edit mode) */}
            {isEditMode && <WidgetGallery />}

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Smart Insight Widget (Always Visible) */}
                <div className="animate-fade-in-up">
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
                <GridLayout
                    className="layout"
                    layout={gridLayout}
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
                >
                    {gridLayout.map((item) => {
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
            </div>
        </div>
    );
};

export default CustomizableDashboard;
