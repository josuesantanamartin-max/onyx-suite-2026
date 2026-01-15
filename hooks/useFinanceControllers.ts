// Logic extracted from App.tsx to manage complex interactions between stores
import { useFinanceStore } from '../store/useFinanceStore';
import { useUserStore } from '../store/useUserStore';
import { Transaction, Trip, Goal } from '../types';

export const useFinanceControllers = () => {
    const {
        transactions, accounts, goals,
        setTransactions, setAccounts, setGoals
    } = useFinanceStore();

    const { automationRules, addSyncLog } = useUserStore();

    const runAutomation = (trigger: string, payload: any) => {
        automationRules.filter(r => r.trigger === trigger && r.isActive).forEach(rule => {
            if (trigger === 'TRANSACTION_OVER_AMOUNT') {
                const tx = payload as Transaction;
                if (rule.threshold && tx.amount > rule.threshold) {
                    if (rule.action === 'SEND_ALERT') {
                        addSyncLog({ message: `⚠️ Alerta Automática: Gasto de ${tx.amount}€ supera el límite de ${rule.threshold}€`, timestamp: Date.now(), type: 'SYSTEM' });
                    }
                }
            }
            // Other rules...
        });
    };

    const addTransaction = (newTransaction: Omit<Transaction, 'id'>, isSync = false) => {
        const transaction: Transaction = { ...newTransaction, id: Math.random().toString(36).substr(2, 9) };
        if (transaction.type === 'EXPENSE') runAutomation('TRANSACTION_OVER_AMOUNT', transaction);

        setTransactions((prev) => [transaction, ...prev]);

        const selectedAccount = accounts.find(a => a.id === transaction.accountId);
        if (selectedAccount) {
            setAccounts((prev) => prev.map(acc => {
                if (selectedAccount.type === 'DEBIT' && selectedAccount.linkedAccountId && acc.id === selectedAccount.linkedAccountId) {
                    return { ...acc, balance: acc.balance + (transaction.type === 'INCOME' ? transaction.amount : -transaction.amount) };
                }
                if (acc.id === transaction.accountId) {
                    return { ...acc, balance: acc.balance + (transaction.type === 'INCOME' ? transaction.amount : -transaction.amount) };
                }
                return acc;
            }));
        }

        if (isSync) addSyncLog({ message: `Gasto sincronizado: ${newTransaction.description} (${newTransaction.amount}€)`, timestamp: Date.now(), type: "FINANCE" });
        else {
            const recurrentMsg = transaction.isRecurring ? ` (Recurrente: ${transaction.frequency || 'Mensual'})` : '';
            addSyncLog({ message: `Nueva transacción registrada${recurrentMsg}`, timestamp: Date.now(), type: "FINANCE" });
        }
    };

    const transfer = (fromAccountId: string, toAccountId: string, amount: number, date: string, goalId?: string, description?: string) => {
        const fromAccount = accounts.find(a => a.id === fromAccountId);
        const toAccount = accounts.find(a => a.id === toAccountId);
        if (!fromAccount || !toAccount) return;

        const outgoing: Transaction = { id: Math.random().toString(36).substr(2, 9), type: 'EXPENSE', amount, date, category: 'Transferencia', subCategory: 'Entre Cuentas', accountId: fromAccountId, description: description || `Transferencia a ${toAccount.name}` };
        const incoming: Transaction = { id: Math.random().toString(36).substr(2, 9), type: 'INCOME', amount, date, category: 'Transferencia', subCategory: 'Desde otra cuenta', accountId: toAccountId, description: description || `Recibido de ${fromAccount.name}` };

        setTransactions((prev) => [incoming, outgoing, ...prev]);
        setAccounts((prev) => prev.map(acc => {
            if (acc.id === fromAccountId) return { ...acc, balance: acc.balance - amount };
            if (acc.id === toAccountId) return { ...acc, balance: acc.balance + amount };
            return acc;
        }));

        if (goalId) {
            const goal = goals.find(g => g.id === goalId);
            if (goal) {
                setGoals((prev) => prev.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g));
                addSyncLog({ message: `Meta actualizada: ${goal.name} (+${amount}€)`, timestamp: Date.now(), type: "FINANCE" });
            }
        }
        addSyncLog({ message: `Traspaso exitoso: ${amount}€ de ${fromAccount.name} a ${toAccount.name}`, timestamp: Date.now(), type: "FINANCE" });
    };

    const editTransaction = (updatedTransaction: Transaction) => {
        const oldTransaction = transactions.find(t => t.id === updatedTransaction.id);
        if (!oldTransaction) return;

        // Revert old balance
        setAccounts((prev) => prev.map(acc => {
            if (acc.id === oldTransaction.accountId) return { ...acc, balance: acc.balance - (oldTransaction.type === 'INCOME' ? oldTransaction.amount : -oldTransaction.amount) };
            return acc;
        }));

        // Apply new balance (async safe way: doing it in one step would be better but keeping App.tsx logic)
        // Wait, map runs sequentially in state updates? No, best to combine logic if possible or do chain.
        // But here I can just do one map if I have access to both.
        // Simplify: just doing what App.tsx did.
        // Actually App.tsx did two setAccounts calls.

        setAccounts((prev) => prev.map(acc => {
            let newBalance = acc.balance;
            if (acc.id === oldTransaction.accountId) newBalance -= (oldTransaction.type === 'INCOME' ? oldTransaction.amount : -oldTransaction.amount); // Revert
            if (acc.id === updatedTransaction.accountId) newBalance += (updatedTransaction.type === 'INCOME' ? updatedTransaction.amount : -updatedTransaction.amount); // Apply
            return { ...acc, balance: newBalance };
        }));

        setTransactions((prev) => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
        addSyncLog({ message: `Transacción actualizada: ${updatedTransaction.description}`, timestamp: Date.now(), type: "FINANCE" });
    };

    const deleteTransaction = (id: string) => {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;
        setAccounts((prev) => prev.map(acc => {
            if (acc.id === transaction.accountId) return { ...acc, balance: acc.balance - (transaction.type === 'INCOME' ? transaction.amount : -transaction.amount) };
            return acc;
        }));
        setTransactions((prev) => prev.filter(t => t.id !== id));
        addSyncLog({ message: `Transacción eliminada: ${transaction.description}`, timestamp: Date.now(), type: "FINANCE" });
    };

    return {
        addTransaction,
        transfer,
        editTransaction,
        deleteTransaction
    };
};
