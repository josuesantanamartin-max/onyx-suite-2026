import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, X, ArrowRight, Check, AlertCircle, FileText, Settings, Database } from 'lucide-react';
import { Transaction } from '@/types';

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
    type?: string;
}

const STEPS = {
    UPLOAD: 0,
    MAPPING: 1,
    PREVIEW: 2,
};

const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [step, setStep] = useState(STEPS.UPLOAD);
    const [file, setFile] = useState<File | null>(null);
    const [rawData, setRawData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<ColumnMapping>({
        date: '',
        amount: '',
        description: '',
        category: '',
    });
    const [previewData, setPreviewData] = useState<Partial<Transaction>[]>([]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            parseCSV(uploadedFile);
        }
    };

    const parseCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setRawData(results.data);
                if (results.meta.fields) {
                    setHeaders(results.meta.fields);
                    // Try to auto-map
                    autoMapColumns(results.meta.fields);
                }
                setStep(STEPS.MAPPING);
            },
        });
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
        const processed = rawData.map(row => {
            const amountVal = parseFloat(row[mapping.amount]?.replace(/[€$,]/g, '') || '0');

            // Attempt to parse date
            let dateVal = row[mapping.date];
            if (dateVal) {
                // Basic fix for DD/MM/YYYY to YYYY-MM-DD if needed, or rely on input type date format if it matches
                // For now assume standard formats or YYYY-MM-DD
                // If DD/MM/YYYY
                if (dateVal.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                    const [d, m, y] = dateVal.split('/');
                    dateVal = `${y}-${m}-${d}`;
                }
            }

            return {
                date: dateVal || new Date().toISOString().split('T')[0],
                amount: Math.abs(amountVal),
                description: row[mapping.description] || 'Sin descripción',
                category: row[mapping.category] || 'Otros',
                type: amountVal >= 0 ? 'INCOME' : 'EXPENSE',
                isRecurring: false,
            } as Partial<Transaction>;
        });
        setPreviewData(processed);
        setStep(STEPS.PREVIEW);
    };

    const handleFinalImport = () => {
        onImport(previewData);
        onClose();
        // Reset state
        setStep(STEPS.UPLOAD);
        setFile(null);
        setRawData([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-onyx-950/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
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
                                {step === STEPS.MAPPING && '2. Asigna las columnas'}
                                {step === STEPS.PREVIEW && '3. Verifica y confirma'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-onyx-50 rounded-full transition-colors text-onyx-400 hover:text-onyx-950">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
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

                    {step === STEPS.MAPPING && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
                                <Database className="w-5 h-5 text-indigo-primary mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-onyx-900 text-sm">Archivo detectado: {file?.name}</h4>
                                    <p className="text-xs text-onyx-500 mt-1">{rawData.length} filas encontradas. Asigna las columnas correspondientes.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { key: 'date', label: 'Fecha' },
                                    { key: 'amount', label: 'Cantidad / Monto' },
                                    { key: 'description', label: 'Descripción' },
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

                    {step === STEPS.PREVIEW && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4">
                                <Check className="w-5 h-5 text-emerald-600 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-onyx-900 text-sm">Listo para importar</h4>
                                    <p className="text-xs text-onyx-500 mt-1">Se han procesado {previewData.length} transacciones. Revisa los datos antes de confirmar.</p>
                                </div>
                            </div>

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
                                        {previewData.slice(0, 10).map((row, idx) => (
                                            <tr key={idx} className="hover:bg-onyx-50/50 transition-colors">
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
                                        ))}
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
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                        >
                            Confirmar Importación <Check className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CSVImportModal;
