import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronRight, Plus } from 'lucide-react';

interface FamilyEvent {
    id: string;
    title: string;
    time: string;
    location?: string;
    type: 'MEDICAL' | 'EDUCATION' | 'SOCIAL' | 'SPORT';
}

const MOCK_EVENTS: FamilyEvent[] = [
    { id: '1', title: 'Pediatra (Joel) - Revisión 5 años', time: 'Mañana, 10:30', location: 'Centro Salud Vistahermosa', type: 'MEDICAL' },
    { id: '2', title: 'Fútbol Joel - Entrenamiento', time: 'Jueves, 17:00', location: 'Campo Municipal', type: 'SPORT' },
    { id: '3', title: 'Clase de Pintura (Sofía)', time: 'Viernes, 16:30', location: 'Taller Creativo', type: 'EDUCATION' },
    { id: '4', title: 'Cena Familiar - Cumpleaños Elena', time: 'Sábado, 21:00', location: 'Restaurante El Faro', type: 'SOCIAL' },
];

export const FamilySharedCalendar: React.FC = () => {
    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Agenda Familiar</h4>
                        <p className="text-[10px] font-bold text-gray-400">Próximos 7 días</p>
                    </div>
                </div>
                <button className="p-2 bg-gray-50 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {MOCK_EVENTS.map(event => (
                    <div key={event.id} className="group p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-purple-100 hover:shadow-md transition-all rounded-2xl cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${event.type === 'MEDICAL' ? 'bg-red-50 text-red-600' :
                                    event.type === 'SPORT' ? 'bg-blue-50 text-blue-600' :
                                        event.type === 'EDUCATION' ? 'bg-emerald-50 text-emerald-600' :
                                            'bg-purple-50 text-purple-600'
                                }`}>
                                {event.type}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-400 transition-colors" />
                        </div>
                        <h5 className="text-sm font-black text-gray-900 mb-2 truncate">{event.title}</h5>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span className="text-[10px] font-bold">{event.time}</span>
                            </div>
                            {event.location && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <MapPin className="w-3 h-3" />
                                    <span className="text-[10px] font-bold truncate">{event.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button className="m-6 mt-0 py-3 text-[10px] font-black uppercase tracking-widest text-purple-600 border border-purple-100 hover:bg-purple-50 rounded-xl transition-all">
                Ver Calendario Completo
            </button>
        </div>
    );
};
