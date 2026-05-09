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
  Type,
  AlertCircle,
  Megaphone,
  Trophy,
  Save
} from 'lucide-react';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'birthdays' | 'broadcast' | 'loyalty'>('birthdays');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Config state
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
    admin_email: ''
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

  // Filtrar clientes para Difusión
  const clientesFiltrados = clientes.filter(c => {
    if (!c.email) return false;
    if (config.filtro_genero === 'Todos') return true;
    return c.genero === config.filtro_genero;
  });

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

  async function handleSendBroadcast() {
    if (clientesFiltrados.length === 0) {
      alert('No hay clientes con este filtro.');
      return;
    }
    if (!confirm(`¿Enviar esta campaña a ${clientesFiltrados.length} personas?`)) return;

    setSending(true);
    try {
      const response = await fetch('/api/marketing/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: config.broadcast_asunto,
          message: config.broadcast_mensaje,
          imageUrl: config.broadcast_foto_url,
          to: 'BROADCAST',
          recipients: clientesFiltrados.map(c => c.email)
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

  return (
    <div className="space-y-8 pb-20">
      {/* Header y Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-[#4A5D4E] flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-travesia-gold" />
            Marketing Pro
          </h1>
          <p className="text-gray-500 mt-2">Gestiona la comunicación con tus clientes.</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button onClick={() => setActiveTab('birthdays')} className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'birthdays' ? 'bg-white text-travesia-green-deep shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Calendar className="w-4 h-4" /> Cumpleaños
          </button>
          <button onClick={() => setActiveTab('loyalty')} className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'loyalty' ? 'bg-white text-travesia-green-deep shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Trophy className="w-4 h-4" /> Premio Fidelidad
          </button>
          <button onClick={() => setActiveTab('broadcast')} className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'broadcast' ? 'bg-white text-travesia-green-deep shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Megaphone className="w-4 h-4" /> Difusión Masiva
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          
          {/* TAB: CUMPLEAÑOS */}
          {activeTab === 'birthdays' && (
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center border-b pb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-travesia-gold" /> Campaña de Cumpleaños
                </h2>
                <button onClick={handleSaveConfig} disabled={saving} className="bg-travesia-green-deep text-white px-6 py-2 rounded-xl font-bold text-sm hover:opacity-90 flex items-center gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Todo'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Asunto</label>
                  <input type="text" value={config.email_asunto} onChange={(e) => setConfig({...config, email_asunto: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">URL Imagen</label>
                  <input type="text" value={config.email_foto_url} onChange={(e) => setConfig({...config, email_foto_url: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none font-mono text-xs" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Mensaje</label>
                  <textarea rows={4} value={config.email_mensaje} onChange={(e) => setConfig({...config, email_mensaje: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none" />
                </div>
              </div>

              <div className="bg-travesia-green-deep/5 p-5 rounded-[24px] border border-travesia-green-deep/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-travesia-gold" />
                  <div>
                    <p className="text-sm font-bold text-travesia-green-deep">Control de Automatización</p>
                    <p className="text-[10px] text-gray-500">¿Enviar correos de esta semana ahora?</p>
                  </div>
                </div>
                <button onClick={async () => { if(!confirm('¿Ejecutar envío semanal?')) return; setLoading(true); try { const res = await fetch('/api/cron/birthdays'); const data = await res.json(); alert(data.message); } catch (e) { alert('Error'); } finally { setLoading(false); } }} className="px-4 py-2 bg-white text-travesia-green-deep border border-travesia-green-deep/20 rounded-xl text-xs font-bold hover:bg-travesia-green-deep hover:text-white transition-all">Ejecutar YA</button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4" /> Destinatarios de esta semana</h3>
                {cumpleañerosSemana.length === 0 ? <p className="text-sm text-gray-400 italic">No hay cumpleaños.</p> : (
                  <div className="overflow-hidden border border-gray-50 rounded-2xl">
                    <table className="w-full text-left text-xs"><thead className="bg-gray-50 text-gray-400 uppercase"><tr><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Fecha</th></tr></thead><tbody className="divide-y divide-gray-50">{cumpleañerosSemana.map((c, i) => (<tr key={i} className="hover:bg-gray-50"><td className="px-4 py-3 font-bold text-gray-700">{c.nombre} {c.apellido}</td><td className="px-4 py-3"><span className="bg-pink-50 text-pink-600 px-2 py-1 rounded-md font-bold">{new Date(c.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span></td></tr>))}</tbody></table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PREMIO FIDELIDAD */}
          {activeTab === 'loyalty' && (
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center border-b pb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-amber-500" /> Correo de Premio Ganado
                </h2>
                <button onClick={handleSaveConfig} disabled={saving} className="bg-travesia-green-deep text-white px-6 py-2 rounded-xl font-bold text-sm hover:opacity-90 flex items-center gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Todo'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Asunto del Premio</label>
                  <input type="text" value={config.email_premio_asunto} onChange={(e) => setConfig({...config, email_premio_asunto: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">URL Imagen del Premio</label>
                  <input type="text" value={config.email_premio_foto_url} onChange={(e) => setConfig({...config, email_premio_foto_url: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none font-mono text-xs" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Mensaje de Felicitación</label>
                  <textarea rows={4} value={config.email_premio_mensaje} onChange={(e) => setConfig({...config, email_premio_mensaje: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* TAB: DIFUSIÓN MASIVA */}
          {activeTab === 'broadcast' && (
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center border-b pb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Megaphone className="w-6 h-6 text-blue-500" /> Difusión de un solo toque
                </h2>
                <div className="flex items-center gap-3">
                  <button onClick={handleSaveConfig} disabled={saving} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 flex items-center gap-2">
                    <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Plantilla'}
                  </button>
                  <select value={config.filtro_genero} onChange={(e) => setConfig({...config, filtro_genero: e.target.value})} className="bg-travesia-green-deep text-white rounded-xl px-4 py-2 font-bold text-xs border-none outline-none">
                    <option value="Todos">Enviar a Todos</option>
                    <option value="Femenino">Solo Mujeres 👩</option>
                    <option value="Masculino">Solo Hombres 👨</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Asunto de esta promo</label>
                  <input type="text" value={config.broadcast_asunto} onChange={(e) => setConfig({...config, broadcast_asunto: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">URL Imagen Promo</label>
                  <input type="text" value={config.broadcast_foto_url} onChange={(e) => setConfig({...config, broadcast_foto_url: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none font-mono text-xs focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Mensaje de la Campaña</label>
                  <textarea rows={4} value={config.broadcast_mensaje} onChange={(e) => setConfig({...config, broadcast_mensaje: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button onClick={handleSendBroadcast} disabled={sending} className="w-full bg-travesia-green-deep text-white py-6 rounded-3xl font-black text-lg shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-4 disabled:opacity-50">
                {sending ? <Loader2 className="animate-spin w-6 h-6" /> : <Send className="w-6 h-6 text-travesia-gold" />}
                ENVIAR A {clientesFiltrados.length} CLIENTES AHORA
              </button>
            </div>
          )}
        </div>

        {/* VISTA PREVIA */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-4"><Eye className="w-4 h-4" /> Previsualización</h3>
          <div className="relative mx-auto w-[320px] h-[600px] bg-black rounded-[50px] border-[10px] border-gray-900 shadow-2xl overflow-hidden ring-1 ring-white/10">
            <div className="absolute top-0 w-full h-8 bg-black flex justify-center items-end"><div className="w-24 h-5 bg-gray-900 rounded-b-2xl" /></div>
            <div className="h-full bg-[#f8f5f0] overflow-y-auto pt-10">
              <div className="bg-white m-3 rounded-[24px] shadow-sm overflow-hidden border border-gray-200/50">
                <div className="aspect-square relative">
                  <img src={activeTab === 'birthdays' ? config.email_foto_url : activeTab === 'loyalty' ? config.email_premio_foto_url : config.broadcast_foto_url} className="w-full h-full object-cover" alt="Preview" onError={(e: any) => e.target.src = 'https://images.unsplash.com/photo-1513151233558-d860c5398176'} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                    <h4 className="text-white font-serif text-xl leading-tight">{activeTab === 'birthdays' ? config.email_asunto : activeTab === 'loyalty' ? config.email_premio_asunto : config.broadcast_asunto}</h4>
                  </div>
                </div>
                <div className="p-6 space-y-4 text-center">
                  <p className="font-serif italic text-gray-900 text-lg">Hola, Cliente!</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{(activeTab === 'birthdays' ? config.email_mensaje : activeTab === 'loyalty' ? config.email_premio_mensaje : config.broadcast_mensaje).replace('{nombre}', 'Amigo/a')}</p>
                  <div className="pt-4 border-t border-gray-50"><button className="w-full bg-[#4A5D4E] text-white py-4 rounded-xl font-bold text-sm tracking-widest shadow-lg uppercase">Reclamar ahora</button></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
