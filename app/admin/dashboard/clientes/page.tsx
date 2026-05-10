'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Smartphone, 
  MapPin, 
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Star,
  Trash2,
  Edit2
} from 'lucide-react';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      
      {/* HEADER DE SECCIÓN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-travesia-gold/10 border border-travesia-gold/20 rounded-xl flex items-center justify-center text-travesia-gold">
              <Users size={20} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Directorio de Socios</h2>
          </div>
          <p className="text-white/40 text-sm ml-13">Administra y segmenta a tus clientes frecuentes.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 text-xs font-black uppercase tracking-widest hover:text-travesia-gold hover:border-travesia-gold/40 transition-all">
            <Download size={16} /> Exportar CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-travesia-gold text-[#051A10] rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-travesia-gold/10">
            + Nuevo Socio
          </button>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[32px]">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-travesia-gold transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, correo o teléfono..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-4 pl-14 rounded-2xl outline-none focus:border-travesia-gold transition-all text-sm"
          />
        </div>
        <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white transition-colors flex items-center gap-3">
          <Filter size={18} /> <span className="text-xs font-black uppercase tracking-widest">Filtros</span>
        </button>
      </div>

      {/* TABLA DE CLIENTES (CRM STYLE) */}
      <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/30">Socio</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/30">Contacto</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/30 text-center">Visitas</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/30 text-center">Estado</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/30 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="group hover:bg-white/5 transition-all duration-300">
                  <td className="p-8">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A3A2A] to-[#051A10] border border-white/10 flex items-center justify-center text-travesia-gold font-serif text-2xl font-bold shadow-lg group-hover:rotate-3 transition-transform">
                          {cliente.nombre[0]}
                        </div>
                        {cliente.visitas >= 5 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-travesia-gold rounded-full flex items-center justify-center border-2 border-[#051A10] shadow-lg">
                            <Star size={10} className="text-[#051A10] fill-current" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg tracking-tight">{cliente.nombre} {cliente.apellido}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mt-1 flex items-center gap-2">
                          <MapPin size={10} className="text-travesia-gold" /> Registro: {new Date(cliente.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 group/item cursor-pointer">
                        <div className="p-2 bg-white/5 rounded-lg text-white/20 group-hover/item:text-travesia-gold transition-colors">
                          <Smartphone size={14} />
                        </div>
                        <span className="text-sm font-medium text-white/60 group-hover/item:text-white transition-colors">{cliente.telefono}</span>
                      </div>
                      <div className="flex items-center gap-3 group/item cursor-pointer">
                        <div className="p-2 bg-white/5 rounded-lg text-white/20 group-hover/item:text-blue-400 transition-colors">
                          <Mail size={14} />
                        </div>
                        <span className="text-sm font-medium text-white/60 group-hover/item:text-white transition-colors">{cliente.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-2xl font-serif font-black text-travesia-gold">{cliente.visitas || 0}</span>
                      <span className="text-[8px] uppercase tracking-widest font-bold text-white/20">Check-ins</span>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      <ShieldCheck size={12} /> Verificado
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center justify-end gap-3">
                      <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-travesia-gold hover:border-travesia-gold/40 transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-red-400 hover:border-red-400/40 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="p-8 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-white/30">Mostrando <span className="text-white font-bold">{filteredClientes.length}</span> socios de <span className="text-white font-bold">{clientes.length}</span></p>
          <div className="flex gap-2">
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/20 cursor-not-allowed">
              <ChevronLeft size={18} />
            </button>
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-travesia-gold hover:border-travesia-gold/40 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
