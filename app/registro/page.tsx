'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle2, Sparkles, ChevronRight, Star,
  User, Mail, Calendar, Loader2, ArrowRight,
  Smartphone, Globe, Instagram, Facebook, Music2, Lock
} from 'lucide-react';
import Ruleta from '@/components/Ruleta';
import { useRouter } from 'next/navigation';
import { sendNotification } from '@/app/actions/notifications';

const COUNTRY_CODES = [
  { code: '+593', name: 'EC' }, { code: '+57', name: 'CO' },
  { code: '+51', name: 'PE' }, { code: '+1', name: 'US' },
  { code: '+34', name: 'ES' }, { code: '+54', name: 'AR' },
  { code: '+56', name: 'CL' }, { code: '+52', name: 'MX' },
];

type Step = 'form' | 'social' | 'review' | 'game' | 'success';

export default function RegistroPage() {
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+593');
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', telefono: '',
    fecha_nacimiento: '', genero: 'Otro', joinWhatsApp: true,
  });
  const [premioFinal, setPremioFinal] = useState<string | null>(null);
  const [telefonoFinal, setTelefonoFinal] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [visitedSocials, setVisitedSocials] = useState<Set<string>>(new Set());
  const pendingSocialRef = useRef<string | null>(null);
  const openedWindowRef = useRef<Window | null>(null);
  const waitingForReturnRef = useRef(false);
  const reviewPendingRef = useRef(false);
  const [reviewOpened, setReviewOpened] = useState(false);
  const [googleReviewLink, setGoogleReviewLink] = useState('https://g.page/r/CSyFh_Ou1msUEBM/review');
  const [socialLinks, setSocialLinks] = useState({
    instagram: '', facebook: '', tiktok: '', whatsapp_group: '',
  });
  const [whatsappConfig, setWhatsappConfig] = useState({
    enabled: true, label: 'Unirme al grupo de WhatsApp de la comunidad',
  });
  const router = useRouter();

  // Cargar estado inicial desde sessionStorage (si existe) para no perder progreso al volver de redes
  useEffect(() => {
    const savedStep = sessionStorage.getItem('reg_step');
    const savedFormData = sessionStorage.getItem('reg_form_data');
    const savedTelefonoFinal = sessionStorage.getItem('reg_telefono_final');
    const savedVisited = sessionStorage.getItem('reg_visited_socials');
    const pendingSocial = sessionStorage.getItem('reg_pending_social');

    let newVisited = new Set<string>();
    if (savedVisited) {
      newVisited = new Set(JSON.parse(savedVisited));
    }
    if (pendingSocial) {
      newVisited.add(pendingSocial);
      sessionStorage.removeItem('reg_pending_social');
    }

    if (savedStep) setStep(savedStep as Step);
    if (savedFormData) setFormData(JSON.parse(savedFormData));
    if (savedTelefonoFinal) setTelefonoFinal(savedTelefonoFinal);
    setVisitedSocials(newVisited);
  }, []);

  // Guardar estado en sessionStorage cuando cambie
  useEffect(() => {
    if (step !== 'form' && step !== 'success') {
      sessionStorage.setItem('reg_step', step);
      sessionStorage.setItem('reg_form_data', JSON.stringify(formData));
      sessionStorage.setItem('reg_telefono_final', telefonoFinal);
      sessionStorage.setItem('reg_visited_socials', JSON.stringify(Array.from(visitedSocials)));
    } else {
      // Si estamos en el formulario o ya se completó el registro, limpiar todo
      sessionStorage.removeItem('reg_step');
      sessionStorage.removeItem('reg_form_data');
      sessionStorage.removeItem('reg_telefono_final');
      sessionStorage.removeItem('reg_visited_socials');
      sessionStorage.removeItem('reg_pending_social');
      sessionStorage.removeItem('reg_review_pending');
    }
  }, [step, formData, telefonoFinal, visitedSocials]);

  useEffect(() => {
    async function init() {
      // Redirigir si ya está registrado
      const savedId = localStorage.getItem('travesia_cliente_id');
      if (savedId) {
        const { data } = await supabase.from('clientes').select('id').eq('id', savedId).single();
        if (data) { router.replace('/checkin'); return; }
        localStorage.removeItem('travesia_cliente_id');
      }
      await fetchConfig();
      setLoading(false);
    }
    init();
  }, [router]);

  async function fetchConfig() {
    const { data } = await supabase.from('config').select('clave, valor');
    if (!data) return;
    const m: Record<string, string> = {};
    data.forEach(({ clave, valor }) => { if (valor) m[clave] = valor; });

    setSocialLinks({
      instagram: m['instagram_link'] || m['link_instagram'] || '',
      facebook: m['facebook_link'] || m['link_facebook'] || '',
      tiktok: m['tiktok_link'] || m['link_tiktok'] || '',
      whatsapp_group: m['whatsapp_group_link'] || m['link_whatsapp'] || '',
    });
    setWhatsappConfig({
      label: m['whatsapp_join_label'] || 'Unirme al grupo de WhatsApp de la comunidad',
      enabled: m['whatsapp_join_enabled'] !== 'false',
    });
    const reviewLink = m['google_review_link'] || m['google_maps_link'] || '';
    if (reviewLink) setGoogleReviewLink(reviewLink);
  }

  const ensureProtocol = (url: string) =>
    url.startsWith('http') ? url : `https://${url}`;

  // Listener único: maneja retorno de redes sociales Y de Google Review
  useEffect(() => {
    function handleVisibilityReturn() {
      // Retorno desde red social (persistencia en sessionStorage)
      const pendingKey = sessionStorage.getItem('reg_pending_social') || pendingSocialRef.current;
      if (pendingKey && (document.visibilityState === 'visible' || document.hasFocus())) {
        // Cerrar la ventana/pestaña intermedia si existe y el navegador lo permite
        if (openedWindowRef.current) {
          try {
            openedWindowRef.current.close();
          } catch (e) {
            console.error("Error al cerrar la ventana:", e);
          }
          openedWindowRef.current = null;
        }
        sessionStorage.removeItem('reg_pending_social');
        pendingSocialRef.current = null;
        setVisitedSocials(prev => new Set([...prev, pendingKey]));
      }

      // Retorno desde Google Review → avanzar al juego
      const isReviewPending = sessionStorage.getItem('reg_review_pending') === 'true' || reviewPendingRef.current;
      if (isReviewPending && (document.visibilityState === 'visible' || document.hasFocus())) {
        // Cerrar la ventana/pestaña intermedia si existe y el navegador lo permite
        if (openedWindowRef.current) {
          try {
            openedWindowRef.current.close();
          } catch (e) {
            console.error("Error al cerrar la ventana:", e);
          }
          openedWindowRef.current = null;
        }
        sessionStorage.removeItem('reg_review_pending');
        reviewPendingRef.current = false;
        setReviewOpened(true);
        setStep('game');
      }
    }

    // Ejecutar verificación inmediatamente al montar (para cuando vuelven por botón de Atrás/Back)
    handleVisibilityReturn();

    document.addEventListener('visibilitychange', handleVisibilityReturn);
    window.addEventListener('focus', handleVisibilityReturn);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityReturn);
      window.removeEventListener('focus', handleVisibilityReturn);
    };
  }, [step]);

  const onSocialClick = (key: string) => {
    sessionStorage.setItem('reg_pending_social', key);
    pendingSocialRef.current = key;
    waitingForReturnRef.current = true;
    
    // Asegurar que el estado esté guardado antes de salir
    sessionStorage.setItem('reg_step', step);
    sessionStorage.setItem('reg_form_data', JSON.stringify(formData));
    sessionStorage.setItem('reg_telefono_final', telefonoFinal);
    sessionStorage.setItem('reg_visited_socials', JSON.stringify(Array.from(visitedSocials)));
  };

  const goToReview = () => {
    sessionStorage.setItem('reg_review_pending', 'true');
    reviewPendingRef.current = true;
    setStep('review');
    window.location.href = ensureProtocol(googleReviewLink);
  };

  const requiredSocials = ['instagram', 'facebook', 'tiktok'];
  const nextSocialKey = requiredSocials.find(k => !visitedSocials.has(k));
  const visitedCount = requiredSocials.filter(k => visitedSocials.has(k)).length;
  const allSocialsVisited = visitedCount === requiredSocials.length;

  useEffect(() => {
    if (step === 'social' && allSocialsVisited) {
      const t = setTimeout(() => setStep('game'), 1500);
      return () => clearTimeout(t);
    }
  }, [allSocialsVisited, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const numLimpio = formData.telefono.replace(/^0/, '').replace(/\s+/g, '');
    const tel = `${countryCode}${numLimpio}`;
    setFormError('');
    try {
      const { data: existing } = await supabase
        .from('clientes').select('id').eq('telefono', tel).maybeSingle();
      if (existing) {
        setFormError('Este número ya está registrado. Ve a Registrar Visita.');
        return;
      }
      setTelefonoFinal(tel);
      setStep('social');
    } catch (error: any) {
      setFormError(error?.message || 'Error al verificar. Intenta de nuevo.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRegistroFinal = async (premio: string) => {
    setSaveLoading(true);
    try {
      const { joinWhatsApp, ...dbData } = formData;
      const hoy = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          ...dbData,
          telefono: telefonoFinal,
          total_visitas: 1,
          visitas: 1,
          fecha_ultima_visita: hoy,
        }])
        .select().single();
      if (error) throw error;
      await supabase.from('visitas').insert([{
        cliente_id: data.id,
        fecha: hoy,
        premio_ganado: premio,
      }]);
      localStorage.setItem('travesia_cliente_id', data.id);
      localStorage.setItem('travesia_phone', telefonoFinal);
      sendNotification('BIRTHDAY_WELCOME', data).catch(console.error);
      setPremioFinal(premio);
      setStep('success');
    } catch (err: any) {
      const msg = err?.message || '';
      setFormError(msg.includes('duplicate') || msg.includes('unique')
        ? 'Este número ya está registrado. Ve a Registrar Visita.'
        : `Error al guardar: ${msg}`);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#051A10] flex items-center justify-center">
      <Loader2 className="animate-spin text-travesia-gold w-10 h-10" />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#051A10] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-travesia-gold/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-md mx-auto min-h-screen flex flex-col px-6 py-6 overflow-x-hidden w-full">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="w-12 h-12 bg-gradient-to-br from-travesia-gold to-[#B8860B] rounded-2xl flex items-center justify-center shadow-xl">
            <Sparkles className="w-6 h-6 text-[#051A10]" />
          </div>
          <h1 className="mt-2 text-xl font-serif font-bold text-travesia-gold">La Travesía</h1>
          <p className="text-xs uppercase tracking-[0.4em] font-black text-white/30 italic">Loyalty Experience</p>
        </div>

        {/* FORM */}
        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-right-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 min-w-0">
                    <label className="text-xs font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><User size={10}/> Nombre</label>
                    <input required type="text" value={formData.nombre}
                      autoComplete="given-name"
                      onChange={e => setFormData({...formData, nombre: e.target.value})}
                      className="w-full min-w-0 bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <label className="text-xs font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><User size={10}/> Apellido</label>
                    <input required type="text" value={formData.apellido}
                      autoComplete="family-name"
                      onChange={e => setFormData({...formData, apellido: e.target.value})}
                      className="w-full min-w-0 bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><Mail size={10}/> Correo</label>
                  <input required type="email" value={formData.email}
                    autoComplete="email"
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><Globe size={10}/> WhatsApp</label>
                  <div className="flex gap-2">
                    <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                      className="w-[100px] bg-white/10 border border-white/10 py-3 px-2 rounded-xl text-travesia-gold font-bold text-sm outline-none focus:border-travesia-gold">
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code} className="bg-[#051A10] text-white">{c.name} {c.code}</option>
                      ))}
                    </select>
                    <input required type="tel" inputMode="numeric" autoComplete="tel"
                      value={formData.telefono}
                      onChange={e => setFormData({...formData, telefono: e.target.value.replace(/[^0-9]/g, '')})}
                      className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><Calendar size={10}/> Fecha de Cumpleaños</label>
                  <input required type="date" value={formData.fecha_nacimiento}
                    autoComplete="bday"
                    onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})}
                    className="w-full min-w-0 bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-white [color-scheme:dark]" />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="text-xs font-black uppercase tracking-widest text-travesia-gold">Género</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{id: 'Masculino', label: 'Hombre'}, {id: 'Femenino', label: 'Mujer'}].map(g => (
                      <button key={g.id} type="button" onClick={() => setFormData({...formData, genero: g.id})}
                        className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${formData.genero === g.id ? 'bg-travesia-gold/10 border-travesia-gold text-travesia-gold' : 'bg-white/5 border-white/10 text-white/50'}`}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs font-bold text-center">
                  {formError}
                </div>
              )}

              <button type="submit" disabled={formLoading}
                className="w-full bg-travesia-gold text-[#051A10] py-4 rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4">
                {formLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>LISTO PARA JUGAR <ChevronRight size={14} /></>}
              </button>
            </form>
          </div>
        )}

        {/* SOCIAL */}
        {step === 'social' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-5 animate-in fade-in slide-in-from-right-8">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-travesia-gold/10 rounded-2xl flex items-center justify-center text-travesia-gold mb-1">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white">Síguenos</h2>
              <p className="text-white/40 text-xs uppercase tracking-widest font-black italic">Activa tu acceso a la ruleta</p>
            </div>

            <div className="w-full px-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-black tracking-widest text-white/30">Progreso</span>
                <span className="text-xs uppercase font-black tracking-widest text-travesia-gold">{visitedCount} / {requiredSocials.length}</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-travesia-gold rounded-full transition-all duration-700"
                  style={{ width: `${(visitedCount / requiredSocials.length) * 100}%` }} />
              </div>
            </div>

            <div className="w-full space-y-2 px-2">
              {[
                { key: 'instagram', label: 'Instagram', url: socialLinks.instagram,
                  icon: <Instagram size={16} />, bg: 'bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045]' },
                { key: 'facebook', label: 'Facebook', url: socialLinks.facebook,
                  icon: <Facebook size={16} />, bg: 'bg-[#1877F2]' },
                { key: 'tiktok', label: 'TikTok', url: socialLinks.tiktok,
                  icon: <Music2 size={16} />, bg: 'bg-black border border-white/10' },
              ].map(({ key, label, url, icon, bg }) => {
                const fullUrl = url ? ensureProtocol(url) : null;
                const visited = visitedSocials.has(key);
                const isActive = nextSocialKey === key;

                if (!fullUrl) {
                  return (
                    <div key={key}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 opacity-30 cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center text-white shadow-lg`}>{icon}</div>
                        <span className="text-xs font-black uppercase tracking-widest text-white/50">{label}</span>
                      </div>
                      <span className="text-xs text-white/30">Sin link</span>
                    </div>
                  );
                }

                if (visited) {
                  return (
                    <a key={key}
                      href={fullUrl}
                      target="_self"
                      onClick={() => onSocialClick(key)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-travesia-gold/15 border border-travesia-gold/50 text-left transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center text-white shadow-lg opacity-80`}>{icon}</div>
                        <span className="text-xs font-black uppercase tracking-widest text-travesia-gold">{label}</span>
                      </div>
                      <CheckCircle2 size={16} className="text-travesia-gold shrink-0" />
                    </a>
                  );
                }

                if (isActive) {
                  return (
                    <a key={key}
                      href={fullUrl}
                      target="_self"
                      onClick={() => onSocialClick(key)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/10 border-2 border-travesia-gold text-left active:scale-[0.98] transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center text-white shadow-lg animate-pulse`}>{icon}</div>
                        <span className="text-xs font-black uppercase tracking-widest text-white">{label}</span>
                      </div>
                      <div className="flex items-center gap-1 text-travesia-gold">
                        <span className="text-[10px] font-black uppercase tracking-widest">IR</span>
                        <ArrowRight size={12} className="animate-bounce" style={{ animationDuration: '0.8s' }} />
                      </div>
                    </a>
                  );
                }

                // Locked state
                return (
                  <div key={key}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 text-left opacity-30 select-none cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-white/50">{icon}</div>
                      <span className="text-xs font-black uppercase tracking-widest text-white/40">{label}</span>
                    </div>
                    <Lock size={12} className="text-white/30 shrink-0" />
                  </div>
                );
              })}
            </div>

            {formError && (
              <div className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs font-bold text-center">
                {formError}
              </div>
            )}

            <button onClick={() => setStep('game')}
              className="w-full py-4 rounded-2xl font-black text-xs tracking-[0.3em] uppercase shadow-2xl transition-all flex items-center justify-center gap-2 bg-travesia-gold text-[#051A10] hover:brightness-110 active:scale-95">
              {allSocialsVisited
                ? <>SIGUIENTE <ChevronRight size={14} /></>
                : <>SEGUIR ({visitedCount}/{requiredSocials.length}) <ChevronRight size={14} /></>}
            </button>
          </div>
        )}

        {/* GOOGLE REVIEW — se abre automático al llegar aquí */}
        {step === 'review' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-7 animate-in fade-in slide-in-from-right-8">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-travesia-gold/10 rounded-[24px] flex items-center justify-center border border-travesia-gold/20">
                <Star size={28} className="text-travesia-gold fill-current animate-pulse" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white">¡Gracias!</h2>
              <p className="text-white/50 text-sm leading-relaxed px-4">
                Se abrió Google para tu reseña. Cuando termines, vuelve aquí y continúa automáticamente.
              </p>
            </div>

            <div className="flex gap-1.5 justify-center">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={30}
                  className="text-travesia-gold fill-current scale-110"
                  style={{ animationDelay: `${(i - 1) * 80}ms` }} />
              ))}
            </div>

            {/* Botón de respaldo si el popup fue bloqueado */}
            <div className="w-full px-2 space-y-3">
              <a href={ensureProtocol(googleReviewLink)} target="_self" onClick={goToReview}
                className="w-full bg-white/10 border border-white/20 text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:border-travesia-gold/50 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Star size={14} className="text-travesia-gold fill-current" /> Abrir reseña de nuevo
              </a>
              <button onClick={() => setStep('game')}
                className="w-full bg-travesia-gold text-[#051A10] py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                <ChevronRight size={14} /> Ya dejé mi reseña — Girar ruleta
              </button>
            </div>
          </div>
        )}

        {/* GAME */}
        {step === 'game' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in h-full overflow-hidden select-none touch-none">
            {saveLoading && (
              <div className="absolute inset-0 bg-[#051A10]/80 flex items-center justify-center z-50 rounded-3xl">
                <Loader2 className="animate-spin text-travesia-gold w-10 h-10" />
              </div>
            )}
            <div className="w-full max-w-[320px] mx-auto">
              <Ruleta onWin={handleRegistroFinal} />
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in select-none touch-none w-full">
            <div className="space-y-4 w-full">
              <div className="mx-auto w-16 h-16 bg-travesia-gold/20 rounded-2xl flex items-center justify-center border border-travesia-gold/30">
                <CheckCircle2 className="w-8 h-8 text-travesia-gold" />
              </div>
              <h2 className="text-3xl font-serif font-bold">¡Bienvenido!</h2>
              <div className="relative w-full">
                <div className="absolute -inset-0.5 bg-travesia-gold/20 rounded-[32px] blur opacity-75" />
                <div className="relative p-6 bg-white/5 border border-travesia-gold/30 rounded-[32px] backdrop-blur-2xl">
                  <p className="text-xs uppercase tracking-[0.4em] text-travesia-gold font-black mb-2">Premio Ganado</p>
                  <p className="text-2xl font-black text-white leading-tight">{premioFinal}</p>
                </div>
              </div>
            </div>

            {whatsappConfig.enabled && socialLinks.whatsapp_group && (
              <a
                href={ensureProtocol(socialLinks.whatsapp_group)}
                className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:brightness-110 shadow-xl transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Smartphone size={16} /> {whatsappConfig.label}
              </a>
            )}

            <button onClick={() => router.push('/checkin?new=true')}
              className="w-full bg-travesia-gold text-[#051A10] py-5 rounded-2xl font-black text-xs tracking-widest uppercase hover:brightness-110 shadow-2xl transition-all flex items-center justify-center gap-2">
              IR A MI PANEL <ArrowRight size={14} />
            </button>
          </div>
        )}

      </div>

      <style jsx global>{`
        html, body {
          touch-action: manipulation;
          overscroll-behavior-y: contain;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </main>
  );
}
