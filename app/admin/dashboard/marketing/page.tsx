'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  ImageIcon, 
  Send, 
  Sparkles, 
  Eye, 
  MessageSquare, 
  Zap, 
  RefreshCw,
  Tag,
  Layout,
  Gift,
  Heart,
  Palette
} from 'lucide-react';

const SUGGESTED_IMAGES = [
  { id: '1', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80', label: 'Spa & Relax' },
  { id: '2', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', label: 'Hostería Lujo' },
  { id: '3', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80', label: 'Cena Romántica' },
  { id: '4', url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80', label: 'Piscina & Sol' },
];

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'birthday' | 'welcome'>('birthday');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewImage, setPreviewImage] = useState(SUGGESTED_IMAGES[0].url);
  
  const [marketingData, setMarketingData] = useState({
    asunto: '¡Feliz Cumpleaños en La Travesía! 🥂',
    mensaje: 'Hola {nombre}, queremos celebrar contigo este día especial. Tienes un regalo esperándote en nuestra hostería.',
    image_url: SUGGESTED_IMAGES[0].url
  });

  useEffect(() => {
    fetchMarketingConfig();
  }, [activeTab]);

  async function fetchMarketingConfig() {
    try {
      const prefix = activeTab === 'birthday' ? 'birthday_' : 'welcome_';
      const { data } = await supabase.from('config').select('*');
      if (data) {
        const asunto = data.find(c => c.clave === `${prefix}email_subject`)?.valor;
        const mensaje = data.find(c => c.clave === `${prefix}email_body`)?.valor;
        const img = data.find(c => c.clave === `${prefix}image_url`)?.valor;
        
        setMarketingData({
          asunto: asunto || (activeTab === 'birthday' ? '¡Feliz Cumpleaños! 🥂' : '¡Bienvenido al Club! ✨'),
          mensaje: mensaje || 'Hola {nombre}, un mensaje especial para ti.',
          image_url: img || SUGGESTED_IMAGES[0].url
        });
        setPreviewImage(img || SUGGESTED_IMAGES[0].url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async (key: string, valor: string) => {
    const prefix = activeTab === 'birthday' ? 'birthday_' : 'welcome_';
    await supabase.from('config').update({ valor }).eq('clave', `${prefix}${key}`);
  };

  const insertTag = (tag: string) => {
    const newMessage = marketingData.mensaje + tag;
    setMarketingData({...marketingData, mensaje: newMessage});
    handleUpdate('email_body', newMessage);
  };

  return (
    <div className="space-y-10">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-400">
              <Palette size={20} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Centro de Campañas</h2>
          </div>
          <p className="text-white/40 text-sm ml-13">Diseña la experiencia de comunicación con tus socios.</p>
        </div>

        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
          <button 
            onClick={() => setActiveTab('birthday')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'birthday' ? 'bg-travesia-gold text-[#051A10]' : 'text-white/40 hover:text-white'}`}
          >
            <Gift size={16} /> Cumpleaños
          </button>
          <button 
            onClick={() => setActiveTab('welcome')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'welcome' ? 'bg-travesia-gold text-[#051A10]' : 'text-white/40 hover:text-white'}`}
          >
            <Heart size={16} /> Bienvenida
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* CONFIGURADOR */}
        <div className="space-y-8">
          <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8">
            
            {/* INPUTS PRINCIPALES */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Asunto Personalizado</label>
                <input 
                  type="text" 
                  value={marketingData.asunto}
                  onChange={(e) => setMarketingData({...marketingData, asunto: e.target.value})}
                  onBlur={(e) => handleUpdate('email_subject', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-[24px] outline-none focus:border-travesia-gold transition-all text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Mensaje Digital</label>
                  <div className="flex gap-2">
                    <button onClick={() => insertTag(' {nombre}')} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-travesia-gold hover:bg-travesia-gold hover:text-[#051A10] transition-all tracking-widest">+{'{nombre}'}</button>
                    <button onClick={() => insertTag(' {premio}')} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-travesia-gold hover:bg-travesia-gold hover:text-[#051A10] transition-all tracking-widest">+{'{premio}'}</button>
                  </div>
                </div>
                <textarea 
                  rows={5}
                  value={marketingData.mensaje}
                  onChange={(e) => setMarketingData({...marketingData, mensaje: e.target.value})}
                  onBlur={(e) => handleUpdate('email_body', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-[24px] outline-none focus:border-travesia-gold transition-all text-sm resize-none font-medium leading-relaxed"
                />
              </div>
            </div>

            {/* GALERÍA UNSPLASH */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Galería de Lujo (Unsplash)</label>
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-3">
                {SUGGESTED_IMAGES.map((img) => (
                  <button 
                    key={img.id}
                    onClick={() => {
                      setPreviewImage(img.url);
                      setMarketingData({...marketingData, image_url: img.url});
                      handleUpdate('image_url', img.url);
                    }}
                    className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${previewImage === img.url ? 'border-travesia-gold scale-95 shadow-lg' : 'border-transparent hover:border-white/20'}`}
                  >
                    <img src={img.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={img.label} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white">{img.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="relative mt-4">
                <input 
                  type="text" 
                  placeholder="Pega aquí otra URL de Unsplash..."
                  value={marketingData.image_url}
                  onChange={(e) => setMarketingData({...marketingData, image_url: e.target.value})}
                  onBlur={(e) => { setPreviewImage(e.target.value); handleUpdate('image_url', e.target.value); }}
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-[20px] outline-none focus:border-travesia-gold transition-all text-[10px]"
                />
                <RefreshCw size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              </div>
            </div>

            {/* ACCIÓN */}
            {activeTab === 'birthday' && (
              <div className="pt-6 border-t border-white/5">
                <button 
                  disabled={sending}
                  className="w-full bg-travesia-gold text-[#051A10] py-5 rounded-[24px] font-black text-[10px] tracking-[0.3em] uppercase shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Zap size={16} /> Lanzar Campaña Forzada
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PREVIEW */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 self-start px-4 mb-6">
            <Eye className="text-travesia-gold" size={18} />
            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Vista Previa Real</h3>
          </div>

          <div className="relative w-[300px] aspect-[9/18.5] bg-white rounded-[3rem] border-[8px] border-[#1A1A1A] shadow-2xl overflow-hidden p-6 flex flex-col scale-110 origin-top">
            {/* MOCKUP CONTENT */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-travesia-gold rounded-lg flex items-center justify-center">
                  <Sparkles size={16} className="text-[#051A10]" />
                </div>
                <div className="leading-none">
                  <p className="text-[10px] font-black text-gray-900">LA TRAVESÍA</p>
                  <p className="text-[7px] text-gray-400 uppercase tracking-widest font-bold">Reserva & Fidelidad</p>
                </div>
              </div>

              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <img src={previewImage} className="w-full h-full object-cover" alt="Campaign" />
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-gray-900 font-serif font-black text-xl leading-tight">
                  {marketingData.asunto.replace('{nombre}', 'Juan')}
                </h4>
                <div className="w-8 h-1 bg-travesia-gold rounded-full"></div>
                <p className="text-gray-500 text-[10px] leading-relaxed italic font-medium">
                  {marketingData.mensaje.replace('{nombre}', 'Juan').replace('{premio}', 'Cocktail de Bienvenida')}
                </p>
              </div>

              <button className="w-full py-4 bg-[#051A10] rounded-2xl text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/20 mt-4">
                RECLAMAR MI BENEFICIO
              </button>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                <Heart size={20} className="text-travesia-gold" />
              </div>
              <p className="text-[6px] text-gray-300 uppercase tracking-widest font-black text-center">
                Te esperamos en La Travesía Hostería
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
