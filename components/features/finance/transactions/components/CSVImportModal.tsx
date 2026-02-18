import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, X, ArrowRight, Check, AlertCircle, FileText, Settings, Database, Building2, AlertTriangle } from 'lucide-react';
import { Transaction } from '../../../../../types';
import { parseDate, normalizeAmount, detectDuplicates, validateTransactions, getTransactionStats, ValidationError, cleanDescription, mapCategory, detectSubCategory, calculateBalanceImpact } from '../../../../../utils/csvUtils';
import { getAllBankTemplates, getBankTemplate, BankTemplate } from '../../../../../config/bankTemplates';
import { useFinanceStore } from '../../../../../store/useFinanceStore';

interface CSVImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (transactions: Partial<Transaction>[]) => void;
}

interface ColumnMapping {
    date: string;
    amount: string;
    description: string;
    category: string;
    subCategory?: string;
    type?: string;
}

const STEPS = {
    UPLOAD: 0,
    BANK_SELECT: 1,
    ACCOUNT_SELECT: 2,
    MAPPING: 3,
    PREVIEW: 4,
};

const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const { transactions: existingTransactions, accounts, categories } = useFinanceStore();
    const [step, setStep] = useState(STEPS.UPLOAD);
    const [file, setFile] = useState<File | null>(null);
    const [rawData, setRawData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [selectedBank, setSelectedBank] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [mapping, setMapping] = useState<ColumnMapping>({
        date: '',
        amount: '',
        description: '',
        category: '',
        subCategory: '',
    });
    const [previewData, setPreviewData] = useState<Partial<Transaction>[]>([]);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [duplicates, setDuplicates] = useState<{ index: number; matches: Transaction[] }[]>([]);
    const [showDuplicates, setShowDuplicates] = useState(true);
    const [balanceInfo, setBalanceInfo] = useState<{
        current: number;
        impact: number;
        finalBalance: number;
        incomeTotal: number;
        expenseTotal: number;
    } | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            parseCSV(uploadedFile);
        }
    };

    const parseCSV = (file: File, delimiter?: string) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            delimiter: delimiter,
            complete: (results) => {
                setRawData(results.data);
                if (results.meta.fields) {
                    setHeaders(results.meta.fields);
                }
                setStep(STEPS.BANK_SELECT);
            },
        });
    };

    const handleBankSelect = (bankId: string | null) => {
        setSelectedBank(bankId);

        if (bankId) {
            const template = getBankTemplate(bankId);
            if (template) {
                applyBankTemplate(template);
            }
        } else {
            // Manual mapping
            autoMapColumns(headers);
        }

        setStep(STEPS.ACCOUNT_SELECT);
    };

    const handleAccountSelect = (accountId: string) => {
        setSelectedAccount(accountId);
        setStep(STEPS.MAPPING);
    };

    const applyBankTemplate = (template: BankTemplate) => {
        const newMapping: ColumnMapping = {
            date: template.columns.date,
            amount: template.columns.amount,
            description: template.columns.description,
            category: template.columns.category || '',
            subCategory: '',
            type: template.columns.type,
        };
        setMapping(newMapping);
    };

    const autoMapColumns = (fields: string[]) => {
        const newMapping = { ...mapping };
        const lowerFields = fields.map(f => f.toLowerCase());

        const findMatch = (keywords: string[]) => {
            const index = lowerFields.findIndex(f => keywords.some(k => f.includes(k)));
            return index !== -1 ? fields[index] : '';
        };

        newMapping.date = findMatch(['date', 'fecha', 'time']);
        newMapping.amount = findMatch(['amount', 'cantidad', 'importe', 'monto', 'valor']);
        newMapping.description = findMatch(['description', 'descripción', 'concepto', 'memo', 'detail']);
        newMapping.category = findMatch(['category', 'categoría']);
        newMapping.subCategory = findMatch(['subcategory', 'subcategoría', 'subcat']);

        setMapping(newMapping);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'text/csv') {
            setFile(droppedFile);
            parseCSV(droppedFile);
        }
    };

    const processData = () => {
        const processed = rawData.map((row, index) => {
            const amountVal = normalizeAmount(row[mapping.amount]);
            const dateVal = parseDate(row[mapping.date]);
            const descriptionVal = cleanDescription(row[mapping.description]);

            // Map category from CSV or use intelligent mapping
            let categoryVal = 'Otros';
            let subCategoryVal: string | undefined;

            if (mapping.category && row[mapping.category]) {
                const mapped = mapCategory(row[mapping.category], categories, descriptionVal);
                categoryVal = mapped.category;
                subCategoryVal = mapped.subCategory;
            }

            // If subcategory column exists, use it
            if (mapping.subCategory && row[mapping.subCategory]) {
                subCategoryVal = row[mapping.subCategory];
            }

            // Try to detect subcategory from description if not already set
            if (!subCategoryVal) {
                subCategoryVal = detectSubCategory(descriptionVal, categoryVal, categories);
            }

            // Log para debugging (solo en desarrollo)
            if (process.env.NODE_ENV === 'development') {
                console.log(`Row ${index + 1}:`, {
                    original: row[mapping.description],
                    cleaned: descriptionVal,
                    amount: amountVal,
                    date: dateVal,
                    category: categoryVal,
                    subCategory: subCategoryVal
                });
            }

            return {
                date: dateVal,
                amount: Math.abs(amountVal),
                description: descriptionVal,
                category: categoryVal,
                subCategory: subCategoryVal,
                type: amountVal >= 0 ? 'INCOME' : 'EXPENSE',
                accountId: selectedAccount || undefined,
                isRecurring: false,
            } as Partial<Transaction>;
        });

        // Validate
        const errors = validateTransactions(processed);
        setValidationErrors(errors);

        // Detect duplicates
        const dupes = detectDuplicates(processed, existingTransactions);
        setDuplicates(dupes);

        // Calculate balance impact if account is selected
        if (selectedAccount) {
            const account = accounts.find(a => a.id === selectedAccount);
            if (account) {
                const balanceCalc = calculateBalanceImpact(processed, account.balance);
                setBalanceInfo({
                    current: account.balance,
                    ...balanceCalc
                });
            }
        }

        setPreviewData(processed);
        setStep(STEPS.PREVIEW);
    };

    const handleFinalImport = () => {
        // Filter out duplicates if user chose to skip them
        let toImport = previewData;

        if (!showDuplicates && duplicates.length > 0) {
            const duplicateIndices = new Set(duplicates.map(d => d.index));
            toImport = previewData.filter((_, index) => !duplicateIndices.has(index));
        }

        // Filter out transactions with errors
        if (validationErrors.length > 0) {
            const errorRows = new Set(validationErrors.map(e => e.row - 1));
            toImport = toImport.filter((_, index) => !errorRows.has(index));
        }

        // Import transactions
        onImport(toImport);

        // Update account balance if account was selected
        if (selectedAccount && balanceInfo) {
            const { updateAccountBalance } = useFinanceStore.getState();
            // Use impact instead of finalBalance because updateAccountBalance adds the value
            updateAccountBalance(selectedAccount, balanceInfo.impact);
        }

        onClose();
        resetState();
    };

    const resetState = () => {
        setStep(STEPS.UPLOAD);
        setFile(null);
        setRawData([]);
        setSelectedBank(null);
        setSelectedAccount(null);
        setPreviewData([]);
        setValidationErrors([]);
        setDuplicates([]);
        setBalanceInfo(null);
    };

    if (!isOpen) return null;

    const stats = getTransactionStats(previewData);
    const validCount = previewData.length - validationErrors.length;
    const duplicateCount = duplicates.length;

    return (
        <div className="fixed inset-0 bg-onyx-950/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-onyx-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-indigo-50 text-indigo-primary`}>
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-onyx-950">Importar Transacciones</h2>
                            <p className="text-xs font-medium text-onyx-400 mt-1 uppercase tracking-wider">
                                {step === STEPS.UPLOAD && '1. Sube tu archivo CSV'}
                                {step === STEPS.BANK_SELECT && '2. Selecciona tu banco'}
                                {step === STEPS.ACCOUNT_SELECT && '3. Selecciona la cuenta'}
                                {step === STEPS.MAPPING && '4. Asigna las columnas'}
                                {step === STEPS.PREVIEW && '5. Verifica y confirma'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-onyx-50 rounded-full transition-colors text-onyx-400 hover:text-onyx-950">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    {/* STEP 1: UPLOAD */}
                    {step === STEPS.UPLOAD && (
                        <div
                            className="border-2 border-dashed border-onyx-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:border-indigo-primary/50 hover:bg-indigo-50/10 transition-all cursor-pointer group"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <div className="w-20 h-20 bg-onyx-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                <FileText className="w-10 h-10 text-onyx-300 group-hover:text-indigo-primary transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-onyx-950 mb-2">Arrastra tu archivo CSV aquí</h3>
                            <p className="text-onyx-500 mb-8 max-w-sm">O haz clic para seleccionar un archivo desde tu ordenador. Asegúrate de que tenga encabezados.</p>

                            <label className="bg-onyx-950 hover:bg-onyx-800 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-onyx-950/20 active:scale-95">
                                Seleccionar Archivo
                                <input type="file" onChange={handleFileUpload} accept=".csv" className="hidden" />
                            </label>
                        </div>
                    )}

                    {/* STEP 2: BANK SELECT */}
                    {step === STEPS.BANK_SELECT && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
                                <Building2 className="w-5 h-5 text-indigo-primary mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-onyx-900 text-sm">¿Tu banco está en la lista?</h4>
                                    <p className="text-xs text-onyx-500 mt-1">Selecciona tu banco para mapear automáticamente las columnas, o continúa manualmente.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {getAllBankTemplates().map(bank => (
                                    <button
                                        key={bank.id}
                                        onClick={() => handleBankSelect(bank.id)}
                                        className="p-6 border-2 border-onyx-200 rounded-2xl hover:border-indigo-primary hover:bg-indigo-50/30 transition-all text-center font-bold text-sm text-onyx-900 hover:text-indigo-primary"
                                    >
                                        {bank.name}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handleBankSelect(null)}
                                className="w-full p-4 border-2 border-dashed border-onyx-300 rounded-2xl hover:border-onyx-400 hover:bg-onyx-50 transition-all text-center font-bold text-sm text-onyx-600"
                            >
                                Mi banco no está en la lista (mapeo manual)
                            </button>
                        </div>
                    )}

                    {/* STEP 3: ACCOUNT SELECT */}
                    {step === STEPS.ACCOUNT_SELECT && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
                                <Database className="w-5 h-5 text-indigo-primary mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-onyx-900 text-sm">Selecciona la cuenta bancaria</h4>
                                    <p className="text-xs text-onyx-500 mt-1">Las transacciones se vincularán a esta cuenta y su saldo se actualizará automáticamente.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {accounts.map(account => (
                                    <button
                                        key={account.id}
                                        onClick={() => handleAccountSelect(account.id)}
                                        className="p-6 border-2 border-onyx-200 rounded-2xl hover:border-indigo-primary hover:bg-indigo-50/30 transition-all text-left group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="font-bold text-onyx-900 group-hover:text-indigo-primary transition-colors">{account.name}</h5>
                                                {account.bankName && (
                                                    <p className="text-xs text-onyx-500 mt-1">{account.bankName}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-onyx-400 uppercase tracking-wider">Saldo Actual</p>
                                                <p className="text-lg font-black text-onyx-900 mt-1">{account.balance.toFixed(2)} €</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {accounts.length === 0 && (
                                <div className="text-center p-8 bg-onyx-50 rounded-2xl">
                                    <p className="text-onyx-500 text-sm">No tienes cuentas bancarias creadas. Por favor, crea una cuenta primero.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4: MAPPING */}
                    {step === STEPS.MAPPING && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
                                <Database className="w-5 h-5 text-indigo-primary mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-onyx-900 text-sm">Archivo detectado: {file?.name}</h4>
                                    <p className="text-xs text-onyx-500 mt-1">{rawData.length} filas encontradas. {selectedBank ? `Plantilla ${getBankTemplate(selectedBank)?.name} aplicada.` : 'Asigna las columnas correspondientes.'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { key: 'date', label: 'Fecha *' },
                                    { key: 'amount', label: 'Cantidad / Monto *' },
                                    { key: 'description', label: 'Descripción *' },
                                    { key: 'category', label: 'Categoría (Opcional)' },
                                ].map((field) => (
                                    <div key={field.key} className="space-y-2">
                                        <label className="text-xs font-bold text-onyx-500 uppercase tracking-wider">{field.label}</label>
                                        <select
                                            value={mapping[field.key as keyof ColumnMapping]}
                                            onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                                            className="w-full p-4 bg-onyx-50 border border-onyx-200 rounded-xl font-medium text-onyx-900 focus:ring-2 focus:ring-indigo-primary/20 outline-none transition-all"
                                        >
                                            <option value="">-- Seleccionar Columna --</option>
                                            {headers.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 5: PREVIEW */}
                    {step === STEPS.PREVIEW && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Balance Info */}
                            {balanceInfo && selectedAccount && (
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200">
                                    <h4 className="font-bold text-onyx-900 text-sm mb-4">Impacto en el Saldo</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-onyx-500 uppercase tracking-wider">Saldo Actual</p>
                                            <p className="text-xl font-black text-onyx-900 mt-1">{balanceInfo.current.toFixed(2)} €</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-onyx-500 uppercase tracking-wider">Impacto</p>
                                            <p className={`text-xl font-black mt-1 ${balanceInfo.impact >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {balanceInfo.impact >= 0 ? '+' : ''}{balanceInfo.impact.toFixed(2)} €
                                            </p>
                                            <p className="text-[10px] text-onyx-400 mt-1">
                                                +{balanceInfo.incomeTotal.toFixed(2)} / -{balanceInfo.expenseTotal.toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-onyx-500 uppercase tracking-wider">Saldo Final</p>
                                            <p className="text-xl font-black text-indigo-600 mt-1">{balanceInfo.finalBalance.toFixed(2)} €</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Statistics */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Válidas</p>
                                    <p className="text-2xl font-black text-emerald-700 mt-1">{validCount}</p>
                                </div>
                                {validationErrors.length > 0 && (
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Errores</p>
                                        <p className="text-2xl font-black text-red-700 mt-1">{validationErrors.length}</p>
                                    </div>
                                )}
                                {duplicateCount > 0 && (
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Duplicados</p>
                                        <p className="text-2xl font-black text-amber-700 mt-1">{duplicateCount}</p>
                                    </div>
                                )}
                            </div>

                            {/* Warnings */}
                            {(validationErrors.length > 0 || duplicateCount > 0) && (
                                <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200">
                                    <div className="flex items-start gap-4">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-onyx-900 text-sm">Atención requerida</h4>
                                            {validationErrors.length > 0 && (
                                                <p className="text-xs text-onyx-600 mt-1">{validationErrors.length} transacciones tienen errores y serán omitidas.</p>
                                            )}
                                            {duplicateCount > 0 && (
                                                <div className="mt-2">
                                                    <label className="flex items-center gap-2 text-xs font-medium text-onyx-700 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={!showDuplicates}
                                                            onChange={(e) => setShowDuplicates(!e.target.checked)}
                                                            className="rounded"
                                                        />
                                                        Omitir {duplicateCount} duplicados detectados
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Preview Table */}
                            <div className="overflow-hidden border border-onyx-200 rounded-2xl">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-onyx-50 text-onyx-500 font-bold uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Fecha</th>
                                            <th className="px-6 py-4">Descripción</th>
                                            <th className="px-6 py-4">Categoría</th>
                                            <th className="px-6 py-4 text-right">Cantidad</th>
                                            <th className="px-6 py-4">Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-onyx-100">
                                        {previewData.slice(0, 10).map((row, idx) => {
                                            const hasError = validationErrors.some(e => e.row === idx + 1);
                                            const isDuplicate = duplicates.some(d => d.index === idx);

                                            return (
                                                <tr key={idx} className={`hover:bg-onyx-50/50 transition-colors ${hasError ? 'bg-red-50' : isDuplicate ? 'bg-amber-50' : ''}`}>
                                                    <td className="px-6 py-4 text-onyx-900">{row.date}</td>
                                                    <td className="px-6 py-4 text-onyx-700">{row.description}</td>
                                                    <td className="px-6 py-4 text-onyx-600">
                                                        <span className="px-2 py-1 bg-onyx-100 rounded-lg text-xs font-medium">{row.category}</span>
                                                    </td>
                                                    <td className={`px-6 py-4 text-right font-bold ${row.type === 'INCOME' ? 'text-emerald-600' : 'text-onyx-900'}`}>
                                                        {row.amount?.toFixed(2)} €
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${row.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                            {row.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {previewData.length > 10 && (
                                    <div className="px-6 py-4 bg-onyx-50 text-center text-xs text-onyx-500 font-medium border-t border-onyx-100">
                                        ... y {previewData.length - 10} más
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-onyx-100 bg-onyx-50/30 flex justify-between items-center">
                    {step === STEPS.UPLOAD ? (
                        <div></div>
                    ) : (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-onyx-500 hover:bg-onyx-100 transition-all"
                        >
                            Atrás
                        </button>
                    )}

                    {step === STEPS.BANK_SELECT && <div></div>}

                    {step === STEPS.MAPPING && (
                        <button
                            onClick={processData}
                            disabled={!mapping.date || !mapping.amount}
                            className="bg-onyx-950 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-onyx-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-onyx-950/10"
                        >
                            Continuar <ArrowRight className="w-4 h-4" />
                        </button>
                    )}

                    {step === STEPS.PREVIEW && (
                        <button
                            onClick={handleFinalImport}
                            disabled={validCount === 0}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                        >
                            Importar {validCount} Transacciones <Check className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CSVImportModal;
