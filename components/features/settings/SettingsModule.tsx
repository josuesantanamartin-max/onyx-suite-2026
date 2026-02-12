import React, { useState, useRef } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { useLifeStore } from '../../../store/useLifeStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import {
  User, CreditCard, Shield, Globe, Lock,
  Check, Coins, Star, Download, Smartphone, Plus, Trash2, Camera, Upload, Layers, Zap, ArrowRight, Pencil, Menu, ExternalLink,
  Calendar, FileJson, Layout
} from 'lucide-react';
import { FamilyMember, CategoryStructure, AutomationRule } from '../../../types';
import PricingSection from './PricingSection';
import { stripeService } from '../../../services/stripeService';
import { supabase } from '../../../services/supabaseClient';
import { DEFAULT_WIDGETS } from '../../../constants';
import PrivacyPolicy from '../../pages/PrivacyPolicy';
import TermsOfService from '../../pages/TermsOfService';
import { HouseholdManager } from '../collaboration/HouseholdManager';
import { MemberManagement } from '../collaboration/MemberManagement';
import { HouseholdChat } from '../collaboration/HouseholdChat';
import PrivacySettings from './PrivacySettings';
import { useSampleData } from '../../../hooks/useSampleData';
import SampleDataSection from './SampleDataSection';
import BackupSettings from './BackupSettings';

interface SettingsModuleProps {
  onMenuClick?: () => void;
}

const TEXTS: any = {
  ES: {
    title: 'Ajustes de la Suite',
    subtitle: 'Configuración Global',
    menu: {
      profile: 'Mi Perfil y Familia',
      general: 'Preferencias',
      categories: 'Categorías',
      automation: 'Automatización',
      subscription: 'Suscripción',
      billing: 'Facturación',
      security: 'Seguridad',
      personalization: 'Personalización',
      privacy: 'Privacidad',
      backups: 'Backups'
    },
    sections: {
      profileDesc: 'Gestiona tu identidad y los miembros de tu unidad familiar.',
      generalDesc: 'Idioma, moneda y configuración regional.',
      persDesc: 'Temas, apariencia y organización del dashboard.',
      catDesc: 'Personaliza tu estructura de ingresos y gastos.',
      autoDesc: 'Crea reglas para automatizar alertas y categorización.',
      subDesc: 'Gestiona tu plan Onyx Suite.',
      billDesc: 'Métodos de pago y facturas.',
      secDesc: 'Contraseñas, autenticación de dos factores y zona de peligro.'
    },
    personalization: {
      theme: 'Tema de la Interfaz',
      themeDesc: 'Elige cómo se ve Onyx Suite.',
      layout: 'Diseño del Dashboard',
      layoutDesc: 'Gestiona los widgets de tu pantalla principal.',
      resetLayout: 'Restaurar Diseño Original',
      resetLayoutDesc: 'Vuelve a la configuración inicial de widgets (visible y orden).'
    },
    plan: {
      current: 'Plan Actual',
      pro: 'Onyx Familia',
      free: 'Onyx Basic',
      features: 'Características',
      upgrade: 'Mejorar Plan',
      nextBill: 'Próxima renovación',
      manage: 'Gestionar Suscripción',
      price: '2,99€',
      freq: '/ mes',
      billDate: '12 Oct 2025'
    },
    billing: {
      methods: 'Métodos de Pago',
      add: 'Añadir Método',
      history: 'Historial de Facturas',
      download: 'Descargar'
    },
    featuresList: [
      'Hasta 5 Usuarios',
      'Onyx Vault Compartido',
      'Espacios Compartidos y Roles',
      'Onyx Junior (Modo Niños)',
      'Soporte Prioritario',
      'Modo Offline'
    ],
    resetZone: 'Zona de Peligro',
    resetBtn: 'Restaurar Sistema (Borrar Datos)',
    resetDesc: 'Esto borrará todos los datos locales y recargará la versión de demostración.'
  },
  EN: {
    title: 'Suite Settings',
    subtitle: 'Global Configuration',
    menu: {
      profile: 'My Profile & Family',
      general: 'Preferences',
      categories: 'Categories',
      automation: 'Automation',
      subscription: 'Subscription',
      billing: 'Billing',
      security: 'Security',
      personalization: 'Personalization',
      privacy: 'Privacy'
    },
    sections: {
      profileDesc: 'Manage your identity and family unit members.',
      generalDesc: 'Language, currency and region.',
      persDesc: 'Themes, appearance and dashboard organization.',
      catDesc: 'Customize your income and expense structure.',
      autoDesc: 'Create rules to automate alerts and categorization.',
      subDesc: 'Manage your Onyx Suite plan.',
      billDesc: 'Payment methods and invoices.',
      secDesc: 'Passwords, 2FA and danger zone.'
    },
    personalization: {
      theme: 'Interface Theme',
      themeDesc: 'Choose how Onyx Suite looks.',
      layout: 'Dashboard Layout',
      layoutDesc: 'Manage your home screen widgets.',
      resetLayout: 'Reset Original Layout',
      resetLayoutDesc: 'Return to initial widget configuration (visibility and order).'
    },
    plan: {
      current: 'Current Plan',
      pro: 'Onyx Family',
      free: 'Onyx Basic',
      features: 'Features',
      upgrade: 'Upgrade Plan',
      nextBill: 'Next renewal',
      manage: 'Manage Subscription',
      price: '€2.99',
      freq: '/ month',
      billDate: 'Oct 12, 2025'
    },
    billing: {
      methods: 'Payment Methods',
      add: 'Add Method',
      history: 'Invoice History',
      download: 'Download'
    },
    featuresList: [
      'Up to 5 Users',
      'Shared Onyx Vault',
      'Shared Spaces & Roles',
      'Onyx Junior (Kids Mode)',
      'Priority Support',
      'Offline Mode'
    ],
    resetZone: 'Danger Zone',
    resetBtn: 'System Reset (Clear Data)',
    resetDesc: 'This will wipe all local data and reload the demo version.'
  },
  FR: {
    title: 'Paramètres Suite',
    subtitle: 'Configuration Globale',
    menu: {
      profile: 'Mon Profil et Famille',
      general: 'Préférences',
      categories: 'Catégories',
      automation: 'Automatisation',
      subscription: 'Abonnement',
      billing: 'Facturation',
      security: 'Sécurité',
      personalization: 'Personnalisation',
      privacy: 'Confidentialité'
    },
    sections: {
      profileDesc: 'Gérez votre identité et les membres de la famille.',
      generalDesc: 'Langue, devise et région.',
      persDesc: 'Thèmes, apparence et organisation du tableau de bord.',
      catDesc: 'Personnalisez votre structure de revenus et dépenses.',
      autoDesc: 'Créez des règles pour automatiser les alertes.',
      subDesc: 'Gérer votre plan Onyx Suite.',
      billDesc: 'Méthodes de paiement et factures.',
      secDesc: 'Mots de passe, 2FA et zone de danger.'
    },
    personalization: {
      theme: 'Thème de l\'interface',
      themeDesc: 'Choisissez l\'apparence d\'Onyx Suite.',
      layout: 'Disposition du tableau de bord',
      layoutDesc: 'Gérez vos widgets d\'écran d\'accueil.',
      resetLayout: 'Rétablir la disposition',
      resetLayoutDesc: 'Revenir à la configuration initiale des widgets.'
    },
    plan: {
      current: 'Plan Actuel',
      pro: 'Onyx Famille',
      free: 'Onyx Basic',
      features: 'Fonctionnalités',
      upgrade: 'Mettre à niveau',
      nextBill: 'Prochain renouvellement',
      manage: 'Gérer l\'abonnement',
      price: '2,99€',
      freq: '/ mois',
      billDate: '12 Oct 2025'
    },
    billing: {
      methods: 'Méthodes de Paiement',
      add: 'Ajouter Méthode',
      history: 'Historique des factures',
      download: 'Télécharger'
    },
    featuresList: [
      'Jusqu\'à 5 Utilisateurs',
      'Onyx Vault Partagé',
      'Espaces Partagés et Rôles',
      'Onyx Junior (Mode Enfants)',
      'Support Prioritaire',
      'Mode Hors Ligne'
    ],
    resetZone: 'Zone de Danger',
    resetBtn: 'Réinitialiser Système',
    resetDesc: 'Ceci effacera toutes les données locales et rechargera la démo.'
  }
};

const SettingsModule: React.FC<SettingsModuleProps> = ({ onMenuClick }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const categoryFormRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Legal Pages State
  const [activeLegalPage, setActiveLegalPage] = useState<'PRIVACY' | 'TERMS' | null>(null);

  // Store Hooks
  const {
    language, setLanguage,
    currency, setCurrency,
    theme, setTheme,
    setDashboardWidgets,
    automationRules, setAutomationRules,
    subscription,
    userProfile, setUserProfile
  } = useUserStore();

  const { familyMembers, setFamilyMembers } = useLifeStore();
  const { categories, setCategories } = useFinanceStore();

  // NEW: Calculate Stats for Profile
  const totalTransactions = useFinanceStore(state => state.transactions.length);
  const totalGoals = useFinanceStore(state => state.goals.length);
  const totalRecipes = useLifeStore(state => state.weeklyPlans.reduce((acc, plan) => acc + plan.meals.length, 0)); // Approx activity
  const joinDate = userProfile?.id ? 'Enero 2025' : 'Oct 2024'; // Mock for now or from DB

  const handleExportData = () => {
    const data = {
      userProfile: useUserStore.getState().userProfile,
      finance: {
        transactions: useFinanceStore.getState().transactions,
        accounts: useFinanceStore.getState().accounts,
        budgets: useFinanceStore.getState().budgets,
        goals: useFinanceStore.getState().goals,
        debts: useFinanceStore.getState().debts,
        categories: useFinanceStore.getState().categories,
      },
      life: {
        pantryItems: useLifeStore.getState().pantryItems,
        shoppingList: useLifeStore.getState().shoppingList,
        familyMembers: useLifeStore.getState().familyMembers,
        weeklyPlans: useLifeStore.getState().weeklyPlans,
      },
      settings: {
        language: useUserStore.getState().language,
        currency: useUserStore.getState().currency,
        automationRules: useUserStore.getState().automationRules,
      },
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onyx_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Family Form
  const [isFamilyFormOpen, setIsFamilyFormOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'PARENT' | 'CHILD'>('CHILD');
  const [newMemberBirth, setNewMemberBirth] = useState('');
  const [newMemberImage, setNewMemberImage] = useState<string>('');

  // Category Form
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [newSubCat, setNewSubCat] = useState('');

  // Profile Edit State
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileAvatar, setEditProfileAvatar] = useState('');

  // Init profile edit state when opening modal
  const handleOpenProfileEdit = () => {
    setEditProfileName(userProfile?.full_name || '');
    setEditProfileAvatar(userProfile?.avatar_url || '');
    setIsProfileEditOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!supabase) return;

      const updates = {
        full_name: editProfileName,
        avatar_url: editProfileAvatar,
      };

      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;

      // Update local store
      setUserProfile({
        ...userProfile,
        ...updates
      });

      setIsProfileEditOpen(false);
      alert('Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar perfil: ' + error.message);
    }
  };

  // --- DELETE ACCOUNT LOGIC ---
  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      language === 'ES'
        ? "POR FAVOR ESCRIBE 'DELETE' PARA CONFIRMAR EL BORRADO DE TU CUENTA. ESTA ACCIÓN ES IRREVERSIBLE."
        : "PLEASE TYPE 'DELETE' TO CONFIRM ACCOUNT DELETION. THIS ACTION IS IRREVERSIBLE."
    );

    if (confirmation === 'DELETE') {
      const t = TEXTS[language as string] || TEXTS['ES'];
      // Simulation for MVP
      localStorage.clear();
      alert(language === 'ES' ? 'Cuenta eliminada. Hasta siempre.' : 'Account deleted. Goodbye.');
      window.location.reload();
    }
  };

  // Rule Form
  const [newRuleTrigger, setNewRuleTrigger] = useState<AutomationRule['trigger']>('TRANSACTION_OVER_AMOUNT');
  const [newRuleThreshold, setNewRuleThreshold] = useState('100');
  const [newRuleAction, setNewRuleAction] = useState<AutomationRule['action']>('SEND_ALERT');

  const t = TEXTS[language as string] || TEXTS['ES'];

  const handleResetSystem = () => {
    if (window.confirm('WARNING: ' + t.resetDesc)) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMemberImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName) return;
    const newMember: FamilyMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMemberName,
      relationship: newMemberRole === 'PARENT' ? 'Madre/Padre' : 'Hijo/a',
      role: newMemberRole,
      avatar: newMemberImage || (newMemberRole === 'PARENT' ? '👤' : '👶'),
      birthDate: newMemberBirth,
      balance: 0,
      weeklyAllowance: newMemberRole === 'CHILD' ? 5 : 0,
      growthHistory: []
    };
    setFamilyMembers((prev) => [...prev, newMember]);
    setIsFamilyFormOpen(false);
    setNewMemberName('');
    setNewMemberBirth('');
    setNewMemberImage('');
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm("¿Seguro? Se eliminará el historial de este miembro.")) {
      setFamilyMembers((prev) => prev.filter(m => m.id !== id));
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return '--';
    const ageDifMs = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleEditCategoryClick = (cat: CategoryStructure) => {
    setEditingCatId(cat.id);
    setNewCatName(cat.name);
    setNewCatType(cat.type);
    setNewSubCat(cat.subCategories.join(', '));
    categoryFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const subCategoriesList = newSubCat
      ? newSubCat.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    if (editingCatId) {
      setCategories((prev) => prev.map(c => c.id === editingCatId ? {
        ...c,
        name: newCatName,
        type: newCatType,
        subCategories: subCategoriesList
      } : c));
    } else {
      const newCat: CategoryStructure = {
        id: Math.random().toString(36).substr(2, 9),
        name: newCatName,
        type: newCatType,
        subCategories: subCategoriesList
      };
      setCategories((prev) => [...prev, newCat]);
    }
    resetCategoryForm();
  };

  const resetCategoryForm = () => {
    setEditingCatId(null);
    setNewCatName('');
    setNewSubCat('');
    setNewCatType('EXPENSE');
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm("¿Eliminar categoría? Esto no afectará a transacciones pasadas, pero desaparecerá del selector.")) {
      setCategories((prev) => prev.filter(c => c.id !== id));
    }
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();

    let name = '';
    if (newRuleTrigger === 'TRANSACTION_OVER_AMOUNT') name = `Alerta gasto > ${newRuleThreshold}€`;
    if (newRuleTrigger === 'TRIP_CREATED') name = `Auto-categoría Viajes`;

    const newRule: AutomationRule = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      trigger: newRuleTrigger,
      threshold: parseFloat(newRuleThreshold),
      action: newRuleAction,
      isActive: true
    };

    setAutomationRules((prev) => [...prev, newRule]);
  };

  const handleToggleRule = (id: string) => {
    setAutomationRules((prev) => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleDeleteRule = (id: string) => {
    setAutomationRules((prev) => prev.filter(r => r.id !== id));
  };

  const renderSidebar = () => (
    <div className="w-full md:w-64 bg-white dark:bg-onyx-950 border-r border-gray-100 dark:border-onyx-800 flex-shrink-0 md:h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{t.subtitle}</p>
      </div>
      <nav className="px-3 space-y-1">
        {[
          { id: 'profile', icon: User, label: t.menu.profile },
          { id: 'general', icon: Globe, label: t.menu.general },
          { id: 'personalization', icon: Layout, label: t.menu.personalization },
          { id: 'privacy', icon: Lock, label: t.menu.privacy },
          { id: 'categories', icon: Layers, label: t.menu.categories },
          { id: 'automation', icon: Zap, label: t.menu.automation },
          { id: 'subscription', icon: Star, label: t.menu.subscription },
          { id: 'billing', icon: CreditCard, label: t.menu.billing },
          { id: 'security', icon: Shield, label: t.menu.security },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === item.id
              ? 'bg-gray-100 dark:bg-onyx-800 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-onyx-900 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );

  if (activeLegalPage === 'PRIVACY') {
    return <PrivacyPolicy onBack={() => setActiveLegalPage(null)} />;
  }

  if (activeLegalPage === 'TERMS') {
    return <TermsOfService onBack={() => setActiveLegalPage(null)} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="max-w-3xl space-y-8 animate-fade-in pb-12">

            {/* 1. MINIMALIST HEADER (No Banner) */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12 animate-fade-in">
              <div className="relative group cursor-pointer" onClick={handleOpenProfileEdit}>
                <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-onyx-900 p-1 rounded-full shadow-lg border border-gray-100 dark:border-onyx-800 relative">
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-onyx-800 overflow-hidden relative">
                    {userProfile?.avatar_url ? (
                      <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                        <User className="w-16 h-16" />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 p-2 bg-black border-4 border-white rounded-full text-white shadow-lg">
                  <Pencil className="w-4 h-4" />
                </div>
              </div>

              <div className="text-center md:text-left mb-2">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">{userProfile?.full_name || 'Usuario Onyx'}</h2>
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-gray-500 font-medium text-sm">
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">@josue_onyx</span>
                  <span className="hidden md:inline text-gray-300">•</span>
                  <span>{userProfile?.email || 'user@onyxsuite.com'}</span>
                </div>
              </div>
            </div>

            {/* 2. STATS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="bg-white dark:bg-onyx-900 p-4 rounded-2xl border border-gray-100 dark:border-onyx-800 shadow-sm flex flex-col items-center justify-center text-center hover:border-indigo-100 transition-all">
                <span className="text-2xl font-black text-gray-900 dark:text-white">{totalTransactions}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Transacciones</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-indigo-100 transition-all">
                <span className="text-2xl font-black text-gray-900">{totalGoals}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Metas</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-indigo-100 transition-all">
                <span className="text-2xl font-black text-gray-900">{familyMembers.length}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Familia</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-indigo-100 transition-all">
                <Calendar className="w-6 h-6 text-gray-300 mb-1" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{joinDate}</span>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* 3. HOUSEHOLD & COLLABORATION (Real) */}
            <div className="space-y-8">
              <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800 space-y-4">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Datos y Privacidad
                </h4>
                <p className="text-xs text-indigo-700/80 dark:text-indigo-300 leading-relaxed">
                  Eres dueño de tus datos. Exporta una copia completa de tu actividad financiera y familiar en formato JSON seguro.
                </p>
                <button onClick={handleExportData} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                  <FileJson className="w-4 h-4" /> Exportar Datos
                </button>
              </div>

              {/* Household Management */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Gestión del Hogar</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <HouseholdManager />
                    <MemberManagement />
                  </div>
                  <div className="lg:h-[600px]">
                    <HouseholdChat />
                  </div>
                </div>
              </div>
            </div>


            {/* EDIT PROFILE MODAL (Styled) */}
            {isProfileEditOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <form onSubmit={handleUpdateProfile} className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-fade-in-up relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                  <div className="relative z-10 -mt-2">
                    <div className="w-24 h-24 mx-auto bg-white rounded-full p-2 shadow-lg mb-4">
                      <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden relative">
                        {editProfileAvatar ? <img src={editProfileAvatar} className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-gray-300" />}
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-center text-gray-900 mb-6">Editar Tu Perfil</h3>
                  </div>

                  <div className="space-y-5 relative z-10">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Nombre Completo</label>
                      <input
                        type="text"
                        value={editProfileName}
                        onChange={e => setEditProfileName(e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">URL Avatar</label>
                      <input
                        type="text"
                        value={editProfileAvatar}
                        onChange={e => setEditProfileAvatar(e.target.value)}
                        placeholder="https://..."
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-8 relative z-10">
                    <button
                      type="button"
                      onClick={() => setIsProfileEditOpen(false)}
                      className="px-4 py-3 text-xs font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        );

      case 'general':
        return (
          <div className="max-w-2xl space-y-8 animate-fade-in">
            <div><h3 className="text-lg font-bold text-gray-900">{t.menu.general}</h3><p className="text-sm text-gray-500">{t.sections.generalDesc}</p></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Globe className="w-5 h-5" /></div><h4 className="font-bold text-gray-900">Idioma / Language</h4></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{['ES', 'EN', 'FR'].map((lang) => (<button key={lang} onClick={() => setLanguage(lang as any)} className={`py-3 px-4 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${language === lang ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{lang === 'ES' ? 'Español' : lang === 'EN' ? 'English' : 'Français'}{language === lang && <Check className="w-4 h-4" />}</button>))}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Coins className="w-5 h-5" /></div><h4 className="font-bold text-gray-900">Moneda Principal</h4></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{['EUR', 'USD', 'GBP'].map((curr) => (<button key={curr} onClick={() => setCurrency(curr as any)} className={`py-3 px-4 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${currency === curr ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{curr}{currency === curr && <Check className="w-4 h-4" />}</button>))}</div>
            </div>
          </div>
        );

      case 'personalization':
        return (
          <div className="max-w-2xl space-y-8 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t.menu.personalization}</h3>
              <p className="text-sm text-gray-500">{t.sections.persDesc}</p>
            </div>

            {/* Theme Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-1">{t.personalization.theme}</h4>
              <p className="text-xs text-gray-500 mb-4">{t.personalization.themeDesc}</p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', label: 'Light', icon: '☀️', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                  { id: 'dark', label: 'Dark', icon: '🌙', color: 'bg-indigo-950 text-indigo-200 border-indigo-900' },
                  { id: 'system', label: 'System', icon: '💻', color: 'bg-gray-100 text-gray-600 border-gray-200' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setTheme(mode.id as any)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all group ${theme === mode.id || (theme === 'system' && mode.id === 'system')
                      ? 'border-indigo-600 ring-2 ring-indigo-100'
                      : 'border-transparent hover:bg-gray-50'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${mode.color}`}>
                      {mode.icon}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${theme === mode.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {mode.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dashboard Layout Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-1">{t.personalization.layout}</h4>
              <p className="text-xs text-gray-500 mb-4">{t.personalization.layoutDesc}</p>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">{t.personalization.resetLayout}</h5>
                  <p className="text-[10px] text-gray-500 mt-1">{t.personalization.resetLayoutDesc}</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('¿Resetear dashboard?')) setDashboardWidgets(DEFAULT_WIDGETS);
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 hover:text-black transition-colors shadow-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Sample Data Management */}
            <SampleDataSection />
          </div>
        );

      case 'privacy':
        return <PrivacySettings />;

      case 'categories':
        return (
          <div className="max-w-4xl space-y-8 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.menu.categories}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.sections.catDesc}</p>
            </div>

            {/* Category Form */}
            <form
              ref={categoryFormRef}
              onSubmit={handleSaveCategory}
              className="bg-white dark:bg-onyx-900 p-6 rounded-2xl border border-gray-100 dark:border-onyx-800 shadow-sm space-y-4"
            >
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {editingCatId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingCatId ? 'Editar Categoría' : 'Nueva Categoría'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nombre</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-onyx-800 border border-gray-200 dark:border-onyx-700 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                    placeholder="Ej: Transporte"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Tipo</label>
                  <div className="flex bg-gray-50 dark:bg-onyx-800 p-1 rounded-xl border border-gray-200 dark:border-onyx-700">
                    <button
                      type="button"
                      onClick={() => setNewCatType('EXPENSE')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newCatType === 'EXPENSE' ? 'bg-white dark:bg-onyx-700 shadow text-red-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      Gasto
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCatType('INCOME')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newCatType === 'INCOME' ? 'bg-white dark:bg-onyx-700 shadow text-green-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      Ingreso
                    </button>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Subcategorías (CSV)</label>
                  <input
                    type="text"
                    value={newSubCat}
                    onChange={(e) => setNewSubCat(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-onyx-800 border border-gray-200 dark:border-onyx-700 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                    placeholder="Gasolina, Metro, Taxi..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                {editingCatId && (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingCatId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>

            {/* EXPENSE CATEGORIES */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-onyx-800 pb-2">Gastos (Expenses)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.filter(c => c.type === 'EXPENSE').map(cat => (
                  <div key={cat.id} className="group bg-white dark:bg-onyx-900 p-4 rounded-xl border border-gray-100 dark:border-onyx-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                          <Coins className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 dark:text-white">{cat.name}</h5>
                          <p className="text-[10px] text-gray-400">{cat.subCategories.length} subcategorías</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditCategoryClick(cat)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cat.subCategories.map((sub, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-50 dark:bg-onyx-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-md border border-gray-100 dark:border-onyx-700">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* INCOME CATEGORIES */}
            <div className="space-y-4 pt-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-onyx-800 pb-2">Ingresos (Income)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.filter(c => c.type === 'INCOME').map(cat => (
                  <div key={cat.id} className="group bg-white dark:bg-onyx-900 p-4 rounded-xl border border-gray-100 dark:border-onyx-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                          <Coins className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 dark:text-white">{cat.name}</h5>
                          <p className="text-[10px] text-gray-400">{cat.subCategories.length} subcategorías</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditCategoryClick(cat)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cat.subCategories.map((sub, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-50 dark:bg-onyx-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-md border border-gray-100 dark:border-onyx-700">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'automation':
        return (
          <div className="max-w-4xl space-y-8 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.menu.automation}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.sections.autoDesc}</p>
            </div>

            {/* New Rule Form */}
            <form onSubmit={handleAddRule} className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <h4 className="font-bold flex items-center gap-2 mb-6 relative z-10">
                <Zap className="w-5 h-5 text-yellow-400" /> Nueva Regla
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase mb-1">Disparador</label>
                  <select
                    value={newRuleTrigger}
                    onChange={(e) => setNewRuleTrigger(e.target.value as any)}
                    className="w-full p-3 bg-indigo-800/50 border border-indigo-700 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="TRANSACTION_OVER_AMOUNT">Transacción mayor de...</option>
                    <option value="TRIP_CREATED">Nuevo viaje creado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase mb-1">Valor</label>
                  <input
                    type="number"
                    value={newRuleThreshold}
                    onChange={(e) => setNewRuleThreshold(e.target.value)}
                    className="w-full p-3 bg-indigo-800/50 border border-indigo-700 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="100"
                  />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full py-3 bg-white text-indigo-900 rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Crear
                  </button>
                </div>
              </div>
            </form>

            <div className="grid grid-cols-1 gap-3">
              {automationRules.map((rule) => (
                <div key={rule.id} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${rule.isActive
                  ? 'bg-white dark:bg-onyx-900 border-indigo-200 dark:border-indigo-900 shadow-sm'
                  : 'bg-gray-50 dark:bg-onyx-950 border-gray-100 dark:border-onyx-800 opacity-75'
                  }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rule.isActive ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-gray-200 dark:bg-onyx-800 text-gray-400'
                      }`}>
                      <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 dark:text-white">{rule.name}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] bg-gray-100 dark:bg-onyx-800 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">{rule.trigger}</span>
                        {rule.threshold && <span className="text-xs text-gray-500 font-medium"> {'>'} {rule.threshold}€</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${rule.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-onyx-700'
                        }`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${rule.isActive ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {automationRules.length === 0 && (
                <div className="text-center py-10 bg-gray-50 dark:bg-onyx-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-onyx-800">
                  <p className="text-gray-400 font-medium">No hay reglas activas</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="max-w-4xl space-y-8 animate-fade-in">
            {subscription.plan === 'FREE' ? (
              <PricingSection />
            ) : (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t.menu.subscription}</h3>
                  <p className="text-sm text-gray-500">{t.sections.subDesc}</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-widest">
                    {subscription.status === 'ACTIVE' ? 'Suscripción Activa' : subscription.status}
                  </div>

                  <div className="flex items-center gap-6 mb-8">
                    <div className="p-5 bg-black text-white rounded-3xl shadow-xl">
                      <Star className="w-10 h-10 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-gray-900">Onyx {subscription.plan}</h4>
                      <p className="text-sm text-gray-500 font-medium mt-1">
                        Tu plan actual está activo hasta el <span className="text-gray-900 font-bold">{subscription.expiryDate || '12 Oct 2025'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Próximo Cobro</p>
                      <p className="font-bold text-gray-900">2,99€ <span className="text-xs text-gray-400">/ mes (Personal)</span></p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Método de Pago</p>
                      <p className="font-bold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> VISA **** 4242
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => stripeService.createPortalSession()}
                      className="flex-1 bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                      Gestionar en Stripe <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="flex-1 bg-white text-gray-900 border border-gray-200 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                      Cambiar Plan
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Beneficios de tu plan
                  </h5>
                  <div className="grid grid-cols-2 gap-y-2">
                    {t.featuresList.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'billing':
        return (
          <div className="max-w-2xl space-y-8 animate-fade-in">
            <div><h3 className="text-lg font-bold text-gray-900">{t.menu.billing}</h3><p className="text-sm text-gray-500">{t.sections.billDesc}</p></div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4">{t.billing.methods}</h4>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl mb-3">
                <div className="flex items-center gap-3"><div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-white text-[8px] font-black uppercase tracking-widest">VISA</div><span className="text-sm font-bold text-gray-700">**** 4242</span></div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Default</span>
              </div>

              {/* Integration Mock Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button className="flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors shadow-lg">
                  <img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-4 h-4 invert" alt="Apple Pay" />
                  Apple Pay
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-blue-900 rounded-xl font-bold text-xs hover:bg-gray-50 transition-colors shadow-sm">
                  <img src="https://www.svgrepo.com/show/475667/paypal-color.svg" className="w-4 h-4" alt="PayPal" />
                  PayPal
                </button>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4">{t.billing.history}</h4>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3"><div className="p-2 bg-gray-100 rounded-lg"><Download className="w-4 h-4 text-gray-500" /></div><div><p className="text-sm font-bold text-gray-900">Invoice #{1000 + i}</p><p className="text-xs text-gray-400">Oct 12, 2024</p></div></div>
                    <span className="text-sm font-bold text-gray-900">{t.plan.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="max-w-2xl space-y-8 animate-fade-in">
            <div><h3 className="text-lg font-bold text-gray-900">{t.menu.security}</h3><p className="text-sm text-gray-500">{t.sections.secDesc}</p></div>
            <div className="bg-white dark:bg-onyx-900 p-6 rounded-2xl border border-gray-100 dark:border-onyx-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg"><Smartphone className="w-5 h-5" /></div><div><h4 className="font-bold text-gray-900 dark:text-white">2-Factor Authentication</h4><p className="text-xs text-gray-500 dark:text-gray-400">Secure your account with 2FA.</p></div></div>
                <div className="w-12 h-6 bg-gray-200 dark:bg-onyx-700 rounded-full p-1 cursor-pointer"><div className="w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
              </div>
              <div className="border-t border-gray-50 dark:border-onyx-800 pt-6">
                <button className="text-sm font-bold text-blue-600 hover:underline">Change Password</button>
              </div>
              <div className="border-t border-gray-50 dark:border-onyx-800 pt-6">
                <button className="text-sm font-bold text-red-600 hover:underline">Log out of all devices</button>
              </div>

              {/* LEGAL SECTION */}
              <div className="border-t border-gray-50 dark:border-onyx-800 pt-6 space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  {language === 'ES' ? 'Legal y Cumplimiento' : 'Legal & Compliance'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button onClick={() => setActiveLegalPage('PRIVACY')} className="p-4 bg-gray-50 dark:bg-onyx-800 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors">
                    <span className="font-bold text-sm block text-gray-900 dark:text-white">Privacy Policy</span>
                    <span className="text-xs text-gray-400">Data usage & rights</span>
                  </button>
                  <button onClick={() => setActiveLegalPage('TERMS')} className="p-4 bg-gray-50 dark:bg-onyx-800 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors">
                    <span className="font-bold text-sm block text-gray-900 dark:text-white">Terms of Service</span>
                    <span className="text-xs text-gray-400">Licensing & agreement</span>
                  </button>
                </div>
              </div>

              {/* DANGER ZONE */}
              <div className="mt-8 pt-6 border-t border-red-50 dark:border-red-900/30">
                <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                  <h4 className="font-bold text-red-900 dark:text-red-400 mb-2">{t.resetZone}</h4>
                  <p className="text-xs text-red-700 dark:text-red-300 mb-4">
                    {language === 'ES'
                      ? 'Eliminar tu cuenta borrará permanentemente todos tus datos de nuestros servidores y de este dispositivo. No podrás recuperar esta información.'
                      : 'Deleting your account will permanently wipe all your data from our servers and this device. You will not be able to recover this information.'}
                  </p>
                  <div className="flex gap-4">
                    <button onClick={handleResetSystem} className="bg-white dark:bg-onyx-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20">
                      {t.resetBtn}
                    </button>
                    <button onClick={handleDeleteAccount} className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none">
                      {language === 'ES' ? 'ELIMINAR CUENTA' : 'DELETE ACCOUNT'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-50 dark:bg-onyx-950 relative">
      <header className="md:hidden bg-white dark:bg-onyx-950 border-b border-gray-100 dark:border-onyx-800 p-4 flex justify-between items-center z-10 sticky top-0 shrink-0">
        <div className="flex items-center gap-2"><h2 className="font-bold text-lg text-gray-900 dark:text-white">{t.title}</h2></div><button onClick={onMenuClick} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><Menu className="w-6 h-6" /></button>
      </header>
      <div className="hidden md:block h-full">{renderSidebar()}</div>
      <div className="md:hidden flex overflow-x-auto p-2 bg-white dark:bg-onyx-950 border-b border-gray-200 dark:border-onyx-800 gap-2 shrink-0">{[{ id: 'profile', icon: User, label: t.menu.profile }, { id: 'general', icon: Globe, label: t.menu.general }, { id: 'categories', icon: Layers, label: t.menu.categories }, { id: 'automation', icon: Zap, label: t.menu.automation }, { id: 'subscription', icon: Star, label: t.menu.subscription }, { id: 'billing', icon: CreditCard, label: t.menu.billing }].map((item) => (<button key={item.id} onClick={() => setActiveSection(item.id)} className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-bold border transition-colors flex items-center gap-2 ${activeSection === item.id ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-white dark:bg-onyx-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-onyx-800'}`}><item.icon className="w-3 h-3" />{item.label}</button>))}</div>
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">{renderContent()}</div>
    </div>
  );
};

export default SettingsModule;
