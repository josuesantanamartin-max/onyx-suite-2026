import { Recipe } from './kitchen'; // Need to import this if it's used in shared types, but wait, types don't import usually unless extending.
// Checking dependencies... 
// Task, Reminder, CalendarEvent don't seem to depend on other custom types except maybe implicitly.
// CalendarEvent uses 'type' strings.

export type Language = 'ES' | 'EN' | 'FR';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Reminder {
    id: string;
    title: string;
    dateTime: string;
    completed: boolean;
}

export interface CalendarEvent {
    id: string;
    title: string;
    date?: string; // Standardized date for logic
    start?: string; // Compatibility with third party calendars
    end?: string;
    allDay?: boolean;
    color?: string;
    type?: 'EVENT' | 'TASK' | 'REMINDER' | 'FINANCE' | 'KITCHEN' | 'LIFE' | 'GOAL';
    amount?: number;
    details?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    icon?: any;
    category?: string;
    targetApp?: string;
    targetTab?: string;
}

export interface AutomationRule {
    id: string;
    name: string;
    trigger: 'TRANSACTION_OVER_AMOUNT' | 'TRIP_CREATED';
    threshold?: number; // Used for TRANSACTION_OVER_AMOUNT
    action: 'SEND_ALERT' | 'CREATE_CATEGORY_FOR_TRIP';
    isActive: boolean;
}

export type VoiceActionType =
    | 'ADD_TRANSACTION'
    | 'NAVIGATE'
    | 'QUERY_DATA'
    | 'CREATE_GOAL'
    | 'UNKNOWN';

export interface VoiceAction {
    type: VoiceActionType;
    confidence: number;
    payload: any; // Flexible payload depending on type
    rawText: string;
}

export interface VoiceState {
    isListening: boolean;
    isProcessing: boolean;
    lastTranscript: string | null;
    lastAction: VoiceAction | null;
    error: string | null;
}

export type PlanType = 'FREE' | 'PERSONAL' | 'FAMILIA';

export interface Subscription {
    id: string;
    userId: string;
    plan: PlanType;
    status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIAL';
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
}

export interface UserPlan {
    type: PlanType;
    features: string[];
    limits: {
        maxAccounts: number;
        maxTransactions: number;
        aiInsights: boolean;
        multiDevice: boolean;
    };
}

export interface SyncLog {
    message: string;
    timestamp: number;
    type: 'FINANCE' | 'KITCHEN' | 'LIFE' | 'SYSTEM';
}

export interface RetirementProjection {
    totalSavings: number;
    monthlyIncome: number;
    yearsOfFunding: number;
}

export interface RetirementPlan {
    id: string;
    userId: string;
    name: string; // e.g. "Early Retirement"
    targetAge: number;
    currentAge: number;
    currentSavings: number;
    monthlyContribution: number;
    expectedReturn: number; // Percentage
    inflationRate: number; // Percentage
    targetMonthlyIncome: number;
    projection?: RetirementProjection; // Calculated, not always stored? Or cached.
    linkedGoalId?: string; // Integration with Goals
    createdAt: string;
    updatedAt: string;
}
