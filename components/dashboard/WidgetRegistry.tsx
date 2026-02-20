import React from 'react';

// Finance Widgets
import NetWorthCard from '../features/finance/dashboard/widgets/NetWorthCard';
import MonthlyFlowWidget from '../features/finance/dashboard/widgets/MonthlyFlowWidget';
import ActiveGoalsWidget from '../features/finance/dashboard/widgets/ActiveGoalsWidget';
import ActiveDebtsWidget from '../features/finance/dashboard/widgets/ActiveDebtsWidget';
import CategoryDistributionChart from '../features/finance/dashboard/widgets/CategoryDistributionChart';
import BudgetStatusWidget from '../features/finance/dashboard/widgets/BudgetStatusWidget';
import TransactionExplorer from '../features/finance/dashboard/widgets/TransactionExplorer';
import SpendingForecast from '../features/finance/dashboard/widgets/SpendingForecast';
import FinanceProjectionWidget from '../features/finance/FinanceProjectionWidget';
import TimelineEvolutionWidget from '../features/finance/dashboard/widgets/TimelineEvolutionWidget';
import AccountsSummaryWidget from '../features/finance/dashboard/widgets/AccountsSummaryWidget';

// New Dashboard Widgets
import FinancialHealthWidget from './widgets/FinancialHealthWidget';
import UpcomingPaymentsWidget from './widgets/UpcomingPaymentsWidget';
import AnnualComparisonWidget from './widgets/AnnualComparisonWidget';
import MonthlyGoalsWidget from './widgets/MonthlyGoalsWidget';

// Life Widgets
import DailyMenuWidget from '../features/life/dashboard/widgets/DailyMenuWidget';
import PantryStatusWidget from '../features/life/dashboard/widgets/PantryStatusWidget';
import FamilyAgendaWidget from '../features/life/dashboard/widgets/FamilyAgendaWidget';
import RecipeFavoritesWidget from '../features/life/dashboard/widgets/RecipeFavoritesWidget';
import WeeklyPlanWidget from '../features/life/dashboard/widgets/WeeklyPlanWidget';
import UpcomingTripsWidget from '../features/life/dashboard/widgets/UpcomingTripsWidget';
import FamilyTasksWidget from '../features/life/dashboard/widgets/FamilyTasksWidget';
import CriticalInventoryWidget from '../features/life/dashboard/widgets/CriticalInventoryWidget';
import ShoppingListWidget from '../features/life/dashboard/widgets/ShoppingListWidget';

// Types
import { Transaction, Account, Debt, Goal, CategoryStructure, Budget } from '@/types';

export const WIDGET_REGISTRY: Record<string, React.ComponentType<any>> = {
    'NET_WORTH': NetWorthCard,
    'MONTHLY_FLOW': MonthlyFlowWidget,
    'CATEGORY_CHART': CategoryDistributionChart,
    'EXPLORER': TransactionExplorer,
    'ACTIVE_GOALS': ActiveGoalsWidget,
    'ACTIVE_DEBTS': ActiveDebtsWidget,
    'SPENDING_FORECAST': SpendingForecast,
    'TODAY_MENU': DailyMenuWidget,
    'SHOPPING_LIST': PantryStatusWidget,
    'SHOPPING_LIST_FULL': ShoppingListWidget,
    'FAMILY_AGENDA': FamilyAgendaWidget,
    'BUDGET_STATUS': BudgetStatusWidget,
    'PROJECTION_WIDGET': FinanceProjectionWidget,
    'TIMELINE_EVOLUTION': TimelineEvolutionWidget,
    'FINANCIAL_HEALTH': FinancialHealthWidget,
    'UPCOMING_PAYMENTS': UpcomingPaymentsWidget,
    'ANNUAL_COMPARISON': AnnualComparisonWidget,
    'MONTHLY_GOALS': MonthlyGoalsWidget,
    'RECIPE_FAVORITES': RecipeFavoritesWidget,
    'WEEKLY_PLAN': WeeklyPlanWidget,
    'UPCOMING_TRIPS': UpcomingTripsWidget,
    'FAMILY_TASKS': FamilyTasksWidget,
    'CRITICAL_INVENTORY': CriticalInventoryWidget,
    'ACCOUNTS_SUMMARY': AccountsSummaryWidget,
};

/**
 * Widget size categories:
 *  kpi     → 3 cols  — Single metric card (number + trend)
 *  half    → 6 cols  — Half-width card (goals, debts, health)
 *  wide    → 8 cols  — Wide chart/card (net worth, projection)
 *  sidebar → 4 cols  — Sidebar panel (agenda, menu, accounts)
 *  full    → 12 cols — Full-width (tables, charts, explorer)
 */
export type WidgetSize = 'kpi' | 'half' | 'wide' | 'sidebar' | 'full';

export function getColSpanClass(size: WidgetSize): string {
    switch (size) {
        case 'kpi': return 'col-span-12 sm:col-span-6 lg:col-span-3';
        case 'half': return 'col-span-12 md:col-span-6';
        case 'wide': return 'col-span-12 lg:col-span-8';
        case 'sidebar': return 'col-span-12 md:col-span-6 lg:col-span-4';
        case 'full': return 'col-span-12';
        default: return 'col-span-12 md:col-span-6';
    }
}

// Widget Layout Configuration
export const WIDGET_CONFIG: Record<string, { size: WidgetSize; label: string; category: string }> = {
    'NET_WORTH': { size: 'wide', label: 'Patrimonio Neto', category: 'finance' },
    'MONTHLY_FLOW': { size: 'sidebar', label: 'Flujo Mensual', category: 'finance' },
    'CATEGORY_CHART': { size: 'full', label: 'Distribución Gastos', category: 'finance' },
    'EXPLORER': { size: 'full', label: 'Explorador Transacciones', category: 'finance' },
    'ACTIVE_GOALS': { size: 'half', label: 'Metas Activas', category: 'finance' },
    'ACTIVE_DEBTS': { size: 'half', label: 'Deudas Activas', category: 'finance' },
    'SPENDING_FORECAST': { size: 'half', label: 'Previsión Gastos', category: 'finance' },
    'BUDGET_STATUS': { size: 'full', label: 'Estado Presupuestos', category: 'finance' },
    'PROJECTION_WIDGET': { size: 'wide', label: 'Proyección Balance', category: 'finance' },
    'TIMELINE_EVOLUTION': { size: 'full', label: 'Evolución Temporal', category: 'finance' },
    'FINANCIAL_HEALTH': { size: 'half', label: 'Salud Financiera', category: 'finance' },
    'UPCOMING_PAYMENTS': { size: 'half', label: 'Próximos Pagos', category: 'finance' },
    'ANNUAL_COMPARISON': { size: 'half', label: 'Comparativa Anual', category: 'finance' },
    'MONTHLY_GOALS': { size: 'half', label: 'Objetivos del Mes', category: 'finance' },
    'ACCOUNTS_SUMMARY': { size: 'sidebar', label: 'Resumen Cuentas', category: 'finance' },
    'TODAY_MENU': { size: 'wide', label: 'Menú de Hoy', category: 'life' },
    'SHOPPING_LIST': { size: 'sidebar', label: 'Despensa & Lista', category: 'life' },
    'SHOPPING_LIST_FULL': { size: 'half', label: 'Lista de Compra Completa', category: 'life' },
    'FAMILY_AGENDA': { size: 'sidebar', label: 'Agenda Familiar', category: 'life' },
    'RECIPE_FAVORITES': { size: 'half', label: 'Recetas Favoritas', category: 'life' },
    'WEEKLY_PLAN': { size: 'full', label: 'Plan Semanal', category: 'life' },
    'UPCOMING_TRIPS': { size: 'half', label: 'Próximos Viajes', category: 'life' },
    'FAMILY_TASKS': { size: 'half', label: 'Tareas Familiares', category: 'life' },
    'CRITICAL_INVENTORY': { size: 'half', label: 'Inventario Crítico', category: 'life' },
};

// Helper type for props passed to dynamic widgets
export interface DashboardDataProps {
    transactions: Transaction[];
    accounts: Account[];
    debts: Debt[];
    goals: Goal[];
    categories: CategoryStructure[];
    budgets: Budget[];

    // Computed values
    monthlyIncome: number;
    monthlyExpenses: number;

    // UI State
    onNavigate: (app: string, tab?: string) => void;
    selectedDate: Date;
    timeMode: 'MONTH' | 'YEAR';

    // Handlers
    onFilter?: (category: string, subCategory?: string) => void;
}
