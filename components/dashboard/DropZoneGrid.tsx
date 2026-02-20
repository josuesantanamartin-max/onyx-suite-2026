import React, { useCallback, useRef, useState } from 'react';
import { WidgetSize, WIDGET_CONFIG, WIDGET_REGISTRY, getColSpanClass, DashboardDataProps } from './WidgetRegistry';
import WidgetWrapper from './WidgetWrapper';
import { useUserStore } from '../../store/useUserStore';

/**
 * A drop zone slot definition — maps a position in the grid to a size.
 * Widgets dragged into a slot adopt its size automatically.
 */
export interface DropZoneSlot {
    id: string;              // e.g. "zone-wide", "zone-half-1"
    size: WidgetSize;        // size this zone enforces
    label: string;           // shown inside empty slot
    colClass: string;        // Tailwind col-span class
}

// Predefined row templates (displayed in edit mode for the user to target)
export const ZONE_ROWS: DropZoneSlot[][] = [
    // Row 1: 8 + 4
    [
        { id: 'zone-wide', size: 'wide', label: 'Ancho (⅔)', colClass: 'col-span-12 lg:col-span-8' },
        { id: 'zone-sidebar', size: 'sidebar', label: 'Lateral (⅓)', colClass: 'col-span-12 lg:col-span-4' },
    ],
    // Row 2: 6 + 6
    [
        { id: 'zone-half-1', size: 'half', label: 'Mitad', colClass: 'col-span-12 md:col-span-6' },
        { id: 'zone-half-2', size: 'half', label: 'Mitad', colClass: 'col-span-12 md:col-span-6' },
    ],
    // Row 3: 3 + 3 + 3 + 3
    [
        { id: 'zone-kpi-1', size: 'kpi', label: 'KPI', colClass: 'col-span-6 lg:col-span-3' },
        { id: 'zone-kpi-2', size: 'kpi', label: 'KPI', colClass: 'col-span-6 lg:col-span-3' },
        { id: 'zone-kpi-3', size: 'kpi', label: 'KPI', colClass: 'col-span-6 lg:col-span-3' },
        { id: 'zone-kpi-4', size: 'kpi', label: 'KPI', colClass: 'col-span-6 lg:col-span-3' },
    ],
    // Row 4: full
    [
        { id: 'zone-full', size: 'full', label: 'Completo', colClass: 'col-span-12' },
    ],
];

interface Props {
    widgetItems: Array<{ i: string; visible?: boolean; sizeOverride?: WidgetSize }>;
    widgetOrder: string[];
    isEditMode: boolean;
    draggingId: string | null;
    onDragStart: (id: string) => void;
    onDragEnd: () => void;
    widgetProps: DashboardDataProps;
    onReorder: (from: string, to: string) => void;
}

const DropZoneGrid: React.FC<Props> = ({
    widgetItems,
    widgetOrder,
    isEditMode,
    draggingId,
    onDragStart,
    onDragEnd,
    widgetProps,
    onReorder,
}) => {
    const { changeWidgetSize } = useUserStore();
    const [dragOverZone, setDragOverZone] = useState<string | null>(null);
    const dragOverItem = useRef<string | null>(null);

    const widgetMap = new Map(widgetItems.map(w => [w.i, w]));
    const orderedIds = widgetOrder.filter(id => {
        const w = widgetMap.get(id);
        if (!w) return false;
        if (!isEditMode && w.visible === false) return false;
        return true;
    });

    // Reorder among free-floating widgets
    const handleItemDragEnter = useCallback((id: string) => {
        dragOverItem.current = id;
    }, []);

    const handleItemDragEnd = useCallback((fromId: string) => {
        if (dragOverItem.current && dragOverItem.current !== fromId) {
            onReorder(fromId, dragOverItem.current);
        }
        dragOverItem.current = null;
        onDragEnd();
    }, [onReorder, onDragEnd]);

    // Drop onto a zone → the widget adopts that zone's size
    const handleZoneDrop = useCallback((e: React.DragEvent, slot: DropZoneSlot) => {
        e.preventDefault();
        if (draggingId) {
            changeWidgetSize(draggingId, slot.size);
        }
        setDragOverZone(null);
        onDragEnd();
    }, [draggingId, changeWidgetSize, onDragEnd]);

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="space-y-4">
            {isEditMode && (
                /* Zone target display — shows all possible zones as drop targets */
                <div className="space-y-3">
                    <p className="text-[11px] font-black text-onyx-400 dark:text-onyx-500 uppercase tracking-widest">
                        Arrastra un widget a una zona para cambiar su tamaño
                    </p>
                    {ZONE_ROWS.map((row, rowIdx) => (
                        <div key={rowIdx} className="grid grid-cols-12 gap-3">
                            {row.map(slot => {
                                const isOver = dragOverZone === slot.id;
                                const isDraggingAny = !!draggingId;
                                return (
                                    <div
                                        key={slot.id}
                                        className={`${slot.colClass} h-16 flex items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-150 ${isDraggingAny
                                            ? isOver
                                                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 scale-[1.02] shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                                                : 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 cursor-copy'
                                            : 'border-onyx-200 dark:border-onyx-700/60 bg-onyx-50/60 dark:bg-onyx-800/30'
                                            }`}
                                        onDragOver={(e) => { e.preventDefault(); setDragOverZone(slot.id); }}
                                        onDragLeave={() => setDragOverZone(null)}
                                        onDrop={(e) => handleZoneDrop(e, slot)}
                                    >
                                        <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${isOver ? 'text-indigo-500' : 'text-onyx-300 dark:text-onyx-600'}`}>
                                            {slot.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Widget Grid ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-12 gap-5">
                {orderedIds.map((id) => {
                    const WidgetComponent = WIDGET_REGISTRY[id];
                    if (!WidgetComponent) return null;

                    const widgetData = widgetMap.get(id);
                    const config = WIDGET_CONFIG[id];
                    // sizeOverride wins over default size from config
                    const effectiveSize = (widgetData?.sizeOverride ?? config?.size ?? 'half') as WidgetSize;
                    const colSpanClass = getColSpanClass(effectiveSize);
                    const isDragging = draggingId === id;

                    return (
                        <div
                            key={id}
                            className={`${colSpanClass} transition-all duration-200 ${isDragging ? 'opacity-40 scale-[0.97]' : 'opacity-100'}`}
                            draggable={isEditMode}
                            onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(id); }}
                            onDragEnter={() => handleItemDragEnter(id)}
                            onDragEnd={() => handleItemDragEnd(id)}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <WidgetWrapper widgetId={id} isEditMode={isEditMode}>
                                <WidgetComponent {...widgetProps} />
                            </WidgetWrapper>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DropZoneGrid;
