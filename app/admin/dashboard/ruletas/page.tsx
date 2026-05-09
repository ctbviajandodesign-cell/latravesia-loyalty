'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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

export default function RuletasPage() {
  const [ruletas, setRuletas] = useState<any[]>([]);
  const [premiosDisponibles, setPremiosDisponibles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [selectedPremios, setSelectedPremios] = useState<string[]>([]);

  // const supabase = createClientComponentClient(); // Eliminado por consistencia

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      // Consultas simples para evitar errores de columnas faltantes
      const { data: ruletasData, error: rError } = await supabase
        .from('ruletas')
        .select('*');
      
      if (rError) throw new Error(`Error en Ruletas: ${rError.message}`);

      const { data: premiosData, error: pError } = await supabase
        .from('premios')
        .select('*');

      if (pError) throw new Error(`Error en Premios: ${pError.message}`);

      setRuletas(ruletasData || []);
      setPremiosDisponibles(premiosData || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRuleta(e: React.FormEvent) {
    e.preventDefault();
    if (selectedPremios.length === 0) {
      setMessage({ type: 'error', text: 'Selecciona al menos un premio.' });
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

      setMessage({ type: 'success', text: 'Ruleta creada.' });
      setNombre('');
      setSelectedPremios([]);
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleStatus(id: string, currentStatus: boolean) {
    setActionLoading(true);
    try {
      if (!currentStatus) {
        await supabase.from('ruletas').update({ activa: false }).neq('id', id);
      }
      const { error } = await supabase.from('ruletas').update({ activa: !currentStatus }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return (
    <div className="p-20 flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-[#4A5D4E]" />
      <p className="text-gray-500 font-medium animate-pulse">Cargando sistema de ruletas...</p>
    </div>
  );

  if (error) return (
    <div className="p-10 bg-red-50 rounded-2xl border border-red-100 text-center space-y-4">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
      <h2 className="text-xl font-bold text-red-700">Ups, algo salió mal</h2>
      <p className="text-red-600 max-w-md mx-auto">{error}</p>
      <button 
        onClick={fetchData}
        className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
      >
        Reintentar conexión
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#4A5D4E] flex items-center gap-2">
            <RotateCw className="w-8 h-8" />
            Configuración de Ruletas
          </h1>
          <p className="text-gray-600 mt-1">Gestiona las promociones activas.</p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[#4A5D4E] text-white px-6 py-3 rounded-xl hover:bg-[#3D4D40] transition-all shadow-lg"
        >
          {showForm ? 'Cancelar' : 'Nueva Ruleta'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-in zoom-in-95">
          <form onSubmit={handleCreateRuleta} className="space-y-6">
            <input 
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de la ruleta..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {premiosDisponibles.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setSelectedPremios(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPremios.includes(p.id) ? 'border-[#4A5D4E] bg-green-50' : 'border-gray-100'}`}
                >
                  <p className="font-bold">{p.emoji || '🎁'} {p.nombre}</p>
                </div>
              ))}
            </div>
            <button type="submit" className="w-full bg-[#4A5D4E] text-white py-4 rounded-xl font-bold">Crear Ruleta</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ruletas.map((r) => (
          <div key={r.id} className={`bg-white p-6 rounded-2xl border-2 ${r.activa ? 'border-[#4A5D4E]' : 'border-gray-100'}`}>
            <h3 className="text-xl font-bold mb-4">{r.nombre}</h3>
            <button 
              onClick={() => toggleStatus(r.id, r.activa)}
              className={`w-full py-3 rounded-xl font-bold ${r.activa ? 'bg-red-50 text-red-700' : 'bg-[#4A5D4E] text-white'}`}
            >
              {r.activa ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
