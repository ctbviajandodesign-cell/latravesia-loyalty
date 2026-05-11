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
  Edit2,
  Eye,
  Settings2
} from 'lucide-react';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // MODAL STATES
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleUpdateCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          nombre: selectedCliente.nombre,
          apellido: selectedCliente.apellido,
          email: selectedCliente.email,
          telefono: selectedCliente.telefono,
          total_visitas: parseInt(selectedCliente.total_visitas)
        })
        .eq('id', selectedCliente.id);

      if (error) throw error;
      setIsEditModalOpen(false);
      fetchClientes();
    } catch (e) {
      alert("Error al actualizar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este socio? Esta acción es irreversible.")) return;
    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
      fetchClientes();
    } catch (e) {
      alert("Error al eliminar");
    }
  };

  const filteredClientes = clientes.filter(c => 
    (c.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.apellido?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.telefono || '').includes(searchTerm)
  );

  return (
    <div className="space-y-8 pb-20">
      
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
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA */}
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
      </div>

      {/* TABLA DE CLIENTES */}
      <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/30">Socio</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/30 text-center">Visitas</th>
                <th className="p-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/30 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="group hover:bg-white/5 transition-all duration-300">
                  <td className="p-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A3A2A] to-[#051A10] border border-white/10 flex items-center justify-center text-travesia-gold font-serif text-2xl font-bold">
                        {cliente.nombre?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg tracking-tight">{cliente.nombre} {cliente.apellido}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mt-1 flex items-center gap-4">
                           <span><Smartphone size={10} className="inline mr-1 text-travesia-gold"/> {cliente.telefono}</span>
                           <span><Mail size={10} className="inline mr-1 text-travesia-gold"/> {cliente.email}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <span className="text-2xl font-serif font-black text-travesia-gold">{cliente.total_visitas || 0}</span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => { setSelectedCliente(cliente); setIsDetailsOpen(true); }}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-travesia-gold transition-all"
                        title="Ver Detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedCliente(cliente); setIsEditModalOpen(true); }}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-travesia-gold transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cliente.id)}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-red-400 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDITAR */}
      {isEditModalOpen && selectedCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#051A10]/90 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0A2A18] border border-white/10 rounded-[40px] p-8 shadow-2xl space-y-6">
            <h3 className="text-2xl font-serif font-bold text-travesia-gold">Editar Socio</h3>
            <form onSubmit={handleUpdateCliente} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-white/40 ml-2">Nombre</label>
                  <input value={selectedCliente.nombre} onChange={(e) => setSelectedCliente({...selectedCliente, nombre: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-white/40 ml-2">Apellido</label>
                  <input value={selectedCliente.apellido} onChange={(e) => setSelectedCliente({...selectedCliente, apellido: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-white/40 ml-2">Correo</label>
                <input value={selectedCliente.email} onChange={(e) => setSelectedCliente({...selectedCliente, email: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-white/40 ml-2">WhatsApp</label>
                  <input value={selectedCliente.telefono} onChange={(e) => setSelectedCliente({...selectedCliente, telefono: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-white/40 ml-2">Visitas Totales</label>
                  <input type="number" value={selectedCliente.total_visitas} onChange={(e) => setSelectedCliente({...selectedCliente, total_visitas: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm text-travesia-gold font-bold" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Cancelar</button>
                <button disabled={isSaving} type="submit" className="flex-1 py-4 bg-travesia-gold rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#051A10] hover:scale-[1.02] transition-all">
                   {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsOpen && selectedCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#051A10]/90 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0A2A18] border border-white/10 rounded-[40px] p-10 shadow-2xl space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-[32px] bg-travesia-gold flex items-center justify-center text-[#051A10] text-4xl font-serif font-bold">
                 {selectedCliente.nombre?.[0]}
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-serif font-bold text-white leading-tight">{selectedCliente.nombre} {selectedCliente.apellido}</h3>
                <p className="text-travesia-gold/60 text-[10px] uppercase font-black tracking-widest mt-1">Miembro Premium</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/5">
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-black text-white/30 tracking-widest">Cumpleaños</p>
                <p className="text-white font-medium">{selectedCliente.fecha_nacimiento || 'No registrado'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-black text-white/30 tracking-widest">Registro</p>
                <p className="text-white font-medium">{new Date(selectedCliente.created_at).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-black text-white/30 tracking-widest">Última Visita</p>
                <p className="text-white font-medium">{selectedCliente.fecha_ultima_visita || 'Hoy'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-black text-white/30 tracking-widest">Puntos/Metas</p>
                <p className="text-travesia-gold font-bold">{selectedCliente.total_visitas} de 10</p>
              </div>
            </div>

            <button onClick={() => setIsDetailsOpen(false)} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">Cerrar Detalle</button>
          </div>
        </div>
      )}
    </div>
  );
}
