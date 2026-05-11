'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  ImageIcon, 
  Save, 
  Sparkles, 
  Eye, 
  MessageSquare, 
  Zap, 
  RefreshCw,
  Tag,
  Gift,
  Heart,
  Palette,
  Users,
  Trophy,
  Filter,
  CheckCircle2,
  Image as LucideImage,
  ExternalLink
} from 'lucide-react';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'birthday' | 'welcome' | 'loyalty' | 'mass'>('birthday');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  
  const [marketingData, setMarketingData] = useState({
    asunto: '',
    mensaje: '',
    image_url: ''
  });

  useEffect(() => {
    fetchMarketingConfig();
  }, [activeTab]);

  const getPrefix = (tab: string) => {
    switch(tab) {
      case 'birthday': return 'birthday_';
      case 'welcome': return 'welcome_';
      case 'loyalty': return 'loyalty_';
      case 'mass': return 'broadcast_'; // Sincronizado con broadcast_ como pidió el usuario
      default: return '';
    }
  };

  async function fetchMarketingConfig() {
    setLoading(true);
    try {
      const prefix = getPrefix(activeTab);
      const { data } = await supabase.from('config').select('*');
      if (data) {
        // En metas de fidelidad las claves son algo distintas según el screenshot previo
        const subjectKey = activeTab === 'loyalty' ? 'email_premio_asunto' : `${prefix}email_subject`;
        const bodyKey = activeTab === 'loyalty' ? 'email_premio_mensaje' : `${prefix}email_body`;
        const imgKey = activeTab === 'loyalty' ? 'email_foto_url' : 
                       activeTab === 'mass' ? 'broadcast_foto_url' : `${prefix}image_url`;

        const asunto = data.find(c => c.clave === subjectKey)?.valor;
        const mensaje = data.find(c => c.clave === bodyKey)?.valor;
        const img = data.find(c => c.clave === imgKey)?.valor;
        
        setMarketingData({
          asunto: asunto || getDefaultAsunto(activeTab),
          mensaje: mensaje || 'Hola {nombre}, un mensaje especial para ti.',
          image_url: img || ''
        });
        
        updatePreview(img || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const getDefaultAsunto = (tab: string) => {
    switch(tab) {
      case 'birthday': return '¡Feliz Cumpleaños! 🥂';
      case 'welcome': return '¡Bienvenido al Club! ✨';
      case 'loyalty': return '¡Has alcanzado una meta! 🏆';
      case 'mass': return '¡Nueva Sorpresa en La Travesía! 🎁';
      default: return '';
    }
  };

  // DETECTOR INTELIGENTE DE UNSPLASH
  const updatePreview = (url: string) => {
    if (!url) {
      setPreviewImage('https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80');
      return;
    }

    let finalUrl = url;
    // Si es un link de la página de Unsplash (ej: unsplash.com/photos/ABC)
    if (url.includes('unsplash.com/photos/')) {
      const id = url.split('photos/')[1]?.split('/')[0]?.split('?')[0];
      if (id) finalUrl = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
    } 
    // Si es un link directo pero sin parámetros de optimización
    else if (url.includes('images.unsplash.com/') && !url.includes('?')) {
      finalUrl = `${url}?auto=format&fit=crop&w=800&q=80`;
    }

    setPreviewImage(finalUrl);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const prefix = getPrefix(activeTab);
    
    const subjectKey = activeTab === 'loyalty' ? 'email_premio_asunto' : `${prefix}email_subject`;
    const bodyKey = activeTab === 'loyalty' ? 'email_premio_mensaje' : `${prefix}email_body`;
    const imgKey = activeTab === 'loyalty' ? 'email_foto_url' : 
                   activeTab === 'mass' ? 'broadcast_foto_url' : `${prefix}image_url`;

    try {
      await Promise.all([
        supabase.from('config').update({ valor: marketingData.asunto }).eq('clave', subjectKey),
        supabase.from('config').update({ valor: marketingData.mensaje }).eq('clave', bodyKey),
        supabase.from('config').update({ valor: marketingData.image_url }).eq('clave', imgKey)
      ]);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-travesia-gold/10 border border-travesia-gold/20 rounded-xl flex items-center justify-center text-travesia-gold">
              <Palette size={20} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Centro de Campañas Hub</h2>
          </div>
          <p className="text-white/40 text-sm ml-13">Diseño y personalización de fidelidad premium.</p>
        </div>

        <div className="flex flex-wrap gap-1 p-1 bg-white/5 border border-white/10 rounded-[24px]">
          {[
            { id: 'birthday', label: 'Cumpleaños', icon: Gift },
            { id: 'welcome', label: 'Bienvenida', icon: Heart },
            { id: 'loyalty', label: 'Metas', icon: Trophy },
            { id: 'mass', label: 'Masivo', icon: Users },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-travesia-gold text-[#051A10] shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* CONFIGURADOR */}
        <div className="space-y-8">
          <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8 relative overflow-hidden">
            
            {/* INDICADOR DE GUARDADO */}
            {saved && (
              <div className="absolute top-4 right-8 flex items-center gap-2 text-emerald-400 animate-in slide-in-from-top-4">
                <CheckCircle2 size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Sincronizado</span>
              </div>
            )}

            {/* EDITOR */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Asunto Estratégico</label>
                <input 
                  type="text" 
                  value={marketingData.asunto}
                  onChange={(e) => setMarketingData({...marketingData, asunto: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-[24px] outline-none focus:border-travesia-gold transition-all text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Cuerpo del Mensaje</label>
                  <button onClick={() => setMarketingData({...marketingData, mensaje: marketingData.mensaje + ' {nombre}'})} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-travesia-gold hover:bg-travesia-gold hover:text-[#051A10] transition-all">+{'{nombre}'}</button>
                </div>
                <textarea 
                  rows={4}
                  value={marketingData.mensaje}
                  onChange={(e) => setMarketingData({...marketingData, mensaje: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-[24px] outline-none focus:border-travesia-gold transition-all text-sm resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Imagen Pro (Unsplash Link)</label>
                  <a href="https://unsplash.com/es/s/fotos/luxury-hotel" target="_blank" className="text-[8px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1 hover:underline">
                    Buscar en Unsplash <ExternalLink size={10} />
                  </a>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Pega el link de la foto aquí..."
                    value={marketingData.image_url}
                    onChange={(e) => { setMarketingData({...marketingData, image_url: e.target.value}); updatePreview(e.target.value); }}
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-[20px] outline-none focus:border-travesia-gold transition-all text-[10px] font-mono"
                  />
                  <LucideImage size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                </div>
                <p className="text-[8px] text-white/20 italic ml-2 mt-2">💡 Puedes pegar el link directo o el de la página de la foto.</p>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
              <button 
                onClick={handleSaveAll}
                disabled={saving}
                className="w-full py-5 rounded-[24px] bg-white/5 border border-white/10 text-white font-black text-[10px] tracking-[0.3em] uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} GUARDAR DISEÑO
              </button>
              
              <button 
                className={`w-full py-5 rounded-[24px] font-black text-[10px] tracking-[0.3em] uppercase shadow-2xl transition-all flex items-center justify-center gap-3 ${activeTab === 'mass' ? 'bg-blue-500 text-white shadow-blue-500/20' : 'bg-travesia-gold text-[#051A10]'}`}
              >
                <Zap size={16} /> {activeTab === 'mass' ? 'LANZAR MASIVO' : 'LANZAR FORZADO'}
              </button>
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 self-start px-4 mb-6">
            <Eye className="text-travesia-gold" size={18} />
            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Vista Previa Real</h3>
          </div>

          <div className="relative w-[300px] aspect-[9/18.5] bg-white rounded-[3rem] border-[10px] border-[#1A1A1A] shadow-2xl overflow-hidden p-6 flex flex-col scale-110 origin-top">
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-travesia-gold rounded-lg flex items-center justify-center text-[#051A10]"><Sparkles size={16} /></div>
                <div className="leading-none">
                  <p className="text-[10px] font-black text-gray-900 tracking-tighter uppercase">La Travesía</p>
                  <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">Hostería & Spa</p>
                </div>
              </div>

              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gray-50">
                <img 
                  src={previewImage} 
                  className="w-full h-full object-cover transition-opacity duration-500" 
                  alt="Visual"
                  onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'; }}
                />
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-gray-900 font-serif font-black text-xl leading-tight">
                  {marketingData.asunto || 'Título de Campaña'}
                </h4>
                <div className="w-8 h-1 bg-travesia-gold rounded-full"></div>
                <p className="text-gray-600 text-[10px] leading-relaxed italic font-medium">
                  {marketingData.mensaje.replace('{nombre}', 'Juan') || 'Cuerpo del mensaje...'}
                </p>
              </div>

              <button className="w-full py-4 bg-[#051A10] rounded-2xl text-white text-[9px] font-black uppercase tracking-[0.3em] shadow-xl shadow-black/20 mt-4">
                OBTENER BENEFICIO
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
