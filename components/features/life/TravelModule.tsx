import React, { useState, useEffect, useRef } from 'react';
import {
   Plane, Map, Luggage, Plus, Calendar, ArrowRight, DollarSign, MapPin,
   Hotel, Ticket, Clock, Check, Search, X, ChevronLeft, Bed, Tent, Wallet, Globe, Sparkles, Loader2,
   Wand2, ExternalLink, ShieldCheck, PieChart
} from 'lucide-react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useUserStore } from '../../../store/useUserStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { Trip, Flight, Accommodation, ItineraryItem, Language } from '../../../types';
import { generateImage, planTripWithAI, extractTravelParams } from '../../../services/geminiService';
import { searchFlights, searchAccommodations } from '../../../services/duffelService';
import { TravelItinerary } from './travel/TravelItinerary';
import { TravelFinance } from './travel/TravelFinance';
import { TravelDocuments } from './travel/TravelDocuments';
import createGlobe from 'cobe';

const CobeInteractiveGlobe = () => {
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      let phi = 0;
      let width = 0;

      const onResize = () => {
         if (canvasRef.current) {
            width = canvasRef.current.offsetWidth;
         }
      };
      window.addEventListener('resize', onResize);
      onResize();

      if (!canvasRef.current) return;

      const globe = createGlobe(canvasRef.current, {
         devicePixelRatio: 2,
         width: width * 2,
         height: width * 2,
         phi: 0,
         theta: 0.3,
         dark: 0,
         diffuse: 1.2,
         mapSamples: 16000,
         mapBrightness: 6,
         baseColor: [1, 1, 1],
         markerColor: [59 / 255, 130 / 255, 246 / 255], // blue-500
         glowColor: [1, 1, 1],
         markers: [],
         onRender: (state) => {
            state.phi = phi;
            phi += 0.005;
            state.width = width * 2;
            state.height = width * 2;
         }
      });

      return () => {
         globe.destroy();
         window.removeEventListener('resize', onResize);
      };
   }, []);

   return (
      <div className="w-full h-full relative" style={{ width: '100%', aspectRatio: '1/1', maxWidth: '300px', margin: 'auto' }}>
         <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', contain: 'layout paint size', opacity: 0.9, transition: 'opacity 1s ease' }}
         />
      </div>
   );
};

interface TravelModuleProps { }

const TravelModule: React.FC<TravelModuleProps> = () => {
   const { trips, setTrips } = useLifeStore();
   const { language } = useUserStore();
   const { currency } = useFinanceStore();

   const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
   const [isNewTripOpen, setIsNewTripOpen] = useState(false);
   const [isMapModalOpen, setIsMapModalOpen] = useState(false);
   const [activeDetailTab, setActiveDetailTab] = useState<'OVERVIEW' | 'ITINERARY' | 'FINANCE' | 'DOCUMENTS' | 'BOOKINGS'>('OVERVIEW');

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

      try {
         // 1. Extraer parámetros del viaje con Gemini
         const params = await extractTravelParams(aiPrompt, language as any);

         let realFlights: Flight[] = [];
         let realAccommodations: Accommodation[] = [];

         // 2. Si Gemini encontró origen, destino y fecha, buscar en Duffel
         if (params && params.origin && params.destination && params.departureDate) {
            realFlights = await searchFlights({
               origin: params.origin,
               destination: params.destination,
               departureDate: params.departureDate,
               returnDate: params.returnDate || undefined,
               adults: params.adults
            });

            // (Asumimos que la búsqueda de hoteles de Duffel aún no la usamos en producción por el beta)
         }

         // 3. Crear el Itinerario final pasando los datos reales
         const tripPlan = await planTripWithAI(aiPrompt, realFlights, realAccommodations, language as any);

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
      } catch (error) {
         console.error("Error en la planificación con IA:", error);
         alert("Ocurrió un error inesperado al conectar con los servicios de viaje.");
      } finally {
         setIsAiPlanning(false);
      }
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
         itinerary: generatedItinerary,
         checklist: []
      };

      setTrips([...trips, newTrip]);
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

   const renderTravelHub = () => {
      const totalTrips = trips.length;
      const upcomingTrips = trips.filter(t => t.status === 'UPCOMING').length;
      const uniqueCountries = new Set(trips.map(t => t.country)).size;

      return (
         <div className="space-y-8 p-8 animate-fade-in pb-20 overflow-y-auto h-full">
            {/* Hub Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                     Onyx Experiencias <span className="bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] px-3 py-1 rounded-full tracking-widest uppercase shadow-md">Pro</span>
                  </h2>
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Tu pasaporte inteligente al mundo</p>
               </div>
               <div className="flex gap-3">
                  <button onClick={() => setIsMapModalOpen(true)} className="bg-white text-gray-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm border border-gray-100 flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95">
                     <Map className="w-4 h-4" /> Mapa Mundial
                  </button>
                  <button onClick={() => setIsNewTripOpen(true)} className="bg-gray-900 text-white px-8 py-3 rounded-2xl shadow-xl hover:bg-gray-800 transition-all active:scale-95 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                     <Plus className="w-5 h-5" /> Nueva Aventura
                  </button>
               </div>
            </div>

            {/* Hub Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
                  <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                     <Luggage className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Viajes Totales</p>
                     <p className="text-3xl font-black text-gray-900 tracking-tighter">{totalTrips}</p>
                     <p className="text-xs font-bold text-emerald-500 mt-1">{upcomingTrips} Próximos</p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                     <Globe className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Países Visitados</p>
                     <p className="text-3xl font-black text-gray-900 tracking-tighter">{uniqueCountries}</p>
                     <p className="text-xs font-bold text-gray-400 mt-1">Explorador Global</p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                     <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Millas Onyx</p>
                     <p className="text-3xl font-black text-gray-900 tracking-tighter">12,450</p>
                     <p className="text-xs font-bold text-emerald-500 mt-1">Nivel Oro</p>
                  </div>
               </div>
            </div>

            {/* Trip Grid */}
            <div>
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 px-2">Tus Expediciones</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {trips.map(trip => {
                     const daysLeft = calculateDaysUntil(trip.startDate);
                     return (
                        <div key={trip.id} onClick={() => setSelectedTripId(trip.id)} className="group cursor-pointer bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative flex flex-col h-[380px]">
                           <div className="h-1/2 relative overflow-hidden bg-rose-50">
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
                              {trip.image ? <img src={trip.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <div className="w-full h-full bg-rose-100 flex items-center justify-center"><Map className="w-12 h-12 text-rose-300" /></div>}
                              <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                                 <h3 className="text-3xl font-black tracking-tighter leading-none mb-2">{trip.destination}</h3>
                                 <p className="text-xs font-bold uppercase tracking-widest opacity-80 flex items-center gap-1"><MapPin className="w-3 h-3" /> {trip.country}</p>
                              </div>
                              <div className="absolute top-4 right-4 z-20">
                                 {daysLeft > 0 ? (
                                    <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-lg">Faltan {daysLeft} días</span>
                                 ) : (
                                    <span className="bg-gray-900/80 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-700 shadow-lg">Completado</span>
                                 )}
                              </div>
                           </div>
                           <div className="p-6 flex-1 flex flex-col justify-between">
                              <div className="space-y-4">
                                 <div className="flex items-center gap-3 text-gray-500">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0"><Calendar className="w-4 h-4" /></div>
                                    <span className="text-xs font-black uppercase tracking-wider">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                                 </div>
                                 <div className="flex items-center gap-3 text-gray-500">
                                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0"><Wallet className="w-4 h-4" /></div>
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Control de Gasto</span>
                                       <span className="text-sm font-black text-gray-900 tracking-tight">{formatCurrency(trip.spent)} <span className="text-gray-400 font-medium">/ {formatCurrency(trip.budget)}</span></span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                                 <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-black text-gray-500 shadow-sm z-10">TÚ</div>
                                    <div className="w-8 h-8 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center text-[9px] font-black text-rose-600 shadow-sm z-0">+1</div>
                                 </div>
                                 <button className="bg-gray-900 text-white w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-rose-500 transition-colors shadow-md">
                                    <ArrowRight className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      );
   };

   const renderTripDetails = () => {
      if (!selectedTrip) return null;
      const daysLeft = calculateDaysUntil(selectedTrip.startDate);

      return (
         <div className="h-full flex flex-col bg-[#FAFAFA] overflow-hidden animate-fade-in relative z-50">
            {/* HEADER */}
            <div className="relative h-72 shrink-0 bg-gray-900">
               <img src={selectedTrip.image} className="w-full h-full object-cover opacity-60" />
               <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

               {/* Top Bar Navigation */}
               <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                  <button onClick={() => setSelectedTripId(null)} className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-white/20 transition-all border border-white/10 group flex items-center gap-2">
                     <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                     <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Volver</span>
                  </button>
                  <div className="flex gap-2">
                     <button className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all border border-white/10 text-[10px] font-black uppercase tracking-widest">Compartir</button>
                     <button className="bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition-all shadow-lg text-[10px] font-black uppercase tracking-widest">Editar</button>
                  </div>
               </div>

               {/* Header Title Area */}
               <div className="absolute bottom-8 left-8 right-8 z-20 text-white flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                     <span className="bg-rose-500/20 text-rose-200 border border-rose-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Misión Planificada</span>
                     <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-2 leading-none drop-shadow-xl">{selectedTrip.destination}</h1>
                     <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] opacity-90 flex items-center gap-2 drop-shadow-md">
                        <Globe className="w-4 h-4" /> {selectedTrip.country}
                     </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex gap-6 text-center">
                     <div>
                        <p className="text-2xl font-black">{daysLeft > 0 ? daysLeft : 0}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Días a salida</p>
                     </div>
                     <div className="w-[1px] bg-white/20"></div>
                     <div>
                        <p className="text-2xl font-black">{Math.max(1, (new Date(selectedTrip.endDate).getTime() - new Date(selectedTrip.startDate).getTime()) / (1000 * 3600 * 24))}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Días</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* NAVIGATION TABS */}
            <div className="bg-white border-b border-gray-100 px-8 flex overflow-x-auto custom-scrollbar shrink-0 sticky top-0 z-40">
               {[
                  { id: 'OVERVIEW', icon: Sparkles, label: 'Resumen' },
                  { id: 'ITINERARY', icon: Map, label: 'Itinerario' },
                  { id: 'FINANCE', icon: Wallet, label: 'Finanzas' },
                  { id: 'DOCUMENTS', icon: ShieldCheck, label: 'Bóveda' },
                  { id: 'BOOKINGS', icon: Ticket, label: 'Reservas' }
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveDetailTab(tab.id as any)}
                     className={`flex items-center gap-3 py-5 px-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all relative whitespace-nowrap ${activeDetailTab === tab.id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                     <tab.icon className={`w-4 h-4 ${activeDetailTab === tab.id ? 'text-rose-500' : ''}`} /> {tab.label}
                     {activeDetailTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-t-full"></div>}
                  </button>
               ))}
            </div>

            {/* TAB CONTENT PANEL */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
               <div className="max-w-5xl mx-auto">

                  {activeDetailTab === 'OVERVIEW' && (
                     <div className="space-y-8 animate-fade-in">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                              <div className="flex justify-between items-start">
                                 <Calendar className="w-5 h-5 text-rose-500" />
                                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">Fechas</span>
                              </div>
                              <div>
                                 <p className="font-black text-gray-900 text-sm tracking-tight">{new Date(selectedTrip.startDate).toLocaleDateString()}</p>
                                 <p className="font-black text-gray-900 text-sm tracking-tight">al {new Date(selectedTrip.endDate).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveDetailTab('FINANCE')}>
                              <div className="flex justify-between items-start group">
                                 <PieChart className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                 <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded group-hover:bg-blue-100 transition-colors">Presupuesto</span>
                              </div>
                              <div>
                                 <p className="font-black text-gray-900 text-xl tracking-tight">{formatCurrency(selectedTrip.budget)}</p>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatCurrency(selectedTrip.spent)} Usado</p>
                              </div>
                           </div>
                           <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveDetailTab('ITINERARY')}>
                              <div className="flex justify-between items-start group">
                                 <MapPin className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded group-hover:bg-emerald-100 transition-colors">Actividades</span>
                              </div>
                              <div>
                                 <p className="font-black text-gray-900 text-xl tracking-tight">{selectedTrip.itinerary.length}</p>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">En Agenda</p>
                              </div>
                           </div>
                           <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveDetailTab('DOCUMENTS')}>
                              <div className="flex justify-between items-start group">
                                 <ShieldCheck className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                                 <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded group-hover:bg-orange-100 transition-colors">Bóveda</span>
                              </div>
                              <div>
                                 <p className="font-black text-gray-900 text-xl tracking-tight">{selectedTrip.checklist?.filter(c => c.completed).length || 0} / {selectedTrip.checklist?.length || 0}</p>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completado</p>
                              </div>
                           </div>
                        </div>

                        {/* Main Highlights Banner */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[2.5rem] p-8 md:p-10 border border-gray-700 relative overflow-hidden text-white shadow-2xl">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                           <div className="relative z-10 md:w-2/3">
                              <h3 className="text-2xl font-black mb-3">Tu próxima gran aventura</h3>
                              <p className="text-gray-300 text-sm leading-relaxed mb-6 font-medium">Revisa tu itinerario, asegura que tu presupuesto está bajo control y comprueba que tienes los visados listos antes de subir al avión.</p>
                              <button onClick={() => setActiveDetailTab('ITINERARY')} className="bg-white text-gray-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                                 Explorar Agenda <ArrowRight className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                     </div>
                  )}

                  {activeDetailTab === 'ITINERARY' && (
                     <div className="animate-fade-in max-w-2xl mx-auto">
                        <TravelItinerary itinerary={selectedTrip.itinerary || []} />
                     </div>
                  )}

                  {activeDetailTab === 'FINANCE' && (
                     <div className="animate-fade-in max-w-2xl mx-auto">
                        <TravelFinance budget={selectedTrip.budget} spent={selectedTrip.spent} currency={currency as string} />
                     </div>
                  )}

                  {activeDetailTab === 'DOCUMENTS' && (
                     <div className="animate-fade-in max-w-3xl mx-auto">
                        <TravelDocuments checklist={selectedTrip.checklist} />
                     </div>
                  )}

                  {activeDetailTab === 'BOOKINGS' && (
                     <div className="space-y-8 animate-fade-in">
                        {/* Bookings Content */}
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="text-xl font-black text-gray-900 tracking-tight">Vuelos & Transporte</h3>
                           <button className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-lg hover:bg-rose-100">+ Añadir</button>
                        </div>
                        {(selectedTrip.flights?.length ?? 0) > 0 ? (
                           <div className="space-y-4">
                              {selectedTrip.flights?.map(flight => (
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
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                                       <div className="text-xl font-black text-gray-900">
                                          {flight.price ? formatCurrency(flight.price) : 'Precio no disponible'}
                                       </div>
                                       {flight.bookingUrl ? (
                                          <a href={flight.bookingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors shadow-lg active:scale-95">
                                             <ExternalLink className="w-3 h-3" /> Reservar
                                          </a>
                                       ) : (
                                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
                                             Busca vía aerolínea
                                          </span>
                                       )}
                                    </div>
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
                        {(selectedTrip.accommodations?.length ?? 0) > 0 ? (
                           <div className="grid grid-cols-1 gap-4">
                              {selectedTrip.accommodations?.map(acc => (
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

               </div>
            </div>
         </div>
      );
   };

   return (
      <div className="h-full bg-[#FAFAFA] relative">
         {!selectedTripId ? renderTravelHub() : renderTripDetails()}

         {/* NEW TRIP MODAL */}
         {isNewTripOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
               <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                  <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                     <h3 className="text-xl font-black text-gray-900 tracking-tight">Nueva Aventura</h3>
                     <button onClick={resetForm} className="text-gray-400 hover:text-gray-900 p-2"><X className="w-6 h-6" /></button>
                  </div>

                  {/* Mode Switcher */}
                  <div className="px-8 pt-6 pb-2">
                     <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                        <button onClick={() => setCreateMode('MANUAL')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${createMode === 'MANUAL' ? 'bg-white shadow-md text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>Manual</button>
                        <button onClick={() => setCreateMode('AI')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${createMode === 'AI' ? 'bg-white shadow-md text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}><Wand2 className="w-3 h-3" /> Onyx Insights</button>
                     </div>
                  </div>

                  {createMode === 'AI' ? (
                     <div className="p-8 space-y-6">
                        <div className="text-center mb-4">
                           <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4"><Sparkles className="w-8 h-8 text-purple-600" /></div>
                           <h4 className="text-lg font-black text-gray-900">Onyx Insights: Diseñador de Experiencias</h4>
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
                        </div>
                        <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl mt-4 active:scale-95 transition-all">
                           {generatedFlights.length > 0 ? 'Guardar Viaje Generado' : 'Crear Viaje & Sincronizar'}
                        </button>
                     </form>
                  )}
               </div>
            </div>
         )}

         {/* MAP MODAL */}
         {isMapModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
               <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden relative">
                  <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                     <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" /> Pasaporte Global
                     </h3>
                     <button onClick={() => setIsMapModalOpen(false)} className="text-gray-400 hover:text-gray-900 p-2"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="p-8 bg-gray-50 flex flex-col md:flex-row gap-8 items-center border-t border-white">
                     <div className="w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center relative shrink-0">
                        <CobeInteractiveGlobe />
                     </div>
                     <div className="flex-1 space-y-4">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Activo</span>
                        <h4 className="text-3xl font-black text-gray-900 tracking-tighter">Tus Territorios Conquistados</h4>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                           Has visitado <strong>{new Set(trips.map(t => t.country)).size} países</strong> a través de <strong>{trips.length} expediciones</strong>.
                           Gira el globo interactivo 3D para planear tu próxima aventura.
                        </p>

                        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200">
                           {Array.from(new Set(trips.map(t => t.country))).map(country => (
                              <span key={country} className="bg-white border border-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 hover:border-gray-300 transition-colors">
                                 <MapPin className="w-4 h-4 text-emerald-500" /> {country}
                              </span>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default TravelModule;
