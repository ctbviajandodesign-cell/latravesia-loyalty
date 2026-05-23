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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [selectedPremios, setSelectedPremios] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const { data: ruletasData, error: rError } = await supabase.from('ruletas').select('*').order('created_at', { ascending: false });
      if (rError) throw rError;

      const { data: premiosData, error: pError } = await supabase.from('premios').select('*');
      if (pError) throw pError;

      setRuletas(ruletasData || []);
      setPremiosDisponibles(premiosData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (ruleta: any) => {
    setSelectedId(ruleta.id);
    setNombre(ruleta.nombre);
    setSelectedPremios(ruleta.configuracion?.premiosIds || []);
    setIsEditing(true);
    setShowForm(true);
  };

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (selectedPremios.length === 0) {
      setMessage({ type: 'error', text: 'Selecciona al menos un premio.' });
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        nombre,
        configuracion: { premiosIds: selectedPremios }
      };

      if (isEditing && selectedId) {
        const { error } = await supabase.from('ruletas').update(payload).eq('id', selectedId);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Ruleta actualizada.' });
      } else {
        const { error } = await supabase.from('ruletas').insert([{ ...payload, activa: false }]);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Ruleta creada.' });
      }

      setNombre('');
      setSelectedPremios([]);
      setShowForm(false);
      setIsEditing(false);
      setSelectedId(null);
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

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta ruleta?")) return;
    setActionLoading(true);
    try {
      await supabase.from('ruletas').delete().eq('id', id);
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
      <p className="text-gray-500 font-medium">Cargando sistema de ruletas...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-[#4A5D4E] flex items-center gap-3">
            <RotateCw className="w-10 h-10" /> Configuración de Ruletas
          </h1>
          <p className="text-gray-500 mt-1 ml-13">Crea diferentes configuraciones de premios y actívalas según la ocasión.</p>
        </div>
        
        <button 
          onClick={() => {
            if (showForm) { setIsEditing(false); setNombre(''); setSelectedPremios([]); }
            setShowForm(!showForm);
          }}
          className="bg-[#4A5D4E] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all"
        >
          {showForm ? 'Cerrar Panel' : '+ Nueva Ruleta'}
        </button>
      </div>

      {message && (
        <div className={`p-5 rounded-2xl animate-in slide-in-from-top-2 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-bold">{message.text}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 animate-in zoom-in-95 space-y-8">
          <h3 className="text-2xl font-serif font-bold text-[#4A5D4E]">{isEditing ? 'Configurar Ruleta' : 'Nueva Configuración'}</h3>
          <form onSubmit={handleCreateOrUpdate} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs uppercase font-black text-gray-400 ml-2">Nombre Identificador</label>
              <input 
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Ruleta de Fin de Semana / Especial Madres..."
                className="w-full px-6 py-5 rounded-2xl border border-gray-200 outline-none focus:border-[#4A5D4E] transition-all text-lg font-medium bg-gray-50"
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs uppercase font-black text-gray-400 ml-2">Selecciona los Premios que aparecerán (Máx 8 recomendados)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {premiosDisponibles.map(p => {
                  const isSelected = selectedPremios.includes(p.id);
                  return (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedPremios(prev => isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${isSelected ? 'border-[#4A5D4E] bg-[#4A5D4E]/5 shadow-inner' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                    >
                      <span className="text-3xl">{p.emoji || '🎁'}</span>
                      <div className="flex-1">
                        <p className="font-black text-gray-800 text-sm leading-tight">{p.nombre}</p>
                        <p className="text-xs text-gray-400 uppercase font-bold mt-1">Prob: {p.probabilidad}%</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-[#4A5D4E] border-[#4A5D4E]' : 'border-gray-200'}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={actionLoading} className="w-full bg-[#4A5D4E] text-white py-6 rounded-2xl font-black tracking-[0.2em] uppercase shadow-2xl shadow-[#4A5D4E]/20 hover:scale-[1.01] transition-all">
              {actionLoading ? 'PROCESANDO...' : isEditing ? 'GUARDAR CAMBIOS' : 'CREAR Y GUARDAR'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {ruletas.map((r) => (
          <div key={r.id} className={`bg-white p-8 rounded-[40px] border-2 transition-all relative group overflow-hidden ${r.activa ? 'border-[#4A5D4E] shadow-2xl shadow-[#4A5D4E]/10' : 'border-gray-100 shadow-sm'}`}>
            <div className="flex justify-between items-start mb-6">
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-800 leading-tight">{r.nombre}</h3>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">{r.configuracion?.premiosIds?.length || 0} Premios configurados</p>
               </div>
               {r.activa && <div className="p-2 bg-[#4A5D4E] text-white rounded-lg animate-pulse"><Play size={14} fill="currentColor" /></div>}
            </div>

            <div className="space-y-3 mb-8">
               <div className="flex -space-x-3 overflow-hidden p-1">
                  {r.configuracion?.premiosIds?.slice(0, 5).map((pid: string) => {
                    const premio = premiosDisponibles.find(p => p.id === pid);
                    return (
                      <div key={pid} className="w-10 h-10 rounded-xl bg-gray-50 border-2 border-white flex items-center justify-center text-xl shadow-sm">
                        {premio?.emoji || '🎁'}
                      </div>
                    );
                  })}
                  {(r.configuracion?.premiosIds?.length || 0) > 5 && (
                    <div className="w-10 h-10 rounded-xl bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-black text-gray-500">
                      +{(r.configuracion?.premiosIds?.length || 0) - 5}
                    </div>
                  )}
               </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => toggleStatus(r.id, r.activa)}
                className={`flex-1 py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all ${r.activa ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-[#4A5D4E] text-white shadow-lg shadow-[#4A5D4E]/20 hover:brightness-110'}`}
              >
                {r.activa ? 'DESACTIVAR' : 'ACTIVAR AHORA'}
              </button>
              <button onClick={() => handleEdit(r)} className="p-4 bg-gray-50 text-gray-400 hover:text-[#4A5D4E] hover:bg-[#4A5D4E]/10 rounded-2xl transition-all"><Settings2 size={18} /></button>
              <button onClick={() => handleDelete(r.id)} className="p-4 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
