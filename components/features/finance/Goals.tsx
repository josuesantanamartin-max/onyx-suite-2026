import React, { useState } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { Goal } from '../../../types';
import { Calculator, Calendar, Target, Plus, Clock, Pencil, Trash2, Sparkles, Banknote, Plane, Car, Home, Heart, Baby, PiggyBank, TrendingUp } from 'lucide-react';

interface GoalsProps {
  // All state managed via stores
}

const Goals: React.FC<GoalsProps> = () => {
  const { goals, setGoals, accounts } = useFinanceStore();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // Effect to select first goal on load
  React.useEffect(() => {
    if (goals.length > 0 && !selectedGoalId) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId]);

  const selectedGoal = goals.find(g => g.id === selectedGoalId);

  const [simMonthly, setSimMonthly] = useState<number | ''>('');


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formCurrent, setFormCurrent] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formAccountId, setFormAccountId] = useState('');

  const formatEUR = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  const resetForm = () => {
    setFormName(''); setFormTarget(''); setFormCurrent(''); setFormDeadline(''); setFormAccountId(''); setEditingId(null); setIsFormOpen(false);
  };

  const handleEdit = (goal: Goal) => {
    setFormName(goal.name); setFormTarget(goal.targetAmount.toString()); setFormCurrent(goal.currentAmount.toString()); setFormDeadline(goal.deadline || ''); setFormAccountId(goal.accountId || ''); setEditingId(goal.id); setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goalData: any = {
      name: formName,
      targetAmount: parseFloat(formTarget),
      currentAmount: parseFloat(formCurrent),
      deadline: formDeadline || undefined,
      accountId: formAccountId || undefined,
      payments: []
    };
    if (editingId) {
      setGoals((prev) => prev.map(g => g.id === editingId ? { ...goalData, id: editingId } : g));
    } else {
      const newGoal = { ...goalData, id: Math.random().toString(36).substr(2, 9) };
      setGoals((prev) => [...prev, newGoal]);
    }
    resetForm();
  };

  const onDeleteGoal = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta meta?')) {
      if (selectedGoalId === id) setSelectedGoalId(null);
      // Use setTimeout to allow render to clear selectedGoalId effect before removing data
      setTimeout(() => {
        setGoals((prev) => prev.filter(g => g.id !== id));
      }, 0);
    }
  };

  // ... (keep existing helper functions like formatEUR, submit, delete) ...

  // Calculate Total Monthly Savings Needed
  const totalMonthlyNeeded = goals.reduce((acc, goal) => {
    if (!goal.deadline) return acc;
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return acc;

    const today = new Date();
    const d = new Date(goal.deadline);
    const months = (d.getFullYear() - today.getFullYear()) * 12 + (d.getMonth() - today.getMonth());

    // If deadline is passed or this month, count as full amount needed (or cap it?) 
    // Let's assume minimum 1 month to avoid infinity 
    return acc + (remaining / Math.max(months, 1));
  }, 0);

  // ... (keep existing helper functions like formatEUR, submit, delete) ...

  return (
    <div className="space-y-10 animate-fade-in pb-10" key="goals-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-onyx-950 tracking-tight">Metas de Ahorro</h2>
          <p className="text-xs font-semibold text-onyx-400 mt-2 uppercase tracking-[0.2em]">Ingeniería de Futuro</p>
        </div>
        {!isFormOpen && (
          <button onClick={() => { setIsFormOpen(true); setEditingId(null); }} className="flex items-center gap-2.5 bg-onyx-950 hover:bg-onyx-800 text-white px-8 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-onyx-950/20 active:scale-95">
            <Plus className="w-5 h-5" /> Nueva Meta
          </button>
        )}
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-onyx-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-2">Total Ahorrado</p>
            <h3 className="text-3xl font-black text-onyx-950 tracking-tight">{formatEUR(goals.reduce((acc, g) => acc + g.currentAmount, 0))}</h3>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
            <Target className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-onyx-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-2">Objetivo Global</p>
            <h3 className="text-3xl font-black text-onyx-950 tracking-tight">{formatEUR(goals.reduce((acc, g) => acc + g.targetAmount, 0))}</h3>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-primary rounded-2xl group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-onyx-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-2">Ahorro Mensual Ideal</p>
            <h3 className="text-3xl font-black text-onyx-950 tracking-tight">{formatEUR(totalMonthlyNeeded)}<span className="text-sm text-onyx-400 font-bold">/mes</span></h3>
          </div>
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* SIDEBAR LIST */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-onyx-100">
            <h3 className="font-bold text-onyx-950 text-lg">Tus Metas</h3>
            <span className="text-xs font-bold bg-onyx-100 px-2 py-1 rounded-lg text-onyx-500">{goals.length} Activas</span>
          </div>

          <div className="space-y-3">
            {goals.map(goal => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const isSelected = selectedGoalId === goal.id;
              const isCompleted = progress >= 100;

              // Icon Logic
              let GoalIcon = Target;
              const lowerName = goal.name.toLowerCase();
              if (lowerName.includes('viaje')) GoalIcon = Plane;
              else if (lowerName.includes('coche')) GoalIcon = Car;
              else if (lowerName.includes('casa')) GoalIcon = Home;
              else if (lowerName.includes('boda')) GoalIcon = Heart;
              else if (lowerName.includes('bebé')) GoalIcon = Baby;
              else if (lowerName.includes('fondo') || lowerName.includes('ahorro')) GoalIcon = PiggyBank;

              return (
                <div key={goal.id} onClick={() => setSelectedGoalId(goal.id)} className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden ${isSelected ? 'bg-onyx-950 text-white border-onyx-950 shadow-xl scale-[1.02]' : 'bg-white text-onyx-950 border-onyx-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/10' : 'bg-onyx-50 text-onyx-500'}`}><GoalIcon className="w-5 h-5" /></div>
                      <div>
                        <p className="font-semibold text-sm leading-tight line-clamp-1">{goal.name}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-white/50' : 'text-onyx-400'}`}>{isCompleted ? 'Completado' : 'En Progreso'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg leading-none">{formatEUR(goal.currentAmount)}</p>
                    </div>
                  </div>
                  {/* Mini Progress Bar */}
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-white/10' : 'bg-onyx-100'}`}>
                    <div className={`h-full rounded-full ${isCompleted ? 'bg-emerald-400' : isSelected ? 'bg-indigo-400' : 'bg-onyx-950'}`} style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          {goals.length === 0 && (
            <div className="text-center p-10 bg-onyx-50/50 border-2 border-dashed border-onyx-100 rounded-3xl flex flex-col items-center justify-center text-onyx-300">
              <Target className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Sin metas activas</p>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-8 space-y-6">
          {isFormOpen ? (
            <div className="bg-white p-10 rounded-onyx shadow-xl border border-onyx-100 animate-fade-in relative overflow-hidden w-full">
              <div className="flex justify-between items-center mb-8 pb-8 border-b border-onyx-50">
                <div>
                  <h4 className="text-2xl font-bold tracking-tight text-onyx-950">{editingId ? 'Editar Meta' : 'Nueva Meta'}</h4>
                  <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mt-1">Configura tu objetivo financiero</p>
                </div>
                <button onClick={resetForm} className="p-2 hover:bg-onyx-50 rounded-full transition-colors"><Trash2 className="w-5 h-5 text-onyx-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-3 block">Nombre de la Meta</label>
                  <input required autoFocus type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-xl font-bold text-onyx-950 focus:bg-white focus:ring-2 focus:ring-indigo-primary/20 outline-none transition-all placeholder:text-onyx-300" placeholder="Ej: Viaje a Japón..." />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-3 block">Objetivo Total (€)</label>
                    <div className="relative">
                      <input required type="number" value={formTarget} onChange={e => setFormTarget(e.target.value)} className="w-full p-4 pl-10 bg-onyx-50 border border-onyx-100 rounded-xl font-bold text-xl text-onyx-950 focus:bg-white focus:ring-2 focus:ring-indigo-primary/20 outline-none transition-all" />
                      <Target className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-onyx-400" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-3 block">Guardado Actualmente (€)</label>
                    <div className="relative">
                      <input required type="number" value={formCurrent} onChange={e => setFormCurrent(e.target.value)} className="w-full p-4 pl-10 bg-onyx-50 border border-onyx-100 rounded-xl font-bold text-xl text-onyx-950 focus:bg-white focus:ring-2 focus:ring-indigo-primary/20 outline-none transition-all" />
                      <Banknote className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-onyx-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-3 block">Fecha Objetivo (Opcional)</label>
                  <input type="date" value={formDeadline} onChange={e => setFormDeadline(e.target.value)} className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-xl font-bold text-onyx-950 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-primary/20 transition-all cursor-pointer" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-3 block">Cuenta de Ahorro Asociada (Opcional)</label>
                  <select value={formAccountId} onChange={e => setFormAccountId(e.target.value)} className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-xl font-bold text-onyx-950 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-primary/20 transition-all cursor-pointer appearance-none">
                    <option value="">-- Sin cuenta asociada --</option>
                    {accounts.filter(a => a.type !== 'CREDIT').map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({formatEUR(acc.balance)})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={resetForm} className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-onyx-500 hover:bg-onyx-50 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-[2] bg-onyx-950 hover:bg-onyx-800 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-onyx-950/20 transition-all active:scale-95">Guardar Meta</button>
                </div>
              </form>
            </div>
          ) : selectedGoal ? (
            <>
              {/* DETAIL CARD */}
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-onyx-100 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-onyx-950 text-white rounded-lg"><Target className="w-4 h-4" /></div>
                      <p className="text-xs font-bold text-onyx-400 uppercase tracking-[0.2em]">Meta Seleccionada</p>
                    </div>
                    <h3 className="text-5xl font-black text-onyx-950 tracking-tight mb-2">{selectedGoal.name}</h3>
                    <div className="flex flex-col gap-1">
                      {selectedGoal.deadline && <p className="text-sm font-bold text-onyx-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Objetivo: {new Date(selectedGoal.deadline).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>}
                      {selectedGoal.accountId && (() => {
                        const acc = accounts.find(a => a.id === selectedGoal.accountId);
                        return acc ? (
                          <p className="text-sm font-bold text-indigo-500 flex items-center gap-2 mt-1">
                            <Banknote className="w-4 h-4" /> Vinculada a: {acc.name} ({formatEUR(acc.balance)})
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(selectedGoal)} className="p-3 bg-onyx-50 hover:bg-onyx-100 rounded-xl text-onyx-500 hover:text-onyx-950 transition-colors"><Pencil className="w-5 h-5" /></button>
                    <button onClick={() => onDeleteGoal(selectedGoal.id)} className="p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-1">Tu Progreso</p>
                    <p className="text-4xl font-black text-emerald-600 tracking-tight mb-4">{formatEUR(selectedGoal.currentAmount)}</p>
                    <div className="w-full bg-onyx-100 h-4 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 relative overflow-hidden" style={{ width: `${Math.min((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100, 100)}%` }}>
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-onyx-400">{((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100).toFixed(0)}% Completado</p>
                      {selectedGoal.deadline && selectedGoal.currentAmount < selectedGoal.targetAmount && (() => {
                        const today = new Date();
                        const deadline = new Date(selectedGoal.deadline);
                        const monthsDiff = (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth());
                        const monthsRemaining = Math.max(1, monthsDiff); // Minimum 1 month to avoid division by zero or huge numbers
                        const remainingAmount = selectedGoal.targetAmount - selectedGoal.currentAmount;
                        const monthlyNeeded = remainingAmount / monthsRemaining;

                        if (monthlyNeeded > 0) {
                          return (
                            <p className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">
                              Necesitas ahorrar: {formatEUR(monthlyNeeded)}/mes
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  <div className="flex flex-col justify-end items-end text-right">
                    <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-1">Meta Total</p>
                    <p className="text-3xl font-bold text-onyx-300 tracking-tight">{formatEUR(selectedGoal.targetAmount)}</p>
                    <p className="text-sm font-bold text-onyx-400 mt-2">Faltan {formatEUR(selectedGoal.targetAmount - selectedGoal.currentAmount)}</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
              </div>

              {/* SIMULATOR FOR THIS GOAL */}
              <div className="bg-white p-8 rounded-onyx shadow-sm border border-onyx-100 group relative overflow-hidden transition-all duration-500 hover:shadow-md">
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="p-2.5 bg-onyx-50 text-onyx-950 rounded-xl"><Calculator className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold text-onyx-950 uppercase tracking-widest">Proyección para {selectedGoal.name}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest">Aportación Mensual (€)</label>
                    <input autoFocus type="number" value={simMonthly} placeholder="0" onChange={(e) => setSimMonthly(e.target.value === '' ? '' : Number(e.target.value))} className="w-full text-2xl font-black bg-transparent border-b border-onyx-100 focus:border-indigo-primary outline-none transition-colors" />
                  </div>

                  <div className="md:col-span-2 bg-onyx-950 text-white p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-end relative z-10">
                      <div>
                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-1">Alcanzarás tu meta en</p>
                        <div className="text-3xl font-black">
                          {(typeof simMonthly === 'number' && simMonthly > 0) ? Math.ceil((selectedGoal.targetAmount - selectedGoal.currentAmount) / simMonthly) : '∞'} <span className="text-sm opacity-50">meses</span>
                        </div>
                      </div>
                      {(typeof simMonthly === 'number' && simMonthly > 0) && <p className="text-[10px] text-indigo-300 font-bold bg-indigo-500/10 px-3 py-1 rounded-lg">
                        Fecha: {new Date(new Date().setMonth(new Date().getMonth() + Math.ceil((selectedGoal.targetAmount - selectedGoal.currentAmount) / simMonthly))).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                      </p>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-onyx-300 min-h-[400px]">
              <Target className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-sm">Selecciona una meta para ver detalles</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Goals;
