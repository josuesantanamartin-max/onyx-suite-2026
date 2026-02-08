import { supabase } from './supabaseClient';

export interface BetaInvitation {
    id: string;
    code: string;
    email?: string;
    max_uses: number;
    uses_count: number;
    expires_at?: string;
    created_by?: string;
    created_at: string;
    used_at?: string;
    used_by?: string;
    is_active: boolean;
    metadata?: Record<string, any>;
}

export interface CreateInvitationParams {
    email?: string;
    max_uses?: number;
    expires_at?: string;
    metadata?: Record<string, any>;
}

class InvitationService {
    /**
     * Validate an invitation code
     */
    async validateCode(code: string): Promise<{ valid: boolean; message?: string }> {
        try {
            const { data, error } = await supabase
                .from('beta_invitations')
                .select('*')
                .eq('code', code.toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !data) {
                return { valid: false, message: 'Código de invitación inválido' };
            }

            // Check expiration
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                return { valid: false, message: 'Código de invitación expirado' };
            }

            // Check usage limit
            if (data.uses_count >= data.max_uses) {
                return { valid: false, message: 'Código de invitación agotado' };
            }

            return { valid: true };
        } catch (error) {
            console.error('Error validating invitation code:', error);
            return { valid: false, message: 'Error al validar código' };
        }
    }

    /**
     * Use an invitation code (increment usage count)
     */
    async useCode(code: string, userId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('use_invitation_code', {
                invitation_code: code.toUpperCase(),
                user_id: userId
            });

            if (error) {
                console.error('Error using invitation code:', error);
                return false;
            }

            return data === true;
        } catch (error) {
            console.error('Error using invitation code:', error);
            return false;
        }
    }

    /**
     * Generate a new invitation code
     */
    async generateCode(params: CreateInvitationParams = {}): Promise<string | null> {
        try {
            // Generate code using database function
            const { data: codeData, error: codeError } = await supabase.rpc('generate_invitation_code');

            if (codeError || !codeData) {
                console.error('Error generating code:', codeError);
                return null;
            }

            const code = codeData as string;

            // Insert invitation
            const { error: insertError } = await supabase
                .from('beta_invitations')
                .insert({
                    code,
                    email: params.email,
                    max_uses: params.max_uses || 1,
                    expires_at: params.expires_at,
                    metadata: params.metadata || {}
                });

            if (insertError) {
                console.error('Error creating invitation:', insertError);
                return null;
            }

            return code;
        } catch (error) {
            console.error('Error generating invitation:', error);
            return null;
        }
    }

    /**
     * Create multiple invitation codes
     */
    async generateBatch(count: number, params: CreateInvitationParams = {}): Promise<string[]> {
        const codes: string[] = [];

        for (let i = 0; i < count; i++) {
            const code = await this.generateCode(params);
            if (code) {
                codes.push(code);
            }
        }

        return codes;
    }

    /**
     * Get all invitations (admin only)
     */
    async getAll(): Promise<BetaInvitation[]> {
        try {
            const { data, error } = await supabase
                .from('beta_invitations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching invitations:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching invitations:', error);
            return [];
        }
    }

    /**
     * Get invitation statistics
     */
    async getStats(): Promise<{
        total: number;
        active: number;
        used: number;
        expired: number;
    }> {
        try {
            const { data, error } = await supabase
                .from('beta_invitations')
                .select('*');

            if (error || !data) {
                return { total: 0, active: 0, used: 0, expired: 0 };
            }

            const now = new Date();
            const stats = {
                total: data.length,
                active: data.filter(inv =>
                    inv.is_active &&
                    inv.uses_count < inv.max_uses &&
                    (!inv.expires_at || new Date(inv.expires_at) > now)
                ).length,
                used: data.filter(inv => inv.uses_count >= inv.max_uses).length,
                expired: data.filter(inv =>
                    inv.expires_at && new Date(inv.expires_at) <= now
                ).length
            };

            return stats;
        } catch (error) {
            console.error('Error fetching stats:', error);
            return { total: 0, active: 0, used: 0, expired: 0 };
        }
    }

    /**
     * Deactivate an invitation
     */
    async deactivate(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('beta_invitations')
                .update({ is_active: false })
                .eq('id', id);

            if (error) {
                console.error('Error deactivating invitation:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error deactivating invitation:', error);
            return false;
        }
    }

    /**
     * Delete an invitation
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('beta_invitations')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting invitation:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error deleting invitation:', error);
            return false;
        }
    }
}

export const invitationService = new InvitationService();
