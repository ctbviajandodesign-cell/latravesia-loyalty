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
  const [sending, setSending] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'Todos' | 'Masculino' | 'Femenino'>('Todos');
  const [visitGoal, setVisitGoal] = useState('5');
  const [previewImage, setPreviewImage] = useState('');
  
  const [marketingData, setMarketingData] = useState({
    asunto: '',
    mensaje: '',
    image_url: ''
  });

  useEffect(() => {
    fetchMarketingConfig();
  }, [activeTab]);

  async function fetchMarketingConfig() {
    setLoading(true);
    try {
      const prefix = activeTab === 'birthday' ? 'birthday_' : 
                     activeTab === 'welcome' ? 'welcome_' :
                     activeTab === 'loyalty' ? 'loyalty_' : 'mass_';
      
      const { data } = await supabase.from('config').select('*');
      if (data) {
        const asunto = data.find(c => c.clave === `${prefix}email_subject`)?.valor;
        const mensaje = data.find(c => c.clave === `${prefix}email_body`)?.valor;
        const img = data.find(c => c.clave === `${prefix}image_url`)?.valor;
        const goal = data.find(c => c.clave === `loyalty_visit_goal`)?.valor;
        
        if (goal) setVisitGoal(goal);

        setMarketingData({
          asunto: asunto || getDefaultAsunto(activeTab),
          mensaje: mensaje || 'Hola {nombre}, un mensaje especial para ti.',
          image_url: img || ''
        });
        
        // Optimizamos el link de Unsplash para el preview
        const optimizedImg = img ? (img.includes('?') ? img : `${img}?auto=format&fit=crop&w=800&q=80`) : '';
        setPreviewImage(optimizedImg);
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
      case 'mass': return 'Promoción Especial 🌟';
      default: return '';
    }
  };

  const handleUpdate = async (key: string, valor: string) => {
    const prefix = activeTab === 'birthday' ? 'birthday_' : 
                   activeTab === 'welcome' ? 'welcome_' :
                   activeTab === 'loyalty' ? 'loyalty_' : 'mass_';
    await supabase.from('config').update({ valor }).eq('clave', `${prefix}${key}`);
  };

  const handleImageRefresh = (url: string) => {
    // Si es un link de Unsplash, nos aseguramos de que tenga parámetros de calidad
    const cleanUrl = url.split('?')[0];
    const optimized = cleanUrl + '?auto=format&fit=crop&w=800&q=80';
    setPreviewImage(optimized);
    setMarketingData({...marketingData, image_url: url});
    handleUpdate('image_url', url);
  };

  return (
    <div className="space-y-10">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-400">
              <Palette size={20} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Centro de Campañas Hub</h2>
          </div>
          <p className="text-white/40 text-sm ml-13">Personalización visual y estratégica de alto impacto.</p>
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
          <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8">
            
            {/* OPCIONES ESPECIALES */}
            {activeTab === 'loyalty' && (
              <div className="p-6 bg-travesia-gold/5 border border-travesia-gold/20 rounded-[24px] flex items-center justify-between">
                <div className="flex items-center gap-3 text-travesia-gold">
                  <Trophy size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Enviar al cumplir:</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={visitGoal}
                    onChange={(e) => { setVisitGoal(e.target.value); handleUpdate('visit_goal', e.target.value); }}
                    className="w-16 bg-white/10 border border-white/10 p-2 rounded-xl text-center font-black text-travesia-gold"
                  />
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Visitas</p>
                </div>
              </div>
            )}

            {activeTab === 'mass' && (
              <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-[24px] space-y-4">
                <div className="flex items-center gap-3 text-blue-400">
                  <Filter size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Audiencia Seleccionada</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Todos', 'Masculino', 'Femenino'].map(g => (
                    <button 
                      key={g}
                      onClick={() => setGenderFilter(g as any)}
                      className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${genderFilter === g ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
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
                  onBlur={(e) => handleUpdate('email_subject', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-[20px] outline-none focus:border-travesia-gold transition-all text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Cuerpo del Mensaje</label>
                  <button onClick={() => { const n = marketingData.mensaje + ' {nombre}'; setMarketingData({...marketingData, mensaje: n}); handleUpdate('email_body', n); }} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-travesia-gold hover:bg-travesia-gold hover:text-[#051A10] transition-all">+{'{nombre}'}</button>
                </div>
                <textarea 
                  rows={4}
                  value={marketingData.mensaje}
                  onChange={(e) => setMarketingData({...marketingData, mensaje: e.target.value})}
                  onBlur={(e) => handleUpdate('email_body', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-[20px] outline-none focus:border-travesia-gold transition-all text-sm resize-none font-medium leading-relaxed"
                />
              </div>
            </div>

            {/* CARGA DE IMAGEN MEJORADA */}
            <div className="space-y-4">
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
                  onChange={(e) => setMarketingData({...marketingData, image_url: e.target.value})}
                  onBlur={(e) => handleImageRefresh(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-[20px] outline-none focus:border-travesia-gold transition-all text-[10px] font-mono"
                />
                <LucideImage size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              </div>
            </div>

            {/* ACCIÓN */}
            <div className="pt-6 border-t border-white/5">
              <button 
                disabled={sending}
                className={`w-full py-5 rounded-[24px] font-black text-[10px] tracking-[0.3em] uppercase shadow-2xl transition-all flex items-center justify-center gap-3 ${activeTab === 'mass' ? 'bg-blue-500 text-white shadow-blue-500/20' : 'bg-travesia-gold text-[#051A10]'}`}
              >
                <Zap size={16} /> {activeTab === 'mass' ? `ENVIAR PROMO A ${genderFilter.toUpperCase()}` : 'LANZAR CAMPAÑA FORZADA'}
              </button>
            </div>
          </div>
        </div>

        {/* PREVIEW ULTRA-HIFI */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 self-start px-4 mb-6">
            <Eye className="text-travesia-gold" size={18} />
            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Visualización de Campaña</h3>
          </div>

          <div className="relative w-[300px] aspect-[9/18.5] bg-white rounded-[3rem] border-[10px] border-[#1A1A1A] shadow-2xl overflow-hidden p-6 flex flex-col scale-110 origin-top">
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-travesia-gold rounded-lg flex items-center justify-center text-[#051A10] shadow-lg"><Sparkles size={16} /></div>
                <div className="leading-none">
                  <p className="text-[10px] font-black text-gray-900 tracking-tighter uppercase">La Travesía</p>
                  <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">Marketing Hub</p>
                </div>
              </div>

              {/* CONTENEDOR DE IMAGEN OPTIMIZADO */}
              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gray-50 flex items-center justify-center">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover animate-in fade-in duration-700" 
                    alt="Promo Visual" 
                    onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'; }}
                  />
                ) : (
                  <div className="text-center p-6 space-y-2 opacity-20">
                    <LucideImage size={32} className="mx-auto" />
                    <p className="text-[8px] font-black uppercase tracking-widest">Sin Imagen</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-gray-900 font-serif font-black text-xl leading-tight">
                  {marketingData.asunto || 'Título de Campaña'}
                </h4>
                <div className="w-8 h-1 bg-travesia-gold rounded-full"></div>
                <p className="text-gray-600 text-[10px] leading-relaxed italic font-medium">
                  {marketingData.mensaje.replace('{nombre}', 'Juan') || 'Contenido de tu mensaje institucional.'}
                </p>
              </div>

              <button className="w-full py-4 bg-[#051A10] rounded-2xl text-white text-[9px] font-black uppercase tracking-[0.3em] shadow-xl shadow-black/20 mt-4 hover:scale-[1.02] transition-transform">
                RECLAMAR BENEFICIO
              </button>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                <Heart size={18} className="text-travesia-gold" />
              </div>
              <p className="text-[6px] text-gray-300 uppercase tracking-[0.4em] font-black text-center">
                Te esperamos en La Travesía Hostería
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
