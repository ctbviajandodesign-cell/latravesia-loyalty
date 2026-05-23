'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { saveConfigValue } from '@/app/actions/config';
import {
  Settings, RefreshCw, Globe, Lock, Link as LinkIcon,
  CheckCircle2, Database, ShieldCheck, Zap, Star,
  Instagram, Facebook, Music2, Smartphone, Save
} from 'lucide-react';

const SOCIAL_KEYS = ['link_instagram', 'link_facebook', 'link_tiktok', 'link_whatsapp'];
const HIDDEN_KEYS = [
  ...SOCIAL_KEYS,
  'instagram_link', 'facebook_link', 'tiktok_link', 'whatsapp_group_link',
  'filtro_genero', 'pin_fecha',
  'admin_password', 'resend_api_key',
];
const MARKETING_PREFIXES = ['birthday_', 'welcome_', 'loyalty_', 'mass_', 'email_', 'broadcast_'];

const SOCIAL_META: Record<string, { label: string; icon: React.ReactNode; color: string; placeholder: string }> = {
  link_instagram: {
    label: 'Instagram',
    icon: <Instagram size={18} />,
    color: 'from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
    placeholder: 'https://www.instagram.com/tu_cuenta/',
  },
  link_facebook: {
    label: 'Facebook',
    icon: <Facebook size={18} />,
    color: 'from-[#1877F2] to-[#1877F2]',
    placeholder: 'https://www.facebook.com/tu_pagina/',
  },
  link_tiktok: {
    label: 'TikTok',
    icon: <Music2 size={18} />,
    color: 'from-black to-[#111]',
    placeholder: 'https://www.tiktok.com/@tu_cuenta',
  },
  link_whatsapp: {
    label: 'Grupo WhatsApp',
    icon: <Smartphone size={18} />,
    color: 'from-[#25D366] to-[#128C7E]',
    placeholder: 'https://chat.whatsapp.com/...',
  },
};

export default function ConfigPage() {
  const [config, setConfig] = useState<any[]>([]);
  const [socials, setSocials] = useState<Record<string, { id: string; valor: string }>>({});
  const [socialInputs, setSocialInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => { fetchConfig(); }, []);

  async function fetchConfig() {
    try {
      const { data } = await supabase.from('config').select('*');
      if (!data) return;

      const socialMap: Record<string, { id: string; valor: string }> = {};
      const inputMap: Record<string, string> = {};
      const rest: any[] = [];

      data.forEach((item) => {
        if (SOCIAL_KEYS.includes(item.clave)) {
          socialMap[item.clave] = { id: item.id, valor: item.valor || '' };
          inputMap[item.clave] = item.valor || '';
        } else if (
          !HIDDEN_KEYS.includes(item.clave) &&
          !MARKETING_PREFIXES.some(p => item.clave.startsWith(p))
        ) {
          rest.push(item);
        }
      });

      setSocials(socialMap);
      setSocialInputs(inputMap);
      setConfig(rest);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveSocial = async (clave: string) => {
    const entry = socials[clave];
    if (!entry) return;
    setSavingId(clave);
    try {
      const result = await saveConfigValue(entry.id, socialInputs[clave]);
      if (result.error) throw new Error(result.error);
      setSocials(prev => ({ ...prev, [clave]: { ...prev[clave], valor: socialInputs[clave] } }));
      setSavedId(clave);
      setTimeout(() => setSavedId(null), 2500);
    } catch {
      alert('Error al guardar');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveGeneric = async (id: string, inputId: string) => {
    setSavingId(id);
    try {
      const value = (document.getElementById(inputId) as HTMLInputElement)?.value ?? '';
      const result = await saveConfigValue(id, value);
      if (result.error) throw new Error(result.error);
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2500);
    } catch {
      alert('Error al guardar');
    } finally {
      setSavingId(null);
    }
  };

  const LABEL_MAP: Record<string, string> = {
    google_maps_link: 'Link de Opiniones Google',
    nombre_restaurante: 'Nombre del Restaurante',
    pin_validacion: 'PIN de Validación',
    visitas_para_premio: 'Visitas para Premio',
    admin_whatsapp: 'WhatsApp Admin',
    whatsapp_join_label: 'Texto botón WhatsApp',
    whatsapp_join_enabled: 'WhatsApp activo (true/false)',
    premio_visitas: 'Premio por Visitas',
    admin_email: 'Email Admin',
  };

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
          {SOCIAL_KEYS.map((clave) => {
            const meta = SOCIAL_META[clave];
            const isSaving = savingId === clave;
            const isSaved = savedId === clave;
            const entry = socials[clave];

            return (
              <div key={clave} className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center text-white shrink-0`}>
                    {meta.icon}
                  </div>
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{meta.label}</label>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={socialInputs[clave] ?? ''}
                    onChange={e => setSocialInputs(prev => ({ ...prev, [clave]: e.target.value }))}
                    placeholder={meta.placeholder}
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all text-sm"
                  />
                  <button
                    onClick={() => handleSaveSocial(clave)}
                    disabled={isSaving || !entry}
                    className={`shrink-0 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap
                      ${isSaved
                        ? 'bg-emerald-500 text-white'
                        : 'bg-travesia-gold text-[#051A10] hover:brightness-110 active:scale-95 disabled:opacity-40'
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

        <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8">
          {loading && (
            <div className="py-16 text-center opacity-40">
              <RefreshCw size={32} className="mx-auto animate-spin mb-3" />
              <p className="uppercase tracking-widest font-black text-xs">Cargando...</p>
            </div>
          )}

          {!loading && config.map((item) => {
            const isGoogle = item.clave === 'google_maps_link';
            const label = LABEL_MAP[item.clave] ?? item.clave.replace(/_/g, ' ');
            const isSaving = savingId === item.id;
            const isSaved = savedId === item.id;

            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-black uppercase tracking-[0.2em] ${isGoogle ? 'text-travesia-gold' : 'text-white/50'}`}>
                    {label}
                  </label>
                  {isGoogle && <Star size={12} className="text-travesia-gold" />}
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1 min-w-0">
                    <input
                      id={item.id}
                      type="text"
                      defaultValue={item.valor}
                      className={`w-full bg-white/5 border p-4 rounded-2xl outline-none transition-all text-sm pr-10 ${isGoogle ? 'border-travesia-gold/30 focus:border-travesia-gold' : 'border-white/10 focus:border-white/30'}`}
                      placeholder="Valor de configuración"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      {isGoogle ? <LinkIcon size={14} className="text-travesia-gold/40" /> : <Lock size={14} className="text-white/10" />}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveGeneric(item.id, item.id)}
                    disabled={isSaving}
                    className={`shrink-0 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap
                      ${isSaved
                        ? 'bg-emerald-500 text-white'
                        : isGoogle
                          ? 'bg-travesia-gold text-[#051A10] hover:brightness-110 active:scale-95'
                          : 'bg-white/5 border border-white/10 text-white/60 hover:text-travesia-gold hover:border-travesia-gold/30 active:scale-95 disabled:opacity-40'
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
          <p className="text-xs text-white/40 leading-relaxed mt-0.5">Los cambios afectan directamente la App móvil y el sistema de envíos.</p>
        </div>
      </div>

    </div>
  );
}
