import React from 'react';
import { Baby, Menu, Star, Trophy } from 'lucide-react';

interface JuniorModuleProps {
  onMenuClick?: () => void;
}

const JuniorModule: React.FC<JuniorModuleProps> = ({ onMenuClick }) => {
  return (
    <div className="flex h-full flex-col relative bg-yellow-50/30">
        <header className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10 sticky top-0">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shadow-md">
               <Baby className="text-white w-4 h-4" />
             </div>
             <div>
                <span className="font-bold text-gray-900 block leading-none text-lg">Junior</span>
                <span className="text-[9px] font-bold text-yellow-700 uppercase tracking-widest">Familia & Kids</span>
             </div>
           </div>
           <button onClick={onMenuClick} className="text-gray-500 hover:text-gray-900">
             <Menu className="w-6 h-6" />
           </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
           <div className="bg-white p-6 rounded-full shadow-sm mb-4 relative">
              <Baby className="w-12 h-12 text-yellow-500" />
              <div className="absolute -bottom-2 -right-2 bg-yellow-100 p-2 rounded-full border-2 border-white">
                 <Star className="w-5 h-5 text-yellow-700" />
              </div>
           </div>
           <h2 className="text-2xl font-bold text-gray-800 mb-2">Módulo Junior</h2>
           <p className="max-w-md mx-auto mb-6">
             Educación financiera y gestión de tareas para los más pequeños. 
             Asigna pagas automáticas basadas en el cumplimiento de tareas del hogar.
           </p>

           <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left">
                 <Trophy className="w-5 h-5 text-yellow-600 mb-2" />
                 <h4 className="font-bold text-sm text-gray-900">Tareas</h4>
                 <p className="text-xs text-gray-400">Gamificación del hogar</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left">
                 <Star className="w-5 h-5 text-yellow-600 mb-2" />
                 <h4 className="font-bold text-sm text-gray-900">Pagas</h4>
                 <p className="text-xs text-gray-400">Ahorro infantil</p>
              </div>
           </div>

           <button className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition-colors">
              Explorar Demo
           </button>
        </div>
    </div>
  );
};

export default JuniorModule;