import React, { useState } from 'react';
import { ChevronDown, Check, Copy, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

const LayoutSelector: React.FC = () => {
    const { dashboardLayouts, activeLayoutId, setActiveLayout, duplicateLayout, renameLayout, deleteLayout } = useUserStore();
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const activeLayout = dashboardLayouts.find(l => l.id === activeLayoutId);

    const handleRename = (id: string, e: React.FormEvent) => {
        e.preventDefault();
        if (editName.trim()) {
            renameLayout(id, editName.trim());
            setEditingId(null);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-onyx-900 border border-onyx-200 dark:border-onyx-700 rounded-xl text-sm font-bold hover:bg-onyx-50 dark:hover:bg-onyx-800 transition-colors shadow-sm"
            >
                <span className="text-onyx-700 dark:text-onyx-200">{activeLayout?.name || 'Seleccionar Layout'}</span>
                <ChevronDown className="w-4 h-4 text-onyx-400" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                            setIsOpen(false);
                            setEditingId(null);
                        }}
                    />
                    <div className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-onyx-900 border border-onyx-200 dark:border-onyx-700 rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-fade-in-up">
                        <div className="px-4 py-2 border-b border-onyx-100 dark:border-onyx-800 mb-2">
                            <span className="text-[10px] font-black text-onyx-400 uppercase tracking-widest">Tus Dashboards</span>
                        </div>

                        {dashboardLayouts.map((layout) => (
                            <div
                                key={layout.id}
                                className={`group relative w-full flex items-center justify-between px-4 py-3 hover:bg-onyx-50 dark:hover:bg-onyx-800 transition-colors ${layout.id === activeLayoutId ? 'bg-indigo-primary/5 dark:bg-indigo-900/10' : ''}`}
                            >
                                <div className="flex-1 mr-4 overflow-hidden">
                                    {editingId === layout.id ? (
                                        <form onSubmit={(e) => handleRename(layout.id, e)} className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full bg-white dark:bg-onyx-700 border border-indigo-primary rounded-lg px-2 py-1 text-sm outline-none"
                                                onBlur={(e) => handleRename(layout.id, e as any)}
                                            />
                                        </form>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setActiveLayout(layout.id);
                                                setIsOpen(false);
                                            }}
                                            className="w-full text-left"
                                        >
                                            <div className="font-bold text-sm text-onyx-900 dark:text-white truncate">
                                                {layout.name}
                                            </div>
                                            {layout.description && (
                                                <div className="text-[10px] text-onyx-400 mt-0.5 truncate">
                                                    {layout.description}
                                                </div>
                                            )}
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {layout.id === activeLayoutId && (
                                        <Check className="w-4 h-4 text-indigo-primary mr-1" />
                                    )}

                                    {!layout.isDefault && editingId !== layout.id && (
                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                            <button
                                                onClick={() => duplicateLayout(layout.id)}
                                                className="p-1.5 hover:bg-indigo-soft dark:hover:bg-indigo-900/30 rounded-lg text-onyx-400 hover:text-indigo-primary"
                                                title="Duplicar"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingId(layout.id);
                                                    setEditName(layout.name);
                                                }}
                                                className="p-1.5 hover:bg-indigo-soft dark:hover:bg-indigo-900/30 rounded-lg text-onyx-400 hover:text-indigo-primary"
                                                title="Renombrar"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('¿Seguro que quieres eliminar este dashboard?')) {
                                                        deleteLayout(layout.id);
                                                    }
                                                }}
                                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-onyx-400 hover:text-red-500"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default LayoutSelector;
