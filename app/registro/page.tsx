'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle2, ChevronRight, User, Mail, Calendar,
  Loader2, ArrowRight, Smartphone, Globe, Instagram,
  Facebook, Music2,
} from 'lucide-react';
import Ruleta from '@/components/Ruleta';
import { useRouter } from 'next/navigation';
import { sendNotification } from '@/app/actions/notifications';
import Image from 'next/image';

const COUNTRY_CODES = [
  { code: '+593', name: 'EC' }, { code: '+57', name: 'CO' },
  { code: '+51', name: 'PE' }, { code: '+1', name: 'US' },
  { code: '+34', name: 'ES' }, { code: '+54', name: 'AR' },
  { code: '+56', name: 'CL' }, { code: '+52', name: 'MX' },
];

type Step = 'form' | 'social' | 'game' | 'success';

/* ── Colores Apple ───────────────────────────────────────── */
const C = {
  bg:        'bg-[#F2F2F7]',
  surface:   'bg-white',
  border:    'border-[#D1D1D6]',
  sep:       'divide-[#E5E5EA]',
  label:     'text-[#1C1C1E]',
  secondary: 'text-[#636366]',
  tertiary:  'text-[#AEAEB2]',
  blue:      '#007AFF',
  gold:      '#B5933A',
  goldText:  'text-[#B5933A]',
  goldBg:    'bg-[#B5933A]',
  green:     '#34C759',
};

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
  const [socialLinks, setSocialLinks] = useState({
    instagram: '', facebook: '', tiktok: '', whatsapp_group: '',
  });
  const [whatsappConfig, setWhatsappConfig] = useState({
    enabled: true, label: 'Unirme al grupo de WhatsApp',
  });
  const router = useRouter();

  useEffect(() => {
    async function init() {
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
      label: m['whatsapp_join_label'] || 'Unirme al grupo de WhatsApp',
      enabled: m['whatsapp_join_enabled'] !== 'false',
    });
  }

  const ensureProtocol = (url: string) =>
    url.startsWith('http') ? url : `https://${url}`;

  // Redes: marcar inmediatamente al tocar — sin abrir ningún link
  const onSocialClick = (key: string) => {
    setVisitedSocials(prev => new Set([...prev, key]));
  };

  const requiredSocials = ['instagram', 'facebook', 'tiktok'];
  const visitedCount = requiredSocials.filter(k => visitedSocials.has(k)).length;
  const progressPct = Math.round((visitedCount / requiredSocials.length) * 100);

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
        .insert([{ ...dbData, telefono: telefonoFinal, total_visitas: 1, visitas: 1, fecha_ultima_visita: hoy }])
        .select().single();
      if (error) throw error;
      await supabase.from('visitas').insert([{ cliente_id: data.id, fecha: hoy, premio_ganado: premio }]);
      localStorage.setItem('travesia_cliente_id', data.id);
      localStorage.setItem('travesia_phone', telefonoFinal);
      sendNotification('BIRTHDAY_WELCOME', data).catch(console.error);
      setPremioFinal(premio);
      setStep('success');
    } catch (err: any) {
      const msg = err?.message || '';
      setFormError(msg.includes('duplicate') || msg.includes('unique')
        ? 'Este número ya está registrado.'
        : `Error al guardar: ${msg}`);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#B5933A] w-8 h-8" />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] overflow-x-hidden">
      <div className="max-w-md mx-auto min-h-screen flex flex-col px-4 pt-10 pb-8">

        {/* ── Logo ── */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <Image
            src="/logo_travesia.png"
            alt="La Travesía"
            width={120}
            height={120}
            className="object-contain drop-shadow-sm"
            priority
          />
        </div>

        {/* ── FORMULARIO ── */}
        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cabecera */}
            <div className="mb-6">
              <h1 className="text-[28px] font-serif font-bold text-[#1C1C1E] leading-tight">
                Únete al club
              </h1>
              <p className="text-[17px] text-[#636366] mt-1">
                Completa tus datos y participa en la ruleta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Card de campos */}
              <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E5EA]">
                {/* Nombre / Apellido */}
                <div className="grid grid-cols-2 divide-x divide-[#E5E5EA]">
                  <div className="p-4">
                    <label className="block text-[13px] font-semibold text-[#636366] mb-1">
                      Nombre
                    </label>
                    <input required type="text" value={formData.nombre}
                      autoComplete="given-name"
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full text-[17px] text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]"
                      placeholder="Juan" />
                  </div>
                  <div className="p-4">
                    <label className="block text-[13px] font-semibold text-[#636366] mb-1">
                      Apellido
                    </label>
                    <input required type="text" value={formData.apellido}
                      autoComplete="family-name"
                      onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                      className="w-full text-[17px] text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]"
                      placeholder="Pérez" />
                  </div>
                </div>

                <div className="border-t border-[#E5E5EA] p-4">
                  <label className="block text-[13px] font-semibold text-[#636366] mb-1">
                    Correo electrónico
                  </label>
                  <input required type="email" value={formData.email}
                    autoComplete="email"
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-[17px] text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]"
                    placeholder="correo@ejemplo.com" />
                </div>

                <div className="border-t border-[#E5E5EA] p-4">
                  <label className="block text-[13px] font-semibold text-[#636366] mb-1">
                    WhatsApp
                  </label>
                  <div className="flex items-center gap-2">
                    <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                      className="text-[17px] text-[#1C1C1E] bg-transparent outline-none font-medium">
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code}>{c.name} {c.code}</option>
                      ))}
                    </select>
                    <input required type="tel" inputMode="numeric" autoComplete="tel"
                      value={formData.telefono}
                      onChange={e => setFormData({ ...formData, telefono: e.target.value.replace(/[^0-9]/g, '') })}
                      className="flex-1 text-[17px] text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]"
                      placeholder="987654321" />
                  </div>
                </div>

                <div className="border-t border-[#E5E5EA] p-4">
                  <label className="block text-[13px] font-semibold text-[#636366] mb-1">
                    Fecha de cumpleaños
                  </label>
                  <input required type="date" value={formData.fecha_nacimiento}
                    autoComplete="bday"
                    onChange={e => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                    className="w-full text-[17px] text-[#1C1C1E] bg-transparent outline-none [color-scheme:light]" />
                </div>
              </div>

              {/* Género */}
              <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E5EA]">
                <div className="p-4 pb-3">
                  <label className="block text-[13px] font-semibold text-[#636366] mb-3">
                    Género
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ id: 'Masculino', label: 'Hombre' }, { id: 'Femenino', label: 'Mujer' }].map(g => (
                      <button key={g.id} type="button"
                        onClick={() => setFormData({ ...formData, genero: g.id })}
                        className={`py-3 rounded-xl text-[15px] font-semibold transition-all border ${formData.genero === g.id
                          ? 'bg-[#007AFF] border-[#007AFF] text-white'
                          : 'bg-[#F2F2F7] border-transparent text-[#636366]'
                        }`}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-[15px] text-center">
                  {formError}
                </div>
              )}

              <button type="submit" disabled={formLoading}
                className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-semibold text-[17px] shadow-sm hover:bg-[#0071E3] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2">
                {formLoading
                  ? <Loader2 className="animate-spin w-5 h-5" />
                  : <>¡Listo para jugar! <ChevronRight size={20} /></>
                }
              </button>
            </form>
          </div>
        )}

        {/* ── REDES SOCIALES (decorativo — los botones solo incrementan el progreso) ── */}
        {step === 'social' && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <h1 className="text-[28px] font-serif font-bold text-[#1C1C1E] leading-tight">
                Síguenos
              </h1>
              <p className="text-[17px] text-[#636366] mt-1">
                Visita nuestras redes para desbloquear la ruleta
              </p>
            </div>

            {/* Barra de progreso estilo Apple */}
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[15px] font-semibold text-[#1C1C1E]">Progreso</span>
                <span className="text-[15px] font-bold text-[#B5933A]">{progressPct}%</span>
              </div>
              <div className="h-[6px] bg-[#E5E5EA] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPct}%`, backgroundColor: '#B5933A' }}
                />
              </div>
              <p className="text-[13px] text-[#AEAEB2] mt-2">
                {visitedCount} de {requiredSocials.length} redes visitadas
              </p>
            </div>

            {/* Lista de redes — sin href, solo incrementan barra */}
            <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden mb-4">
              {[
                {
                  key: 'instagram',
                  label: 'Instagram',
                  sub: '@latravesia',
                  icon: <Instagram size={20} />,
                  color: 'bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
                },
                {
                  key: 'facebook',
                  label: 'Facebook',
                  sub: 'La Travesía',
                  icon: <Facebook size={20} />,
                  color: 'bg-[#1877F2]',
                },
                {
                  key: 'tiktok',
                  label: 'TikTok',
                  sub: '@latravesia',
                  icon: <Music2 size={20} />,
                  color: 'bg-[#010101]',
                },
              ].map(({ key, label, sub, icon, color }, idx) => {
                const visited = visitedSocials.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSocialClick(key)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all active:bg-[#F2F2F7] ${idx > 0 ? 'border-t border-[#E5E5EA]' : ''}`}
                  >
                    {/* Ícono de red */}
                    <div className={`w-11 h-11 ${color} rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0`}>
                      {icon}
                    </div>
                    {/* Texto */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[17px] font-semibold text-[#1C1C1E] leading-tight">{label}</p>
                      <p className="text-[13px] text-[#AEAEB2] mt-0.5">{sub}</p>
                    </div>
                    {/* Estado */}
                    {visited
                      ? <CheckCircle2 size={22} className="text-[#34C759] shrink-0" />
                      : <ChevronRight size={18} className="text-[#AEAEB2] shrink-0" />
                    }
                  </button>
                );
              })}
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-[15px] text-center mb-4">
                {formError}
              </div>
            )}

            {/* CTA — siempre habilitado */}
            <button
              onClick={() => setStep('game')}
              className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-semibold text-[17px] shadow-sm hover:bg-[#0071E3] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-auto"
            >
              {visitedCount === requiredSocials.length
                ? <>¡A girar la ruleta! <ChevronRight size={20} /></>
                : <>Continuar <ChevronRight size={20} /></>
              }
            </button>
            <p className="text-center text-[13px] text-[#AEAEB2] mt-3">
              Puedes continuar en cualquier momento
            </p>
          </div>
        )}

        {/* ── RULETA ── */}
        {step === 'game' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-500 select-none touch-none overflow-hidden">
            {saveLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
                <Loader2 className="animate-spin text-[#B5933A] w-10 h-10" />
              </div>
            )}
            {formError && (
              <div className="w-full mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-[15px] text-center">
                {formError}
              </div>
            )}
            <p className="text-[22px] font-serif font-bold text-[#1C1C1E] mb-4 text-center">
              ¡Gira la ruleta!
            </p>
            <div className="w-full max-w-[320px] mx-auto">
              <Ruleta onWin={handleRegistroFinal} />
            </div>
          </div>
        )}

        {/* ── ÉXITO ── */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 select-none touch-none">
            {/* Ícono de check */}
            <div className="w-20 h-20 bg-[#34C759] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-[34px] font-serif font-bold text-[#1C1C1E] leading-tight">
              ¡Bienvenido!
            </h1>
            <p className="text-[17px] text-[#636366] mt-2 mb-8">
              Ya eres parte del club de La Travesía
            </p>

            {/* Card del premio */}
            <div className="w-full bg-white border border-[#E5E5EA] rounded-3xl p-6 mb-6 shadow-sm">
              <p className="text-[13px] font-semibold text-[#AEAEB2] uppercase tracking-wide mb-2">
                Premio ganado
              </p>
              <p className="text-[24px] font-bold text-[#1C1C1E] leading-snug">{premioFinal}</p>
            </div>

            {/* WhatsApp */}
            {whatsappConfig.enabled && socialLinks.whatsapp_group && (
              <a
                href={ensureProtocol(socialLinks.whatsapp_group)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl font-semibold text-[17px] transition-all flex items-center justify-center gap-3 mb-3 active:scale-[0.98]"
                style={{ backgroundColor: '#25D366', color: '#fff' }}
              >
                <Smartphone size={20} />
                {whatsappConfig.label}
              </a>
            )}

            <button
              onClick={() => router.push('/checkin?new=true')}
              className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-semibold text-[17px] shadow-sm hover:bg-[#0071E3] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Ir a mi panel <ArrowRight size={20} />
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
