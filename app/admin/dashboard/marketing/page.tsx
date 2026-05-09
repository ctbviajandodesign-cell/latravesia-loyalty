'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  Send, 
  Calendar, 
  Users, 
  Eye, 
  Sparkles,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  AlertCircle,
  Megaphone,
  Trophy,
  Save,
  Wand2
} from 'lucide-react';

// Función mágica para arreglar links de Unsplash y otros
const formatImageUrl = (url: string) => {
  if (!url) return '';
  
  // 1. Detectar ID de Unsplash en CUALQUIER tipo de link de página
  const unsplashPageRegex = /unsplash\.com\/.*?(?:fotos|photos)\/([a-zA-Z0-9_-]+)/;
  const match = url.match(unsplashPageRegex);
  if (match && match[1]) {
    // Usamos el endpoint de descarga que acepta el ID corto perfectamente
    return `https://unsplash.com/photos/${match[1]}/download?w=1000`;
  }

  // 2. Detectar ID en nombres de archivo (ej: juan-marca-e4kmTGIQFIw-unsplash)
  const fileRegex = /([a-zA-Z0-9_-]{11})-unsplash/;
  const fileMatch = url.match(fileRegex);
  if (fileMatch && fileMatch[1]) {
    return `https://unsplash.com/photos/${fileMatch[1]}/download?w=1000`;
  }
  
  return url;
};

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'birthdays' | 'broadcast' | 'loyalty'>('birthdays');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [config, setConfig] = useState<any>({
    email_asunto: '',
    email_mensaje: '',
    email_foto_url: '',
    email_premio_asunto: '',
    email_premio_mensaje: '',
    email_premio_foto_url: '',
    broadcast_asunto: '',
    broadcast_mensaje: '',
    broadcast_foto_url: '',
    admin_email: '',
    google_maps_link: '',
    filtro_genero: 'Todos'
  });

  const [clientes, setClientes] = useState<any[]>([]);
  const [cumpleañerosSemana, setCumpleañerosSemana] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: configData } = await supabase.from('config').select('*');
      const configObj = configData?.reduce((acc: any, item: any) => {
        acc[item.clave] = item.valor;
        return acc;
      }, {});
      
      setConfig({
        email_asunto: configObj?.email_asunto || '¡Feliz Cumpleaños! 🎂',
        email_mensaje: configObj?.email_mensaje || 'Queremos celebrarlo contigo...',
        email_foto_url: configObj?.email_foto_url || 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
        email_premio_asunto: configObj?.email_premio_asunto || '¡Felicidades por tu fidelidad! 🏆',
        email_premio_mensaje: configObj?.email_premio_mensaje || 'Has completado tus visitas. ¡Tu fidelidad tiene premio!',
        email_premio_foto_url: configObj?.email_premio_foto_url || 'https://images.unsplash.com/photo-1513151233558-d860c5398176',
        broadcast_asunto: configObj?.broadcast_asunto || '¡Nueva Sorpresa en La Travesía! 🎁',
        broadcast_mensaje: configObj?.broadcast_mensaje || 'Hola {nombre}, tenemos algo especial...',
        broadcast_foto_url: configObj?.broadcast_foto_url || 'https://images.unsplash.com/photo-1559339352-11d035aa65de',
        admin_email: configObj?.admin_email || '',
        google_maps_link: configObj?.google_maps_link || '',
        filtro_genero: 'Todos'
      });

      const { data: todos } = await supabase.from('clientes').select('*');
      setClientes(todos || []);

      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const filteredBirthdays = todos?.filter(c => {
        if (!c.fecha_nacimiento) return false;
        const [, m, d] = c.fecha_nacimiento.split('-').map(Number);
        const bday = new Date(today.getFullYear(), m - 1, d);
        return bday >= startOfWeek && bday <= endOfWeek;
      }) || [];
      
      setCumpleañerosSemana(filteredBirthdays);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveConfig() {
    setSaving(true);
    try {
      const updates = Object.entries(config).map(([clave, valor]) => ({ clave, valor }));
      await supabase.from('config').upsert(updates, { onConflict: 'clave' });
      setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleForzarEnvioCumpleaños() {
    if (!confirm('¿Seguro que quieres enviar los correos de cumpleaños de esta semana ahora mismo?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/cron/birthdays');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      alert(data.message || `Éxito: Se procesaron los envíos.`);
      fetchData(); // Recargar lista
    } catch (e: any) {
      alert('Error al ejecutar: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendBroadcast() {
    const recips = clientes.filter(c => c.email && (config.filtro_genero === 'Todos' || c.genero === config.filtro_genero));
    if (recips.length === 0) { alert('No hay clientes.'); return; }
    if (!confirm(`¿Enviar a ${recips.length} personas?`)) return;

    setSending(true);
    try {
      const response = await fetch('/api/marketing/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: config.broadcast_asunto,
          message: config.broadcast_mensaje,
          imageUrl: formatImageUrl(config.broadcast_foto_url), // CORREGIDO AQUÍ
          to: 'BROADCAST',
          recipients: recips.map(c => c.email)
        })
      });
      if (!response.ok) throw new Error('Error al enviar');
      setMessage({ type: 'success', text: `¡Campaña enviada con éxito!` });
      setTimeout(() => setMessage(null), 5000);
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Error al enviar.' });
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-travesia-green-deep" /></div>;

  const currentPreviewImg = formatImageUrl(activeTab === 'birthdays' ? config.email_foto_url : activeTab === 'loyalty' ? config.email_premio_foto_url : config.broadcast_foto_url);
  const currentPreviewSubject = activeTab === 'birthdays' ? config.email_asunto : activeTab === 'loyalty' ? config.email_premio_asunto : config.broadcast_asunto;
  const currentPreviewMsg = activeTab === 'birthdays' ? config.email_mensaje : activeTab === 'loyalty' ? config.email_premio_mensaje : config.broadcast_mensaje;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-[#4A5D4E] flex items-center gap-3"><Sparkles className="w-10 h-10 text-travesia-gold" /> Marketing Pro</h1>
          <p className="text-gray-500 mt-2">Centro de automatización y comunicación.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button onClick={() => setActiveTab('birthdays')} className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'birthdays' ? 'bg-white text-travesia-green-deep shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Calendar className="w-4 h-4" /> Cumpleaños</button>
          <button onClick={() => setActiveTab('loyalty')} className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'loyalty' ? 'bg-white text-travesia-green-deep shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Trophy className="w-4 h-4" /> Premio Fidelidad</button>
          <button onClick={() => setActiveTab('broadcast')} className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'broadcast' ? 'bg-white text-travesia-green-deep shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Megaphone className="w-4 h-4" /> Difusión Masiva</button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          
          {/* EDITORES */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center border-b pb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {activeTab === 'birthdays' ? <Sparkles className="w-6 h-6 text-travesia-gold" /> : activeTab === 'loyalty' ? <Trophy className="w-6 h-6 text-amber-500" /> : <Megaphone className="w-6 h-6 text-blue-500" />}
                {activeTab === 'birthdays' ? 'Campaña de Cumpleaños' : activeTab === 'loyalty' ? 'Premio Ganado' : 'Difusión Masiva'}
              </h2>
              <div className="flex items-center gap-3">
                {activeTab === 'broadcast' && (
                  <select value={config.filtro_genero} onChange={(e) => setConfig({...config, filtro_genero: e.target.value})} className="bg-travesia-green-deep text-white rounded-xl px-4 py-2 font-bold text-xs border-none outline-none">
                    <option value="Todos">Enviar a Todos</option>
                    <option value="Femenino">Mujeres 👩</option>
                    <option value="Masculino">Hombres 👨</option>
                  </select>
                )}
                <button onClick={handleSaveConfig} disabled={saving} className="bg-travesia-green-deep text-white px-6 py-2 rounded-xl font-bold text-sm hover:opacity-90 flex items-center gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Todo'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Asunto</label>
                <input type="text" value={activeTab === 'birthdays' ? config.email_asunto : activeTab === 'loyalty' ? config.email_premio_asunto : config.broadcast_asunto} onChange={(e) => setConfig({...config, [activeTab === 'birthdays' ? 'email_asunto' : activeTab === 'loyalty' ? 'email_premio_asunto' : 'broadcast_asunto']: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex justify-between">
                  URL Imagen
                  <button 
                    onClick={() => {
                      const key = activeTab === 'birthdays' ? 'email_foto_url' : activeTab === 'loyalty' ? 'email_premio_foto_url' : 'broadcast_foto_url';
                      const currentVal = config[key];
                      // Forzar actualización disparando el formateador
                      setConfig({...config, [key]: formatImageUrl(currentVal)});
                      alert('¡Link procesado! Si era un link de Unsplash, ahora debería verse en el preview.');
                    }}
                    className="text-travesia-gold hover:text-travesia-gold/80 flex items-center gap-1 text-[10px] uppercase tracking-tighter"
                  >
                    <Wand2 className="w-3 h-3" /> Arreglo Mágico
                  </button>
                </label>
                <input type="text" value={activeTab === 'birthdays' ? config.email_foto_url : activeTab === 'loyalty' ? config.email_premio_foto_url : config.broadcast_foto_url} onChange={(e) => setConfig({...config, [activeTab === 'birthdays' ? 'email_foto_url' : activeTab === 'loyalty' ? 'email_premio_foto_url' : 'broadcast_foto_url']: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none font-mono text-xs" placeholder="https://..." />
                <p className="text-[10px] text-gray-400 ml-2 italic">Cualquier link de Unsplash se arreglará solo.</p>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Mensaje</label>
                <textarea rows={4} value={activeTab === 'birthdays' ? config.email_mensaje : activeTab === 'loyalty' ? config.email_premio_mensaje : config.broadcast_mensaje} onChange={(e) => setConfig({...config, [activeTab === 'birthdays' ? 'email_mensaje' : activeTab === 'loyalty' ? 'email_premio_mensaje' : 'broadcast_mensaje']: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none" />
              </div>
            </div>

            {activeTab === 'loyalty' && (
              <div className="pt-8 border-t space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Link de Reseña en Google Maps</label>
                  <input type="text" value={config.google_maps_link} onChange={(e) => setConfig({...config, google_maps_link: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none" placeholder="https://g.page/r/..." />
                  <p className="text-[10px] text-gray-400 ml-2">Este link aparecerá a los clientes fieles (2+ visitas) para pedirles una reseña.</p>
                </div>
              </div>
            )}

            {activeTab === 'birthdays' && (
              <div className="pt-8 border-t space-y-8">
                <div className="bg-travesia-green-deep/5 p-6 rounded-[32px] border border-travesia-green-deep/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4"><Calendar className="w-8 h-8 text-travesia-gold" /><div><p className="text-sm font-bold text-travesia-green-deep">Disparo Manual</p><p className="text-xs text-gray-500">Envía los correos de esta semana ahora mismo.</p></div></div>
                  <button onClick={handleForzarEnvioCumpleaños} className="px-6 py-3 bg-white text-travesia-green-deep border border-travesia-green-deep/20 rounded-2xl text-xs font-bold hover:bg-travesia-green-deep hover:text-white transition-all shadow-sm">EJECUTAR ENVÍO YA</button>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-2"><Users className="w-4 h-4" /> Destinatarios de la semana</h3>
                  {cumpleañerosSemana.length === 0 ? <p className="text-sm text-gray-400 italic px-2">No hay cumpleaños.</p> : (
                    <div className="overflow-hidden border border-gray-50 rounded-[24px]"><table className="w-full text-left text-xs"><thead className="bg-gray-50 text-gray-400 uppercase"><tr><th className="px-6 py-4">Cliente</th><th className="px-6 py-4 text-right">Fecha</th></tr></thead><tbody className="divide-y divide-gray-50">{cumpleañerosSemana.map((c, i) => (<tr key={i} className="hover:bg-gray-50/50"><td className="px-6 py-4 font-bold text-gray-700">{c.nombre} {c.apellido}</td><td className="px-6 py-4 text-right"><span className="bg-travesia-gold/10 text-travesia-green-deep px-3 py-1.5 rounded-xl font-bold">{new Date(c.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span></td></tr>))}</tbody></table></div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'broadcast' && (
              <button onClick={handleSendBroadcast} disabled={sending} className="w-full bg-travesia-green-deep text-white py-6 rounded-[32px] font-black text-lg shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-4 disabled:opacity-50">
                {sending ? <Loader2 className="animate-spin w-6 h-6" /> : <Send className="w-6 h-6 text-travesia-gold" />}
                ENVIAR CAMPAÑA AHORA
              </button>
            )}
          </div>
        </div>

        {/* VISTA PREVIA */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-4"><Eye className="w-4 h-4" /> Previsualización</h3>
          <div className="relative mx-auto w-[320px] h-[600px] bg-black rounded-[50px] border-[10px] border-gray-900 shadow-2xl overflow-hidden">
            <div className="h-full bg-[#f8f5f0] overflow-y-auto pt-10 px-4">
              <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-gray-200/50">
                <div className="aspect-square relative bg-gray-100">
                  <img key={currentPreviewImg} src={currentPreviewImg} className="w-full h-full object-cover" alt="Preview" onError={(e: any) => e.target.src = 'https://images.unsplash.com/photo-1513151233558-d860c5398176'} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                    <h4 className="text-white font-serif text-lg leading-tight">{currentPreviewSubject}</h4>
                  </div>
                </div>
                <div className="p-6 space-y-4 text-center">
                  <p className="font-serif italic text-gray-900 text-lg">Hola, Cliente!</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{currentPreviewMsg.replace('{nombre}', 'Amigo/a')}</p>
                  <div className="pt-4 border-t border-gray-50"><button className="w-full bg-[#4A5D4E] text-white py-4 rounded-xl font-bold text-xs tracking-widest uppercase shadow-lg">Reclamar ahora</button></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
