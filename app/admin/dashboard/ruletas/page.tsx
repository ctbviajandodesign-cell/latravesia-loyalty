'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  RotateCw, 
  Plus, 
  Trash2, 
  Play, 
  Square, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Settings2,
  Gift
} from 'lucide-react';

interface Premio {
  id: string;
  nombre: string;
  probabilidad: number;
  stock: number;
}

interface Ruleta {
  id: string;
  nombre: string;
  activa: boolean;
  configuracion: {
    premiosIds: string[];
  };
  created_at: string;
}

export default function RuletasPage() {
  const [ruletas, setRuletas] = useState<Ruleta[]>([]);
  const [premiosDisponibles, setPremiosDisponibles] = useState<Premio[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [selectedPremios, setSelectedPremios] = useState<string[]>([]);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [ruletasRes, premiosRes] = await Promise.all([
        supabase.from('ruletas').select('*').order('created_at', { ascending: false }),
        supabase.from('premios').select('id, nombre, probabilidad, stock').gt('stock', 0)
      ]);

      if (ruletasRes.error) throw ruletasRes.error;
      if (premiosRes.error) throw premiosRes.error;

      setRuletas(ruletasRes.data || []);
      setPremiosDisponibles(premiosRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRuleta(e: React.FormEvent) {
    e.preventDefault();
    if (selectedPremios.length === 0) {
      setMessage({ type: 'error', text: 'Debes seleccionar al menos un premio.' });
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('ruletas')
        .insert([{
          nombre,
          activa: false,
          configuracion: { premiosIds: selectedPremios }
        }]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Ruleta creada correctamente.' });
      setNombre('');
      setSelectedPremios([]);
      setShowForm(false);
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleStatus(id: string, currentStatus: boolean) {
    setActionLoading(true);
    try {
      // If we are activating this one, deactivate all others first
      if (!currentStatus) {
        await supabase.from('ruletas').update({ activa: false }).neq('id', id);
      }

      const { error } = await supabase
        .from('ruletas')
        .update({ activa: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: !currentStatus ? 'Ruleta activada' : 'Ruleta desactivada' });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta ruleta?')) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase.from('ruletas').delete().eq('id', id);
      if (error) throw error;
      setRuletas(ruletas.filter(r => r.id !== id));
      setMessage({ type: 'success', text: 'Ruleta eliminada' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(false);
    }
  }

  const togglePremio = (id: string) => {
    setSelectedPremios(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#4A5D4E] flex items-center gap-2">
            <RotateCw className="w-8 h-8" />
            Configuración de Ruletas
          </h1>
          <p className="text-gray-600 mt-1">Activa y configura las promociones del día.</p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-[#4A5D4E] text-white px-6 py-3 rounded-xl hover:bg-[#3D4D40] transition-all shadow-lg active:scale-95"
        >
          {showForm ? 'Cerrar' : <><Plus className="w-5 h-5" /> Nueva Ruleta</>}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-in zoom-in-95">
          <form onSubmit={handleCreateRuleta} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nombre de la Ruleta</label>
              <input 
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Promo San Valentín"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A5D4E] outline-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Selecciona los Premios a incluir:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {premiosDisponibles.map(premio => (
                  <div 
                    key={premio.id}
                    onClick={() => togglePremio(premio.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      selectedPremios.includes(premio.id) 
                        ? 'border-[#4A5D4E] bg-green-50 shadow-md' 
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                      selectedPremios.includes(premio.id) ? 'bg-[#4A5D4E] border-[#4A5D4E]' : 'border-gray-300'
                    }`}>
                      {selectedPremios.includes(premio.id) && <Plus className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{premio.nombre}</div>
                      <div className="text-xs text-gray-500">Prob: {premio.probabilidad}% | Stock: {premio.stock}</div>
                    </div>
                  </div>
                ))}
              </div>
              {premiosDisponibles.length === 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> No hay premios con stock disponible. Crea premios primero.
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={actionLoading || premiosDisponibles.length === 0}
              className="w-full bg-[#4A5D4E] text-white py-4 rounded-xl font-medium hover:bg-[#3D4D40] disabled:opacity-50 transition-all"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Crear y Guardar Ruleta'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full p-12 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#4A5D4E]" />
            <p className="text-gray-500">Cargando ruletas...</p>
          </div>
        ) : ruletas.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300">
            <Settings2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aún no has configurado ninguna ruleta.</p>
          </div>
        ) : ruletas.map((ruleta) => (
          <div 
            key={ruleta.id}
            className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-all ${
              ruleta.activa ? 'border-[#4A5D4E] ring-4 ring-green-900/5' : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-serif text-gray-900">{ruleta.nombre}</h3>
                  {ruleta.activa && (
                    <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1 h-1 bg-green-700 rounded-full animate-pulse" /> Activa
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Creada el {new Date(ruleta.created_at).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => handleDelete(ruleta.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Premios incluidos:</h4>
              <div className="flex flex-wrap gap-2">
                {ruleta.configuracion.premiosIds.map(id => {
                  const p = premiosDisponibles.find(pr => pr.id === id);
                  return (
                    <span key={id} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-700 flex items-center gap-2">
                      <Gift className="w-3 h-3 text-[#4A5D4E]" /> {p?.nombre || 'Premio'}
                    </span>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={() => toggleStatus(ruleta.id, ruleta.activa)}
              disabled={actionLoading}
              className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                ruleta.activa 
                  ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                  : 'bg-[#4A5D4E] text-white hover:bg-[#3D4D40] shadow-lg shadow-green-900/10'
              }`}
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                ruleta.activa ? <><Square className="w-5 h-5" /> Desactivar</> : <><Play className="w-5 h-5" /> Activar Ruleta</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
