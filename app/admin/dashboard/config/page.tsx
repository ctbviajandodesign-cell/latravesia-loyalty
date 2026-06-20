'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { upsertConfigByClave } from '@/app/actions/config';
import {
  Settings, RefreshCw, CheckCircle2, ShieldCheck, Star,
  Instagram, Facebook, Music2, Smartphone, Save, Link as LinkIcon, Lock
} from 'lucide-react';

const SOCIAL_DEFS = [
  { clave: 'instagram_link', label: 'Instagram',      bg: 'bg-[#111111]', placeholder: 'https://www.instagram.com/tu_cuenta/' },
  { clave: 'facebook_link',  label: 'Facebook',       bg: 'bg-[#1877F2]',  placeholder: 'https://www.facebook.com/tu_pagina/' },
  { clave: 'tiktok_link',    label: 'TikTok',         bg: 'bg-black',      placeholder: 'https://www.tiktok.com/@tu_cuenta' },
  { clave: 'whatsapp_group_link', label: 'WhatsApp Grupo', bg: 'bg-[#25D366]', placeholder: 'https://chat.whatsapp.com/...' },
];

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram_link:     <Instagram size={18} />,
  facebook_link:      <Facebook size={18} />,
  tiktok_link:        <Music2 size={18} />,
  whatsapp_group_link: <Smartphone size={18} />,
};

const GENERAL_KEYS = [
  'google_maps_link', 'nombre_restaurante', 'visitas_para_premio',
  'admin_whatsapp', 'admin_email', 'whatsapp_join_label',
  'whatsapp_join_enabled', 'premio_visitas',
];

const GENERAL_LABELS: Record<string, string> = {
  google_maps_link:     'Link de Opiniones Google',
  nombre_restaurante:   'Nombre del Restaurante',
  visitas_para_premio:  'Visitas para Premio',
  admin_whatsapp:       'WhatsApp Admin',
  admin_email:          'Email Admin',
  whatsapp_join_label:  'Texto botón WhatsApp registro',
  whatsapp_join_enabled:'WhatsApp activo (true/false)',
  premio_visitas:       'Premio por Visitas',
};

export default function ConfigPage() {
  const [socialInputs, setSocialInputs]   = useState<Record<string, string>>({});
  const [generalItems, setGeneralItems]   = useState<string[]>([]);
  const [generalInputs, setGeneralInputs] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey]   = useState<string | null>(null);

  useEffect(() => { loadConfig(); }, []);

  async function loadConfig() {
    try {
      const { data } = await supabase.from('config').select('*');
      if (!data) return;

      const map: Record<string, string> = {};
      data.forEach((row: any) => { map[row.clave] = row.valor ?? ''; });

      // Social: clave canónica
      const si: Record<string, string> = {};
      SOCIAL_DEFS.forEach(({ clave }) => {
        si[clave] = map[clave] || '';
      });
      setSocialInputs(si);

      // General: solo las claves de GENERAL_KEYS
      const gi: string[] = [];
      const gInputs: Record<string, string> = {};
      GENERAL_KEYS.forEach(clave => {
        gi.push(clave);
        gInputs[clave] = map[clave] || '';
      });
      setGeneralItems(gi);
      setGeneralInputs(gInputs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveSocial(clave: string) {
    setSavingKey(clave);
    try {
      const r = await upsertConfigByClave(clave, socialInputs[clave] ?? '');
      if (r.error) throw new Error(r.error);
      setSavedKey(clave);
      setTimeout(() => setSavedKey(null), 2500);
    } catch { alert('Error al guardar'); }
    finally { setSavingKey(null); }
  }

  async function saveGeneral(clave: string) {
    setSavingKey(clave);
    try {
      const r = await upsertConfigByClave(clave, generalInputs[clave] ?? '');
      if (r.error) throw new Error(r.error);
      setSavedKey(clave);
      setTimeout(() => setSavedKey(null), 2500);
    } catch { alert('Error al guardar'); }
    finally { setSavingKey(null); }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <RefreshCw className="animate-spin text-white w-8 h-8" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-10">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white">
          <Settings size={20} />
        </div>
        <div>
          <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Parámetros Globales</h2>
          <p className="text-white/40 text-sm">Links de redes sociales y ajustes técnicos.</p>
        </div>
      </div>

      {/* ── REDES SOCIALES ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-1.5 h-6 bg-white text-black rounded-full" />
          <h3 className="text-xl font-serif font-bold text-white">Redes Sociales</h3>
        </div>
        <div className="bg-[#111111]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 space-y-6 shadow-2xl">
          {SOCIAL_DEFS.map(({ clave, label, bg, placeholder }) => {
            const isSaving = savingKey === clave;
            const isSaved  = savedKey  === clave;
            return (
              <div key={clave} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center text-white shrink-0`}>
                    {SOCIAL_ICONS[clave]}
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{label}</span>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={socialInputs[clave] ?? ''}
                    onChange={e => setSocialInputs(p => ({ ...p, [clave]: e.target.value }))}
                    placeholder={placeholder}
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-white/20 transition-all text-sm"
                  />
                  <button
                    onClick={() => saveSocial(clave)}
                    disabled={isSaving}
                    className={`shrink-0 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 disabled:opacity-50
                      ${isSaved ? 'bg-emerald-500 text-white' : 'bg-[#111111] text-white border border-white/20 hover:brightness-110'}`}
                  >
                    {isSaving ? <RefreshCw size={14} className="animate-spin" />
                      : isSaved ? <><CheckCircle2 size={14} />Guardado</>
                      : <><Save size={14} />Guardar</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CONFIGURACIÓN GENERAL ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-1.5 h-6 bg-white/20 rounded-full" />
          <h3 className="text-xl font-serif font-bold text-white">Configuración General</h3>
        </div>
        <div className="bg-[#111111]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-6">
          {generalItems.map((clave) => {
            const isGoogle = clave === 'google_maps_link';
            const isSaving = savingKey === clave;
            const isSaved  = savedKey  === clave;
            return (
              <div key={clave} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black uppercase tracking-[0.2em] ${isGoogle ? 'text-white' : 'text-white/50'}`}>
                    {GENERAL_LABELS[clave] ?? clave}
                  </span>
                  {isGoogle && <Star size={12} className="text-white" />}
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      value={generalInputs[clave] ?? ''}
                      onChange={e => setGeneralInputs(p => ({ ...p, [clave]: e.target.value }))}
                      placeholder="Valor de configuración"
                      className={`w-full bg-white/5 border p-4 rounded-2xl outline-none transition-all text-sm pr-10
                        ${isGoogle ? 'border-white/30 focus:border-white/20' : 'border-white/10 focus:border-white/30'}`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      {isGoogle ? <LinkIcon size={14} className="text-white/40" /> : <Lock size={14} className="text-white/10" />}
                    </div>
                  </div>
                  <button
                    onClick={() => saveGeneral(clave)}
                    disabled={isSaving}
                    className={`shrink-0 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 disabled:opacity-50
                      ${isSaved ? 'bg-emerald-500 text-white'
                        : isGoogle ? 'bg-[#111111] text-white border border-white/20 hover:brightness-110'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30'}`}
                  >
                    {isSaving ? <RefreshCw size={14} className="animate-spin" />
                      : isSaved ? <><CheckCircle2 size={14} />Guardado</>
                      : <><Save size={14} />Guardar</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
