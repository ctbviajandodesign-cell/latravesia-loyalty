'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Gift, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Package,
  Percent,
  Wifi,
  WifiOff
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
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [emoji, setEmoji] = useState('🎁');
  const [probabilidad, setProbabilidad] = useState('10');
  const [stock, setStock] = useState('100');

  useEffect(() => {
    checkConnection();
    fetchPremios();
  }, []);

  async function checkConnection() {
    try {
      const { error } = await supabase.from('premios').select('id', { count: 'exact', head: true });
      if (error) throw error;
      setDbStatus('connected');
    } catch (e) {
      setDbStatus('error');
    }
  }

  async function fetchPremios() {
    try {
      const { data, error } = await supabase
        .from('premios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPremios(data || []);
    } catch (error) {
      console.error('Error:', error);
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
      setShowForm(false);
      fetchPremios();
    } catch (error: any) {
      console.error('Error guardando premio:', error);
      setMessage({ 
        type: 'error', 
        text: `Error: ${error.message || 'No se pudo guardar el premio. Revisa los permisos (RLS) en Supabase.'}` 
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro?')) return;
    setActionLoading(true);
    try {
      await supabase.from('premios').delete().eq('id', id);
      fetchPremios();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className={`text-[10px] uppercase font-black px-4 py-1 rounded-full w-fit flex items-center gap-2 ${
        dbStatus === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {dbStatus === 'connected' ? <><Wifi size={12} /> Sistema Activo</> : <><WifiOff size={12} /> Error de Base de Datos</>}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-[#4A5D4E] flex items-center gap-2">
            <Gift className="w-10 h-10" /> Gestión de Premios
          </h1>
          <p className="text-gray-500">Crea y edita los premios de la ruleta.</p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[#4A5D4E] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all"
        >
          {showForm ? 'Cerrar' : '+ Nuevo Premio'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddPremio} className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold">Emoji</label>
            <input required value={emoji} onChange={e => setEmoji(e.target.value)} className="w-full p-4 rounded-xl border bg-gray-50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Nombre</label>
            <input required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-4 rounded-xl border bg-gray-50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Probabilidad (%)</label>
            <input type="number" required value={probabilidad} onChange={e => setProbabilidad(e.target.value)} className="w-full p-4 rounded-xl border bg-gray-50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Stock</label>
            <input type="number" required value={stock} onChange={e => setStock(e.target.value)} className="w-full p-4 rounded-xl border bg-gray-50" />
          </div>
          <button disabled={actionLoading} className="md:col-span-2 bg-[#4A5D4E] text-white p-5 rounded-2xl font-black">
            {actionLoading ? 'Guardando...' : 'GUARDAR PREMIO'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs font-black uppercase">
            <tr>
              <th className="p-6">Premio</th>
              <th className="p-6">Prob.</th>
              <th className="p-6">Stock</th>
              <th className="p-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {premios.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{p.emoji}</span>
                    <span className="font-bold text-gray-800">{p.nombre}</span>
                  </div>
                </td>
                <td className="p-6 font-bold text-blue-600">{p.probabilidad}%</td>
                <td className="p-6 font-bold">{p.stock}</td>
                <td className="p-6 text-right">
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
