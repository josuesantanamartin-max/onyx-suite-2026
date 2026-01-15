
import { supabase } from './supabaseClient';

export const storageService = {
    /**
     * Upload a file to a Supabase storage bucket
     * @param bucket The name of the bucket (e.g., 'receipts', 'avatars')
     * @param path The path within the bucket
     * @param file The file object to upload
     */
    async uploadFile(bucket: string, path: string, file: File) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                upsert: true
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return publicUrl;
    },

    /**
     * Delete a file from a Supabase storage bucket
     */
    async deleteFile(bucket: string, path: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) throw error;
    }
};
