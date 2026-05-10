'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  Image as ImageIcon, 
  Send, 
  Sparkles, 
  Eye, 
  MessageSquare, 
  Zap, 
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';

export default function MarketingPage() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewImage, setPreviewImage] = useState('https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=500&q=80');
  const [marketingData, setMarketingData] = useState({
    asunto: '¡Feliz Cumpleaños en La Travesía! 🥂',
    mensaje: 'Queremos celebrar contigo este día especial. Tienes un regalo esperándote en nuestra hostería.',
    image_url: ''
  });

  useEffect(() => {
    fetchMarketingConfig();
  }, []);

  async function fetchMarketingConfig() {
    try {
      const { data } = await supabase.from('config').select('*');
      if (data) {
        const asunto = data.find(c => c.clave === 'birthday_email_subject')?.valor;
        const mensaje = data.find(c => c.clave === 'birthday_email_body')?.valor;
        const img = data.find(c => c.clave === 'birthday_image_url')?.valor;
        
        setMarketingData({
          asunto: asunto || marketingData.asunto,
          mensaje: mensaje || marketingData.mensaje,
          image_url: img || ''
        });
        if (img) setPreviewImage(img);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async (clave: string, valor: string) => {
    await supabase.from('config').update({ valor }).eq('clave', clave);
  };

  return (
    <div className="space-y-10">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-400">
              <Mail size={20} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Zona de Marketing</h2>
          </div>
          <p className="text-white/40 text-sm ml-13">Personaliza la comunicación y campañas de fidelidad.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* EDITOR DE MENSAJE */}
        <div className="space-y-6">
          <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-travesia-gold" size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Campaña de Cumpleaños</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Asunto del Email</label>
                <input 
                  type="text" 
                  value={marketingData.asunto}
                  onChange={(e) => setMarketingData({...marketingData, asunto: e.target.value})}
                  onBlur={(e) => handleUpdate('birthday_email_subject', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Cuerpo del Mensaje</label>
                <textarea 
                  rows={6}
                  value={marketingData.mensaje}
                  onChange={(e) => setMarketingData({...marketingData, mensaje: e.target.value})}
                  onBlur={(e) => handleUpdate('birthday_email_body', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2 flex items-center gap-2">
                  <ImageIcon size={12} /> URL Imagen (Unsplash)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://images.unsplash.com/..."
                    value={marketingData.image_url}
                    onChange={(e) => setMarketingData({...marketingData, image_url: e.target.value})}
                    className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all text-xs"
                  />
                  <button 
                    onClick={() => setPreviewImage(marketingData.image_url)}
                    className="p-4 bg-white/10 rounded-2xl text-travesia-gold hover:bg-travesia-gold hover:text-[#051A10] transition-all"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <button 
                disabled={sending}
                className="w-full group bg-gradient-to-r from-pink-500 to-pink-600 text-white py-5 rounded-[24px] font-black text-[10px] tracking-[0.3em] uppercase shadow-xl shadow-pink-500/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {sending ? <RefreshCw className="animate-spin" /> : <><Zap size={16} className="group-hover:animate-pulse" /> Envío Forzado de Cumpleaños</>}
              </button>
              <p className="mt-3 text-center text-[8px] text-white/20 uppercase tracking-widest font-bold">
                Esto enviará el correo a todos los socios que cumplen años hoy.
              </p>
            </div>
          </div>
        </div>

        {/* PREVISUALIZACIÓN MÓVIL */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <Eye className="text-blue-400" size={18} />
            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Vista Previa</h3>
          </div>

          <div className="relative mx-auto w-[320px] aspect-[9/16] bg-white rounded-[3rem] border-[8px] border-[#1A1A1A] shadow-2xl overflow-hidden p-6 flex flex-col">
            {/* EMAIL MOCKUP */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-travesia-gold rounded-lg flex items-center justify-center">
                  <Sparkles size={16} className="text-[#051A10]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-900 leading-none">La Travesía</p>
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest">Hostería & Spa</p>
                </div>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg">
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-gray-900 font-serif font-bold text-lg leading-tight">
                  {marketingData.asunto}
                </h4>
                <p className="text-gray-600 text-[10px] leading-relaxed italic">
                  {marketingData.mensaje}
                </p>
              </div>

              <div className="pt-4">
                <div className="w-full py-3 bg-[#051A10] rounded-xl text-white text-[9px] font-black uppercase tracking-widest text-center shadow-lg shadow-black/10">
                  RECLAMAR MI REGALO
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-center">
              <p className="text-[6px] text-gray-400 uppercase tracking-[0.4em] font-black text-center">
                Gracias por ser parte de nosotros
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
