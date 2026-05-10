'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Globe, 
  Lock, 
  Link as LinkIcon, 
  CheckCircle2, 
  Database,
  ShieldCheck,
  Zap,
  Layout
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
      setConfig(data || []);
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
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Configuración del Sistema</h2>
          </div>
          <p className="text-white/40 text-sm ml-13">Ajusta los parámetros globales de la plataforma Loyalty.</p>
        </div>
        
        {saved && (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Cambios guardados</span>
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
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-travesia-gold/30 transition-all">
                  <div className="p-3 bg-travesia-gold/10 rounded-xl text-travesia-gold">
                    <Database size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Supabase Cloud</p>
                    <p className="text-[10px] text-white/30">PostgreSQL Engine</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-emerald-500/30 transition-all">
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">API Security</p>
                    <p className="text-[10px] text-white/30">Verified & Secure</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-4 text-center">Version de Sistema</p>
              <p className="text-3xl font-serif font-black text-center text-white/60 tracking-tighter">v17.0<span className="text-travesia-gold">.3</span></p>
            </div>
          </div>
        </div>

        {/* LISTA DE VARIABLES DE CONFIGURACIÓN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-10">
            {config.map((item) => (
              <div key={item.id} className="group space-y-4 animate-in fade-in duration-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-travesia-gold/40 group-hover:bg-travesia-gold transition-colors rounded-full"></div>
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors">
                      {item.clave.replace(/_/g, ' ')}
                    </label>
                  </div>
                  {item.clave.includes('link') ? <LinkIcon size={14} className="text-white/20" /> : <Globe size={14} className="text-white/20" />}
                </div>
                
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      defaultValue={item.valor} 
                      onBlur={(e) => handleSave(item.id, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-[20px] outline-none focus:border-travesia-gold transition-all text-sm font-medium pr-14"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      <Lock size={16} className="text-white/10" />
                    </div>
                  </div>
                  <button 
                    className="p-5 bg-white/5 border border-white/10 rounded-[20px] text-white/20 hover:text-travesia-gold hover:border-travesia-gold/40 transition-all"
                    onClick={() => handleSave(item.id, (document.getElementById(item.id) as any).value)}
                  >
                    <RefreshCw size={20} className={saving ? 'animate-spin' : ''} />
                  </button>
                </div>
                <p className="text-[10px] text-white/20 italic ml-4">
                  Define el valor global para la clave institucional <span className="text-white/40">{item.clave}</span>.
                </p>
              </div>
            ))}

            {config.length === 0 && (
              <div className="py-20 text-center space-y-4 opacity-40">
                <Layout size={48} className="mx-auto" />
                <p className="uppercase tracking-widest font-black text-xs">Cargando variables...</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-travesia-gold to-[#B8860B] p-[1px] rounded-[32px] overflow-hidden group">
            <div className="bg-[#0A2A18] p-8 rounded-[31px] flex items-center justify-between group-hover:bg-[#0A2A18]/80 transition-colors">
              <div className="space-y-1">
                <p className="font-bold text-white tracking-tight">Acceso Master</p>
                <p className="text-xs text-white/40 leading-relaxed">Todos los cambios se aplican en tiempo real al sistema global.</p>
              </div>
              <ShieldCheck className="w-10 h-10 text-travesia-gold animate-pulse" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
