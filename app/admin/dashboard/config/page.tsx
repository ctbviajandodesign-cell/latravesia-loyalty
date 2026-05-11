'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Settings, 
  RefreshCw, 
  Globe, 
  Lock, 
  Link as LinkIcon, 
  CheckCircle2, 
  Database,
  ShieldCheck,
  Zap,
  Layout,
  Star
} from 'lucide-react';

export default function ConfigPage() {
  const [config, setConfig] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const { data } = await supabase.from('config').select('*');
      if (data) {
        // Filtramos para quitar ABSOLUTAMENTE TODO lo relacionado con emails, marketing y masivos
        const marketingPrefixes = ['birthday_', 'welcome_', 'loyalty_', 'mass_', 'email_', 'broadcast_'];
        const filtered = data.filter(c => !marketingPrefixes.some(prefix => c.clave.startsWith(prefix)));
        setConfig(filtered);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (id: string, valor: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('config').update({ valor }).eq('id', id);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-12">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-travesia-gold/10 border border-travesia-gold/20 rounded-xl flex items-center justify-center text-travesia-gold">
              <Settings size={20} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Parámetros Globales</h2>
          </div>
          <p className="text-white/40 text-sm ml-13">Ajustes técnicos y enlaces de reputación institucional.</p>
        </div>
        
        {saved && (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Cambios sincronizados</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL LATERAL DE ESTADO */}
        <div className="space-y-6">
          <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest font-black text-white/30">Infraestructura</p>
                <span className="flex items-center gap-2 text-travesia-gold text-[10px] font-black uppercase tracking-widest"><Zap size={12}/> Online</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="p-3 bg-travesia-gold/10 rounded-xl text-travesia-gold">
                    <Database size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Base de Datos</p>
                    <p className="text-[10px] text-white/30">Supabase SQL</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Star size={16} className="text-travesia-gold" />
                <p className="text-[10px] uppercase tracking-widest font-black text-white/30">SEO & Reputación</p>
              </div>
              <p className="text-xs text-white/50 leading-relaxed italic">
                El link de Google Maps es fundamental para que el sistema de Check-In invite a los clientes frecuentes a dejar una reseña.
              </p>
            </div>
          </div>
        </div>

        {/* LISTA DE VARIABLES TÉCNICAS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-10">
            {config.map((item) => {
              const isGoogle = item.clave === 'google_maps_link';
              return (
                <div key={item.id} className="group space-y-4 animate-in fade-in duration-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-6 rounded-full transition-colors ${isGoogle ? 'bg-travesia-gold' : 'bg-white/20 group-hover:bg-white/40'}`}></div>
                      <label className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${isGoogle ? 'text-travesia-gold' : 'text-white/60 group-hover:text-white'}`}>
                        {item.clave === 'google_maps_link' ? 'LINK DE OPINIONES GOOGLE' : item.clave.replace(/_/g, ' ')}
                      </label>
                    </div>
                    {isGoogle ? <Star size={14} className="text-travesia-gold animate-pulse" /> : <Globe size={14} className="text-white/20" />}
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <input 
                        id={item.id}
                        type="text" 
                        defaultValue={item.valor} 
                        className={`w-full bg-white/5 border p-5 rounded-[20px] outline-none transition-all text-sm font-medium pr-14 ${isGoogle ? 'border-travesia-gold/30 focus:border-travesia-gold' : 'border-white/10 focus:border-white/30'}`}
                        placeholder={isGoogle ? "https://share.google/..." : "Valor de configuración"}
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2">
                        {isGoogle ? <LinkIcon size={16} className="text-travesia-gold/40" /> : <Lock size={16} className="text-white/10" />}
                      </div>
                    </div>
                    <button 
                      className={`p-5 rounded-[20px] transition-all flex items-center justify-center ${isGoogle ? 'bg-travesia-gold text-[#051A10] hover:scale-105' : 'bg-white/5 border border-white/10 text-white/20 hover:text-travesia-gold'}`}
                      onClick={() => handleSave(item.id, (document.getElementById(item.id) as any).value)}
                    >
                      {saving ? <RefreshCw className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                    </button>
                  </div>
                  {isGoogle && (
                    <p className="text-[10px] text-travesia-gold/60 italic ml-4 font-bold">
                      ⚠️ Este enlace aparecerá a los clientes frecuentes después de su segunda visita.
                    </p>
                  )}
                </div>
              );
            })}

            {config.length === 0 && (
              <div className="py-20 text-center opacity-40">
                <RefreshCw size={48} className="mx-auto animate-spin mb-4" />
                <p className="uppercase tracking-widest font-black text-xs">Cargando parámetros...</p>
              </div>
            )}
          </div>
          
          <div className="bg-emerald-500/5 p-8 rounded-[32px] border border-emerald-500/10 flex items-center gap-6">
            <ShieldCheck className="w-12 h-12 text-emerald-400 shrink-0" />
            <div className="space-y-1">
              <p className="font-bold text-white tracking-tight">Configuración Protegida</p>
              <p className="text-xs text-white/40 leading-relaxed">Los cambios aquí afectan directamente al comportamiento de la App móvil y el sistema de envíos.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
