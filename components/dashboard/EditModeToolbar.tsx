import React from 'react';
import { Save, X, Plus, Pencil } from 'lucide-react';
import { Button } from '../ui/Button';

interface EditModeToolbarProps {
    onSave: () => void;
    onCancel: () => void;
    onAddWidget?: () => void;
}

const EditModeToolbar: React.FC<EditModeToolbarProps> = ({
    onSave,
    onCancel,
    onAddWidget,
}) => {
    return (
        <div className="flex items-center gap-2">
            {/* Edit mode badge */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <Pencil className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest hidden sm:inline">
                    Editando
                </span>
            </div>

            {/* Add Widget */}
            {onAddWidget && (
                <Button
                    variant="outline"
                    onClick={onAddWidget}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Añadir</span>
                </Button>
            )}

            {/* Save */}
            <Button
                variant="primary"
                onClick={onSave}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Guardar</span>
            </Button>

            {/* Cancel */}
            <Button
                variant="secondary"
                onClick={onCancel}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cancelar</span>
            </Button>
        </div>
    );
};

export default EditModeToolbar;
