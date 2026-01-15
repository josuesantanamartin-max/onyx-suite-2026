import React, { useState } from 'react';
import { Language } from '../../types';
import { Logo } from './Logo';
import { LANDING_TEXTS } from './landing/landingData';
import { LandingHeader } from './landing/LandingHeader';
import { LandingFooter } from './landing/LandingFooter';
import { LandingHome } from './landing/LandingHome';
import { LandingFinance } from './landing/LandingFinance';
import { LandingLife } from './landing/LandingLife';

interface OnyxLandingProps {
  onLogin: (method: 'DEMO' | 'GOOGLE' | 'APPLE' | 'EMAIL' | 'NOTION', data?: { email: string, password: string, isRegister: boolean }) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const OnyxLanding: React.FC<OnyxLandingProps> = ({ onLogin, language, setLanguage }) => {
  const [currentView, setCurrentView] = useState<'HOME' | 'FINANCE' | 'LIFE'>('HOME');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const t = LANDING_TEXTS[language];

  // Logic for Login Modal (Copied from original)
  const renderLoginModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowLoginModal(false)}>
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Logo className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">Bienvenido a Onyx</h3>
        <p className="text-gray-500 text-sm mb-8">Selecciona tu método de acceso</p>

        <div className="space-y-3">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isRegister ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
            >
              INICIAR SESIÓN
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isRegister ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
            >
              REGISTRARSE
            </button>
          </div>

          <div className="space-y-2 text-left mb-6">
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              onClick={async () => {
                setAuthLoading(true);
                await onLogin('EMAIL', { email, password, isRegister });
                setAuthLoading(false);
              }}
              disabled={authLoading || !email || !password}
              className="w-full py-4 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? 'Procesando...' : (isRegister ? 'Crear Cuenta' : 'Entrar con Email')}
            </button>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-2 text-gray-400">Otras opciones</span></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => onLogin('GOOGLE')} className="py-3 rounded-xl border border-gray-200 font-bold text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
            </button>
            <button onClick={() => onLogin('APPLE')} className="py-3 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm">
              <img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-4 h-4 invert" alt="Apple" />
            </button>
            <button onClick={() => onLogin('NOTION')} className="py-3 rounded-xl border border-gray-200 font-bold text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-4 h-4" alt="Notion" />
            </button>
          </div>

          <div className="pt-2">
            <button onClick={() => onLogin('DEMO')} className="w-full py-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600 transition-all">
              {t.ctaDemo}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const navigateTo = (view: 'HOME' | 'FINANCE' | 'LIFE') => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-black selection:text-white">
      {showLoginModal && renderLoginModal()}

      <LandingHeader
        language={language}
        setLanguage={setLanguage}
        setShowLoginModal={setShowLoginModal}
        onNavigate={navigateTo}
        currentView={currentView}
        t={t}
      />

      <main>
        {currentView === 'HOME' && (
          <LandingHome
            t={t}
            language={language}
            setShowLoginModal={setShowLoginModal}
            onNavigate={navigateTo}
          />
        )}
        {currentView === 'FINANCE' && (
          <LandingFinance
            t={t}
            language={language}
            setShowLoginModal={setShowLoginModal}
          />
        )}
        {currentView === 'LIFE' && (
          <LandingLife
            t={t}
            language={language}
            setShowLoginModal={setShowLoginModal}
          />
        )}
      </main>

      <LandingFooter onNavigate={navigateTo} />
    </div>
  );
};

export default OnyxLanding;
