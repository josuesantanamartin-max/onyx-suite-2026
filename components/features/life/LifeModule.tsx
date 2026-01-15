import React from 'react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useUserStore } from '../../../store/useUserStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useFinanceControllers } from '../../../hooks/useFinanceControllers';

import {
  Menu, Utensils, Plane, Lock, Baby, Home, Heart
} from 'lucide-react';
import { Trip, Goal } from '../../../types';
import { KitchenManager } from './KitchenManager';
import TravelModule from './TravelModule';
import { FamilyManager } from './FamilyManager';
import { VaultManager } from './VaultManager';
import { SpacesManager } from './SpacesManager';

interface LifeModuleProps {
  onMenuClick: () => void;
}

const LIFE_TEXTS: any = {
  ES: { nav: { overview: 'Resumen', kitchen: 'Cocina', travel: 'Viajes', vault: 'Bóveda', family: 'Familia', spaces: 'Espacios' } },
  EN: { nav: { overview: 'Overview', kitchen: 'Kitchen', travel: 'Travel', vault: 'Vault', family: 'Family', spaces: 'Spaces' } },
  FR: { nav: { overview: 'Aperçu', kitchen: 'Cuisine', travel: 'Voyages', vault: 'Coffre-fort', family: 'Famille', spaces: 'Espaces' } }
};

const LifeModule: React.FC<LifeModuleProps> = ({ onMenuClick }) => {
  // Store Hooks
  const { setTrips } = useLifeStore();
  const {
    lifeActiveTab: activeTab,
    setLifeActiveTab: setActiveTab,
    language,
    addSyncLog, automationRules
  } = useUserStore();
  const { accounts, setGoals, categories, setCategories } = useFinanceStore();

  const t = LIFE_TEXTS[language as string] || LIFE_TEXTS['ES'];
  const currentMainTab = activeTab.split('-')[0];

  const handleCreateTrip = (newTripData: Trip) => {
    const tripToSave = { ...newTripData };

    // Automation: Create Category if rule active
    const rule = automationRules.find(r => r.trigger === 'TRIP_CREATED' && r.isActive);
    if (rule && rule.action === 'CREATE_CATEGORY_FOR_TRIP') {
      const newCatName = `Viaje: ${tripToSave.destination}`;
      if (!categories.find(c => c.name === newCatName)) {
        setCategories((prev) => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          name: newCatName,
          type: 'EXPENSE',
          subCategories: ['Vuelos', 'Hotel', 'Comida', 'Ocio']
        }]);
        addSyncLog({ message: `Automatización: Categoría "${newCatName}" creada.`, timestamp: Date.now(), type: 'SYSTEM' });
      }
    }

    // Automation: Create Goal
    if (newTripData.budget > 0) {
      const newGoal: Goal = {
        id: Math.random().toString(36).substr(2, 9),
        name: `✈️ Viaje a ${newTripData.destination}`,
        targetAmount: newTripData.budget,
        currentAmount: 0,
        deadline: newTripData.startDate,
        accountId: accounts[0]?.id || '1',
        linkedTripId: newTripData.id
      };
      setGoals((prev) => [newGoal, ...prev]);
      tripToSave.linkedGoalId = newGoal.id;
      addSyncLog({ message: `Meta financiera creada: ${newGoal.name}`, timestamp: Date.now(), type: "FINANCE" });
    }

    setTrips((prev) => [tripToSave, ...prev]);
    addSyncLog({ message: `Nuevo viaje creado: ${newTripData.destination}`, timestamp: Date.now(), type: "LIFE" });
  };

  const NAV_ITEMS = [
    { id: 'kitchen', label: t.nav.kitchen, icon: Utensils },
    { id: 'spaces', label: t.nav.spaces, icon: Home },
    { id: 'travel', label: t.nav.travel, icon: Plane },
    { id: 'vault', label: t.nav.vault, icon: Lock },
    { id: 'family', label: t.nav.family, icon: Baby },
  ];

  const renderNav = () => (
    <>
      {/* DESKTOP NAV */}
      <div className="hidden md:flex bg-white mx-6 mt-6 p-1.5 rounded-[1.5rem] shadow-sm border border-gray-100 items-center justify-between w-fit gap-1 sticky top-6 z-30">
        {NAV_ITEMS.map(item => {
          const isActive = item.id === 'life-overview' ? activeTab === 'life-overview' : currentMainTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id === 'life-overview' ? 'life-overview' : item.id === 'kitchen' ? 'kitchen-dashboard' : item.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all relative overflow-hidden ${isActive ? 'text-white shadow-lg scale-105' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gray-900 z-0"></div>
              )}
              <span className="relative z-10 flex items-center gap-2">
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center z-10 sticky top-0 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-md">
            <Heart className="text-white w-4 h-4" />
          </div>
          <span className="font-black text-gray-900 text-lg tracking-tight">ONYX Vida</span>
        </div>
        <button onClick={onMenuClick} className="text-gray-500 hover:text-gray-900">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Segmented Control */}
      <div className="md:hidden px-4 py-4 overflow-x-auto no-scrollbar flex gap-2 snap-x">
        {NAV_ITEMS.map(item => {
          const isActive = item.id === 'life-overview' ? activeTab === 'life-overview' : currentMainTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id === 'life-overview' ? 'life-overview' : item.id === 'kitchen' ? 'kitchen-dashboard' : item.id)}
              className={`snap-start shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${isActive ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </>
  );

  return (
    <div className="flex h-full flex-col relative bg-[#FAFAFA]">
      {renderNav()}

      <div className="flex-1 overflow-hidden relative">
        {currentMainTab === 'kitchen' && (
          <KitchenManager
            view={activeTab.replace('kitchen-', '').toUpperCase()}
            onViewChange={(newView) => setActiveTab(`kitchen-${newView.toLowerCase()}`)}
          />
        )}
        {activeTab === 'spaces' && <SpacesManager />}
        {activeTab === 'travel' && <TravelModule />}
        {activeTab === 'vault' && <VaultManager />}
        {activeTab === 'family' && <FamilyManager />}
      </div>
    </div>
  );
};

export default LifeModule;
