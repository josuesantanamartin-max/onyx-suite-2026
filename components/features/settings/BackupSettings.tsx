import React, { useState } from 'react';
import { Database, Download, Upload, Trash2, Check, AlertCircle, Clock, HardDrive } from 'lucide-react';
import { useBackup } from '../../../hooks/useBackup';
import { BackupService } from '../../../services/BackupService';

/**
 * Backup Settings Component
 * Allows users to configure automatic backups and manage existing backups
 */
const BackupSettings: React.FC = () => {
    const {
        config,
        backups,
        isCreating,
        isRestoring,
        updateConfig,
        createBackup,
        restoreBackup,
        deleteBackup,
        downloadBackup
    } = useBackup();

    const [showConfirmRestore, setShowConfirmRestore] = useState<string | null>(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

    const handleCreateBackup = async () => {
        const success = await createBackup();
        if (success) {
            alert('✅ Backup creado exitosamente');
        } else {
            alert('❌ Error al crear backup');
        }
    };

    const handleRestoreBackup = async (backupId: string) => {
        const success = await restoreBackup(backupId);
        if (!success) {
            alert('❌ Error al restaurar backup');
        }
        setShowConfirmRestore(null);
    };

    const handleDeleteBackup = (backupId: string) => {
        const success = deleteBackup(backupId);
        if (success) {
            alert('✅ Backup eliminado');
        } else {
            alert('❌ Error al eliminar backup');
        }
        setShowConfirmDelete(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Backups Automáticos
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Protege tus datos con copias de seguridad automáticas
                    </p>
                </div>
            </div>

            {/* Configuration Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Configuración</h4>

                {/* Enable Backups */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">Backups Automáticos</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Crear backups automáticamente según la frecuencia configurada
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.autoBackup}
                            onChange={(e) => updateConfig({ autoBackup: e.target.checked, enabled: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {/* Frequency */}
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <label className="block font-medium text-gray-900 dark:text-white mb-2">
                        Frecuencia
                    </label>
                    <select
                        value={config.frequency}
                        onChange={(e) => updateConfig({ frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                        disabled={!config.autoBackup}
                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="daily">Diaria</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                    </select>
                </div>

                {/* Retention */}
                <div className="mb-4">
                    <label className="block font-medium text-gray-900 dark:text-white mb-2">
                        Retención (backups a mantener)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={config.retention}
                        onChange={(e) => updateConfig({ retention: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Los backups más antiguos se eliminarán automáticamente
                    </p>
                </div>

                {/* Last Backup Info */}
                {config.lastBackup && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span>
                            Último backup: {BackupService.formatTimestamp(config.lastBackup)}
                        </span>
                    </div>
                )}
            </div>

            {/* Manual Backup */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Backup Manual</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Crea un backup inmediato de todos tus datos
                </p>
                <button
                    onClick={handleCreateBackup}
                    disabled={isCreating}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isCreating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creando backup...
                        </>
                    ) : (
                        <>
                            <Database className="w-5 h-5" />
                            Crear Backup Ahora
                        </>
                    )}
                </button>
            </div>

            {/* Backups List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 dark:text-white">Backups Disponibles</h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {backups.length} backup{backups.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {backups.length === 0 ? (
                    <div className="text-center py-8">
                        <HardDrive className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">
                            No hay backups disponibles
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Crea tu primer backup para proteger tus datos
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {backups.map((backup) => (
                            <div
                                key={backup.id}
                                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {BackupService.formatTimestamp(backup.timestamp)}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {BackupService.formatSize(backup.size)} • {backup.dataTypes.length} tipos de datos
                                        </p>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                        v{backup.version}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => setShowConfirmRestore(backup.id)}
                                        disabled={isRestoring}
                                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Restaurar
                                    </button>
                                    <button
                                        onClick={() => downloadBackup(backup.id)}
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Descargar
                                    </button>
                                    <button
                                        onClick={() => setShowConfirmDelete(backup.id)}
                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Confirm Restore */}
                                {showConfirmRestore === backup.id && (
                                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <div className="flex items-start gap-2 mb-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                                <p className="font-semibold mb-1">¿Restaurar este backup?</p>
                                                <p>Esto reemplazará todos tus datos actuales. La página se recargará automáticamente.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRestoreBackup(backup.id)}
                                                className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Confirmar Restauración
                                            </button>
                                            <button
                                                onClick={() => setShowConfirmRestore(null)}
                                                className="px-3 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Confirm Delete */}
                                {showConfirmDelete === backup.id && (
                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                                            ¿Eliminar este backup permanentemente?
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDeleteBackup(backup.id)}
                                                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Eliminar
                                            </button>
                                            <button
                                                onClick={() => setShowConfirmDelete(null)}
                                                className="px-3 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-semibold mb-1">Sobre los backups</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                            <li>Los backups se guardan localmente en tu navegador</li>
                            <li>Incluyen transacciones, presupuestos, recetas, viajes y más</li>
                            <li>Puedes descargarlos como archivos JSON</li>
                            <li>Los backups antiguos se eliminan automáticamente según la política de retención</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupSettings;
