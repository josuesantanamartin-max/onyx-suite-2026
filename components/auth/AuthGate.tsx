import React, { useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useUserStore } from '../../store/useUserStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import OnyxLanding from '../layout/OnyxLanding';

interface AuthGateProps {
    children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
    const {
        isAuthenticated, setAuthenticated,
        isDemoMode, setDemoMode,
        language, setLanguage,
        addSyncLog, setUserProfile
    } = useUserStore();

    const { loadFromCloud } = useFinanceStore();

    // --- AUTH INITIALIZATION ---
    useEffect(() => {
        // Handle Demo Mode
        if (isDemoMode) {
            setAuthenticated(true);
            return;
        }

        if (supabase) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    setAuthenticated(true);
                    setUserProfile(session.user);
                    loadFromCloud();
                    addSyncLog({ message: "Conectado a Onyx Cloud (Supabase)", timestamp: Date.now(), type: "SYSTEM" });
                }
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                if (session) {
                    setAuthenticated(true);
                    setDemoMode(false);
                    setUserProfile(session.user);
                    loadFromCloud();
                } else if (!isDemoMode) {
                    setAuthenticated(false);
                    setUserProfile(null);
                }
            });

            return () => subscription.unsubscribe();
        }
    }, [isDemoMode, setAuthenticated, setDemoMode, addSyncLog, setUserProfile, loadFromCloud]);

    const handleLogin = async (method: 'DEMO' | 'GOOGLE' | 'APPLE' | 'EMAIL' | 'NOTION', data?: { email: string, password: string, isRegister: boolean }) => {
        if (method === 'DEMO') {
            setDemoMode(true);
            setAuthenticated(true);
            addSyncLog({ message: "Modo Demo activado (Local)", timestamp: Date.now(), type: "SYSTEM" });
        } else if (method === 'GOOGLE' && supabase) {
            await supabase.auth.signInWithOAuth({ provider: 'google' });
        } else if (method === 'NOTION' && supabase) {
            await supabase.auth.signInWithOAuth({ provider: 'notion' });
        } else if (method === 'EMAIL' && supabase && data) {
            try {
                if (data.isRegister) {
                    const { error } = await supabase.auth.signUp({
                        email: data.email,
                        password: data.password,
                    });
                    if (error) throw error;
                    alert("¡Registro con éxito! Por favor, verifica tu email o inicia sesión.");
                } else {
                    const { error } = await supabase.auth.signInWithPassword({
                        email: data.email,
                        password: data.password,
                    });
                    if (error) throw error;
                }
            } catch (error: any) {
                alert(`Error de autenticación: ${error.message}`);
                console.error(error);
            }
        } else if (!supabase) {
            alert("Para activar el login real, configura las claves de Supabase en tu entorno.");
        }
    };

    if (!isAuthenticated) {
        return <OnyxLanding onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
    }

    return <>{children}</>;
};

export default AuthGate;
