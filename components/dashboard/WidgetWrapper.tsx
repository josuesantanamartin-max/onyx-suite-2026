import React from 'react';
import { GripVertical, X, Eye, EyeOff } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { WIDGET_CONFIG } from './WidgetRegistry';

interface WidgetWrapperProps {
    widgetId: string;
    isEditMode: boolean;
    children: React.ReactNode;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
    widgetId,
    isEditMode,
    children,
}) => {
    const { removeWidgetFromLayout, toggleWidgetVisibility, dashboardLayouts, activeLayoutId } = useUserStore();

    const activeLayout = dashboardLayouts.find(l => l.id === activeLayoutId);
    const widgetLayout = activeLayout?.widgets.find(w => w.i === widgetId);
    const isVisible = widgetLayout?.visible !== false;
    const widgetLabel = WIDGET_CONFIG[widgetId]?.label ?? widgetId;

    return (
        <div className={`h-full bg-white dark:bg-onyx-900 rounded-2xl shadow-sm border overflow-hidden relative flex flex-col transition-all duration-200 ${isEditMode
                ? 'border-indigo-300 dark:border-indigo-700 shadow-indigo-100 dark:shadow-indigo-900/20'
                : 'border-onyx-100 dark:border-onyx-800'
            }`}>

            {/* ── Drag Bar (visible only in edit mode) ── */}
            {isEditMode && (
                <div
                    className="drag-handle flex items-center justify-between px-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 border-b border-indigo-100 dark:border-indigo-900 cursor-grab active:cursor-grabbing select-none shrink-0 group/bar"
                    title="Arrastrar para mover"
                >
                    {/* Left: grip + name */}
                    <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="w-4 h-4 text-indigo-400 dark:text-indigo-500 shrink-0 group-hover/bar:text-indigo-600 dark:group-hover/bar:text-indigo-300 transition-colors" />
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest truncate">
                            {widgetLabel}
                        </span>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleWidgetVisibility(widgetId); }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${isVisible
                                    ? 'text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                                    : 'text-onyx-400 hover:bg-onyx-100 dark:hover:bg-onyx-800'
                                }`}
                            title={isVisible ? 'Ocultar widget' : 'Mostrar widget'}
                        >
                            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{isVisible ? 'Ocultar' : 'Mostrar'}</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); removeWidgetFromLayout(widgetId); }}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-all"
                            title="Eliminar widget del layout"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Quitar</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Widget Content ── */}
            <div className={`flex-1 overflow-auto custom-scrollbar transition-opacity min-h-0 ${!isVisible && isEditMode ? 'opacity-25 grayscale pointer-events-none' : 'opacity-100'
                }`}>
                {children}
            </div>

            {/* ── Hidden overlay ── */}
            {!isVisible && isEditMode && (
                <div className="absolute inset-0 top-[38px] flex items-center justify-center z-10">
                    <button
                        onClick={() => toggleWidgetVisibility(widgetId)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-onyx-800 border border-indigo-200 dark:border-indigo-700 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-300 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <Eye className="w-4 h-4" />
                        Mostrar widget
                    </button>
                </div>
            )}
        </div>
    );
};

export default WidgetWrapper;
