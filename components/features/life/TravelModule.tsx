import React, { useState } from 'react';
import {
   Plane, Map, Luggage, Plus, Calendar, ArrowRight, DollarSign, MapPin,
   Hotel, Ticket, Clock, Check, Search, X, ChevronLeft, Bed, Tent, Wallet, Globe, Sparkles, Loader2,
   Wand2, ExternalLink
} from 'lucide-react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useUserStore } from '../../../store/useUserStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { Trip, Flight, Accommodation, ItineraryItem, Language } from '../../../types';
import { generateImage, planTripWithAI } from '../../../services/geminiService';

interface TravelModuleProps {
   // All state managed via stores
}

const TravelModule: React.FC<TravelModuleProps> = () => {
   const { trips, setTrips } = useLifeStore();
   const { language } = useUserStore();
   const { currency } = useFinanceStore();

   const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
   const [isNewTripOpen, setIsNewTripOpen] = useState(false);
   const [activeDetailTab, setActiveDetailTab] = useState<'OVERVIEW' | 'ITINERARY' | 'BOOKINGS'>('OVERVIEW');

   // Creation Mode State
   const [createMode, setCreateMode] = useState<'MANUAL' | 'AI'>('MANUAL');
   const [aiPrompt, setAiPrompt] = useState('');
   const [isAiPlanning, setIsAiPlanning] = useState(false);

   // New Trip Form State (Shared)
   const [newDestination, setNewDestination] = useState('');
   const [newCountry, setNewCountry] = useState('');
   const [newStartDate, setNewStartDate] = useState('');
   const [newEndDate, setNewEndDate] = useState('');
   const [newBudget, setNewBudget] = useState('');
   const [newImage, setNewImage] = useState<string | null>(null);
   const [isGeneratingImg, setIsGeneratingImg] = useState(false);

   // AI Generated Content Buffers
   const [generatedFlights, setGeneratedFlights] = useState<Flight[]>([]);
   const [generatedAccommodations, setGeneratedAccommodations] = useState<Accommodation[]>([]);
   const [generatedItinerary, setGeneratedItinerary] = useState<ItineraryItem[]>([]);

   const selectedTrip = trips.find(t => t.id === selectedTripId);

   const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency as string, maximumFractionDigits: 0 }).format(amount);

   const handleGenerateImage = async () => {
      if (!newDestination) return;
      setIsGeneratingImg(true);
      const prompt = `Beautiful travel photo of ${newDestination}, ${newCountry}. Landmarks, sunny weather.`;
      const result = await generateImage(prompt, "16:9");
      if (result.imageUrl) {
         setNewImage(result.imageUrl);
      } else {
         alert("No se pudo generar la imagen. Inténtalo de nuevo.");
      }
      setIsGeneratingImg(false);
   };

   const handleAiPlan = async () => {
      if (!aiPrompt) return;
      setIsAiPlanning(true);

      const tripPlan = await planTripWithAI(aiPrompt, language as any);

      if (tripPlan) {
         setNewDestination(tripPlan.destination || '');
         setNewCountry(tripPlan.country || '');
         setNewStartDate(tripPlan.startDate || '');
         setNewEndDate(tripPlan.endDate || '');
         setNewBudget(tripPlan.budget?.toString() || '');

         if (tripPlan.flights) setGeneratedFlights(tripPlan.flights.map(f => ({ ...f, id: Math.random().toString(36).substr(2, 9) } as Flight)));
         if (tripPlan.accommodations) setGeneratedAccommodations(tripPlan.accommodations.map(a => ({ ...a, id: Math.random().toString(36).substr(2, 9) } as Accommodation)));
         if (tripPlan.itinerary) setGeneratedItinerary(tripPlan.itinerary.map(i => ({ ...i, id: Math.random().toString(36).substr(2, 9) } as ItineraryItem)));

         setCreateMode('MANUAL');

         if (tripPlan.destination) {
            setIsGeneratingImg(true);
            const prompt = tripPlan.imagePrompt || `Travel photo of ${tripPlan.destination}`;
            generateImage(prompt, "16:9").then(res => {
               if (res.imageUrl) setNewImage(res.imageUrl);
               setIsGeneratingImg(false);
            });
         }
      } else {
         alert("La IA no pudo generar el plan. Intenta ser más específico.");
      }
      setIsAiPlanning(false);
   };

   const handleCreateTrip = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newDestination || !newStartDate) return;

      const newTrip: Trip = {
         id: Math.random().toString(36).substr(2, 9),
         destination: newDestination,
         country: newCountry,
         startDate: newStartDate,
         endDate: newEndDate,
         budget: parseFloat(newBudget) || 0,
         spent: 0,
         status: 'UPCOMING',
         image: newImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
         flights: generatedFlights,
         accommodations: generatedAccommodations,
         itinerary: generatedItinerary
      };

      setTrips((prev: Trip[]) => [...prev, newTrip]);
      resetForm();
   };

   const resetForm = () => {
      setIsNewTripOpen(false);
      setNewDestination(''); setNewCountry(''); setNewStartDate(''); setNewEndDate(''); setNewBudget(''); setNewImage(null);
      setGeneratedFlights([]); setGeneratedAccommodations([]); setGeneratedItinerary([]);
      setCreateMode('MANUAL'); setAiPrompt('');
   };

   const calculateDaysUntil = (dateStr: string) => {
      const today = new Date();
      const target = new Date(dateStr);
      const diff = target.getTime() - today.getTime();
      return Math.ceil(diff / (1000 * 3600 * 24));
   };

   const renderTripList = () => (
      <div className="space-y-8 p-8 animate-fade-in pb-20 overflow-y-auto h-full">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Mis Viajes</h2>
               <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Explora el mundo con Onyx</p>
            </div>
            <button onClick={() => setIsNewTripOpen(true)} className="bg-rose-500 text-white px-8 py-3 rounded-[1.5rem] shadow-xl hover:bg-rose-600 transition-all active:scale-95 font-black text-xs uppercase tracking-widest flex items-center gap-2">
               <Plus className="w-5 h-5" /> Nuevo Viaje
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map(trip => {
               const daysLeft = calculateDaysUntil(trip.startDate);
               return (
                  <div key={trip.id} onClick={() => setSelectedTripId(trip.id)} className="group cursor-pointer bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative flex flex-col h-[350px]">
                     <div className="h-1/2 relative overflow-hidden bg-rose-50">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                        {trip.image ? <img src={trip.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <div className="w-full h-full bg-rose-100 flex items-center justify-center"><Map className="w-12 h-12 text-rose-300" /></div>}
                        <div className="absolute bottom-4 left-6 z-20 text-white">
                           <h3 className="text-2xl font-black tracking-tight leading-none mb-1">{trip.destination}</h3>
                           <p className="text-xs font-bold uppercase tracking-widest opacity-80">{trip.country}</p>
                        </div>
                        <div className="absolute top-4 right-4 z-20">
                           {daysLeft > 0 ? (
                              <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">Faltan {daysLeft} días</span>
                           ) : (
                              <span className="bg-emerald-500 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">Completado</span>
                           )}
                        </div>
                     </div>
                     <div className="p-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3 text-gray-500">
                              <Calendar className="w-4 h-4 text-rose-500" />
                              <span className="text-xs font-bold uppercase tracking-wider">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                           </div>
                           <div className="flex items-center gap-3 text-gray-500">
                              <Wallet className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-bold uppercase tracking-wider">Presupuesto: {formatCurrency(trip.budget)}</span>
                           </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                           <div className="flex -space-x-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-black text-gray-500">TU</div>
                              <div className="w-8 h-8 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center text-[9px] font-black text-rose-600">+1</div>
                           </div>
                           <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest group-hover:underline flex items-center gap-1">Ver Detalles <ArrowRight className="w-3 h-3" /></span>
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );

   const renderTripDetails = () => {
      if (!selectedTrip) return null;
      const daysLeft = calculateDaysUntil(selectedTrip.startDate);
      const progress = Math.min((selectedTrip.spent / selectedTrip.budget) * 100, 100);

      return (
         <div className="h-full flex flex-col bg-white overflow-hidden animate-fade-in">
            {/* HEADER */}
            <div className="relative h-64 shrink-0 bg-gray-900">
               <img src={selectedTrip.image} className="w-full h-full object-cover opacity-80" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
               <button onClick={() => setSelectedTripId(null)} className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-all z-20"><ChevronLeft className="w-6 h-6" /></button>
               <div className="absolute bottom-8 left-8 right-8 z-20 text-white flex justify-between items-end">
                  <div>
                     <h1 className="text-5xl font-black tracking-tighter mb-2">{selectedTrip.destination}</h1>
                     <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-80 flex items-center gap-2"><MapPin className="w-4 h-4" /> {selectedTrip.country}</p>
                  </div>
                  <div className="hidden md:block text-right">
                     <p className="text-3xl font-black">{daysLeft > 0 ? daysLeft : 0}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Días para despegar</p>
                  </div>
               </div>
            </div>

            {/* NAVIGATION & CONTENT */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
               {/* SIDEBAR TABS */}
               <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto">
                  <button onClick={() => setActiveDetailTab('OVERVIEW')} className={`p-3 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest transition-all ${activeDetailTab === 'OVERVIEW' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}><Sparkles className="w-4 h-4" /> Resumen</button>
                  <button onClick={() => setActiveDetailTab('ITINERARY')} className={`p-3 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest transition-all ${activeDetailTab === 'ITINERARY' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}><Map className="w-4 h-4" /> Itinerario</button>
                  <button onClick={() => setActiveDetailTab('BOOKINGS')} className={`p-3 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest transition-all ${activeDetailTab === 'BOOKINGS' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}><Ticket className="w-4 h-4" /> Reservas</button>
               </div>

               {/* TAB CONTENT */}
               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">

                  {activeDetailTab === 'OVERVIEW' && (
                     <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                              <div className="flex justify-between items-center mb-6">
                                 <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Control Presupuesto</h3>
                                 <div className="flex items-center gap-2">
                                    {selectedTrip.linkedGoalId && <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100 uppercase tracking-tighter flex items-center gap-1"><Check className="w-3 h-3" /> Sincronizado Finanzas</span>}
                                    <Wallet className="w-5 h-5 text-gray-400" />
                                 </div>
                              </div>
                              <p className="text-3xl font-black text-gray-900 tracking-tighter mb-2">{formatCurrency(selectedTrip.spent)} <span className="text-sm font-bold text-gray-400">/ {formatCurrency(selectedTrip.budget)}</span></p>
                              <div className="w-full bg-gray-100 rounded-full h-3 mb-2"><div className={`h-3 rounded-full transition-all duration-1000 ${progress > 90 ? 'bg-red-500' : 'bg-rose-500'}`} style={{ width: `${progress}%` }}></div></div>
                              <p className="text-[10px] font-bold text-gray-400 text-right">{progress.toFixed(0)}% Utilizado</p>
                           </div>
                           <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 flex flex-col justify-center items-center text-center">
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm mb-3"><Calendar className="w-6 h-6" /></div>
                              <p className="text-rose-900 font-black text-lg">{new Date(selectedTrip.startDate).toLocaleDateString()}</p>
                              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Fecha de salida</p>
                           </div>
                        </div>
                        <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                           <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm mb-6 flex items-center gap-2"><Globe className="w-4 h-4" /> Documentación y Visados</h3>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm">
                                 <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Check className="w-4 h-4" /></div>
                                 <span className="text-sm font-bold text-gray-700">Pasaportes</span>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm opacity-50">
                                 <div className="p-2 bg-gray-100 text-gray-400 rounded-lg"><X className="w-4 h-4" /></div>
                                 <span className="text-sm font-bold text-gray-700">Seguro Viaje</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {activeDetailTab === 'BOOKINGS' && (
                     <div className="space-y-8 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="text-xl font-black text-gray-900 tracking-tight">Vuelos & Transporte</h3>
                           <button className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-lg hover:bg-rose-100">+ Añadir</button>
                        </div>
                        {selectedTrip.flights.length > 0 ? (
                           <div className="space-y-4">
                              {selectedTrip.flights.map(flight => (
                                 <div key={flight.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-gray-50 px-4 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest text-gray-400">{flight.airline} • {flight.flightNumber}</div>
                                    <div className="flex items-center justify-between mt-4">
                                       <div className="text-center">
                                          <div className="text-3xl font-black text-gray-900">{flight.origin}</div>
                                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                       </div>
                                       <div className="flex-1 px-8 flex flex-col items-center">
                                          <div className="flex items-center gap-2 w-full">
                                             <div className="h-[2px] bg-gray-200 flex-1"></div>
                                             <Plane className="w-5 h-5 text-rose-400 rotate-90" />
                                             <div className="h-[2px] bg-gray-200 flex-1"></div>
                                          </div>
                                          <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">Directo</span>
                                       </div>
                                       <div className="text-center">
                                          <div className="text-3xl font-black text-gray-900">{flight.destination}</div>
                                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                       </div>
                                    </div>
                                    {flight.bookingUrl && (
                                       <div className="flex justify-center mt-6">
                                          <a href={flight.bookingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors shadow-lg active:scale-95">
                                             <ExternalLink className="w-3 h-3" /> Ver Oferta / Reservar
                                          </a>
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400">
                              <Plane className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              <p className="text-xs font-bold uppercase tracking-widest">Sin vuelos registrados</p>
                           </div>
                        )}

                        <div className="flex justify-between items-center mb-4 pt-8 border-t border-gray-50">
                           <h3 className="text-xl font-black text-gray-900 tracking-tight">Alojamiento</h3>
                           <button className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-lg hover:bg-rose-100">+ Añadir</button>
                        </div>
                        {selectedTrip.accommodations.length > 0 ? (
                           <div className="grid grid-cols-1 gap-4">
                              {selectedTrip.accommodations.map(acc => (
                                 <div key={acc.id} className="flex flex-col gap-4 p-4 bg-white border border-gray-100 rounded-3xl hover:shadow-md transition-all">
                                    <div className="flex gap-4">
                                       <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
                                          <Hotel className="w-8 h-8 text-gray-400" />
                                       </div>
                                       <div className="flex-1">
                                          <h4 className="font-black text-gray-900 text-lg">{acc.name}</h4>
                                          <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> {acc.address}</p>
                                          <div className="flex gap-3 mt-2">
                                             <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">In: {new Date(acc.checkIn).toLocaleDateString()}</span>
                                             <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Out: {new Date(acc.checkOut).toLocaleDateString()}</span>
                                          </div>
                                       </div>
                                    </div>
                                    {acc.bookingUrl && (
                                       <a href={acc.bookingUrl} target="_blank" rel="noopener noreferrer" className="w-full text-center text-[10px] font-black uppercase tracking-widest bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors shadow-md">
                                          Ver Hotel / Reservar
                                       </a>
                                    )}
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400">
                              <Bed className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              <p className="text-xs font-bold uppercase tracking-widest">Sin alojamientos registrados</p>
                           </div>
                        )}
                     </div>
                  )}

                  {activeDetailTab === 'ITINERARY' && (
                     <div className="space-y-6 animate-fade-in relative">
                        <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-100"></div>
                        {selectedTrip.itinerary.length > 0 ? (
                           selectedTrip.itinerary.map(item => (
                              <div key={item.id} className="relative pl-12">
                                 <div className="absolute left-[11px] top-4 w-3 h-3 rounded-full bg-rose-500 border-2 border-white ring-4 ring-rose-100"></div>
                                 <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                       <div>
                                          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 block">{item.time}</span>
                                          <h4 className="font-black text-gray-900">{item.activity}</h4>
                                          {item.location && <p className="text-xs text-gray-400 font-bold mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</p>}
                                       </div>
                                       <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${item.type === 'FOOD' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{item.type}</span>
                                    </div>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="pl-12">
                              <div className="bg-gray-50 p-8 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
                                 <Map className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                 <p className="text-xs font-bold uppercase tracking-widest">Itinerario vacío</p>
                                 <button className="mt-4 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:underline">Generar con IA</button>
                              </div>
                           </div>
                        )}
                     </div>
                  )}

               </div>
            </div>
         </div>
      );
   };

   return (
      <div className="h-full bg-[#FAFAFA] relative">
         {!selectedTripId ? renderTripList() : renderTripDetails()}

         {/* NEW TRIP MODAL */}
         {isNewTripOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
               <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                  <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                     <h3 className="text-xl font-black text-gray-900 tracking-tight">Nuevo Viaje</h3>
                     <button onClick={resetForm} className="text-gray-400 hover:text-gray-900 p-2"><X className="w-6 h-6" /></button>
                  </div>

                  {/* Mode Switcher */}
                  <div className="px-8 pt-6 pb-2">
                     <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                        <button onClick={() => setCreateMode('MANUAL')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${createMode === 'MANUAL' ? 'bg-white shadow-md text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>Manual</button>
                        <button onClick={() => setCreateMode('AI')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${createMode === 'AI' ? 'bg-white shadow-md text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}><Wand2 className="w-3 h-3" /> Planificador IA</button>
                     </div>
                  </div>

                  {createMode === 'AI' ? (
                     <div className="p-8 space-y-6">
                        <div className="text-center mb-4">
                           <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4"><Sparkles className="w-8 h-8 text-purple-600" /></div>
                           <h4 className="text-lg font-black text-gray-900">Diseñador de Experiencias</h4>
                           <p className="text-sm text-gray-500 mt-2">Describe tu viaje ideal y la IA se encargará de buscar vuelos reales, hoteles y crear tu agenda.</p>
                        </div>
                        <div>
                           <textarea
                              value={aiPrompt}
                              onChange={(e) => setAiPrompt(e.target.value)}
                              placeholder="Ej: Quiero ir a la costa amalfitana en mayo, 5 días, con un presupuesto de 2000€. Me gusta la comida italiana y los paseos en barco."
                              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-sm focus:bg-white focus:ring-4 focus:ring-purple-500/10 outline-none transition-all h-32 resize-none"
                           />
                        </div>
                        <button
                           onClick={handleAiPlan}
                           disabled={isAiPlanning || !aiPrompt}
                           className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                           {isAiPlanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                           {isAiPlanning ? 'Buscando opciones reales...' : 'Generar Viaje Completo'}
                        </button>
                     </div>
                  ) : (
                     <form onSubmit={handleCreateTrip} className="p-8 space-y-6">
                        {/* Image Preview and Generator */}
                        <div className="w-full h-40 rounded-2xl bg-gray-100 relative overflow-hidden group border border-gray-200 flex items-center justify-center">
                           {newImage ? (
                              <>
                                 <img src={newImage} className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                              </>
                           ) : (
                              <div className="text-gray-400 flex flex-col items-center">
                                 <Plane className="w-8 h-8 mb-2 opacity-20" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Sin imagen</span>
                              </div>
                           )}

                           <button
                              type="button"
                              onClick={handleGenerateImage}
                              disabled={isGeneratingImg || !newDestination}
                              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md hover:bg-white text-gray-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                           >
                              {isGeneratingImg ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-purple-600" />}
                              {isGeneratingImg ? 'Generando...' : 'Autogenerar Foto'}
                           </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="col-span-2">
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Destino</label>
                              <input type="text" value={newDestination} onChange={(e) => setNewDestination(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" placeholder="Ej: París" required />
                           </div>
                           <div className="col-span-2">
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">País</label>
                              <input type="text" value={newCountry} onChange={(e) => setNewCountry(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" placeholder="Ej: Francia" />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Inicio</label>
                              <input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" required />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fin</label>
                              <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" />
                           </div>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Presupuesto Estimado ({currency})</label>
                           <div className="relative">
                              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input type="number" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-lg" placeholder="0.00" />
                           </div>

                           {/* Show summary of AI generated assets if present */}
                           {(generatedFlights.length > 0 || generatedAccommodations.length > 0) && (
                              <div className="mt-4 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                 <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Wand2 className="w-3 h-3" /> Contenido Generado por IA</p>
                                 <div className="flex gap-2">
                                    {generatedFlights.length > 0 && <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-gray-600 shadow-sm border border-gray-100">{generatedFlights.length} Vuelos</span>}
                                    {generatedAccommodations.length > 0 && <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-gray-600 shadow-sm border border-gray-100">{generatedAccommodations.length} Alojamientos</span>}
                                    {generatedItinerary.length > 0 && <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-gray-600 shadow-sm border border-gray-100">{generatedItinerary.length} Actividades</span>}
                                 </div>
                              </div>
                           )}

                           <p className="text-[9px] text-gray-400 mt-2 font-medium flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-500" /> Se creará una meta de ahorro automática en Finanzas.
                           </p>
                        </div>
                        <button type="submit" className="w-full bg-rose-500 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl mt-4 active:scale-95 transition-all">
                           {generatedFlights.length > 0 ? 'Guardar Viaje Generado' : 'Crear Viaje & Sincronizar'}
                        </button>
                     </form>
                  )}
               </div>
            </div>
         )}
      </div>
   );
};

export default TravelModule;
