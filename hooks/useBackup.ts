import { useState, useEffect } from 'react';
import { BackupService, BackupConfig, BackupMetadata } from '../services/BackupService';
import { useUserStore } from '../store/useUserStore';

/**
 * Hook for managing backups
 */
export const useBackup = () => {
    const { userProfile } = useUserStore();
    const [config, setConfig] = useState<BackupConfig>(BackupService.getConfig());
    const [backups, setBackups] = useState<BackupMetadata[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    // Load backups on mount
    useEffect(() => {
        loadBackups();
    }, []);

    // Check for automatic backup on mount and periodically
    useEffect(() => {
        const checkAutoBackup = async () => {
            if (userProfile?.id && BackupService.shouldCreateBackup()) {
                console.log('Automatic backup needed, creating...');
                await createBackup();
            }
        };

        checkAutoBackup();

        // Check every hour
        const interval = setInterval(checkAutoBackup, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [userProfile, config]);

    const loadBackups = () => {
        const list = BackupService.getBackupList();
        setBackups(list);
    };

    const updateConfig = (updates: Partial<BackupConfig>) => {
        BackupService.updateConfig(updates);
        setConfig(BackupService.getConfig());
    };

    const createBackup = async (): Promise<boolean> => {
        if (!userProfile?.id) {
            console.error('No user logged in');
            return false;
        }

        setIsCreating(true);
        try {
            const metadata = await BackupService.createBackup(userProfile.id);
            if (metadata) {
                loadBackups();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error creating backup:', error);
            return false;
        } finally {
            setIsCreating(false);
        }
    };

    const restoreBackup = async (backupId: string): Promise<boolean> => {
        if (!userProfile?.id) {
            console.error('No user logged in');
            return false;
        }

        setIsRestoring(true);
        try {
            const success = await BackupService.restoreBackup(backupId, userProfile.id);
            if (success) {
                // Reload the page to refresh all data
                window.location.reload();
            }
            return success;
        } catch (error) {
            console.error('Error restoring backup:', error);
            return false;
        } finally {
            setIsRestoring(false);
        }
    }; "

    const deleteBackup = (backupId: string): boolean => {
        const success = BackupService.deleteBackup(backupId);
        if (success) {
            loadBackups();
        }
        return success;
    };

    const downloadBackup = (backupId: string): void => {
        BackupService.downloadBackup(backupId);
    };

    return {
        config,
        backups,
        isCreating,
        isRestoring,
        updateConfig,
        createBackup,
        restoreBackup,
        deleteBackup,
        downloadBackup,
        loadBackups
    };
};
