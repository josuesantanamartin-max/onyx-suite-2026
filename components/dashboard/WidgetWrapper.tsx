import React from 'react';
import { GripVertical, X, Eye, EyeOff, Square, Columns, Maximize2, Layout, StretchHorizontal } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { WIDGET_CONFIG, WidgetSize } from './WidgetRegistry';

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
    const { removeWidgetFromLayout, toggleWidgetVisibility, changeWidgetSize, dashboardLayouts, activeLayoutId } = useUserStore();

    const activeLayout = dashboardLayouts.find(l => l.id === activeLayoutId);
    const widgetLayout = activeLayout?.widgets.find(w => w.i === widgetId);
    const isVisible = widgetLayout?.visible !== false;
    const widgetLabel = WIDGET_CONFIG[widgetId]?.label ?? widgetId;

    return (
        <div
            className={`h-full min-h-[180px] bg-white dark:bg-onyx-900 rounded-2xl overflow-hidden relative flex flex-col transition-all duration-200 ${isEditMode
                ? 'ring-2 ring-indigo-400/60 dark:ring-indigo-600/60 shadow-lg shadow-indigo-100/80 dark:shadow-indigo-950/40'
                : 'shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)] border border-onyx-100/70 dark:border-onyx-800/70 hover:shadow-[0_4px_24px_rgba(0,0,0,0.09)] dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:-translate-y-px'
                }`}
        >
            {/* ── Drag Bar (edit mode only) ── */}
            {isEditMode && (
                <div
                    className="drag-handle flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/50 border-b border-indigo-100 dark:border-indigo-800/60 cursor-grab active:cursor-grabbing select-none shrink-0 group/bar"
                    title="Arrastra para mover"
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-500 shrink-0 group-hover/bar:text-indigo-600 dark:group-hover/bar:text-indigo-400 transition-colors" />
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.12em] truncate">
                            {widgetLabel}
                        </span>
                    </div>

                    {/* Quick Resize Controls */}
                    <div className="flex items-center gap-1 px-2 border-x border-indigo-200/50 dark:border-indigo-800/40 mx-2 overflow-hidden">
                        {(['kpi', 'sidebar', 'half', 'wide', 'full'] as WidgetSize[]).map((size) => {
                            const isCurrent = widgetLayout?.sizeOverride === size || (!widgetLayout?.sizeOverride && WIDGET_CONFIG[widgetId]?.size === size);

                            let Icon = Square;
                            if (size === 'sidebar') Icon = Columns;
                            if (size === 'half') Icon = Layout;
                            if (size === 'wide') Icon = Maximize2;
                            if (size === 'full') Icon = StretchHorizontal;

                            const label = size === 'kpi' ? 'KPI' :
                                size === 'sidebar' ? 'Lateral' :
                                    size === 'half' ? 'Mitad' :
                                        size === 'wide' ? 'Ancho' : 'Completo';

                            return (
                                <button
                                    key={size}
                                    onClick={(e) => { e.stopPropagation(); changeWidgetSize(widgetId, size); }}
                                    className={`p-1 rounded-md transition-all ${isCurrent
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-indigo-400/70 hover:bg-indigo-100 hover:text-indigo-600 dark:text-indigo-500/50 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300'
                                        }`}
                                    title={`Cambiar a ${label}`}
                                >
                                    <Icon className="w-3 h-3" />
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleWidgetVisibility(widgetId); }}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${isVisible
                                ? 'text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:text-indigo-600'
                                : 'text-onyx-300 hover:bg-onyx-100 dark:hover:bg-onyx-800 hover:text-onyx-600'
                                }`}
                            title={isVisible ? 'Ocultar' : 'Mostrar'}
                        >
                            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); removeWidgetFromLayout(widgetId); }}
                            className="p-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-all"
                            title="Quitar del layout"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Widget Content ── */}
            <div className={`flex-1 overflow-auto custom-scrollbar transition-all min-h-0 ${!isVisible && isEditMode ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'}`}>
                {children}
            </div>

            {/* ── Hidden overlay ── */}
            {!isVisible && isEditMode && (
                <div className="absolute inset-0 top-[44px] flex items-center justify-center z-10 bg-white/60 dark:bg-onyx-900/60 backdrop-blur-sm">
                    <button
                        onClick={() => toggleWidgetVisibility(widgetId)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-onyx-800 border border-indigo-200 dark:border-indigo-700/60 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-300 shadow-xl hover:scale-105 hover:shadow-2xl transition-all"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Mostrar widget
                    </button>
                </div>
            )}
        </div>
    );
};

export default WidgetWrapper;
