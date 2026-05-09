'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, User } from 'lucide-react';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchClientes() {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setClientes(data || []);
      setLoading(false);
    }
    fetchClientes();
  }, []);

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-travesia-green-deep tracking-tight">Clientes</h1>
          <p className="text-travesia-green-dark/60 font-medium">Gestiona tu base de datos de fidelidad</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-travesia-gold/10 flex items-center gap-4">
        <Search className="text-travesia-green-dark/30" />
        <input 
          type="text" 
          placeholder="Buscar por nombre, apellido o teléfono..."
          className="flex-1 outline-none text-travesia-green-deep placeholder:text-travesia-green-dark/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-travesia-gold/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-travesia-cream/50 text-travesia-green-dark/40 text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Visitas</th>
                <th className="px-6 py-4">Última Visita</th>
                <th className="px-6 py-4">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-travesia-gold/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-travesia-green-dark/40 italic">
                    Cargando clientes...
                  </td>
                </tr>
              ) : filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-travesia-green-dark/40 italic">
                    No se encontraron clientes.
                  </td>
                </tr>
              ) : (
                filteredClientes.map((c) => (
                  <tr key={c.id} className="hover:bg-travesia-cream/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-travesia-cream rounded-full flex items-center justify-center text-travesia-green-dark group-hover:bg-travesia-gold group-hover:text-travesia-green-deep transition-colors">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-travesia-green-deep">{c.nombre} {c.apellido}</p>
                          <p className="text-xs text-travesia-green-dark/40">{c.email || 'Sin email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-travesia-green-dark/60">
                      {c.telefono}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-travesia-cream px-3 py-1 rounded-full text-xs font-bold text-travesia-green-deep">
                        {c.total_visitas}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-travesia-green-dark/60">
                      {c.fecha_ultima_visita || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-travesia-green-dark/40">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
