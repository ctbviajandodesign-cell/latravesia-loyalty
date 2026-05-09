'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Cake, 
  Gift, 
  Search, 
  Phone, 
  MessageCircle, 
  Loader2,
  Calendar,
  ChevronRight,
  PartyPopper
} from 'lucide-react';

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  fecha_nacimiento: string;
}

export default function CumpleanosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCumpleanos();
  }, []);

  async function fetchCumpleanos() {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nombre, apellido, telefono, fecha_nacimiento')
        .order('fecha_nacimiento', { ascending: true });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error fetching birthdays:', error);
    } finally {
      setLoading(false);
    }
  }

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    return clientes.filter(c => {
      if (!c.fecha_nacimiento) return false;
      const [year, month, day] = c.fecha_nacimiento.split('-').map(Number);
      
      // Hoy
      if (month === todayMonth && day === todayDay) return true;
      
      // Próximos 30 días
      const bdayThisYear = new Date(today.getFullYear(), month - 1, day);
      if (bdayThisYear < today) bdayThisYear.setFullYear(today.getFullYear() + 1);
      
      const diffTime = Math.abs(bdayThisYear.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= 30;
    }).sort((a, b) => {
      const [, m1, d1] = a.fecha_nacimiento.split('-').map(Number);
      const [, m2, d2] = b.fecha_nacimiento.split('-').map(Number);
      if (m1 !== m2) return m1 - m2;
      return d1 - d2;
    });
  };

  const upcoming = getUpcomingBirthdays();

  const isToday = (fecha: string) => {
    const today = new Date();
    const [, month, day] = fecha.split('-').map(Number);
    return month === (today.getMonth() + 1) && day === today.getDate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#4A5D4E] flex items-center gap-2">
            <Cake className="w-8 h-8" />
            Calendario de Cumpleaños
          </h1>
          <p className="text-gray-600 mt-1">Descubre qué clientes celebran su día pronto.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista Principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-travesia-gold" /> Próximos 30 días
              </h2>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                {upcoming.length} clientes
              </span>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#4A5D4E]" />
              </div>
            ) : upcoming.length === 0 ? (
              <div className="p-12 text-center text-gray-400 italic">
                No hay cumpleaños próximos este mes.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {upcoming.map(cliente => (
                  <div key={cliente.id} className={`p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors ${isToday(cliente.fecha_nacimiento) ? 'bg-amber-50/30' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${isToday(cliente.fecha_nacimiento) ? 'bg-travesia-gold text-white animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
                        {isToday(cliente.fecha_nacimiento) ? '🎂' : '🎈'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {cliente.nombre} {cliente.apellido}
                          {isToday(cliente.fecha_nacimiento) && (
                            <span className="bg-[#4A5D4E] text-white text-[10px] uppercase font-black px-2 py-0.5 rounded">¡Hoy!</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> 
                          {new Date(cliente.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'long' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a 
                        href={`https://wa.me/${cliente.telefono}?text=¡Hola ${cliente.nombre}! 👋 Feliz cumpleaños de parte de La Travesía 🎂`}
                        target="_blank"
                        className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all shadow-sm"
                        title="Saludar por WhatsApp"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Informativo */}
        <div className="space-y-6">
          <div className="bg-[#4A5D4E] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <Cake className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
            <h3 className="text-xl font-bold mb-4">¿Por qué es importante?</h3>
            <ul className="space-y-4 text-white/80 text-sm">
              <li className="flex gap-3">
                <Gift className="w-5 h-5 shrink-0 text-travesia-gold" />
                <span>Envía un postre de cortesía por WhatsApp y asegura una reserva.</span>
              </li>
              <li className="flex gap-3">
                <PartyPopper className="w-5 h-5 shrink-0 text-travesia-gold" />
                <span>Haz que tus clientes se sientan especiales y vuelvan pronto.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center space-y-2">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Cumpleañeros Hoy</p>
            <p className="text-5xl font-black text-gray-900">
              {upcoming.filter(c => isToday(c.fecha_nacimiento)).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
