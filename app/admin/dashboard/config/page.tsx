'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, CheckCircle } from 'lucide-react';

export default function ConfigPage() {
  const [config, setConfig] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      const { data, error } = await supabase
        .from('config')
        .select('*');
      
      if (!error) setConfig(data || []);
      setLoading(false);
    }
    fetchConfig();
  }, []);

  const handleChange = (clave: string, valor: string) => {
    setConfig(prev => prev.map(c => c.clave === clave ? { ...c, valor } : c));
  };

  const handleSave = async () => {
    setSaving(true);
    for (const item of config) {
      await supabase
        .from('config')
        .update({ valor: item.valor })
        .eq('clave', item.clave);
    }
    setSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-travesia-green-dark/40">Cargando configuración...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-travesia-green-deep tracking-tight">Configuración</h1>
          <p className="text-travesia-green-dark/60 font-medium">Personaliza el sistema y enlaces</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-travesia-gold text-travesia-green-deep px-8 py-3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </button>
      </div>

      {showSaved && (
        <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={20} />
          Configuración guardada correctamente.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {config.map((item) => (
          <div key={item.clave} className="bg-white p-6 rounded-3xl shadow-sm border border-travesia-gold/10 space-y-3">
            <label className="text-xs font-black text-travesia-green-dark/40 uppercase tracking-[0.2em]">
              {item.clave.replace(/_/g, ' ')}
            </label>
            {item.valor.length > 50 ? (
              <textarea 
                className="w-full bg-travesia-cream p-4 rounded-xl outline-none focus:ring-2 ring-travesia-gold/30 text-travesia-green-deep min-h-[100px]"
                value={item.valor}
                onChange={(e) => handleChange(item.clave, e.target.value)}
              />
            ) : (
              <input 
                type="text"
                className="w-full bg-travesia-cream p-4 rounded-xl outline-none focus:ring-2 ring-travesia-gold/30 text-travesia-green-deep"
                value={item.valor}
                onChange={(e) => handleChange(item.clave, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
