// Global Dashboard Widgets
export type WidgetType = 'NET_WORTH' | 'MONTHLY_FLOW' | 'ACTIVE_GOALS' | 'ACTIVE_DEBTS' | 'SHOPPING_LIST' | 'TODAY_MENU' | 'RECENT_TRANSACTIONS' | 'EXPLORER' | 'CATEGORY_CHART' | 'TREND_CHART' | 'COMPARISON_CHART' | 'SPENDING_FORECAST' | 'FAMILY_AGENDA' | 'BUDGET_STATUS' | 'PROJECTION_WIDGET' | 'TIMELINE_EVOLUTION' | 'FINANCIAL_HEALTH' | 'UPCOMING_PAYMENTS' | 'ANNUAL_COMPARISON' | 'MONTHLY_GOALS' | 'RECIPE_FAVORITES' | 'WEEKLY_PLAN' | 'UPCOMING_TRIPS' | 'FAMILY_TASKS' | 'CRITICAL_INVENTORY' | 'ACCOUNTS_SUMMARY';

export type WidgetCategory = 'FINANCE' | 'LIFE' | 'ALL';

export interface DashboardWidget {
    id: string;
    visible: boolean;
    order: number;
}

export type FinanceWidgetType = 'HEALTH_SCORE' | 'KPI_CARDS' | 'BUDGET_GOALS_SUMMARY' | 'CHART_EVOLUTION' | 'CHART_FLOW' | 'TOP_EXPENSES' | 'RECENT_LIST';

export interface WidgetLayout {
    i: string;              // Widget ID
    x: number;              // Grid position X
    y: number;              // Grid position Y
    w: number;              // Width (1-12)
    h: number;              // Height (1-4)
    minW?: number;          // Minimum width
    minH?: number;          // Minimum height
    maxW?: number;          // Maximum width
    maxH?: number;          // Maximum height
    static?: boolean;       // Cannot be moved/resized
    visible?: boolean;      // Visibility toggle
    sizeOverride?: 'kpi' | 'half' | 'wide' | 'sidebar' | 'full'; // User-overridden size from drop zone

}

export interface DashboardLayout {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    widgets: WidgetLayout[];
    createdAt: string;
    updatedAt: string;
}
