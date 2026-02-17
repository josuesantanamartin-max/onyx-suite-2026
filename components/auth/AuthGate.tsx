import React, { useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useUserStore } from '../../store/useUserStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import OnyxLanding from '../layout/OnyxLanding';
import OnboardingWizard from '../onboarding/OnboardingWizard';

interface AuthGateProps {
    children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
    const {
        isAuthenticated, setAuthenticated,
        isDemoMode, setDemoMode,
        language, setLanguage,
        addSyncLog, setUserProfile,
        hasCompletedOnboarding
    } = useUserStore();

    const { loadFromCloud } = useFinanceStore();

    // --- AUTH INITIALIZATION ---
    useEffect(() => {
        console.log("[AuthGate] Initializing Auth...", { isDemoMode, isAuthenticated, hash: window.location.hash });

        if (supabase) {
            supabase.auth.getSession().then(({ data: { session }, error }) => {
                if (error) {
                    console.error("[AuthGate] Error getting session:", error);
                    return;
                }

                if (session) {
                    console.log("[AuthGate] Session found! Upgrading to real mode.", session.user.email);
                    setAuthenticated(true);
                    setDemoMode(false); // Force exit demo mode if we have a real session
                    setUserProfile(session.user);
                    loadFromCloud();
                    addSyncLog({ message: "Conectado a Onyx Cloud (Supabase)", timestamp: Date.now(), type: "SYSTEM" });
                } else {
                    console.log("[AuthGate] No active session found.");
                    // Only apply demo mode if NO real session exists
                    if (isDemoMode) {
                        console.log("[AuthGate] Falling back to Demo Mode.");
                        setAuthenticated(true);
                    }
                }
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                console.log("[AuthGate] Auth state changed:", event, session?.user?.email);
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
        } else if (isDemoMode) {
            setAuthenticated(true);
        }
    }, [isDemoMode, setAuthenticated, setDemoMode, addSyncLog, setUserProfile, loadFromCloud]);

    const handleLogin = async (method: 'DEMO' | 'GOOGLE' | 'EMAIL' | 'NOTION', data?: { email: string, password: string, isRegister: boolean }) => {
        if (method === 'DEMO') {
            setDemoMode(true);
            setAuthenticated(true);
            addSyncLog({ message: "Modo Demo activado (Local)", timestamp: Date.now(), type: "SYSTEM" });
        } else if (method === 'GOOGLE' && supabase) {
            try {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin
                    }
                });
                if (error) throw error;
            } catch (error: any) {
                alert(`Error al iniciar sesión con Google: ${error.message}`);
                console.error(error);
            }
        } else if (method === 'NOTION' && supabase) {
            try {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'notion',
                    options: {
                        redirectTo: window.location.origin
                    }
                });
                if (error) throw error;
            } catch (error: any) {
                alert(`Error al iniciar sesión con Notion: ${error.message}`);
                console.error(error);
            }
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

    // New: Check for Onboarding Completion check
    if (!hasCompletedOnboarding) {
        return <OnboardingWizard />;
    }

    return <>{children}</>;
};

export default AuthGate;
