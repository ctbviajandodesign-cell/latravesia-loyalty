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
  Image as LucideImage
} from 'lucide-react';

const SUGGESTED_IMAGES = [
  { id: '1', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80', label: 'Spa & Relax' },
  { id: '2', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', label: 'Hostería Lujo' },
  { id: '3', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80', label: 'Cena Romántica' },
  { id: '4', url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80', label: 'Piscina & Sol' },
];

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'birthday' | 'welcome' | 'loyalty' | 'mass'>('birthday');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'Todos' | 'Masculino' | 'Femenino'>('Todos');
  const [visitGoal, setVisitGoal] = useState('5');
  const [previewImage, setPreviewImage] = useState(SUGGESTED_IMAGES[0].url);
  
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
          image_url: img || (activeTab === 'mass' ? '' : SUGGESTED_IMAGES[0].url)
        });
        setPreviewImage(img || (activeTab === 'mass' ? 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80' : SUGGESTED_IMAGES[0].url));
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

  return (
    <div className="space-y-10">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-400">
              <Palette size={20} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Centro de Campañas</h2>
          </div>
          <p className="text-white/40 text-sm ml-13">Configura y lanza tus estrategias de comunicación.</p>
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
                  <p className="text-[10px] font-black uppercase tracking-widest">Filtro de Audiencia</p>
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
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Asunto del Email</label>
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
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-[20px] outline-none focus:border-travesia-gold transition-all text-sm resize-none"
                />
              </div>
            </div>

            {/* CARGA DE IMAGEN (SIN GALERÍA EN MASIVO) */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Imagen de la Campaña (Link Unsplash)</label>
              
              {activeTab !== 'mass' && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {SUGGESTED_IMAGES.map((img) => (
                    <button 
                      key={img.id}
                      onClick={() => {
                        setPreviewImage(img.url);
                        setMarketingData({...marketingData, image_url: img.url});
                        handleUpdate('image_url', img.url);
                      }}
                      className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${previewImage === img.url ? 'border-travesia-gold scale-95' : 'border-transparent'}`}
                    >
                      <img src={img.url} className="w-full h-full object-cover" alt={img.label} />
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Pega el link de la foto aquí..."
                  value={marketingData.image_url}
                  onChange={(e) => setMarketingData({...marketingData, image_url: e.target.value})}
                  onBlur={(e) => { setPreviewImage(e.target.value); handleUpdate('image_url', e.target.value); }}
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-[20px] outline-none focus:border-travesia-gold transition-all text-[10px]"
                />
                <LucideImage size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              </div>
              {activeTab === 'mass' && (
                <p className="text-[9px] text-white/20 italic ml-2">⚠️ Solo se usará la imagen que cargues arriba para esta promoción masiva.</p>
              )}
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

        {/* PREVIEW */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 self-start px-4 mb-6">
            <Eye className="text-travesia-gold" size={18} />
            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Vista Previa</h3>
          </div>

          <div className="relative w-[280px] aspect-[9/18.5] bg-white rounded-[2.5rem] border-[8px] border-[#1A1A1A] shadow-2xl overflow-hidden p-6 flex flex-col scale-110 origin-top">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-travesia-gold rounded flex items-center justify-center text-[#051A10]"><Sparkles size={12} /></div>
                <p className="text-[8px] font-black text-gray-900 tracking-tighter">LA TRAVESÍA</p>
              </div>

              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden shadow-lg border-2 border-white">
                <img src={previewImage || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'} className="w-full h-full object-cover" alt="Promo" />
              </div>

              <div className="space-y-2">
                <h4 className="text-gray-900 font-serif font-black text-lg leading-tight">
                  {marketingData.asunto || 'Promoción Especial'}
                </h4>
                <p className="text-gray-500 text-[9px] leading-relaxed italic font-medium">
                  {marketingData.mensaje || 'Un mensaje especial para ti de parte de La Travesía.'}
                </p>
              </div>

              <button className="w-full py-3 bg-[#051A10] rounded-xl text-white text-[8px] font-black uppercase tracking-widest mt-2">
                OBTENER BENEFICIO
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
