import React from 'react';
import { Check, ShieldCheck, FileText, AlertCircle, ExternalLink, Globe2 } from 'lucide-react';

interface ChecklistItem {
    id: string;
    task: string;
    completed: boolean;
}

interface TravelDocumentsProps {
    checklist?: ChecklistItem[];
}

export const TravelDocuments: React.FC<TravelDocumentsProps> = ({ checklist }) => {
    return (
        <div className="space-y-8">
            <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Preparación y Visados</h3>
                        <p className="text-xs font-medium text-gray-500 mt-1">Asegúrate de tener todo listo antes de embarcar.</p>
                    </div>
                </div>

                {checklist && checklist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {checklist.map(item => (
                            <div key={item.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${item.completed ? 'bg-white border-emerald-200 shadow-sm opacity-70' : 'bg-white border-gray-100 shadow-sm hover:border-gray-300'}`}>
                                <button className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-gray-50 border-gray-300'}`}>
                                    {item.completed && <Check className="w-3 h-3" />}
                                </button>
                                <span className={`text-sm font-bold ${item.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.task}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/50 p-6 rounded-2xl text-center border border-emerald-200/50">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Lista de verificación vacía</p>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">Bóveda de Viaje (Vault)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <Globe2 className="w-5 h-5" />
                        </div>
                        <h4 className="font-black text-gray-900 text-sm">Pasaportes</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">2 Documentos</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h4 className="font-black text-gray-900 text-sm">Pólizas de Seguro</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">1 Documento</p>
                    </div>
                </div>
            </div>

            <div className="bg-orange-50/50 p-4 rounded-2xl flex gap-3 border border-orange-100">
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                <p className="text-xs font-medium text-orange-700">
                    Recuerda que tienes documentos caducados en tu Bóveda. Revisa el Pasaporte de Joel antes del viaje a Costa Amalfitana.
                </p>
            </div>
        </div>
    );
};
