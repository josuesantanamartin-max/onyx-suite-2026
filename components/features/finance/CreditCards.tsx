import React, { useState } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { Account } from '../../../types';
import { CreditCard, Plus, Calendar, AlertCircle, X } from 'lucide-react';

interface CreditCardsProps {
  // All state managed via stores
}

const CreditCards: React.FC<CreditCardsProps> = () => {
  const { accounts, setAccounts } = useFinanceStore();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [cutoffDay, setCutoffDay] = useState('');
  const [paymentDay, setPaymentDay] = useState('');
  const [currentBalance, setCurrentBalance] = useState(''); // Normally 0 or negative

  const creditCards = accounts.filter(acc => acc.type === 'CREDIT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !limit) return;

    const newAccount: any = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type: 'CREDIT',
      balance: -Math.abs(parseFloat(currentBalance) || 0), // Ensure debt is negative
      currency: 'EUR',
      creditLimit: parseFloat(limit),
      cutoffDay: parseInt(cutoffDay) || 1,
      paymentDay: parseInt(paymentDay) || 5,
    };

    setAccounts((prev: Account[]) => [...prev, newAccount]);

    setIsFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setLimit('');
    setCutoffDay('');
    setPaymentDay('');
    setCurrentBalance('');
  };

  const formatEUR = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
        <div>
          <h2 className="text-3xl font-extrabold text-onyx-950 tracking-tight">Mis Tarjetas</h2>
          <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mt-2">Gestión de límites y ciclos de facturación</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-4 bg-onyx-950 hover:bg-onyx-800 text-white px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-onyx-950/20 active:scale-95 group"
        >
          {isFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />}
          {isFormOpen ? 'Cerrar Panel' : 'Nueva Tarjeta'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-onyx-100 mb-12 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10"></div>
          <h3 className="text-xl font-bold mb-10 text-onyx-950 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-primary rounded-xl">
              <Plus className="w-6 h-6" />
            </div>
            Alta de Tarjeta de Crédito
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="col-span-1 md:col-span-2 space-y-3">
              <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest ml-1">Denominación del Plástico</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: VISA Infinite Platinum" className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-onyx-950 focus:bg-white focus:ring-4 focus:ring-indigo-primary/5 outline-none transition-all shadow-inner" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest ml-1">Cupo Disponible (€)</label>
              <input type="number" required value={limit} onChange={(e) => setLimit(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-xl text-onyx-950 focus:bg-white focus:ring-4 focus:ring-indigo-primary/5 outline-none transition-all shadow-inner" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest ml-1">Utilización Inicial (€)</label>
              <input type="number" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} placeholder="0.00" className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-xl text-onyx-950 focus:bg-white focus:ring-4 focus:ring-indigo-primary/5 outline-none transition-all shadow-inner" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest ml-1">Día de Facturación</label>
              <input type="number" min="1" max="31" value={cutoffDay} onChange={(e) => setCutoffDay(e.target.value)} placeholder="Ej: 20" className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-onyx-950 focus:bg-white focus:ring-4 focus:ring-indigo-primary/5 outline-none transition-all shadow-inner" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest ml-1">Día de Liquidación</label>
              <input type="number" min="1" max="31" value={paymentDay} onChange={(e) => setPaymentDay(e.target.value)} placeholder="Ej: 5" className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-onyx-950 focus:bg-white focus:ring-4 focus:ring-indigo-primary/5 outline-none transition-all shadow-inner" />
            </div>

            <div className="col-span-1 md:col-span-2 pt-4">
              <button type="submit" className="w-full bg-onyx-950 hover:bg-onyx-800 text-white py-6 rounded-3xl font-bold text-[11px] uppercase tracking-[0.3em] transition-all shadow-2xl shadow-onyx-950/20 active:scale-95 group relative overflow-hidden">
                <span className="relative z-10">Consolidar Registro de Tarjeta</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditCards.map(card => {
          const limitAmount = card.creditLimit || 0;
          const currentDebt = Math.abs(card.balance);
          const available = limitAmount - currentDebt;
          const utilization = limitAmount > 0 ? (currentDebt / limitAmount) * 100 : 0;
          const isHighUtilization = utilization > 80;

          return (
            <div key={card.id} className="group relative overflow-hidden bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-onyx-100 shadow-2xl shadow-onyx-950/5 hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <div className="flex justify-between items-start mb-12">
                <div>
                  <h3 className="font-extrabold text-xl text-onyx-950 tracking-tight mb-2">{card.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="p-1 px-3 bg-onyx-950 text-white rounded-lg text-[9px] font-mono tracking-widest">VISA</div>
                    <span className="text-[10px] text-onyx-400 font-mono tracking-wider">**** {card.id.substring(0, 4)}</span>
                  </div>
                </div>
                <div className="p-4 bg-onyx-50 text-onyx-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-primary transition-all duration-500">
                  <CreditCard className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="text-[9px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Crédito Disdispuesto</p>
                  <p className="text-3xl font-black text-onyx-950 tracking-tight">{formatEUR(currentDebt)}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-onyx-400">Cupo Total: {formatEUR(limitAmount)}</span>
                    <span className={isHighUtilization ? 'text-red-500' : 'text-emerald-500'}>{formatEUR(available)} LIBRE</span>
                  </div>
                  <div className="w-full bg-onyx-100 rounded-full h-3 p-1 shadow-inner relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${isHighUtilization ? 'bg-gradient-to-r from-red-500 to-rose-400' : 'bg-gradient-to-r from-indigo-500 to-indigo-400'}`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-onyx-50">
                  <div className="bg-onyx-50/50 p-4 rounded-2xl border border-onyx-100/50">
                    <p className="text-[8px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-1">Cierre Ciclo</p>
                    <p className="font-black text-onyx-900 text-sm flex items-center gap-2">
                      Día {card.cutoffDay || '--'}
                    </p>
                  </div>
                  <div className="bg-onyx-50/50 p-4 rounded-2xl border border-onyx-100/50">
                    <p className="text-[8px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-1">Vencimiento</p>
                    <p className="font-black text-onyx-900 text-sm flex items-center gap-2">
                      Día {card.paymentDay || '--'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {creditCards.length === 0 && !isFormOpen && (
          <div className="col-span-full text-center p-10 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tienes tarjetas de crédito registradas.</p>
            <button onClick={() => setIsFormOpen(true)} className="mt-2 text-blue-950 font-medium hover:underline">Añadir una ahora</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCards;