import React from 'react';
import { MapPin, Clock, Utensils, Camera, Plane, ExternalLink } from 'lucide-react';
import { ItineraryItem } from '../../../../types';
import { motion } from 'framer-motion';

interface TravelItineraryProps {
    itinerary: ItineraryItem[];
}

export const TravelItinerary: React.FC<TravelItineraryProps> = ({ itinerary }) => {
    if (!itinerary || itinerary.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                <MapPin className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Sin actividades programadas</p>
            </div>
        );
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'FOOD': return <Utensils className="w-4 h-4" />;
            case 'TRANSPORT': return <Plane className="w-4 h-4" />;
            case 'ACTIVITY': return <Camera className="w-4 h-4" />;
            default: return <MapPin className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'FOOD': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'TRANSPORT': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'ACTIVITY': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="relative pl-8 space-y-12">
            {/* Timeline Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-rose-500 via-rose-300 to-transparent"></div>

            {itinerary.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                >
                    {/* Dot */}
                    <div className="absolute -left-[30px] top-1.5 w-6 h-6 rounded-full bg-white border-4 border-rose-500 shadow-md z-10"></div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl border ${getTypeColor(item.type)}`}>
                                    {getTypeIcon(item.type)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-3 h-3 text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{item.time}</span>
                                    </div>
                                    <h4 className="text-lg font-black text-gray-900 tracking-tight group-hover:text-rose-600 transition-colors">{item.activity}</h4>
                                    {item.location && (
                                        <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {item.location}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getTypeColor(item.type)}`}>
                                    {item.type}
                                </span>
                                <button className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
