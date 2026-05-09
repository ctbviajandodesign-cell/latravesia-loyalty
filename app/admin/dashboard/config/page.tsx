'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Settings, 
  Instagram, 
  Facebook, 
  Music, 
  MessageCircle, 
  Lock, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trophy
} from 'lucide-react';

export default function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [config, setConfig] = useState({
    link_instagram: '',
    link_facebook: '',
    link_tiktok: '',
    link_whatsapp: '',
    visitas_para_premio: '10',
    admin_password: ''
  });

  // const supabase = createClientComponentClient();

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const { data, error } = await supabase.from('config').select('*');
      if (error) throw error;

      if (data) {
        const configObj = data.reduce((acc: any, item: any) => {
          acc[item.clave] = item.valor;
          return acc;
        }, {});
        setConfig(prev => ({ ...prev, ...configObj }));
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updates = Object.entries(config).map(([clave, valor]) => ({
        clave,
        valor
      }));

      const { error } = await supabase
        .from('config')
        .upsert(updates, { onConflict: 'clave' });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#4A5D4E]" />
        <p className="text-gray-500">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-[#4A5D4E] flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Configuración General
        </h1>
        <p className="text-gray-600 mt-1">Personaliza el comportamiento y los enlaces de tu sistema.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Redes Sociales */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Redes Sociales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-600" /> Instagram URL
              </label>
              <input 
                type="url"
                value={config.link_instagram}
                onChange={(e) => setConfig({...config, link_instagram: e.target.value})}
                placeholder="https://instagram.com/tuperfil"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A5D4E] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600" /> Facebook URL
              </label>
              <input 
                type="url"
                value={config.link_facebook}
                onChange={(e) => setConfig({...config, link_facebook: e.target.value})}
                placeholder="https://facebook.com/tupagina"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A5D4E] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Music className="w-4 h-4 text-black" /> TikTok URL
              </label>
              <input 
                type="url"
                value={config.link_tiktok}
                onChange={(e) => setConfig({...config, link_tiktok: e.target.value})}
                placeholder="https://tiktok.com/@tuusuario"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A5D4E] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp URL
              </label>
              <input 
                type="url"
                value={config.link_whatsapp}
                onChange={(e) => setConfig({...config, link_whatsapp: e.target.value})}
                placeholder="https://wa.me/tunumero"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A5D4E] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Lógica de Fidelidad */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Sistema de Fidelidad</h2>
          
          <div className="space-y-2 max-w-sm">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Visitas para Premio VIP
            </label>
            <input 
              type="number"
              value={config.visitas_para_premio}
              onChange={(e) => setConfig({...config, visitas_para_premio: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A5D4E] outline-none"
            />
            <p className="text-xs text-gray-500">Cuántas visitas acumuladas necesita un cliente para ganar un premio especial de lealtad.</p>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2 text-red-600">Seguridad</h2>
          
          <div className="space-y-2 max-w-sm">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Cambiar Contraseña del Panel
            </label>
            <input 
              type="text"
              value={config.admin_password}
              onChange={(e) => setConfig({...config, admin_password: e.target.value})}
              placeholder="Nueva contraseña"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A5D4E] outline-none"
            />
            <p className="text-xs text-gray-500 italic">Ten cuidado al cambiarla, asegúrate de recordarla.</p>
          </div>
        </div>

        <button 
          type="submit"
          disabled={saving}
          className="w-full bg-[#4A5D4E] text-white py-4 rounded-2xl font-bold hover:bg-[#3D4D40] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1"
        >
          {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> Guardar Todos los Cambios</>}
        </button>
      </form>
    </div>
  );
}
