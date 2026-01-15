import React, { useState } from 'react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useUserStore } from '../../../store/useUserStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { KitchenWidgetType, MealTime, Recipe } from '../../../types';
import { Edit, Eye, EyeOff, Flame, AlertTriangle, ShoppingCart, Activity, Clock, ArrowRight, Sparkles, ChefHat, Sunset, Moon, Coffee, ListChecks, Zap, CreditCard, Leaf } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface KitchenDashboardProps {
   onViewChange: (view: string) => void;
   onOpenAiPlanner: () => void;
   onOpenRecipe: (recipe: Recipe) => void;
}

const WIDGET_NAMES: Record<KitchenWidgetType, string> = {
   'STATS_ROW': 'Estadísticas Rápidas',
   'TODAY_MENU_CARD': 'Tarjeta de Menú Hoy',
   'SHOPPING_LIST_CARD': 'Tarjeta Lista Compra'
};

const GREETINGS = {
   morning: { text: 'Buenos días, Chef', sub: 'El desayuno es la comida más importante.', icon: Coffee },
   afternoon: { text: 'Buenas tardes', sub: '¿Qué tal algo ligero para comer?', icon: Sunset },
   evening: { text: 'Buenas noches', sub: 'Hora de preparar una cena deliciosa.', icon: Moon },
};

export const KitchenDashboard: React.FC<KitchenDashboardProps> = ({ onOpenAiPlanner, onViewChange, onOpenRecipe }) => {
   const { weeklyPlan, pantryItems, shoppingList, widgets, setWidgets } = useLifeStore();
   const { transactions } = useFinanceStore();
   const { setLifeActiveTab } = useUserStore();

   const [isEditingLayout, setIsEditingLayout] = useState(false);




   const toggleWidget = (id: KitchenWidgetType) => {
      setWidgets((prev) => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
   };

   const isVisible = (id: KitchenWidgetType) => widgets?.find(w => w.id === id)?.visible ?? true;

   const lowStockItems = pantryItems.filter(item => item.lowStockThreshold && item.quantity <= item.lowStockThreshold);

   // --- NEW CALCULATIONS ---
   // 1. Food Spending
   const currentMonthISO = new Date().toISOString().slice(0, 7);
   const foodSpending = transactions
      .filter(t => t.type === 'EXPENSE' && (t.category === 'Alimentación' || t.category === 'Food') && t.date.startsWith(currentMonthISO))
      .reduce((acc, curr) => acc + curr.amount, 0);

   // 2. Stock Health %
   const totalPantryItems = pantryItems.length;
   const goodStockItems = pantryItems.filter(item => !item.lowStockThreshold || item.quantity > item.lowStockThreshold).length;
   const stockHealth = totalPantryItems > 0 ? Math.round((goodStockItems / totalPantryItems) * 100) : 0;

   // 3. Freshness Score
   const expiredCount = pantryItems.filter(item => item.expiryDate && new Date(item.expiryDate) < new Date()).length;
   const expiringSoonCount = pantryItems.filter(item => {
      if (!item.expiryDate) return false;
      const exp = new Date(item.expiryDate);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return exp >= new Date() && exp < nextWeek;
   }).length;

   // Formula: Start at 100. Deduct 10 for expired, 5 for expiring soon.
   const freshnessScore = Math.max(0, 100 - (expiredCount * 10) - (expiringSoonCount * 5));

   const hour = new Date().getHours();
   const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
   const greeting = GREETINGS[timeOfDay];

   // Missing variable needed for the Meal Planner card
   const todayStr = new Date().toISOString().split('T')[0];
   const todayMeals = weeklyPlan[todayStr] || { breakfast: [], lunch: [], dinner: [] };

   return (
      <div className="space-y-8 animate-fade-in custom-scrollbar overflow-y-auto h-full pb-20 pr-1 relative">

         <div className="flex justify-between items-end">
            <div>
               <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-1">
                  <greeting.icon className="w-4 h-4" /> {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
               </div>
               <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{greeting.text}</h1>
               <p className="text-gray-400 font-medium">{greeting.sub}</p>
            </div>

            <button onClick={() => setIsEditingLayout(!isEditingLayout)} className={`p-2 border rounded-xl transition-colors shadow-sm active:scale-95 ${isEditingLayout ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}>
               <Edit className="w-4 h-4" />
            </button>
         </div>

         {isEditingLayout && (
            <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md p-4 rounded-3xl mb-6 text-white animate-fade-in-up shadow-2xl">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Configurar Resumen</h3>
                  <button onClick={() => setIsEditingLayout(false)} className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200">Terminar</button>
               </div>
               <div className="flex flex-wrap gap-2">
                  {(widgets || []).map(w => (
                     <button
                        key={w.id}
                        onClick={() => toggleWidget(w.id as KitchenWidgetType)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${w.visible ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-gray-600 text-gray-400'}`}
                     >
                        {w.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {WIDGET_NAMES[w.id as KitchenWidgetType] || w.id}
                     </button>
                  ))}
               </div>
            </div>
         )}

         {isVisible('STATS_ROW') && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {/* 1. GASTO MENSUAL COMIDA (Sincronizado con Finanzas) */}
               <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform"><CreditCard className="w-5 h-5" /></div>
                     <span className={`text-[10px] font-black px-3 py-1 rounded-full shadow-inner ${foodSpending > 400 ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {new Date().toLocaleDateString('es-ES', { month: 'long' })}
                     </span>
                  </div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Gasto Alimentación</p>
                  <h3 className="text-3xl font-black text-gray-900 mt-1 flex items-baseline gap-1">
                     {foodSpending.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">€</span>
                  </h3>
               </div>

               {/* 2. SALUD DE STOCK (Porcentaje Real) */}
               <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 group relative overflow-hidden flex items-center justify-between">
                  <div className="z-10">
                     <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform w-fit mb-4"><Activity className="w-5 h-5" /></div>
                     <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Salud Stock</p>
                     <h3 className="text-3xl font-black text-gray-900 mt-1">{stockHealth}%</h3>
                  </div>
                  <div className="w-20 h-20 relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={[{ value: stockHealth, color: '#10B981' }, { value: 100 - stockHealth, color: '#F3F4F6' }]} innerRadius={25} outerRadius={35} paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                              {[{ value: stockHealth, color: '#10B981' }, { value: 100 - stockHealth, color: '#F3F4F6' }].map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-black text-emerald-600">{stockHealth}%</span>
                     </div>
                  </div>
               </div>

               {/* 3. ÍNDICE DE FRESCURA (Basado en Caducidad) */}
               <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 group">
                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-2xl group-hover:scale-110 transition-transform ${freshnessScore > 80 ? 'bg-emerald-50 text-emerald-600' : freshnessScore > 50 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                        <Leaf className="w-5 h-5" />
                     </div>
                     <span className={`text-[10px] font-black px-3 py-1 rounded-full ${freshnessScore > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                        Score
                     </span>
                  </div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Frescura Global</p>
                  <h3 className="text-3xl font-black text-gray-900 mt-1 flex items-baseline gap-1">
                     {freshnessScore}
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">/ 100</span>
                  </h3>
               </div>

               {/* 4. ITEMS BAJOS (Acción Inmediata) */}
               <div className={`p-6 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl ${lowStockItems.length > 0 ? 'bg-white border-red-100' : 'bg-white border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-4 z-10">
                     <div className={`p-3 rounded-2xl transition-all group-hover:scale-110 ${lowStockItems.length > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}><ShoppingCart className="w-5 h-5" /></div>
                     {lowStockItems.length > 0 && <AlertTriangle className="w-6 h-6 text-red-500 animate-bounce" />}
                  </div>
                  <div className="z-10">
                     <p className={`${lowStockItems.length > 0 ? 'text-red-500' : 'text-gray-400'} text-[10px] font-black uppercase tracking-[0.2em]`}>Reponer</p>
                     <h3 className={`text-3xl font-black mt-1 ${lowStockItems.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{lowStockItems.length}</h3>
                  </div>
               </div>
            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {isVisible('TODAY_MENU_CARD') && (
               <div className="lg:col-span-8 bg-white text-gray-900 rounded-[3rem] p-8 md:p-10 shadow-sm border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-1000"></div>

                  <div className="relative z-10 flex flex-col h-full">
                     <div className="flex justify-between items-start mb-10">
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                                 <Sparkles className="w-5 h-5" />
                              </div>
                              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">
                                 Hoja de Ruta Gourmet
                              </h3>
                           </div>
                           <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Sincronizado con Onyx Calendar
                           </p>
                        </div>
                        <button
                           onClick={() => onViewChange('PLANNER')}
                           className="p-4 bg-white hover:bg-gray-50 rounded-[1.5rem] transition-all duration-300 active:scale-95 border border-gray-100 shadow-sm group/btn"
                        >
                           <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {[
                           { key: 'breakfast', icon: Coffee, title: 'Desayuno', time: '08:30', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
                           { key: 'lunch', icon: Sunset, title: 'Almuerzo', time: '14:00', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                           { key: 'dinner', icon: Moon, title: 'Cena', time: '21:00', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' }
                        ].map((meal) => {
                           const dishes = todayMeals[meal.key as MealTime] || [];
                           return (
                              <div
                                 key={meal.key}
                                 className={`rounded-[2rem] p-6 border flex flex-col gap-6 group/item transition-all duration-500 cursor-pointer overflow-hidden relative active:scale-95 hover:shadow-md ${meal.bg} ${meal.border}`}
                              >
                                 <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-white p-0.5 shadow-sm group-hover/item:scale-110 transition-transform">
                                       <div className="w-full h-full bg-white rounded-[0.9rem] flex items-center justify-center">
                                          <meal.icon className={`w-6 h-6 ${meal.color}`} />
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <span className={`text-[10px] font-black uppercase tracking-widest ${meal.color} opacity-70`}>{meal.time}</span>
                                       <span className="block text-[10px] font-bold text-gray-600 uppercase mt-0.5">{meal.title}</span>
                                    </div>
                                 </div>

                                 <div className="flex-1">
                                    {dishes.length > 0 ? (
                                       <div className="space-y-3">
                                          {dishes.map((d, idx) => (
                                             <button
                                                key={idx}
                                                onClick={() => onOpenRecipe(d)}
                                                className="w-full text-left font-extrabold text-sm text-gray-800 hover:text-emerald-700 transition-colors leading-tight flex items-center gap-2 group/dish"
                                             >
                                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-0 group-hover/dish:opacity-100 transition-opacity"></span>
                                                {d.name}
                                             </button>
                                          ))}
                                       </div>
                                    ) : (
                                       <div className="flex flex-col gap-1 opacity-20 group-hover/item:opacity-40 transition-opacity">
                                          <div className="h-4 w-2/3 bg-gray-400 rounded-full"></div>
                                          <div className="h-4 w-1/2 bg-gray-400 rounded-full"></div>
                                       </div>
                                    )}
                                 </div>

                                 {dishes.length > 0 && (
                                    <div className="pt-4 border-t border-black/5 mt-auto">
                                       <span className="text-[10px] font-black text-gray-500 flex items-center gap-1 group-hover/item:text-gray-600 transition-colors">
                                          <Flame className="w-3 h-3" /> {dishes.reduce((a, b) => a + (b.calories || 0), 0)} KCAL
                                       </span>
                                    </div>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  </div>
                  <ChefHat className="absolute -bottom-16 -right-16 w-80 h-80 text-emerald-900/5 rotate-12 pointer-events-none group-hover:scale-110 group-hover:rotate-0 transition-all duration-1000" />
               </div>
            )}

            {isVisible('SHOPPING_LIST_CARD') && (
               <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-lg transition-shadow duration-500">
                     <div className="flex justify-between items-center mb-6">
                        <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest flex items-center gap-2">
                           <ListChecks className="w-5 h-5 text-emerald-600" /> Tu Cesta
                        </h4>
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shadow-sm">{shoppingList.length}</span>
                     </div>

                     <div className="flex-1 space-y-3 mb-6 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                        {shoppingList.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-50">
                              <Sparkles className="w-8 h-8 text-emerald-500 mb-2" />
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Todo Listo</p>
                           </div>
                        ) : (
                           shoppingList.slice(0, 5).map(item => (
                              <button
                                 key={item.id}
                                 onClick={() => {
                                    // Remove item locally and from store
                                    widgets.find(w => w.id === 'SHOPPING_LIST_CARD'); // dummy read
                                    useLifeStore.getState().setShoppingList(prev => prev.filter(i => i.id !== item.id));
                                 }}
                                 className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100 group cursor-pointer text-left"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full group-hover:scale-150 transition-transform ${item.source?.type === 'RECIPE' ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                                    <span className="text-xs font-bold text-gray-700 truncate max-w-[120px] group-hover:line-through group-hover:text-gray-400 transition-all">{item.name}</span>
                                 </div>
                                 <span className="text-[9px] font-black text-gray-400 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100 flex items-center gap-1 group-hover:text-emerald-500">
                                    {item.quantity} {item.unit}
                                    <span className="hidden group-hover:inline opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
                                 </span>
                              </button>
                           ))
                        )}
                        {shoppingList.length > 5 && (
                           <button onClick={() => onViewChange('LIST')} className="text-[10px] font-black text-blue-600 w-full text-center hover:underline py-2">+ {shoppingList.length - 5} más...</button>
                        )}
                     </div>

                     <button onClick={() => onViewChange('LIST')} className="w-full py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                        Ver Lista Completa
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};
