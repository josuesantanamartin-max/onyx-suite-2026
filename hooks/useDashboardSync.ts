import { useEffect, useRef, useCallback } from 'react';
import { useUserStore } from '../store/useUserStore';
import { dashboardSyncService } from '../services/dashboardSyncService';
import { DashboardLayout } from '../types';

export const useDashboardSync = () => {
    const {
        userProfile,
        dashboardLayouts,
        activeLayoutId,
        saveLayout,
        setActiveLayout,
        isEditMode,
    } = useUserStore();

    const syncTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const lastSyncedRef = useRef<string>('');
    const hasLoadedRef = useRef(false);

    /**
     * Carga layouts iniciales desde Supabase
     */
    const loadLayouts = useCallback(async () => {
        if (!userProfile?.id || hasLoadedRef.current) return;

        console.log('📥 Cargando layouts desde Supabase...');

        const layouts = await dashboardSyncService.loadUserLayouts(userProfile.id);

        if (layouts.length > 0) {
            console.log(`✅ ${layouts.length} layouts cargados desde Supabase`);

            // Actualizar store con layouts de Supabase
            layouts.forEach(layout => saveLayout(layout));

            // Buscar y activar el layout activo
            const activeLayout = await dashboardSyncService.getActiveLayout(userProfile.id);
            if (activeLayout) {
                setActiveLayout(activeLayout.id);
            }

            hasLoadedRef.current = true;
        } else {
            console.log('ℹ️ No hay layouts guardados en Supabase, usando defaults');
        }
    }, [userProfile, saveLayout, setActiveLayout]);

    /**
     * Sincroniza cambios con Supabase (con debounce)
     */
    const syncToSupabase = useCallback((layouts: DashboardLayout[]) => {
        if (!userProfile?.id || !isEditMode) return;

        // Cancelar sincronización pendiente
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        // Crear hash de layouts para detectar cambios
        const layoutsHash = JSON.stringify(layouts.map(l => ({
            id: l.id,
            widgets: l.widgets,
            name: l.name,
        })));

        // Si no hay cambios, no sincronizar
        if (layoutsHash === lastSyncedRef.current) {
            return;
        }

        console.log('⏳ Programando sincronización con Supabase en 3s...');

        // Programar sincronización con debounce de 3 segundos
        syncTimeoutRef.current = setTimeout(async () => {
            console.log('🔄 Sincronizando layouts con Supabase...');

            const success = await dashboardSyncService.syncLayouts(userProfile.id!, layouts);

            if (success) {
                lastSyncedRef.current = layoutsHash;
                console.log('✅ Layouts sincronizados con Supabase');
            } else {
                console.error('❌ Error al sincronizar layouts con Supabase');
            }
        }, 3000);
    }, [userProfile, isEditMode]);

    /**
     * Sincroniza layout activo inmediatamente
     */
    const syncActiveLayout = useCallback(async (layoutId: string) => {
        if (!userProfile?.id) return;

        console.log(`🎯 Marcando layout "${layoutId}" como activo en Supabase...`);
        const success = await dashboardSyncService.setActiveLayout(userProfile.id, layoutId);

        if (success) {
            console.log('✅ Layout activo sincronizado');
        }
    }, [userProfile]);

    // Cargar layouts al montar (solo una vez)
    useEffect(() => {
        loadLayouts();
    }, [loadLayouts]);

    // Sincronizar cuando cambien los layouts (solo en modo edición)
    useEffect(() => {
        if (isEditMode) {
            syncToSupabase(dashboardLayouts);
        }
    }, [dashboardLayouts, syncToSupabase, isEditMode]);

    // Sincronizar layout activo cuando cambie
    useEffect(() => {
        if (hasLoadedRef.current) {
            syncActiveLayout(activeLayoutId);
        }
    }, [activeLayoutId, syncActiveLayout]);

    // Limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, []);

    return {
        loadLayouts,
        syncToSupabase,
    };
};
