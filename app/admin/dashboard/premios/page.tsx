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
  WifiOff,
  Settings2
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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
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

  const handleEdit = (premio: Premio) => {
    setSelectedId(premio.id);
    setNombre(premio.nombre);
    setDescripcion(premio.descripcion || '');
    setEmoji(premio.emoji);
    setProbabilidad(premio.probabilidad.toString());
    setStock(premio.stock.toString());
    setIsEditing(true);
    setShowForm(true);
  };

  async function handleAddPremio(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    try {
      const payload = {
        nombre,
        descripcion,
        emoji,
        probabilidad: parseFloat(probabilidad),
        stock: parseInt(stock)
      };

      if (isEditing && selectedId) {
        const { error } = await supabase.from('premios').update(payload).eq('id', selectedId);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Premio actualizado' });
      } else {
        const { error } = await supabase.from('premios').insert([payload]);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Premio añadido' });
      }

      setNombre('');
      setDescripcion('');
      setEmoji('🎁');
      setShowForm(false);
      setIsEditing(false);
      setSelectedId(null);
      fetchPremios();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que quieres eliminar este premio?')) return;
    setActionLoading(true);
    try {
      await supabase.from('premios').delete().eq('id', id);
      fetchPremios();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
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
          <p className="text-gray-500">Administra los premios que aparecen en las ruletas.</p>
        </div>
        
        <button 
          onClick={() => {
            if (showForm) { setIsEditing(false); setNombre(''); }
            setShowForm(!showForm);
          }}
          className="bg-[#4A5D4E] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all"
        >
          {showForm ? 'Cerrar' : '+ Nuevo Premio'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddPremio} className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4">
          <h3 className="md:col-span-2 text-xl font-bold text-[#4A5D4E]">{isEditing ? 'Editar Premio' : 'Nuevo Premio'}</h3>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-gray-400 ml-1">Emoji / Icono</label>
            <input required value={emoji} onChange={e => setEmoji(e.target.value)} className="w-full p-4 rounded-xl border bg-gray-50 focus:border-[#4A5D4E] outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-gray-400 ml-1">Nombre del Premio</label>
            <input required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-4 rounded-xl border bg-gray-50 focus:border-[#4A5D4E] outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-gray-400 ml-1">Probabilidad de Salida (%)</label>
            <input type="number" required value={probabilidad} onChange={e => setProbabilidad(e.target.value)} className="w-full p-4 rounded-xl border bg-gray-50 focus:border-[#4A5D4E] outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-gray-400 ml-1">Stock Disponible</label>
            <input type="number" required value={stock} onChange={e => setStock(e.target.value)} className="w-full p-4 rounded-xl border bg-gray-50 focus:border-[#4A5D4E] outline-none transition-all" />
          </div>
          <button disabled={actionLoading} className="md:col-span-2 bg-[#4A5D4E] text-white p-5 rounded-2xl font-black tracking-widest hover:brightness-110 transition-all shadow-lg">
            {actionLoading ? 'GUARDANDO...' : isEditing ? 'ACTUALIZAR PREMIO' : 'CREAR PREMIO'}
          </button>
        </form>
      )}

      {message && (
        <div className={`p-4 rounded-2xl animate-in fade-in flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
           {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
           <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-8">Detalle del Premio</th>
                <th className="p-8">Probabilidad</th>
                <th className="p-8">Stock</th>
                <th className="p-8 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {premios.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                        {p.emoji}
                      </div>
                      <span className="font-bold text-gray-800 text-lg">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2">
                       <div className="w-12 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${p.probabilidad}%` }}></div>
                       </div>
                       <span className="font-black text-blue-600 text-sm">{p.probabilidad}%</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-2 rounded-full font-bold text-xs ${p.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      {p.stock} unidades
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(p)} className="p-3 bg-gray-50 text-gray-400 hover:text-[#4A5D4E] hover:bg-[#4A5D4E]/10 rounded-xl transition-all">
                        <Settings2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
