import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, Heart, Settings, LogOut, HelpCircle } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { Logo } from './Logo';

interface SidebarProps {
  onLogout?: () => void;
}

const SIDEBAR_TEXTS = {
  ES: {
    dashboard: 'Onyx Central',
    finance: 'Finanzas',
    life: 'Vida',
    settings: 'Ajustes',
    help: 'Ayuda',
    logout: 'Salir',
    suite: 'ONYX SUITE'
  },
  EN: {
    dashboard: 'Onyx Central',
    finance: 'Finance',
    life: 'Life',
    settings: 'Settings',
    help: 'Help',
    logout: 'Log Out',
    suite: 'ONYX SUITE'
  },
  FR: {
    dashboard: 'Accueil',
    finance: 'Finances',
    life: 'Vie',
    settings: 'Paramètres',
    help: 'Aide',
    logout: 'Quitter',
    suite: 'ONYX SUITE'
  }
};

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const {
    activeApp, setActiveApp,
    isSidebarOpen: isOpen, setSidebarOpen: setIsOpen,
    language,
    userProfile,
    subscription
  } = useUserStore();

  const t = SIDEBAR_TEXTS[language];

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'finance', label: t.finance, icon: Wallet },
    { id: 'life', label: t.life, icon: Heart },
  ];

  const handleLinkClick = (app: string) => {
    setActiveApp(app);
    if (setIsOpen) setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-onyx-950/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsOpen && setIsOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-onyx-950 border-r border-onyx-100 dark:border-onyx-800 h-screen flex flex-col transition-all duration-500 ease-in-out z-30 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <div className="p-10 pb-6 flex-1 flex flex-col">
          <div
            className="flex items-center gap-3.5 mb-14 cursor-pointer group"
            onClick={() => handleLinkClick('dashboard')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-700 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 shadow-lg shadow-indigo-500/30">
              <Logo className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-onyx-950 dark:text-white uppercase leading-none">Onyx <span className="text-indigo-primary">Suite</span></span>
              <span className="text-[8px] font-bold text-onyx-300 dark:text-onyx-600 uppercase tracking-[0.2em] mt-1.5">Premium Management</span>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeApp === item.id;
              return (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${isActive
                    ? 'text-onyx-950 dark:text-white font-bold bg-onyx-50 dark:bg-onyx-900 border border-onyx-100 dark:border-onyx-800 shadow-sm'
                    : 'text-onyx-400 dark:text-onyx-500 hover:text-onyx-900 dark:hover:text-onyx-200 hover:bg-onyx-50/50 dark:hover:bg-onyx-900/50'
                    }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {isActive && (
                    <motion.div layoutId="activeScreenIndicator" className="absolute left-0 w-1 h-6 bg-indigo-primary rounded-r-full" />
                  )}
                  <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-indigo-primary scale-110' : 'text-onyx-400 group-hover:text-onyx-600 group-hover:scale-110'}`} />
                  <span className="text-[13px] tracking-tight">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleLinkClick('settings')}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${activeApp === 'settings' ? 'text-onyx-950 dark:text-white font-bold bg-onyx-50 dark:bg-onyx-900 border border-onyx-100 dark:border-onyx-800 shadow-sm' : 'text-onyx-400 dark:text-onyx-500 hover:text-onyx-900 dark:hover:text-onyx-200 hover:bg-onyx-50/50 dark:hover:bg-onyx-900/50'}`}
            >
              <Settings className={`w-5 h-5 transition-transform duration-500 group-hover:rotate-90 ${activeApp === 'settings' ? 'text-indigo-primary' : 'text-onyx-400'}`} />
              <span className="text-[13px] tracking-tight">{t.settings}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleLinkClick('help')}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${activeApp === 'help' ? 'text-onyx-950 dark:text-white font-bold bg-onyx-50 dark:bg-onyx-900 border border-onyx-100 dark:border-onyx-800 shadow-sm' : 'text-onyx-400 dark:text-onyx-500 hover:text-onyx-900 dark:hover:text-onyx-200 hover:bg-onyx-50/50 dark:hover:bg-onyx-900/50'}`}
            >
              <HelpCircle className={`w-5 h-5 transition-all duration-300 ${activeApp === 'help' ? 'text-indigo-primary' : 'text-onyx-400 group-hover:text-onyx-600'}`} />
              <span className="text-[13px] tracking-tight">{t.help}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-onyx-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="text-[13px] tracking-tight">{t.logout}</span>
            </motion.button>
          </div>
        </div>

        <div className="p-10 pt-0">
          <div className="h-px bg-onyx-100 dark:bg-onyx-800 w-full mb-8"></div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-4 px-2 cursor-pointer group hover:bg-onyx-50 dark:hover:bg-onyx-900 p-2 rounded-xl transition-all"
            onClick={() => handleLinkClick('settings')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-onyx-100 flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {(userProfile?.full_name || userProfile?.email || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className={`flex flex-col transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
              <span className="text-sm font-bold text-onyx-950 dark:text-white truncate max-w-[140px] group-hover:text-indigo-primary transition-colors">
                {userProfile?.full_name || 'Usuario Onyx'}
              </span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                {subscription?.plan === 'FAMILIA' ? 'Premium' :
                  subscription?.plan === 'PERSONAL' ? 'Pro' : 'Onyx Basic'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
