'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Cliente } from '@/types';
import {
  Users,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Mail,
  Smartphone,
  Trash2,
  Edit2,
  Eye,
} from 'lucide-react';

const PAGE_SIZE = 25;

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      <td className="p-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/5 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
            <div className="h-3 w-56 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </td>
      <td className="p-8 text-center">
        <div className="h-8 w-12 bg-white/5 rounded animate-pulse mx-auto" />
      </td>
      <td className="p-8">
        <div className="flex items-center justify-end gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
          <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
          <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
        </div>
      </td>
    </tr>
  );
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('clientes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (debouncedSearch) {
        query = query.or(
          `nombre.ilike.%${debouncedSearch}%,apellido.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,telefono.ilike.%${debouncedSearch}%`
        );
      }

      const { data, count, error } = await query;
      if (error) throw error;
      setClientes(data || []);
      setTotalCount(count || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleUpdateCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          nombre: selectedCliente.nombre,
          apellido: selectedCliente.apellido,
          email: selectedCliente.email,
          telefono: selectedCliente.telefono,
          total_visitas: Number(selectedCliente.total_visitas),
        })
        .eq('id', selectedCliente.id);

      if (error) throw error;
      setIsEditModalOpen(false);
      fetchClientes();
    } catch {
      alert('Error al actualizar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este socio? Esta acción es irreversible.')) return;
    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
      fetchClientes();
    } catch {
      alert('Error al eliminar');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-travesia-gold/10 border border-travesia-gold/20 rounded-xl flex items-center justify-center text-travesia-gold">
              <Users size={20} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Directorio de Socios</h2>
          </div>
          <p className="text-white/40 text-sm ml-13">
            {totalCount > 0 ? `${totalCount} socios registrados` : 'Administra y segmenta a tus clientes frecuentes.'}
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 text-xs font-black uppercase tracking-widest hover:text-travesia-gold hover:border-travesia-gold/40 transition-all self-start lg:self-auto">
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      {/* BÚSQUEDA */}
      <div className="flex items-center gap-4 p-4 bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[32px]">
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

      {/* TABLA */}
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
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : clientes.map((cliente) => (
                    <tr key={cliente.id} className="group hover:bg-white/5 transition-all duration-300">
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A3A2A] to-[#051A10] border border-white/10 flex items-center justify-center text-travesia-gold font-serif text-2xl font-bold">
                            {cliente.nombre?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg tracking-tight">
                              {cliente.nombre} {cliente.apellido}
                            </p>
                            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mt-1 flex items-center gap-4">
                              <span>
                                <Smartphone size={10} className="inline mr-1 text-travesia-gold" />
                                {cliente.telefono}
                              </span>
                              <span>
                                <Mail size={10} className="inline mr-1 text-travesia-gold" />
                                {cliente.email}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8 text-center">
                        <span className="text-2xl font-serif font-black text-travesia-gold">
                          {cliente.total_visitas || 0}
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => { setSelectedCliente(cliente); setIsDetailsOpen(true); }}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-travesia-gold transition-all"
                            aria-label="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => { setSelectedCliente(cliente); setIsEditModalOpen(true); }}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-travesia-gold transition-all"
                            aria-label="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(cliente.id)}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-red-400 transition-all"
                            aria-label="Eliminar"
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

        {/* PAGINACIÓN */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-6 border-t border-white/5">
            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">
              Página {page + 1} de {totalPages} — {totalCount} socios
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-travesia-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const pageNum = start + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                      pageNum === page
                        ? 'bg-travesia-gold text-[#051A10]'
                        : 'bg-white/5 border border-white/10 text-white/40 hover:text-travesia-gold'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-travesia-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Página siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {!loading && clientes.length === 0 && (
          <div className="py-20 text-center text-white/30 text-sm">
            {debouncedSearch ? `Sin resultados para "${debouncedSearch}"` : 'Sin socios registrados aún.'}
          </div>
        )}
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
                  <input
                    value={selectedCliente.nombre}
                    onChange={(e) => setSelectedCliente({ ...selectedCliente, nombre: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-white/40 ml-2">Apellido</label>
                  <input
                    value={selectedCliente.apellido}
                    onChange={(e) => setSelectedCliente({ ...selectedCliente, apellido: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-white/40 ml-2">Correo</label>
                <input
                  value={selectedCliente.email}
                  onChange={(e) => setSelectedCliente({ ...selectedCliente, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-white/40 ml-2">WhatsApp</label>
                  <input
                    value={selectedCliente.telefono}
                    onChange={(e) => setSelectedCliente({ ...selectedCliente, telefono: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-white/40 ml-2">Visitas</label>
                  <input
                    type="number"
                    value={selectedCliente.total_visitas}
                    onChange={(e) =>
                      setSelectedCliente({ ...selectedCliente, total_visitas: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm text-travesia-gold font-bold"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  disabled={isSaving}
                  type="submit"
                  className="flex-1 py-4 bg-travesia-gold rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#051A10] hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
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
                <h3 className="text-2xl font-serif font-bold text-white leading-tight">
                  {selectedCliente.nombre} {selectedCliente.apellido}
                </h3>
                <p className="text-travesia-gold/60 text-[10px] uppercase font-black tracking-widest mt-1">Miembro</p>
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
                <p className="text-[9px] uppercase font-black text-white/30 tracking-widest">Género</p>
                <p className="text-white font-medium">{selectedCliente.genero || 'No registrado'}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-[9px] uppercase font-black text-white/30 tracking-widest">Visitas / Meta</p>
                <p className="text-travesia-gold font-bold text-xl">{selectedCliente.total_visitas} de 10</p>
              </div>
            </div>

            <button
              onClick={() => setIsDetailsOpen(false)}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
