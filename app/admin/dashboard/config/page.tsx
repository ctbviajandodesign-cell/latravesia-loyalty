'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { upsertConfigByClave } from '@/app/actions/config';
import {
  Settings, RefreshCw, CheckCircle2, ShieldCheck, Star,
  Instagram, Facebook, Music2, Smartphone, Save, Link as LinkIcon, Lock
} from 'lucide-react';

// Claves que se muestran en la sección de Redes Sociales
const SOCIAL_DEFS = [
  {
    clave: 'instagram_link',
    fallback: 'link_instagram',
    label: 'Instagram',
    icon: <Instagram size={18} />,
    bg: 'bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
    placeholder: 'https://www.instagram.com/tu_cuenta/',
  },
  {
    clave: 'facebook_link',
    fallback: 'link_facebook',
    label: 'Facebook',
    icon: <Facebook size={18} />,
    bg: 'bg-[#1877F2]',
    placeholder: 'https://www.facebook.com/tu_pagina/',
  },
  {
    clave: 'tiktok_link',
    fallback: 'link_tiktok',
    label: 'TikTok',
    icon: <Music2 size={18} />,
    bg: 'bg-black',
    placeholder: 'https://www.tiktok.com/@tu_cuenta',
  },
  {
    clave: 'whatsapp_group_link',
    fallback: 'link_whatsapp',
    label: 'Grupo WhatsApp',
    icon: <Smartphone size={18} />,
    bg: 'bg-[#25D366]',
    placeholder: 'https://chat.whatsapp.com/...',
  },
];

// Claves que aparecen en Configuración General (explícito, nada más)
const GENERAL_KEYS = [
  'google_maps_link',
  'nombre_restaurante',
  'visitas_para_premio',
  'admin_whatsapp',
  'admin_email',
  'whatsapp_join_label',
  'whatsapp_join_enabled',
  'premio_visitas',
];

const GENERAL_LABELS: Record<string, string> = {
  google_maps_link: 'Link de Opiniones Google',
  nombre_restaurante: 'Nombre del Restaurante',
  visitas_para_premio: 'Visitas para Premio',
  admin_whatsapp: 'WhatsApp Admin',
  admin_email: 'Email Admin',
  whatsapp_join_label: 'Texto botón WhatsApp registro',
  whatsapp_join_enabled: 'WhatsApp activo (true/false)',
  premio_visitas: 'Premio por Visitas',
};

export default function ConfigPage() {
  // socialInputs: clave → valor actual en input
  const [socialInputs, setSocialInputs] = useState<Record<string, string>>({});
  // generalItems: lista de { clave, valor, id }
  const [generalItems, setGeneralItems] = useState<{ clave: string; valor: string; id: string }[]>([]);
  // generalInputs: id → valor actual en input
  const [generalInputs, setGeneralInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => { loadConfig(); }, []);

  async function loadConfig() {
    try {
      const { data } = await supabase.from('config').select('*');
      if (!data) return;

      const map: Record<string, { id: string; valor: string }> = {};
      data.forEach(row => { map[row.clave] = { id: row.id, valor: row.valor || '' }; });

      // Social: usa el valor de la clave canónica, con fallback al alias link_*
      const inputs: Record<string, string> = {};
      SOCIAL_DEFS.forEach(({ clave, fallback }) => {
        inputs[clave] = map[clave]?.valor || map[fallback]?.valor || '';
      });
      setSocialInputs(inputs);

      // General: solo las claves explícitas
      const gItems: { clave: string; valor: string; id: string }[] = [];
      const gInputs: Record<string, string> = {};
      GENERAL_KEYS.forEach(clave => {
        const row = map[clave];
        if (row) {
          gItems.push({ clave, valor: row.valor, id: row.id });
          gInputs[row.id] = row.valor;
        }
      });
      setGeneralItems(gItems);
      setGeneralInputs(gInputs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSocial(clave: string) {
    setSavingKey(clave);
    try {
      const result = await upsertConfigByClave(clave, socialInputs[clave] ?? '');
      if (result.error) throw new Error(result.error);
      setSavedKey(clave);
      setTimeout(() => setSavedKey(null), 2500);
    } catch {
      alert('Error al guardar');
    } finally {
      setSavingKey(null);
    }
  }

  async function handleSaveGeneral(id: string, clave: string) {
    setSavingKey(id);
    try {
      const result = await upsertConfigByClave(clave, generalInputs[id] ?? '');
      if (result.error) throw new Error(result.error);
      setSavedKey(id);
      setTimeout(() => setSavedKey(null), 2500);
    } catch {
      alert('Error al guardar');
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <RefreshCw className="animate-spin text-travesia-gold w-8 h-8" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-10">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-travesia-gold/10 border border-travesia-gold/20 rounded-xl flex items-center justify-center text-travesia-gold">
          <Settings size={20} />
        </div>
        <div>
          <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Parámetros Globales</h2>
          <p className="text-white/40 text-sm">Links de redes sociales y ajustes técnicos.</p>
        </div>
      </div>

      {/* REDES SOCIALES */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-1.5 h-6 bg-travesia-gold rounded-full" />
          <h3 className="text-xl font-serif font-bold text-white">Redes Sociales</h3>
        </div>

        <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 space-y-6 shadow-2xl">
          {SOCIAL_DEFS.map(({ clave, label, icon, bg, placeholder }) => {
            const isSaving = savingKey === clave;
            const isSaved = savedKey === clave;
            return (
              <div key={clave} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center text-white shrink-0`}>
                    {icon}
                  </div>
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{label}</label>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={socialInputs[clave] ?? ''}
                    onChange={e => setSocialInputs(prev => ({ ...prev, [clave]: e.target.value }))}
                    placeholder={placeholder}
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all text-sm"
                  />
                  <button
                    onClick={() => handleSaveSocial(clave)}
                    disabled={isSaving}
                    className={`shrink-0 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap active:scale-95
                      ${isSaved
                        ? 'bg-emerald-500 text-white'
                        : 'bg-travesia-gold text-[#051A10] hover:brightness-110 disabled:opacity-50'
                      }`}
                  >
                    {isSaving
                      ? <RefreshCw size={14} className="animate-spin" />
                      : isSaved
                        ? <><CheckCircle2 size={14} /> Guardado</>
                        : <><Save size={14} /> Guardar</>
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIGURACIÓN GENERAL */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-1.5 h-6 bg-white/20 rounded-full" />
          <h3 className="text-xl font-serif font-bold text-white">Configuración General</h3>
        </div>

        <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-6">
          {generalItems.map(({ clave, id }) => {
            const isGoogle = clave === 'google_maps_link';
            const isSaving = savingKey === id;
            const isSaved = savedKey === id;
            return (
              <div key={id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-black uppercase tracking-[0.2em] ${isGoogle ? 'text-travesia-gold' : 'text-white/50'}`}>
                    {GENERAL_LABELS[clave] ?? clave}
                  </label>
                  {isGoogle && <Star size={12} className="text-travesia-gold" />}
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      value={generalInputs[id] ?? ''}
                      onChange={e => setGeneralInputs(prev => ({ ...prev, [id]: e.target.value }))}
                      className={`w-full bg-white/5 border p-4 rounded-2xl outline-none transition-all text-sm pr-10
                        ${isGoogle ? 'border-travesia-gold/30 focus:border-travesia-gold' : 'border-white/10 focus:border-white/30'}`}
                      placeholder="Valor de configuración"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      {isGoogle
                        ? <LinkIcon size={14} className="text-travesia-gold/40" />
                        : <Lock size={14} className="text-white/10" />}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveGeneral(id, clave)}
                    disabled={isSaving}
                    className={`shrink-0 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap active:scale-95
                      ${isSaved
                        ? 'bg-emerald-500 text-white'
                        : isGoogle
                          ? 'bg-travesia-gold text-[#051A10] hover:brightness-110'
                          : 'bg-white/5 border border-white/10 text-white/60 hover:text-travesia-gold hover:border-travesia-gold/30 disabled:opacity-40'
                      }`}
                  >
                    {isSaving
                      ? <RefreshCw size={14} className="animate-spin" />
                      : isSaved
                        ? <><CheckCircle2 size={14} /> Guardado</>
                        : <><Save size={14} /> Guardar</>
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-emerald-500/5 p-6 rounded-[32px] border border-emerald-500/10 flex items-center gap-5">
        <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
        <div>
          <p className="font-bold text-white">Configuración Protegida</p>
          <p className="text-xs text-white/40 mt-0.5 leading-relaxed">Los cambios afectan directamente la App móvil y el sistema de envíos.</p>
        </div>
      </div>

    </div>
  );
}
