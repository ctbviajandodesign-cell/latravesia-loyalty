'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Search, 
  Phone, 
  Calendar, 
  Star, 
  Loader2,
  ChevronRight,
  Filter,
  Download,
  Cake
} from 'lucide-react';

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  total_visitas: number;
  fecha_nacimiento: string;
  fecha_ultima_visita: string;
  created_at: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // const supabase = createClientComponentClient();

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
    } catch (error) {
      console.error('Error fetching clientes:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredClientes = clientes.filter(cliente => {
    const searchStr = `${cliente.nombre} ${cliente.apellido} ${cliente.telefono} ${cliente.email || ''} ${cliente.fecha_nacimiento || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#4A5D4E] flex items-center gap-2">
            <Users className="w-8 h-8" />
            Base de Datos de Clientes
          </h1>
          <p className="text-gray-600 mt-1">Gestiona y conoce a los visitantes de La Travesía.</p>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-all text-sm font-medium">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Buscar por nombre, apellido o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#4A5D4E] outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all">
          <Filter className="w-5 h-5" /> Filtros
        </button>
      </div>

      {/* Tabla / Lista */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#4A5D4E]" />
            <p className="text-gray-500">Cargando base de datos...</p>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchTerm ? 'No se encontraron clientes con esa búsqueda.' : 'Aún no hay clientes registrados.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Cumpleaños</th>
                  <th className="px-6 py-4">Fidelidad</th>
                  <th className="px-6 py-4">Última Visita</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E] font-bold">
                          {cliente.nombre[0]}{cliente.apellido[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{cliente.nombre} {cliente.apellido}</div>
                          <div className="text-xs text-gray-500">Miembro desde {new Date(cliente.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone className="w-3 h-3" /> {cliente.telefono}
                        </div>
                        <div className="text-xs text-gray-500 lowercase">{cliente.email || 'Sin email'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Cake className="w-3 h-3 text-pink-500" />
                        {cliente.fecha_nacimiento ? new Date(cliente.fecha_nacimiento).toLocaleDateString() : 'No reg.'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold">
                          <Star className="w-3 h-3 fill-amber-700" /> {cliente.total_visitas || 0}
                        </div>
                        <span className="text-xs text-gray-400 font-medium">visitas</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {cliente.fecha_ultima_visita ? new Date(cliente.fecha_ultima_visita).toLocaleDateString() : 'Nunca'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-[#4A5D4E] hover:bg-green-50 rounded-lg transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen Rápido */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#4A5D4E] p-6 rounded-2xl text-white shadow-lg">
            <p className="text-white/60 text-sm font-medium uppercase tracking-wider">Total Clientes</p>
            <p className="text-4xl font-bold mt-1">{clientes.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Clientes Activos Hoy</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">
              {clientes.filter(c => c.fecha_ultima_visita === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Tasa de Fidelidad</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">
              {clientes.length > 0 ? (clientes.filter(c => c.total_visitas > 2).length / clientes.length * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
