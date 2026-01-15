import React, { useState, useRef } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { useLifeStore } from '../../../store/useLifeStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import {
  User, CreditCard, Shield, Globe, Lock,
  Check, Coins, Star, Download, Smartphone, Plus, Trash2, Camera, Upload, Layers, Zap, ArrowRight, Pencil, Menu, ExternalLink
} from 'lucide-react';
import { FamilyMember, CategoryStructure, AutomationRule } from '../../../types';
import PricingSection from './PricingSection';
import { stripeService } from '../../../services/stripeService';
import { supabase } from '../../../services/supabaseClient';

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
      security: 'Seguridad'
    },
    sections: {
      profileDesc: 'Gestiona tu identidad y los miembros de tu unidad familiar.',
      generalDesc: 'Idioma, moneda y configuración regional.',
      catDesc: 'Personaliza tu estructura de ingresos y gastos.',
      autoDesc: 'Crea reglas para automatizar alertas y categorización.',
      subDesc: 'Gestiona tu plan Onyx Suite.',
      billDesc: 'Métodos de pago y facturas.',
      secDesc: 'Contraseñas y autenticación de dos factores.'
    },
    plan: {
      current: 'Plan Actual',
      pro: 'Onyx Familia',
      free: 'Onyx Basic',
      features: 'Características',
      upgrade: 'Mejorar Plan',
      nextBill: 'Próxima renovación',
      manage: 'Gestionar Suscripción',
      price: '4.99€',
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
      security: 'Security'
    },
    sections: {
      profileDesc: 'Manage your identity and family unit members.',
      generalDesc: 'Language, currency and region.',
      catDesc: 'Customize your income and expense structure.',
      autoDesc: 'Create rules to automate alerts and categorization.',
      subDesc: 'Manage your Onyx Suite plan.',
      billDesc: 'Payment methods and invoices.',
      secDesc: 'Passwords and 2FA.'
    },
    plan: {
      current: 'Current Plan',
      pro: 'Onyx Family',
      free: 'Onyx Basic',
      features: 'Features',
      upgrade: 'Upgrade Plan',
      nextBill: 'Next renewal',
      manage: 'Manage Subscription',
      price: '€4.99',
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
      security: 'Sécurité'
    },
    sections: {
      profileDesc: 'Gérez votre identité et les membres de la famille.',
      generalDesc: 'Langue, devise et région.',
      catDesc: 'Personnalisez votre structure de revenus et dépenses.',
      autoDesc: 'Créez des règles pour automatiser les alertes.',
      subDesc: 'Gérer votre plan Onyx Suite.',
      billDesc: 'Méthodes de paiement et factures.',
      secDesc: 'Mots de passe et 2FA.'
    },
    plan: {
      current: 'Plan Actuel',
      pro: 'Onyx Famille',
      free: 'Onyx Basic',
      features: 'Fonctionnalités',
      upgrade: 'Mettre à niveau',
      nextBill: 'Prochain renouvellement',
      manage: 'Gérer l\'abonnement',
      price: '4,99€',
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

  // Store Hooks
  const {
    language, setLanguage,
    currency, setCurrency,
    automationRules, setAutomationRules,
    subscription,
    userProfile, setUserProfile
  } = useUserStore();

  const { familyMembers, setFamilyMembers } = useLifeStore();
  const { categories, setCategories } = useFinanceStore();

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
    <div className="w-full md:w-64 bg-white border-r border-gray-100 flex-shrink-0 md:h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{t.subtitle}</p>
      </div>
      <nav className="px-3 space-y-1">
        {[
          { id: 'profile', icon: User, label: t.menu.profile },
          { id: 'general', icon: Globe, label: t.menu.general },
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
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="max-w-2xl space-y-10 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t.menu.profile}</h3>
              <p className="text-sm text-gray-500">{t.sections.profileDesc}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-gray-400 border-4 border-white shadow-sm">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">{userProfile?.full_name || 'Cuenta Principal'}</h4>
                <p className="text-sm text-gray-500">{userProfile?.email || 'user@onyxsuite.com'}</p>
                <button
                  onClick={handleOpenProfileEdit}
                  className="text-xs font-bold text-blue-600 hover:underline mt-2"
                >
                  Editar datos personales
                </button>
              </div>
            </div>

            {isProfileEditOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <form onSubmit={handleUpdateProfile} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in relative">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Editar Perfil</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        value={editProfileName}
                        onChange={e => setEditProfileName(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">URL Avatar (Imagen)</label>
                      <input
                        type="text"
                        value={editProfileAvatar}
                        onChange={e => setEditProfileAvatar(e.target.value)}
                        placeholder="https://pagina.com/foto.jpg"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Introduce una URL de imagen válida.</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsProfileEditOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            )}
            <hr className="border-gray-100" />
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Unidad Familiar</h4>
                  <p className="text-sm text-gray-500 mt-1">Miembros que componen el hogar y sus roles.</p>
                </div>
                <button onClick={() => setIsFamilyFormOpen(true)} className="flex items-center gap-2 text-xs font-black bg-blue-50 text-blue-600 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-blue-100 transition-colors">
                  <Plus className="w-3 h-3" /> Añadir Miembro
                </button>
              </div>
              {isFamilyFormOpen && (
                <form onSubmit={handleAddMember} className="bg-white p-6 rounded-3xl border border-blue-100 shadow-lg space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                  <h5 className="font-bold text-gray-900">Nuevo Miembro</h5>
                  <div className="flex gap-6">
                    <div className="shrink-0">
                      <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-blue-400 hover:text-blue-500 transition-all overflow-hidden relative group">
                        {newMemberImage ? (<img src={newMemberImage} className="w-full h-full object-cover" alt="Preview" />) : (<><Camera className="w-6 h-6 mb-1" /><span className="text-[9px] font-bold uppercase">Foto</span></>)}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="w-6 h-6 text-white" /></div>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nombre</label><input type="text" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="Ej: Samuel" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Rol</label><select value={newMemberRole} onChange={e => setNewMemberRole(e.target.value as any)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none"><option value="PARENT">Padre/Madre</option><option value="CHILD">Hijo/a</option></select></div>
                        <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Fecha Nacimiento</label><input type="date" value={newMemberBirth} onChange={e => setNewMemberBirth(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setIsFamilyFormOpen(false); setNewMemberImage(''); }} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900">Cancelar</button>
                    <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">Guardar Miembro</button>
                  </div>
                </form>
              )}
              <div className="grid grid-cols-1 gap-3">
                {familyMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl shadow-inner border-2 border-white overflow-hidden">
                        {member.avatar.startsWith('data:') || member.avatar.startsWith('http') ? <img src={member.avatar} className="w-full h-full object-cover" /> : <span className="text-2xl">{member.avatar}</span>}
                      </div>
                      <div><p className="font-bold text-gray-900">{member.name}</p><p className="text-xs text-gray-500 font-medium flex items-center gap-2"><span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${member.role === 'PARENT' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'}`}>{member.role === 'PARENT' ? 'Admin' : 'Junior'}</span>{member.birthDate && <span>{calculateAge(member.birthDate)} años</span>}</p></div>
                    </div>
                    <button onClick={() => handleDeleteMember(member.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="max-w-2xl space-y-8 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t.menu.categories}</h3>
              <p className="text-sm text-gray-500">{t.sections.catDesc}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <form ref={categoryFormRef} onSubmit={handleSaveCategory} className="space-y-4 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-900 text-sm">{editingCatId ? 'Editar Categoría' : 'Nueva Categoría'}</h4>
                  {editingCatId && <button type="button" onClick={resetCategoryForm} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>}
                </div>
                <div className="flex gap-3">
                  <select value={newCatType} onChange={e => setNewCatType(e.target.value as any)} className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-widest outline-none">
                    <option value="EXPENSE">Gasto</option>
                    <option value="INCOME">Ingreso</option>
                  </select>
                  <input required type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nombre Categoría (ej: Jardinería)" className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <input type="text" value={newSubCat} onChange={e => setNewSubCat(e.target.value)} placeholder="Subcategorías separadas por coma (ej: Plantas, Herramientas, Riego)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className={`w-full py-3 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${editingCatId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-black'}`}>
                  {editingCatId ? 'Guardar Cambios' : 'Añadir Categoría'}
                </button>
              </form>

              <div className="space-y-4">
                {categories.map(cat => (
                  <div key={cat.id} className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${cat.type === 'EXPENSE' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{cat.type === 'EXPENSE' ? 'Gasto' : 'Ingreso'}</span>
                        <span className="font-bold text-gray-900">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditCategoryClick(cat)} className="text-gray-300 hover:text-blue-500 p-2"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cat.subCategories.map(sub => (
                        <span key={sub} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">{sub}</span>
                      ))}
                      {cat.subCategories.length === 0 && <span className="text-[10px] text-gray-300 italic">Sin subcategorías</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'automation':
        return (
          <div className="max-w-2xl space-y-8 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t.menu.automation}</h3>
              <p className="text-sm text-gray-500">{t.sections.autoDesc}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <form onSubmit={handleAddRule} className="space-y-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-purple-600" /> Crear Regla (Motor de Reglas)</h4>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">SI (Trigger)</span>
                    <select value={newRuleTrigger} onChange={e => setNewRuleTrigger(e.target.value as any)} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none">
                      <option value="TRANSACTION_OVER_AMOUNT">El gasto supera la cantidad de...</option>
                      <option value="TRIP_CREATED">Se crea un nuevo viaje</option>
                    </select>
                  </div>

                  {newRuleTrigger === 'TRANSACTION_OVER_AMOUNT' && (
                    <div className="flex items-center gap-2 animate-fade-in">
                      <span className="text-xs font-bold text-gray-500 uppercase">CANTIDAD (€)</span>
                      <input type="number" value={newRuleThreshold} onChange={e => setNewRuleThreshold(e.target.value)} className="w-24 p-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-center outline-none" />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">ENTONCES</span>
                    <select value={newRuleAction} onChange={e => setNewRuleAction(e.target.value as any)} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none">
                      {newRuleTrigger === 'TRANSACTION_OVER_AMOUNT' && <option value="SEND_ALERT">Enviar Alerta</option>}
                      {newRuleTrigger === 'TRIP_CREATED' && <option value="CREATE_CATEGORY_FOR_TRIP">Crear Categoría del Viaje</option>}
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-purple-700 transition-all mt-2">Añadir Automatización</button>
              </form>

              <div className="space-y-4">
                {automationRules.map(rule => (
                  <div key={rule.id} className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-gray-900 text-sm">{rule.name}</h5>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[9px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded uppercase font-black">{rule.trigger === 'TRANSACTION_OVER_AMOUNT' ? 'Gasto > X' : 'Nuevo Viaje'}</span>
                        <ArrowRight className="w-3 h-3 text-gray-300" />
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded uppercase font-black">{rule.action === 'SEND_ALERT' ? 'Alerta' : 'Crear Categoría'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => handleToggleRule(rule.id)}
                        className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${rule.isActive ? 'bg-purple-600' : 'bg-gray-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${rule.isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                      <button onClick={() => handleDeleteRule(rule.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                {automationRules.length === 0 && <p className="text-center text-gray-400 text-xs italic py-4">No hay reglas activas.</p>}
              </div>
            </div>
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
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
              <h4 className="font-bold text-red-900 mb-2">{t.resetZone}</h4>
              <p className="text-xs text-red-700 mb-4">{t.resetDesc}</p>
              <button onClick={handleResetSystem} className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700">{t.resetBtn}</button>
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
                      <p className="font-bold text-gray-900">4.99€ <span className="text-xs text-gray-400">/mes</span></p>
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
                      onClick={() => stripeService.redirectToCustomerPortal('cus_mock_123')}
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
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Smartphone className="w-5 h-5" /></div><div><h4 className="font-bold text-gray-900">2-Factor Authentication</h4><p className="text-xs text-gray-500">Secure your account with 2FA.</p></div></div>
                <div className="w-12 h-6 bg-gray-200 rounded-full p-1 cursor-pointer"><div className="w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
              </div>
              <div className="border-t border-gray-50 pt-6">
                <button className="text-sm font-bold text-blue-600 hover:underline">Change Password</button>
              </div>
              <div className="border-t border-gray-50 pt-6">
                <button className="text-sm font-bold text-red-600 hover:underline">Log out of all devices</button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#FAFAFA] relative">
      <header className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10 sticky top-0 shrink-0">
        <div className="flex items-center gap-2"><h2 className="font-bold text-lg">{t.title}</h2></div><button onClick={onMenuClick} className="text-gray-500 hover:text-gray-900"><Menu className="w-6 h-6" /></button>
      </header>
      <div className="hidden md:block h-full">{renderSidebar()}</div>
      <div className="md:hidden flex overflow-x-auto p-2 bg-white border-b border-gray-200 gap-2 shrink-0">{[{ id: 'profile', icon: User, label: t.menu.profile }, { id: 'general', icon: Globe, label: t.menu.general }, { id: 'categories', icon: Layers, label: t.menu.categories }, { id: 'automation', icon: Zap, label: t.menu.automation }, { id: 'subscription', icon: Star, label: t.menu.subscription }, { id: 'billing', icon: CreditCard, label: t.menu.billing }].map((item) => (<button key={item.id} onClick={() => setActiveSection(item.id)} className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-bold border transition-colors flex items-center gap-2 ${activeSection === item.id ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}><item.icon className="w-3 h-3" />{item.label}</button>))}</div>
      <div className="flex-1 overflow-y-auto p-6 md:p-10">{renderContent()}</div>
    </div>
  );
};

export default SettingsModule;
