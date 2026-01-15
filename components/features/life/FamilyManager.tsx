import React, { useState } from 'react';
import {
    Users, Plus, Gift, Calendar, Heart, MessageSquare, Phone, MapPin,
    Search, Filter, MoreVertical, Edit2, Trash2, Mail, ExternalLink,
    Clock, Bell, Star, Shield, Activity
} from 'lucide-react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useUserStore } from '../../../store/useUserStore';
import { FamilyMember } from '../../../types';

export const FamilyManager: React.FC = () => {
    const { familyMembers, setFamilyMembers } = useLifeStore();
    const { language } = useUserStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'IMMEDIATE' | 'EXTENDED' | 'FRIENDS'>('ALL');

    const filteredMembers = familyMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.relationship.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="h-full flex flex-col space-y-8 animate-fade-in pb-20 p-8 overflow-y-auto custom-scrollbar">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Círculo Onyx</h2>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Gestión de Familia y Contactos Clave</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-emerald-700 transition-all active:scale-95">
                        <Plus className="w-5 h-5" /> Añadir Miembro
                    </button>
                </div>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex flex-col justify-between">
                    <div className="text-emerald-600 mb-2"><Heart className="w-6 h-6 fill-current" /></div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Próximos Cumpleaños</p>
                        <h4 className="text-xl font-black text-emerald-900">2 este mes</h4>
                    </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex flex-col justify-between">
                    <div className="text-blue-600 mb-2"><Bell className="w-6 h-6" /></div>
                    <div>
                        <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Recordatorios</p>
                        <h4 className="text-xl font-black text-blue-900">Aniversario en 5d</h4>
                    </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 flex flex-col justify-between">
                    <div className="text-purple-600 mb-2"><Activity className="w-6 h-6" /></div>
                    <div>
                        <p className="text-[10px] font-black text-purple-800 uppercase tracking-widest">Salud Familiar</p>
                        <h4 className="text-xl font-black text-purple-900">Todo al día</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col justify-between shadow-sm">
                    <div className="text-gray-400 mb-2"><Shield className="w-6 h-6" /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contactos Emergencia</p>
                        <h4 className="text-xl font-black text-gray-900">3 Configurados</h4>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o parentesco..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        {['ALL', 'IMMEDIATE', 'EXTENDED', 'FRIENDS'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat as any)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                {cat === 'ALL' ? 'Todos' : cat === 'IMMEDIATE' ? 'Directo' : cat === 'EXTENDED' ? 'Extendida' : 'Amigos'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMembers.map(member => (
                            <div key={member.id} className="group bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-gray-400 hover:text-gray-900"><MoreVertical className="w-5 h-5" /></button>
                                </div>

                                <div className="flex items-center gap-5 mb-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-2xl border-2 border-white shadow-sm overflow-hidden">
                                            {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                                        </div>
                                        {member.isEmergencyContact && (
                                            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1.5 rounded-full border-2 border-white shadow-lg">
                                                <Shield className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">{member.name}</h3>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">{member.relationship}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-gray-500 group/link cursor-pointer hover:text-gray-900 transition-colors">
                                        <div className="p-2 bg-gray-50 rounded-lg group-hover/link:bg-emerald-50 group-hover/link:text-emerald-600 transition-colors"><Mail className="w-4 h-4" /></div>
                                        <span className="text-xs font-bold truncate">{member.email || 'Sin email'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 group/link cursor-pointer hover:text-gray-900 transition-colors">
                                        <div className="p-2 bg-gray-50 rounded-lg group-hover/link:bg-blue-50 group-hover/link:text-blue-600 transition-colors"><Phone className="w-4 h-4" /></div>
                                        <span className="text-xs font-bold">{member.phone || 'Sin teléfono'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <div className="p-2 bg-gray-50 rounded-lg"><Calendar className="w-4 h-4" /></div>
                                        <span className="text-xs font-bold">{member.birthDate ? new Date(member.birthDate).toLocaleDateString() : 'Sin fecha'}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 bg-gray-50 hover:bg-emerald-600 hover:text-white text-gray-600 p-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                        <Phone className="w-4 h-4" /> Llamar
                                    </button>
                                    <button className="px-4 bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-600 rounded-xl transition-all flex items-center justify-center">
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add New Card */}
                        <button className="border-4 border-dashed border-gray-50 rounded-[2rem] p-8 flex flex-col items-center justify-center text-gray-300 hover:text-emerald-500 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group">
                            <Plus className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                            <span className="font-black text-sm uppercase tracking-widest">Añadir Nuevo</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};