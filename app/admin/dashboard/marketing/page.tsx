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
import { resolveUnsplashUrl } from '@/app/actions/unsplash';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'birthday' | 'welcome' | 'loyalty' | 'mass'>('birthday');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [upcomingList, setUpcomingList] = useState<any[]>([]);
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'M' | 'F'>('ALL');
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  
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
    const { data: clients } = await supabase.from('clientes').select('id, nombre, apellido, fecha_nacimiento, telefono, email');
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

  const formatWhatsAppLink = (telefono: string, nombre: string, mensajeTemplate: string, rouletteLink: string) => {
    let msg = mensajeTemplate.replace(/\{nombre\}/gi, nombre);
    if (rouletteLink) {
      msg += `\n\n${rouletteLink}`;
    }
    const num = telefono.replace(/\+/g, '').replace(/\s+/g, '');
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

  const getDefaultAsunto = (tab: string) => {
    switch(tab) {
      case 'birthday': return '¡Feliz Cumpleaños! 🥂';
      case 'welcome': return '¡Bienvenido al Club! ✨';
      case 'loyalty': return '¡Has alcanzado una meta! 🏆';
      case 'mass': return '¡Nueva Sorpresa en La Travesía! 🎁';
      default: return '';
    }
  };

  const updatePreview = async (url: string) => {
    if (!url) {
      setPreviewImage('');
      return;
    }
    if (url.includes('unsplash.com')) {
      try {
        const resolved = await resolveUnsplashUrl(url);
        setPreviewImage(resolved);
        // Actualizamos marketingData para que se guarde la URL limpia en la base de datos
        setMarketingData(prev => {
          if (prev.image_url === url) {
            return { ...prev, image_url: resolved };
          }
          return prev;
        });
      } catch (e) {
        console.error("Error al resolver URL de Unsplash:", e);
        setPreviewImage(formatUnsplashUrl(url));
      }
    } else {
      setPreviewImage(formatUnsplashUrl(url));
    }
  };

  const handleRefreshPreview = () => {
    updatePreview(marketingData.image_url);
  };

  const [whatsappGroupLink, setWhatsappGroupLink] = useState('');
  const [adminWhatsapp, setAdminWhatsapp] = useState('');

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
        const groupLink = data.find(c => c.clave === 'whatsapp_group_link')?.valor;
        const adminWA = data.find(c => c.clave === 'admin_whatsapp')?.valor;
        
        setWhatsappGroupLink(groupLink || '');
        setAdminWhatsapp(adminWA || '');
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
      const mes = String(hoy.getMonth() + 1).padStart(2, '0');
      const dia = String(hoy.getDate()).padStart(2, '0');
      const target = `-${mes}-${dia}`; // Formato que coincide con el final de YYYY-MM-DD
      
      const { data: clients } = await supabase.from('clientes').select('email, nombre, fecha_nacimiento');
      const cumpleaneros = clients?.filter(c => c.fecha_nacimiento?.endsWith(target)) || [];

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
          to: 'BROADCAST',
          recipients: cumpleaneros.map(c => ({ email: c.email, nombre: c.nombre })),
          isBirthday: true,
          rouletteLink: marketingData.roulette_link
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
          to: 'BROADCAST',
          recipients: upcomingBirthdays.map(c => ({ email: c.email, nombre: c.nombre })),
          isBirthday: true,
          rouletteLink: marketingData.roulette_link
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
    let filterDesc = genderFilter === 'ALL' ? 'Todos' : genderFilter === 'M' ? 'Hombres' : 'Mujeres';
    if (minAge || maxAge) {
      filterDesc += ` (Edad: ${minAge || 0} - ${maxAge || '∞'} años)`;
    }
    const confirmMsg = isMass 
      ? `¿Enviar campaña MASIVA a clientes con filtro: ${filterDesc}?`
      : "¿Enviar prueba a tu correo admin?";
    
    if (!confirm(confirmMsg)) return;
    
    setSaving(true);
    try {
      let targetTo = '';
      let recipients: any[] = [];

      if (isMass) {
        let query = supabase.from('clientes').select('email, nombre, genero, fecha_nacimiento');
        if (genderFilter !== 'ALL') {
          query = query.eq('genero', genderFilter === 'M' ? 'Masculino' : 'Femenino');
        }
        const { data: clients } = await query;
        
        let filteredClients = clients || [];
        if (minAge || maxAge) {
          const currentYear = new Date().getFullYear();
          filteredClients = filteredClients.filter(c => {
            if (!c.fecha_nacimiento) return false;
            const birthYear = parseInt(c.fecha_nacimiento.split('-')[0]);
            if (isNaN(birthYear)) return false;
            const age = currentYear - birthYear;
            
            const min = minAge ? parseInt(minAge) : 0;
            const max = maxAge ? parseInt(maxAge) : 999;
            
            return age >= min && age <= max;
          });
        }
        recipients = filteredClients.map(c => ({ email: c.email, nombre: c.nombre })).filter(r => r.email);
        targetTo = 'BROADCAST';
        
        if (recipients.length === 0) {
          alert("No hay clientes que coincidan con el filtro seleccionado.");
          return;
        }
      } else {
        const { data: config } = await supabase.from('config').select('valor').eq('clave', 'admin_email').maybeSingle();
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
            <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white">
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
              className={`flex items-center gap-2 px-5 py-3 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#111111] text-white border border-white/20 shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* CONFIGURADOR */}
        <div className="space-y-8">
          <div className="bg-[#111111]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8 relative overflow-hidden">
            
            {saved && (
              <div className="absolute top-4 right-8 flex items-center gap-2 text-emerald-400 animate-in slide-in-from-top-4">
                <CheckCircle2 size={16} /> <span className="text-xs font-black uppercase tracking-widest">Sincronizado</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-2">Asunto del Correo</label>
                <input 
                  type="text" 
                  value={marketingData.asunto}
                  onChange={(e) => setMarketingData({...marketingData, asunto: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-[24px] outline-none focus:border-white/20 transition-all text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/30">Cuerpo del Mensaje</label>
                  <button onClick={() => setMarketingData({...marketingData, mensaje: marketingData.mensaje + ' {nombre}'})} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-black text-white hover:bg-white text-black hover:text-[#000000] transition-all">+{'{nombre}'}</button>
                </div>
                <textarea 
                  rows={4}
                  value={marketingData.mensaje}
                  onChange={(e) => setMarketingData({...marketingData, mensaje: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-[24px] outline-none focus:border-white/20 transition-all text-sm resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-2">Imagen (Link Unsplash / Directo)</label>
                   <input 
                    type="text" 
                    value={marketingData.image_url}
                    onChange={(e) => { setMarketingData({...marketingData, image_url: e.target.value}); updatePreview(e.target.value); }}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-[20px] outline-none focus:border-white/20 transition-all text-xs"
                  />
                </div>
                
                {activeTab === 'birthday' && (
                  <div className="space-y-2 animate-in slide-in-from-bottom-2">
                    <label className="text-xs font-black uppercase tracking-widest text-white ml-2">Link de Ruleta de Regalo (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="https://latravesia.app/game?id=birthday"
                      value={marketingData.roulette_link}
                      onChange={(e) => setMarketingData({...marketingData, roulette_link: e.target.value})}
                      className="w-full bg-white text-black/5 border border-white/20 p-4 rounded-[20px] outline-none focus:border-white/20 transition-all text-xs text-white"
                    />
                  </div>
                )}

                {activeTab === 'mass' && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-2">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-2">Filtrar Género</label>
                      <div className="flex gap-2">
                        {[
                          { id: 'ALL', label: 'Todos' },
                          { id: 'M', label: 'Hombres' },
                          { id: 'F', label: 'Mujeres' },
                        ].map(g => (
                          <button 
                            key={g.id}
                            type="button"
                            onClick={() => setGenderFilter(g.id as any)}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${genderFilter === g.id ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-2">Filtrar por Edad</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="number" 
                          placeholder="Min" 
                          value={minAge}
                          onChange={(e) => setMinAge(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-white/20 text-sm text-center font-sans"
                        />
                        <span className="text-xs text-white/40 font-black uppercase tracking-widest">y</span>
                        <input 
                          type="number" 
                          placeholder="Max" 
                          value={maxAge}
                          onChange={(e) => setMaxAge(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-white/20 text-sm text-center font-sans"
                        />
                      </div>
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
                  className="py-5 rounded-[24px] bg-white/5 border border-white/10 text-white font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <Save size={16} /> GUARDAR
                </button>
                
                <button 
                  onClick={handleLaunch}
                  disabled={saving}
                  className="py-5 rounded-[24px] bg-[#111111] text-white border border-white/20 font-black text-xs tracking-[0.3em] uppercase hover:brightness-110 transition-all flex items-center justify-center gap-3"
                >
                  <Zap size={16} /> {activeTab === 'mass' ? 'LANZAR MASIVO' : 'PROBAR'}
                </button>
              </div>

              {activeTab === 'birthday' && (
                <div className="space-y-3">
                  <button 
                    onClick={handleWeeklyBirthdayBroadcast}
                    className="w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-black text-xs tracking-widest uppercase hover:bg-white text-black/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Users size={14} /> LANZAR CAMPAÑA SEMANAL ({upcomingCount} SOCIOS)
                  </button>
                  
                  <button 
                    onClick={handleForceBirthday}
                    className="w-full py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs tracking-widest uppercase hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} /> FORZAR ENVÍO CUMPLEAÑOS DE HOY
                  </button>

                  {/* LISTA DE CUMPLEAÑEROS */}
                  {upcomingList.length > 0 && (
                    <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-4">
                      <div className="flex items-center justify-between px-2">
                        <p className="text-xs font-black uppercase tracking-widest text-white/30">Celebrados de la Semana</p>
                        <span className="px-2 py-0.5 bg-white text-black/20 text-white rounded text-xs font-black uppercase">{upcomingList.length}</span>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {upcomingList.map(c => (
                          <div key={c.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
                            <div>
                              <p className="text-xs font-bold text-white">{c.nombre} {c.apellido}</p>
                              <p className="text-xs text-white/30 uppercase font-black tracking-tighter mt-0.5">{c.fecha_nacimiento}</p>
                            </div>
                            <a 
                              href={formatWhatsAppLink(c.telefono, c.nombre, marketingData.mensaje, marketingData.roulette_link)}
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
            <Eye className="text-white" size={18} />
            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Vista Previa</h3>
          </div>

          <div className="relative w-[300px] aspect-[9/18.5] bg-white rounded-[3rem] border-[10px] border-[#1A1A1A] shadow-2xl overflow-hidden p-6 flex flex-col scale-110 origin-top">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center text-[#000000]"><Sparkles size={16} /></div>
                <p className="text-xs font-black text-gray-900 tracking-tighter uppercase">La Travesía</p>
              </div>

              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center relative border border-gray-100 group">
                {previewImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      key={previewImage}
                      src={previewImage} 
                      referrerPolicy="no-referrer" 
                      className="w-full h-full object-cover animate-in fade-in duration-500" 
                      alt="Visual" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                      <button 
                        onClick={handleRefreshPreview}
                        className="p-3 bg-white rounded-full text-[#000000] shadow-xl hover:scale-110 transition-transform"
                        title="Refrescar Previsualización"
                      >
                        <RefreshCw size={20} />
                      </button>
                      <a 
                        href={previewImage} 
                        target="_blank" 
                        className="p-3 bg-white rounded-full text-[#000000] shadow-xl hover:scale-110 transition-transform"
                        title="Ver Link Directo"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-300 flex flex-col items-center gap-2">
                    <ImageIcon size={40} />
                    <p className="text-xs font-black uppercase tracking-widest opacity-40">Sin Imagen</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-gray-900 font-serif font-black text-lg leading-tight">{marketingData.asunto}</h4>
                <p className="text-gray-600 text-xs leading-relaxed font-medium">
                  {marketingData.mensaje.replace('{nombre}', 'Socio')}
                </p>
              </div>

              <button 
                onClick={() => {
                  const num = adminWhatsapp.replace(/\+/g, '').replace(/\s+/g, '');
                  window.open(`https://wa.me/${num}?text=${encodeURIComponent('Hola La Travesía, deseo consultar mis beneficios.')}`, '_blank');
                }}
                className="w-full py-4 bg-[#000000] rounded-2xl text-white text-xs font-black uppercase tracking-[0.3em] mt-2 active:scale-95 transition-all"
              >
                CONSULTAR BENEFICIOS 🎡
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
