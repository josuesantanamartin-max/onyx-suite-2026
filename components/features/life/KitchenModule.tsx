import React from 'react';
import { Utensils, Menu } from 'lucide-react';

interface KitchenModuleProps {
  onMenuClick?: () => void;
}

const KitchenModule: React.FC<KitchenModuleProps> = ({ onMenuClick }) => {
  return (
    <div className="flex h-full flex-col relative bg-emerald-50/30">
        <header className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10 sticky top-0">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md">
               <Utensils className="text-white w-4 h-4" />
             </div>
             <div>
                <span className="font-bold text-gray-900 block leading-none text-lg">Kitchen</span>
                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">Nutrición</span>
             </div>
           </div>
           <button onClick={onMenuClick} className="text-gray-500 hover:text-gray-900">
             <Menu className="w-6 h-6" />
           </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
           <div className="bg-white p-6 rounded-full shadow-sm mb-4">
              <Utensils className="w-12 h-12 text-emerald-400" />
           </div>
           <h2 className="text-2xl font-bold text-gray-800 mb-2">Módulo de Cocina</h2>
           <p className="max-w-md mx-auto">Próximamente: Gestiona tu despensa, crea listas de la compra inteligentes y planifica tus menús semanales integrados con tus finanzas.</p>
           <button className="mt-6 px-6 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors">
              Explorar Demo
           </button>
        </div>
    </div>
  );
};

export default KitchenModule;