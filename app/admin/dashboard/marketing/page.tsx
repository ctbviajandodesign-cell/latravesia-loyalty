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
  Filter,
  ArrowRight
} from 'lucide-react';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'birthdays' | 'broadcast'>('birthdays');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Config para Cumpleaños
  const [config, setConfig] = useState({
    email_asunto: '',
    email_mensaje: '',
    email_foto_url: '',
    admin_email: ''
  });

  // Config para Difusión Masiva (Broadcast)
  const [broadcast, setBroadcast] = useState({
    asunto: '¡Nueva Sorpresa en La Travesía! 🎁',
    mensaje: 'Hola {nombre}, tenemos algo especial para ti este fin de semana...',
    foto_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop',
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
        admin_email: configObj?.admin_email || ''
      });

      const { data: todos } = await supabase.from('clientes').select('nombre, apellido, email, telefono, fecha_nacimiento, genero');
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
    if (broadcast.filtro_genero === 'Todos') return true;
    return c.genero === broadcast.filtro_genero;
  });

  async function handleSaveBirthdayConfig() {
    setSaving(true);
    try {
      const updates = Object.entries(config).map(([clave, valor]) => ({ clave, valor }));
      await supabase.from('config').upsert(updates, { onConflict: 'clave' });
      setMessage({ type: 'success', text: 'Campaña de cumpleaños guardada.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleSendBroadcast() {
    if (clientesFiltrados.length === 0) {
      alert('No hay clientes que cumplan con el filtro seleccionado.');
      return;
    }

    if (!confirm(`¿Estás seguro de enviar esta campaña a ${clientesFiltrados.length} clientes?`)) return;

    setSending(true);
    try {
      // Usamos el mismo API de test-send pero adaptado para múltiples
      const response = await fetch('/api/marketing/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: broadcast.asunto,
          message: broadcast.mensaje,
          imageUrl: broadcast.foto_url,
          to: 'BROADCAST', // Identificador para el backend si queremos enviar a varios
          recipients: clientesFiltrados.map(c => c.email)
        })
      });

      if (!response.ok) throw new Error('Error en el servidor');

      setMessage({ type: 'success', text: `¡Campaña enviada con éxito a ${clientesFiltrados.length} personas!` });
      setTimeout(() => setMessage(null), 5000);
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Error al enviar masivo.' });
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
          <button 
            onClick={() => setActiveTab('birthdays')}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'birthdays' ? 'bg-white text-travesia-green-deep shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Calendar className="w-4 h-4" /> Cumpleaños
          </button>
          <button 
            onClick={() => setActiveTab('broadcast')}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'broadcast' ? 'bg-white text-travesia-green-deep shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
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
        {/* Lado Izquierdo: Editores */}
        <div className="xl:col-span-2 space-y-8">
          
          {activeTab === 'birthdays' ? (
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center border-b pb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-travesia-gold" /> Campaña de Cumpleaños
                </h2>
                <button 
                  onClick={handleSaveBirthdayConfig}
                  disabled={saving}
                  className="bg-travesia-green-deep text-white px-6 py-2 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Todo'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Asunto del Email</label>
                  <input 
                    type="text" 
                    value={config.email_asunto}
                    onChange={(e) => setConfig({...config, email_asunto: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-travesia-gold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">URL Imagen Cabecera</label>
                  <input 
                    type="text" 
                    value={config.email_foto_url}
                    onChange={(e) => setConfig({...config, email_foto_url: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-travesia-gold transition-all font-mono text-xs"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Mensaje Invitación</label>
                  <textarea 
                    rows={4}
                    value={config.email_mensaje}
                    onChange={(e) => setConfig({...config, email_mensaje: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-travesia-gold transition-all"
                  />
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-500 text-white p-3 rounded-2xl shadow-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-amber-900 font-bold">{cumpleañerosSemana.length} Cumpleañeros</p>
                    <p className="text-amber-700 text-sm italic">Listos para el envío automático del lunes.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center border-b pb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Megaphone className="w-6 h-6 text-blue-500" /> Difusión de un solo toque
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400">Filtrar por:</span>
                  <select 
                    value={broadcast.filtro_genero}
                    onChange={(e) => setBroadcast({...broadcast, filtro_genero: e.target.value})}
                    className="bg-gray-100 border-none rounded-xl px-4 py-2 font-bold text-xs"
                  >
                    <option value="Todos">Todos los clientes</option>
                    <option value="Femenino">Solo Mujeres 👩</option>
                    <option value="Masculino">Solo Hombres 👨</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Asunto de esta promo</label>
                  <input 
                    type="text" 
                    value={broadcast.asunto}
                    onChange={(e) => setBroadcast({...broadcast, asunto: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">URL Imagen Promo</label>
                  <input 
                    type="text" 
                    value={broadcast.foto_url}
                    onChange={(e) => setBroadcast({...broadcast, foto_url: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-xs"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Mensaje de la Campaña</label>
                  <textarea 
                    rows={4}
                    value={broadcast.mensaje}
                    onChange={(e) => setBroadcast({...broadcast, mensaje: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleSendBroadcast}
                disabled={sending}
                className="w-full bg-travesia-green-deep text-white py-6 rounded-3xl font-black text-lg shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {sending ? <Loader2 className="animate-spin w-6 h-6" /> : <Send className="w-6 h-6 text-travesia-gold" />}
                ENVIAR A {clientesFiltrados.length} CLIENTES AHORA
              </button>
            </div>
          )}
        </div>

        {/* Lado Derecho: Vista Previa */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-4">
            <Eye className="w-4 h-4" /> Previsualización
          </h3>
          
          <div className="relative mx-auto w-[320px] h-[600px] bg-black rounded-[50px] border-[10px] border-gray-900 shadow-2xl overflow-hidden ring-1 ring-white/10">
            <div className="absolute top-0 w-full h-8 bg-black flex justify-center items-end">
              <div className="w-24 h-5 bg-gray-900 rounded-b-2xl" />
            </div>
            
            <div className="h-full bg-[#f8f5f0] overflow-y-auto pt-10">
              <div className="bg-white m-3 rounded-[24px] shadow-sm overflow-hidden border border-gray-200/50">
                <div className="aspect-square relative">
                  <img 
                    src={activeTab === 'birthdays' ? config.email_foto_url : broadcast.foto_url} 
                    className="w-full h-full object-cover"
                    alt="Preview"
                    onError={(e: any) => e.target.src = 'https://images.unsplash.com/photo-1559339352-11d035aa65de'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                    <h4 className="text-white font-serif text-xl leading-tight">
                      {activeTab === 'birthdays' ? config.email_asunto : broadcast.asunto}
                    </h4>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <p className="font-serif italic text-gray-900 text-lg">Hola, Cliente!</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {(activeTab === 'birthdays' ? config.email_mensaje : broadcast.mensaje).replace('{nombre}', 'Amigo/a')}
                  </p>
                  
                  <div className="pt-4 border-t border-gray-50">
                    <button className="w-full bg-[#4A5D4E] text-white py-4 rounded-xl font-bold text-sm tracking-widest shadow-lg">
                      RESERVAR AHORA
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest pt-4">
                    La Travesía • Luxury Hospitality
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
