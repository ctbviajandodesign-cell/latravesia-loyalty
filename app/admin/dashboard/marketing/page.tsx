'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  Zap, 
  Gift, 
  Heart, 
  Trophy, 
  Users, 
  Save, 
  CheckCircle2, 
  Image as ImageIcon, 
  RefreshCw, 
  Eye, 
  Sparkles, 
  Smartphone,
  ExternalLink,
  Image as LucideImage
} from 'lucide-react';
import { formatUnsplashUrl } from '@/lib/unsplash';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'birthday' | 'welcome' | 'loyalty' | 'mass'>('birthday');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [upcomingList, setUpcomingList] = useState<any[]>([]);
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'M' | 'F'>('ALL');
  
  const [marketingData, setMarketingData] = useState({
    asunto: '',
    mensaje: '',
    image_url: '',
    roulette_link: '' // Nueva opción para link de ruleta (cumpleaños)
  });

  useEffect(() => {
    fetchMarketingConfig();
    if (activeTab === 'birthday') {
      calculateUpcomingBirthdays();
    }
  }, [activeTab]);

  async function calculateUpcomingBirthdays() {
    const { data: clients } = await supabase.from('clientes').select('*');
    if (!clients) return;
    
    const list = clients.filter(cliente => {
      if (!cliente.fecha_nacimiento) return false;
      const hoy = new Date();
      const [año, mes, dia] = cliente.fecha_nacimiento.split('-').map(Number);
      
      // Chequear próximos 7 días
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date();
        checkDate.setDate(hoy.getDate() + i);
        if ((checkDate.getMonth() + 1) === mes && checkDate.getDate() === dia) return true;
      }
      return false;
    });

    setUpcomingCount(list.length);
    setUpcomingList(list);
  }

  const formatWhatsAppLink = (telefono: string, nombre: string) => {
    const msg = `¡Hola ${nombre}! 🥂 De parte de La Travesía te deseamos un muy feliz cumpleaños. Te hemos enviado una sorpresa a tu correo. ¡Te esperamos!`;
    const num = telefono.replace(/\+/g, '');
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  };

  const getPrefix = (tab: string) => {
    switch(tab) {
      case 'birthday': return 'birthday_';
      case 'welcome': return 'welcome_';
      case 'loyalty': return 'loyalty_';
      case 'mass': return 'broadcast_';
      default: return '';
    }
  };

  async function fetchMarketingConfig() {
    setLoading(true);
    try {
      const prefix = getPrefix(activeTab);
      const { data } = await supabase.from('config').select('*');
      if (data) {
        const asunto = data.find(c => c.clave === `${prefix}email_subject`)?.valor;
        const mensaje = data.find(c => c.clave === `${prefix}email_body`)?.valor;
        const img = data.find(c => c.clave === `${prefix}image_url`)?.valor;
        const link = data.find(c => c.clave === `${prefix}roulette_link`)?.valor;
        
        setMarketingData({
          asunto: asunto || getDefaultAsunto(activeTab),
          mensaje: mensaje || 'Hola {nombre}, un mensaje especial para ti.',
          image_url: img || '',
          roulette_link: link || ''
        });
        
        updatePreview(img || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveAll = async () => {
    setSaving(true);
    const prefix = getPrefix(activeTab);
    
    try {
      const updates = [
        { clave: `${prefix}email_subject`, valor: marketingData.asunto },
        { clave: `${prefix}email_body`, valor: marketingData.mensaje },
        { clave: `${prefix}image_url`, valor: marketingData.image_url },
        { clave: `${prefix}roulette_link`, valor: marketingData.roulette_link }
      ];

      for (const update of updates) {
        await supabase.from('config').upsert(update, { onConflict: 'clave' });
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // FUNCIÓN PARA FORZAR ENVÍO DE CUMPLEAÑOS (HOY)
  const handleForceBirthday = async () => {
    if (!confirm("Se enviará el correo de cumpleaños a todos los socios que cumplen años HOY. ¿Continuar?")) return;
    setSaving(true);
    try {
      const hoy = new Date();
      const mesDia = `${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
      
      const { data: clients } = await supabase.from('clientes').select('email, nombre, fecha_nacimiento');
      const cumpleaneros = clients?.filter(c => c.fecha_nacimiento?.includes(mesDia)) || [];

      if (cumpleaneros.length === 0) {
        alert("No hay socios que cumplan años hoy.");
        return;
      }

      const response = await fetch('/api/marketing/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: marketingData.asunto,
          message: marketingData.mensaje,
          imageUrl: formatUnsplashUrl(marketingData.image_url),
          recipients: cumpleaneros.map(c => c.email),
          isBirthday: true
        })
      });

      if (response.ok) alert(`¡Éxito! Se enviaron ${cumpleaneros.length} correos.`);
      else alert("Error en el envío automático.");
    } catch (e) {
      alert("Error crítico");
    } finally {
      setSaving(false);
    }
  };

  // NUEVA FUNCIÓN: LANZAMIENTO SEMANAL (LUNES)
  const handleWeeklyBirthdayBroadcast = async () => {
    if (!confirm("¿Deseas lanzar la campaña para TODOS los cumpleañeros de la semana (Próximos 7 días)?")) return;
    setSaving(true);
    try {
      const { data: clients } = await supabase.from('clientes').select('email, nombre, fecha_nacimiento');
      if (!clients) return;

      const upcomingBirthdays = clients.filter(cliente => {
        if (!cliente.fecha_nacimiento) return false;
        
        const hoy = new Date();
        const [año, mes, dia] = cliente.fecha_nacimiento.split('-').map(Number);
        
        // Revisar próximos 7 días
        for (let i = 0; i < 7; i++) {
          const checkDate = new Date();
          checkDate.setDate(hoy.getDate() + i);
          if ((checkDate.getMonth() + 1) === mes && checkDate.getDate() === dia) return true;
        }
        return false;
      });

      if (upcomingBirthdays.length === 0) {
        alert("No hay cumpleañeros registrados para esta semana.");
        return;
      }

      const response = await fetch('/api/marketing/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: marketingData.asunto,
          message: marketingData.mensaje,
          imageUrl: formatUnsplashUrl(marketingData.image_url),
          recipients: upcomingBirthdays.map(c => c.email),
          isBirthday: true,
          weeklyBroadcast: true
        })
      });

      if (response.ok) {
        alert(`¡Campaña Semanal Exitosa! Se notificó a ${upcomingBirthdays.length} cumpleañeros de la semana.`);
      } else {
        alert("Error al procesar el envío semanal.");
      }
    } catch (e) {
      alert("Error en el cálculo semanal");
    } finally {
      setSaving(false);
    }
  };

  const handleLaunch = async () => {
    const isMass = activeTab === 'mass';
    const confirmMsg = isMass 
      ? `¿Enviar campaña MASIVA a todos los clientes (${genderFilter === 'ALL' ? 'Todos' : genderFilter === 'M' ? 'Hombres' : 'Mujeres'})?`
      : "¿Enviar prueba a tu correo admin?";
    
    if (!confirm(confirmMsg)) return;
    
    setSaving(true);
    try {
      let targetTo = '';
      let recipients: string[] = [];

      if (isMass) {
        let query = supabase.from('clientes').select('email, genero');
        if (genderFilter !== 'ALL') {
          query = query.eq('genero', genderFilter === 'M' ? 'Masculino' : 'Femenino');
        }
        const { data: clients } = await query;
        recipients = clients?.map(c => c.email).filter(Boolean) || [];
        targetTo = 'BROADCAST';
        
        if (recipients.length === 0) {
          alert("No hay clientes que coincidan con el filtro seleccionado.");
          return;
        }
      } else {
        const { data: config } = await supabase.from('config').select('valor').eq('clave', 'admin_email').single();
        targetTo = config?.valor || '';
      }

      const response = await fetch('/api/marketing/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: marketingData.asunto,
          message: marketingData.mensaje,
          imageUrl: formatUnsplashUrl(marketingData.image_url),
          to: targetTo,
          recipients: isMass ? recipients : undefined
        })
      });

      if (response.ok) alert(`¡Éxito! Se enviaron ${isMass ? recipients.length : 1} correos.`);
      else alert("Error al enviar.");
    } catch (e) {
      alert("Error crítico");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-travesia-gold/10 border border-travesia-gold/20 rounded-xl flex items-center justify-center text-travesia-gold">
              <Zap size={20} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Marketing Hub</h2>
          </div>
          <p className="text-white/40 text-sm ml-13">Automatización y campañas de fidelidad.</p>
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
            
            {saved && (
              <div className="absolute top-4 right-8 flex items-center gap-2 text-emerald-400 animate-in slide-in-from-top-4">
                <CheckCircle2 size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Sincronizado</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Asunto del Correo</label>
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

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Imagen (Link Unsplash)</label>
                   <input 
                    type="text" 
                    value={marketingData.image_url}
                    onChange={(e) => { setMarketingData({...marketingData, image_url: e.target.value}); updatePreview(e.target.value); }}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-[20px] outline-none focus:border-travesia-gold transition-all text-[10px]"
                  />
                </div>
                
                {activeTab === 'birthday' && (
                  <div className="space-y-2 animate-in slide-in-from-bottom-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold ml-2">Link de Ruleta de Regalo (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="https://latravesia.app/game?id=birthday"
                      value={marketingData.roulette_link}
                      onChange={(e) => setMarketingData({...marketingData, roulette_link: e.target.value})}
                      className="w-full bg-travesia-gold/5 border border-travesia-gold/20 p-4 rounded-[20px] outline-none focus:border-travesia-gold transition-all text-[10px] text-travesia-gold"
                    />
                  </div>
                )}

                {activeTab === 'mass' && (
                  <div className="space-y-3 animate-in slide-in-from-bottom-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Filtrar Destinatarios</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'ALL', label: 'Todos' },
                        { id: 'M', label: 'Hombres' },
                        { id: 'F', label: 'Mujeres' },
                      ].map(g => (
                        <button 
                          key={g.id}
                          onClick={() => setGenderFilter(g.id as any)}
                          className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${genderFilter === g.id ? 'bg-white/10 border-travesia-gold text-travesia-gold' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="py-5 rounded-[24px] bg-white/5 border border-white/10 text-white font-black text-[10px] tracking-[0.3em] uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <Save size={16} /> GUARDAR
                </button>
                
                <button 
                  onClick={handleLaunch}
                  disabled={saving}
                  className="py-5 rounded-[24px] bg-travesia-gold text-[#051A10] font-black text-[10px] tracking-[0.3em] uppercase hover:brightness-110 transition-all flex items-center justify-center gap-3"
                >
                  <Zap size={16} /> {activeTab === 'mass' ? 'LANZAR MASIVO' : 'PROBAR'}
                </button>
              </div>

              {activeTab === 'birthday' && (
                <div className="space-y-3">
                  <button 
                    onClick={handleWeeklyBirthdayBroadcast}
                    className="w-full py-4 rounded-2xl bg-travesia-gold/10 border border-travesia-gold/20 text-travesia-gold font-black text-[10px] tracking-widest uppercase hover:bg-travesia-gold/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Users size={14} /> LANZAR CAMPAÑA SEMANAL ({upcomingCount} SOCIOS)
                  </button>
                  
                  <button 
                    onClick={handleForceBirthday}
                    className="w-full py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] tracking-widest uppercase hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} /> FORZAR ENVÍO CUMPLEAÑOS DE HOY
                  </button>

                  {/* LISTA DE CUMPLEAÑEROS */}
                  {upcomingList.length > 0 && (
                    <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-4">
                      <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Celebrados de la Semana</p>
                        <span className="px-2 py-0.5 bg-travesia-gold/20 text-travesia-gold rounded text-[8px] font-black uppercase">{upcomingList.length}</span>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {upcomingList.map(c => (
                          <div key={c.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
                            <div>
                              <p className="text-[11px] font-bold text-white">{c.nombre} {c.apellido}</p>
                              <p className="text-[9px] text-white/30 uppercase font-black tracking-tighter mt-0.5">{c.fecha_nacimiento}</p>
                            </div>
                            <a 
                              href={formatWhatsAppLink(c.telefono, c.nombre)}
                              target="_blank"
                              className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                              title="Enviar WhatsApp Personalizado"
                            >
                              <Smartphone size={14} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 self-start px-4 mb-6">
            <Eye className="text-travesia-gold" size={18} />
            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Vista Previa</h3>
          </div>

          <div className="relative w-[300px] aspect-[9/18.5] bg-white rounded-[3rem] border-[10px] border-[#1A1A1A] shadow-2xl overflow-hidden p-6 flex flex-col scale-110 origin-top">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-travesia-gold rounded-lg flex items-center justify-center text-[#051A10]"><Sparkles size={16} /></div>
                <p className="text-[10px] font-black text-gray-900 tracking-tighter uppercase">La Travesía</p>
              </div>

              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-100">
                {previewImage && <img src={previewImage} className="w-full h-full object-cover" alt="Visual" />}
              </div>

              <div className="space-y-2">
                <h4 className="text-gray-900 font-serif font-black text-lg leading-tight">{marketingData.asunto}</h4>
                <p className="text-gray-600 text-[10px] leading-relaxed font-medium">
                  {marketingData.mensaje.replace('{nombre}', 'Socio')}
                </p>
              </div>

              <button className="w-full py-4 bg-[#051A10] rounded-2xl text-white text-[9px] font-black uppercase tracking-[0.3em] mt-2">
                {marketingData.roulette_link ? 'GIRAR MI RULETA 🎡' : 'OBTENER BENEFICIO'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
