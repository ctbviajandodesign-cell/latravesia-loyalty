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
  Phone
} from 'lucide-react';

export default function MarketingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [config, setConfig] = useState({
    email_asunto: '',
    email_mensaje: '',
    email_foto_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2070&auto=format&fit=crop',
    admin_email: ''
  });
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
        email_asunto: configObj?.email_asunto || '¡Feliz Semana de tu Cumpleaños! 🎂',
        email_mensaje: configObj?.email_mensaje || 'Hola {nombre}, queremos invitarte a celebrar tu semana especial con nosotros...',
        email_foto_url: configObj?.email_foto_url || 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2070&auto=format&fit=crop',
        admin_email: configObj?.admin_email || ''
      });

      const { data: clientes } = await supabase.from('clientes').select('nombre, apellido, telefono, fecha_nacimiento');
      
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo
      
      const filtered = clientes?.filter(c => {
        if (!c.fecha_nacimiento) return false;
        const [, m, d] = c.fecha_nacimiento.split('-').map(Number);
        const bday = new Date(today.getFullYear(), m - 1, d);
        return bday >= startOfWeek && bday <= endOfWeek;
      }) || [];
      
      setCumpleañerosSemana(filtered);
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
      const { error } = await supabase.from('config').upsert(updates, { onConflict: 'clave' });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Campaña actualizada correctamente.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestSend() {
    if (!config.admin_email) {
      setMessage({ type: 'error', text: 'Configura un correo de administrador primero.' });
      return;
    }

    setTestSending(true);
    try {
      const response = await fetch('/api/marketing/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: config.email_asunto,
          message: config.email_mensaje,
          imageUrl: config.email_foto_url,
          to: config.admin_email
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setMessage({ type: 'success', text: `¡Correo enviado de verdad a ${config.admin_email}!` });
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      setMessage({ type: 'error', text: `Error al enviar: ${error.message}` });
    } finally {
      setTestSending(false);
    }
  }

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-travesia-green-deep" /></div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#4A5D4E] flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-travesia-gold" />
            Centro de Marketing v2.6
          </h1>
          <p className="text-gray-600 mt-1">Personaliza y gestiona tus campañas automáticas.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleTestSend}
            disabled={testSending || !config.admin_email}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
          >
            {testSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-travesia-green-deep" />}
            {config.admin_email ? `Prueba a ${config.admin_email}` : 'Falta Correo Admin'}
          </button>
          <button 
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-8 py-3 bg-[#4A5D4E] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-[#3D4D40] shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Guardar Cambios
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Editor de Contenido */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-travesia-gold" /> Personalizar Mensaje
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Asunto del Email</label>
                <input 
                  type="text"
                  value={config.email_asunto}
                  onChange={(e) => setConfig({...config, email_asunto: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-travesia-gold outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Imagen de Cabecera (URL)</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={config.email_foto_url}
                    onChange={(e) => setConfig({...config, email_foto_url: e.target.value})}
                    placeholder="Pega aquí el link de tu imagen..."
                    className="flex-1 px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-travesia-gold outline-none transition-all font-mono text-xs"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                    <img src={config.email_foto_url} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Cuerpo del Mensaje</label>
                <textarea 
                  rows={6}
                  value={config.email_mensaje}
                  onChange={(e) => setConfig({...config, email_mensaje: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-travesia-gold outline-none transition-all"
                />
                <p className="text-xs text-gray-400">Usa <b>{"{nombre}"}</b> para que el sistema ponga el nombre del cliente.</p>
              </div>
            </div>
          </div>

          {/* Lista de Destinatarios */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" /> Destinatarios de esta Semana
            </h2>
            
            {cumpleañerosSemana.length === 0 ? (
              <div className="py-8 text-center text-gray-400 italic">No hay cumpleaños programados para esta semana.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      <th className="pb-4 px-2">Cliente</th>
                      <th className="pb-4 px-2">Teléfono</th>
                      <th className="pb-4 px-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cumpleañerosSemana.map((c, i) => (
                      <tr key={i} className="text-sm hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-2 font-bold text-gray-900">{c.nombre} {c.apellido}</td>
                        <td className="py-4 px-2 text-gray-500 font-mono text-xs">+{c.telefono}</td>
                        <td className="py-4 px-2">
                          <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full font-bold text-[10px] uppercase">
                            {new Date(c.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Vista Previa Móvil */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-4">
            <Eye className="w-4 h-4" /> Vista Previa
          </h2>
          
          <div className="relative mx-auto w-[320px] h-[600px] bg-black rounded-[48px] border-[8px] border-gray-800 shadow-2xl overflow-hidden">
            <div className="absolute top-0 w-full h-6 bg-black flex justify-center items-end">
              <div className="w-20 h-4 bg-gray-800 rounded-b-xl" />
            </div>
            <div className="h-full bg-gray-100 overflow-y-auto pt-8">
              <div className="bg-white m-2 rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                <div className="aspect-[4/3] bg-gray-200 relative">
                  <img 
                    src={config.email_foto_url} 
                    alt="Birthday"
                    className="w-full h-full object-cover"
                    onError={(e: any) => e.target.src = 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2070&auto=format&fit=crop'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                    <h3 className="text-white font-serif text-xl leading-tight">{config.email_asunto}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="font-serif text-lg text-gray-900 italic">¡Hola, {cumpleañerosSemana[0]?.nombre || 'Cliente'}!</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {config.email_mensaje.replace('{nombre}', cumpleañerosSemana[0]?.nombre || 'Cliente')}
                  </p>
                  <div className="pt-4">
                    <button className="w-full bg-[#4A5D4E] text-white py-4 rounded-xl font-bold text-sm shadow-lg">
                      RESERVAR MI MESA
                    </button>
                  </div>
                  <div className="text-[9px] text-center text-gray-400 uppercase tracking-widest pt-4 border-t border-gray-100">
                    Hostería La Travesía<br/>Solo Sábados y Domingos
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400">Así es como tus clientes verán el correo en su celular.</p>
        </div>
      </div>
    </div>
  );
}
