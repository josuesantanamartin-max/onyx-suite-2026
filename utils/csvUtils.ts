import { Transaction } from '../types';
import { MERCHANT_MAPPINGS } from '../config/merchantMappings';

/**
 * Detect the delimiter used in a CSV file
 */
export const detectDelimiter = (csvText: string): string => {
    const firstLine = csvText.split('\n')[0];
    const delimiters = [',', ';', '\t', '|'];

    let maxCount = 0;
    let detectedDelimiter = ',';

    delimiters.forEach(delimiter => {
        const count = (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
        if (count > maxCount) {
            maxCount = count;
            detectedDelimiter = delimiter;
        }
    });

    return detectedDelimiter;
};

/**
 * Parse date from various formats to YYYY-MM-DD
 */
export const parseDate = (dateStr: string, format?: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];

    // Clean the date string
    const cleaned = dateStr.trim();

    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
        return cleaned;
    }

    // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    const ddmmyyyyMatch = cleaned.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (ddmmyyyyMatch) {
        const [, day, month, year] = ddmmyyyyMatch;
        // Assume DD/MM/YYYY for European format
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // YYYY/MM/DD or YYYY.MM.DD
    const yyyymmddMatch = cleaned.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (yyyymmddMatch) {
        const [, year, month, day] = yyyymmddMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try to parse as Date object (handles many formats)
    try {
        const date = new Date(cleaned);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        // Fall through to default
    }

    // Default to today if parsing fails
    return new Date().toISOString().split('T')[0];
};

/**
 * Detect date format from sample dates
 */
export const detectDateFormat = (dates: string[]): string => {
    if (dates.length === 0) return 'YYYY-MM-DD';

    const sample = dates.filter(d => d && d.trim()).slice(0, 10);

    // Check for YYYY-MM-DD
    if (sample.every(d => /^\d{4}-\d{2}-\d{2}$/.test(d))) {
        return 'YYYY-MM-DD';
    }

    // Check for DD/MM/YYYY
    if (sample.every(d => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d))) {
        return 'DD/MM/YYYY';
    }

    // Check for MM/DD/YYYY
    if (sample.every(d => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d))) {
        // Ambiguous - could be DD/MM or MM/DD
        // Default to DD/MM for European context
        return 'DD/MM/YYYY';
    }

    return 'YYYY-MM-DD';
};

/**
 * Clean and normalize description text
 */
export const cleanDescription = (description: string | undefined | null): string => {
    if (!description) return 'Sin descripción';

    // Convert to string and trim
    let cleaned = String(description).trim();

    // Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Remove common problematic characters but keep useful ones
    // Keep: letters, numbers, spaces, basic punctuation (.,;:()/-€$)
    cleaned = cleaned.replace(/[^\w\s.,;:()\/-€$áéíóúñÁÉÍÓÚÑüÜ]/gi, '');

    // If after cleaning it's empty, return default
    if (!cleaned || cleaned.trim() === '') {
        return 'Sin descripción';
    }

    // Capitalize first letter
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

    return cleaned;
};

/**
 * Normalize amount string to number
 */
export const normalizeAmount = (amountStr: string): number => {
    if (!amountStr) return 0;

    // Remove currency symbols and spaces
    let cleaned = amountStr.toString().replace(/[€$£\s]/g, '');

    // Handle European format (1.234,56 -> 1234.56)
    if (cleaned.includes(',') && cleaned.includes('.')) {
        // If comma comes after dot, it's European format
        if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
            // American format, just remove commas
            cleaned = cleaned.replace(/,/g, '');
        }
    } else if (cleaned.includes(',')) {
        // Only comma - could be decimal separator or thousands
        // If there are 2 digits after comma, it's decimal
        if (/,\d{2}$/.test(cleaned)) {
            cleaned = cleaned.replace(',', '.');
        } else {
            cleaned = cleaned.replace(/,/g, '');
        }
    }

    return parseFloat(cleaned) || 0;
};

/**
 * Detect duplicates in transactions
 */
export const detectDuplicates = (
    newTransactions: Partial<Transaction>[],
    existingTransactions: Transaction[]
): { index: number; matches: Transaction[] }[] => {
    const duplicates: { index: number; matches: Transaction[] }[] = [];

    newTransactions.forEach((newTx, index) => {
        const matches = existingTransactions.filter(existingTx => {
            // Match by date, amount, and description
            const sameDate = existingTx.date === newTx.date;
            const sameAmount = Math.abs(existingTx.amount - (newTx.amount || 0)) < 0.01;
            const sameDescription = existingTx.description?.toLowerCase().trim() ===
                newTx.description?.toLowerCase().trim();

            return sameDate && sameAmount && sameDescription;
        });

        if (matches.length > 0) {
            duplicates.push({ index, matches });
        }
    });

    return duplicates;
};

/**
 * Validate transaction data
 */
export interface ValidationError {
    row: number;
    field: string;
    message: string;
    value: any;
}

export const validateTransactions = (
    transactions: Partial<Transaction>[]
): ValidationError[] => {
    const errors: ValidationError[] = [];

    transactions.forEach((tx, index) => {
        const row = index + 1;

        // Validate date
        if (!tx.date || tx.date === 'Invalid Date') {
            errors.push({
                row,
                field: 'date',
                message: 'Fecha inválida o faltante',
                value: tx.date
            });
        }

        // Validate amount
        if (tx.amount === undefined || tx.amount === null || isNaN(tx.amount)) {
            errors.push({
                row,
                field: 'amount',
                message: 'Cantidad inválida o faltante',
                value: tx.amount
            });
        }

        // Validate description
        if (!tx.description || tx.description.trim() === '' || tx.description === 'Sin descripción') {
            errors.push({
                row,
                field: 'description',
                message: 'Descripción faltante o genérica',
                value: tx.description
            });
        }
    });

    return errors;
};

/**
 * Get statistics from transactions
 */
export interface TransactionStats {
    total: number;
    income: number;
    expense: number;
    totalIncome: number;
    totalExpense: number;
    dateRange: { from: string; to: string };
    categories: { [key: string]: number };
}

export const getTransactionStats = (
    transactions: Partial<Transaction>[]
): TransactionStats => {
    const stats: TransactionStats = {
        total: transactions.length,
        income: 0,
        expense: 0,
        totalIncome: 0,
        totalExpense: 0,
        dateRange: { from: '', to: '' },
        categories: {}
    };

    if (transactions.length === 0) return stats;

    const dates = transactions.map(t => t.date).filter(Boolean).sort();
    stats.dateRange.from = dates[0] || '';
    stats.dateRange.to = dates[dates.length - 1] || '';

    transactions.forEach(tx => {
        if (tx.type === 'INCOME') {
            stats.income++;
            stats.totalIncome += tx.amount || 0;
        } else {
            stats.expense++;
            stats.totalExpense += tx.amount || 0;
        }

        if (tx.category) {
            stats.categories[tx.category] = (stats.categories[tx.category] || 0) + 1;
        }
    });

    return stats;
};

/**
 * Detect category and subcategory from description using merchant mappings
 */
export const detectCategoryFromDescription = (
    description: string
): { category: string; subCategory?: string } | null => {
    if (!description) return null;

    const cleanedDescription = description.toUpperCase();

    for (const mapping of MERCHANT_MAPPINGS) {
        if (mapping.keywords.some(keyword => cleanedDescription.includes(keyword))) {
            return {
                category: mapping.category,
                subCategory: mapping.subCategory
            };
        }
    }

    return null;
};

/**
 * Map category from CSV to existing categories
 */
export const mapCategory = (
    categoryStr: string | undefined | null,
    availableCategories: { id: string; name: string; subCategories: string[] }[],
    description?: string // Added description parameter
): { category: string; subCategory?: string } => {
    // 1. Try to detect by merchant description first (most accurate for bank CSVs)
    if (description) {
        const detected = detectCategoryFromDescription(description);
        if (detected) return detected;
    }

    if (!categoryStr) return { category: 'Otros' };

    const cleaned = categoryStr.trim().toLowerCase();

    // 2. Try exact match
    for (const cat of availableCategories) {
        if (cat.name.toLowerCase() === cleaned) {
            return { category: cat.name };
        }

        // Check subcategories
        for (const subCat of cat.subCategories) {
            if (subCat.toLowerCase() === cleaned) {
                return { category: cat.name, subCategory: subCat };
            }
        }
    }

    // 3. Try partial match
    for (const cat of availableCategories) {
        if (cleaned.includes(cat.name.toLowerCase()) || cat.name.toLowerCase().includes(cleaned)) {
            return { category: cat.name };
        }
    }

    return { category: 'Otros' };
};

/**
 * Detect subcategory from description
 */
export const detectSubCategory = (
    description: string,
    category: string,
    categories: { id: string; name: string; subCategories: string[] }[]
): string | undefined => {
    if (!description) return undefined;

    const cleaned = description.toLowerCase();
    const categoryObj = categories.find(c => c.name === category);

    if (!categoryObj) return undefined;

    // Check if any subcategory keyword appears in description
    for (const subCat of categoryObj.subCategories) {
        const subCatLower = subCat.toLowerCase();
        if (cleaned.includes(subCatLower)) {
            return subCat;
        }
    }

    return undefined;
};

/**
 * Calculate balance impact from transactions
 */
export const calculateBalanceImpact = (
    transactions: Partial<Transaction>[],
    currentBalance: number
): { impact: number; finalBalance: number; incomeTotal: number; expenseTotal: number } => {
    let incomeTotal = 0;
    let expenseTotal = 0;

    transactions.forEach(tx => {
        if (tx.type === 'INCOME') {
            incomeTotal += tx.amount || 0;
        } else {
            expenseTotal += tx.amount || 0;
        }
    });

    const impact = incomeTotal - expenseTotal;
    const finalBalance = currentBalance + impact;

    return {
        impact,
        finalBalance,
        incomeTotal,
        expenseTotal
    };
};
