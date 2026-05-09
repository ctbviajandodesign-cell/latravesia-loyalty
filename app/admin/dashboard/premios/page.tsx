'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Gift, 
  Plus, 
  Trash2, 
  Edit2, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Package,
  Percent
} from 'lucide-react';

interface Premio {
  id: string;
  nombre: string;
  descripcion: string;
  emoji: string;
  probabilidad: number;
  stock: number;
  created_at: string;
}

export default function PremiosPage() {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [emoji, setEmoji] = useState('🎁');
  const [probabilidad, setProbabilidad] = useState('10');
  const [stock, setStock] = useState('100');

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPremios();
  }, []);

  async function fetchPremios() {
    try {
      const { data, error } = await supabase
        .from('premios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPremios(data || []);
    } catch (error) {
      console.error('Error fetching premios:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPremio(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('premios')
        .insert([{
          nombre,
          descripcion,
          emoji,
          probabilidad: parseFloat(probabilidad),
          stock: parseInt(stock)
        }]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Premio añadido correctamente' });
      setNombre('');
      setDescripcion('');
      setEmoji('🎁');
      setProbabilidad('10');
      setStock('100');
      setShowForm(false);
      fetchPremios();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este premio?')) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('premios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPremios(premios.filter(p => p.id !== id));
      setMessage({ type: 'success', text: 'Premio eliminado' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#4A5D4E] flex items-center gap-2">
            <Gift className="w-8 h-8" />
            Gestión de Premios
          </h1>
          <p className="text-gray-600 mt-1">Configura los premios que aparecerán en la ruleta.</p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-[#4A5D4E] text-white px-6 py-3 rounded-xl hover:bg-[#3D4D40] transition-all shadow-lg active:scale-95"
        >
          {showForm ? 'Cerrar Formulario' : (
            <><Plus className="w-5 h-5" /> Añadir Premio</>
          )}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-in zoom-in-95 duration-200">
          <form onSubmit={handleAddPremio} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Icono / Emoji</label>
              <input 
                required
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="Ej: ☕"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A5D4E] outline-none text-2xl text-center"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nombre del Premio</label>
              <input 
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Café Gratis"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A5D4E] outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Descripción (Opcional)</label>
              <input 
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Canjeable en el restaurante"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A5D4E] focus:border-transparent outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Percent className="w-4 h-4" /> Probabilidad (%)
              </label>
              <input 
                required
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={probabilidad}
                onChange={(e) => setProbabilidad(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A5D4E] focus:border-transparent outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Package className="w-4 h-4" /> Stock Inicial
              </label>
              <input 
                required
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A5D4E] focus:border-transparent outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit"
                disabled={actionLoading}
                className="w-full bg-[#4A5D4E] text-white py-4 rounded-xl font-medium hover:bg-[#3D4D40] disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/10"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Premio'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#4A5D4E]" />
            <p className="text-gray-500">Cargando premios...</p>
          </div>
        ) : premios.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <Gift className="w-8 h-8" />
            </div>
            <p className="text-gray-500">No hay premios configurados aún.</p>
            <button 
              onClick={() => setShowForm(true)}
              className="text-[#4A5D4E] font-medium hover:underline"
            >
              Crea tu primer premio aquí
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Premio</th>
                  <th className="px-6 py-4">Probabilidad</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Fecha Creación</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {premios.map((premio) => (
                  <tr key={premio.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{premio.emoji}</span>
                        <div>
                          <div className="font-medium text-gray-900">{premio.nombre}</div>
                          <div className="text-sm text-gray-500">{premio.descripcion || 'Sin descripción'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {premio.probabilidad}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className={premio.stock < 10 ? 'text-red-600 font-bold' : ''}>
                        {premio.stock} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(premio.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDelete(premio.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
