import React from 'react';
import { Lock, Menu, FileText, ShieldCheck, Home } from 'lucide-react';

interface VaultModuleProps {
  onMenuClick?: () => void;
}

const VaultModule: React.FC<VaultModuleProps> = ({ onMenuClick }) => {
  return (
    <div className="flex h-full flex-col relative bg-slate-50/30">
        <header className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10 sticky top-0">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center shadow-md">
               <Lock className="text-white w-4 h-4" />
             </div>
             <div>
                <span className="font-bold text-gray-900 block leading-none text-lg">Vault</span>
                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Seguridad Documental</span>
             </div>
           </div>
           <button onClick={onMenuClick} className="text-gray-500 hover:text-gray-900">
             <Menu className="w-6 h-6" />
           </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
           <div className="bg-white p-6 rounded-full shadow-sm mb-4 relative">
              <Lock className="w-12 h-12 text-slate-600" />
              <div className="absolute -bottom-2 -right-2 bg-slate-200 p-2 rounded-full border-2 border-white">
                 <ShieldCheck className="w-5 h-5 text-slate-800" />
              </div>
           </div>
           <h2 className="text-2xl font-bold text-gray-800 mb-2">Bóveda Digital (Vault)</h2>
           <p className="max-w-md mx-auto mb-6">
             Almacenamiento encriptado de grado militar. Tus documentos más importantes, siempre seguros.
           </p>

           <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left hover:border-slate-300 transition-colors cursor-pointer">
                 <FileText className="w-5 h-5 text-slate-600 mb-2" />
                 <h4 className="font-bold text-sm text-gray-900">Personales</h4>
                 <p className="text-xs text-gray-400">DNI, Pasaportes, Familia</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left hover:border-slate-300 transition-colors cursor-pointer relative overflow-hidden group">
                 {/* Visual Badge for Home Integration */}
                 <div className="absolute top-0 right-0 bg-cyan-50 text-cyan-700 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
                    <Home className="w-3 h-3" /> Sync
                 </div>
                 <div className="p-1 bg-slate-50 w-fit rounded-lg mb-2">
                    <ShieldCheck className="w-4 h-4 text-slate-700" />
                 </div>
                 <h4 className="font-bold text-sm text-gray-900">Propiedades</h4>
                 <p className="text-xs text-gray-400">Escrituras, Garantías (Home)</p>
              </div>
           </div>

           <button className="px-6 py-2 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
              Explorar Demo
           </button>
        </div>
    </div>
  );
};

export default VaultModule;