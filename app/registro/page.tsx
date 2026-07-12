'use client';

import { useState, useEffect } from 'react';
import { getAllConfig } from '@/app/actions/public';
import { checkPhoneExists, checkEmailExists, registerNewClient } from '@/app/actions/registro';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, ChevronRight, Loader2, ArrowRight,
  Smartphone, Instagram, Facebook, Music2,
} from 'lucide-react';
import Ruleta from '@/components/Ruleta';
import { sendNotification } from '@/app/actions/notifications';
import Image from 'next/image';

const COUNTRY_CODES = [
  { code: '+593', name: 'EC' }, { code: '+57', name: 'CO' },
  { code: '+51', name: 'PE' }, { code: '+1', name: 'US' },
  { code: '+34', name: 'ES' }, { code: '+54', name: 'AR' },
  { code: '+56', name: 'CL' }, { code: '+52', name: 'MX' },
];

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/* ── Picker de fecha Android-friendly (3 selects separados) ── */
function BirthdayPicker({
  value, onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1929 }, (_, i) => currentYear - 16 - i);

  // value comes as 'YYYY-MM-DD' or ''
  const [day, setDay] = useState(() => value ? parseInt(value.split('-')[2]) : 0);
  const [month, setMonth] = useState(() => value ? parseInt(value.split('-')[1]) : 0);
  const [year, setYear] = useState(() => value ? parseInt(value.split('-')[0]) : 0);

  const daysInMonth = month && year ? new Date(year, month, 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const emit = (d: number, m: number, y: number) => {
    if (d && m && y) {
      const dd = String(d).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      onChange(`${y}-${mm}-${dd}`);
    }
  };

  const handleDay = (v: number) => { setDay(v); emit(v, month, year); };
  const handleMonth = (v: number) => {
    const newDay = day > new Date(year || 2000, v, 0).getDate() ? 1 : day;
    setMonth(v); setDay(newDay); emit(newDay, v, year);
  };
  const handleYear = (v: number) => { setYear(v); emit(day, month, v); };

  const sel = 'flex-1 bg-transparent text-[17px] text-[#1C1C1E] outline-none appearance-none text-center py-1';

  return (
    <div className="flex items-center gap-1">
      {/* Día */}
      <select value={day || ''} onChange={e => handleDay(Number(e.target.value))}
        className={sel} required>
        <option value="" disabled>Día</option>
        {days.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <span className="text-[#AEAEB2] text-lg font-light">/</span>
      {/* Mes */}
      <select value={month || ''} onChange={e => handleMonth(Number(e.target.value))}
        className={sel} required>
        <option value="" disabled>Mes</option>
        {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
      </select>
      <span className="text-[#AEAEB2] text-lg font-light">/</span>
      {/* Año — lista desplegable para navegar rápido en Android */}
      <select value={year || ''} onChange={e => handleYear(Number(e.target.value))}
        className={sel} required>
        <option value="" disabled>Año</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

type Step = 'form' | 'social' | 'game' | 'success';

/* Color principal de marca */
const BRAND = '#111111';
const BRAND_DARK = '#000000';  // hover más oscuro

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
        // If there's an ID, just redirect to checkin, checking existence isn't strictly needed for UI routing.
        router.replace('/checkin'); return;
      }
      await fetchConfig();
      setLoading(false);
    }
    init();
  }, [router]);

  async function fetchConfig() {
    const m = await getAllConfig();
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

  /* Redes: marcar instantáneamente al tocar — sin abrir link */
  const onSocialClick = (key: string) => {
    setVisitedSocials(prev => new Set([...prev, key]));
  };

  const requiredSocials = ['instagram', 'facebook', 'tiktok'];
  const visitedCount = requiredSocials.filter(k => visitedSocials.has(k)).length;
  const progressPct = Math.round((visitedCount / requiredSocials.length) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fecha_nacimiento) {
      setFormError('Por favor ingresa tu fecha de cumpleaños.');
      return;
    }
    setFormLoading(true);
    setFormError('');

    try {
      const numLimpio = formData.telefono.replace(/^0/, '').replace(/\s+/g, '');
      const localPhone = countryCode === '+593' ? `0${numLimpio}` : numLimpio;
      const fullPhone = `${countryCode}${localPhone}`;
      
      const { exists: phoneExists } = await checkPhoneExists(countryCode, localPhone);
      
      if (phoneExists) {
        setFormError('Este número de teléfono ya está registrado. Ve a Registrar Visita.');
        setFormLoading(false);
        return;
      }

      const { exists: emailExists } = await checkEmailExists(formData.email);
      if (emailExists) {
        setFormError('Este correo electrónico ya está registrado. Ve a Registrar Visita o usa otro correo.');
        setFormLoading(false);
        return;
      }

      setTelefonoFinal(fullPhone);
      setStep('game');
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
      const numLimpio = formData.telefono.replace(/^0/, '').replace(/\s+/g, '');
      const localPhone = countryCode === '+593' ? `0${numLimpio}` : numLimpio;
      const fullPhone = `${countryCode}${localPhone}`;

      const res = await registerNewClient(dbData, countryCode, localPhone, premio);
      
      if (!res.success) throw new Error(res.error);
      
      localStorage.setItem('travesia_cliente_id', res.data.id);
      localStorage.setItem('travesia_phone', fullPhone);
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
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <Loader2 className="animate-spin w-8 h-8" style={{ color: BRAND }} />
    </div>
  );

  return (
    <main className="min-h-screen bg-transparent text-[#1C1C1E] overflow-x-hidden relative z-10">
      <div className="max-w-md mx-auto min-h-screen flex flex-col px-4 pt-10 pb-8">

        {/* ── Logo ── */}
        <div className={`flex flex-col items-center ${step === 'game' ? 'mb-2' : 'mb-8'} animate-in fade-in slide-in-from-top-4 duration-700`}>
          <Image
            src="/logo_travesia.png"
            alt="La Travesía"
            width={130}
            height={130}
            className="object-contain"
            priority
          />
        </div>

        {/* ══════════════════════ FORMULARIO ══════════════════════ */}
        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <h1 className="text-[32px] font-bold text-[#1C1C1E] leading-tight tracking-tight">
                Únete al club
              </h1>
              <p className="text-[17px] text-[#636366] mt-1">
                Completa tus datos y participa en la ruleta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Card campos personales */}
              <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E5EA]">

                {/* Nombre / Apellido */}
                <div className="grid grid-cols-2 divide-x divide-[#E5E5EA]">
                  <div className="p-4">
                    <label className="block text-[13px] font-semibold text-[#636366] mb-1">Nombre</label>
                    <input required type="text" value={formData.nombre}
                      autoComplete="given-name"
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full text-[17px] text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]"
                      placeholder="Juan" />
                  </div>
                  <div className="p-4">
                    <label className="block text-[13px] font-semibold text-[#636366] mb-1">Apellido</label>
                    <input required type="text" value={formData.apellido}
                      autoComplete="family-name"
                      onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                      className="w-full text-[17px] text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]"
                      placeholder="Pérez" />
                  </div>
                </div>

                {/* Email */}
                <div className="border-t border-[#E5E5EA] p-4">
                  <label className="block text-[13px] font-semibold text-[#636366] mb-1">Correo electrónico</label>
                  <input required type="email" value={formData.email}
                    autoComplete="email"
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-[17px] text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]"
                    placeholder="correo@ejemplo.com" />
                </div>

                {/* WhatsApp */}
                <div className="border-t border-[#E5E5EA] p-4">
                  <label className="block text-[13px] font-semibold text-[#636366] mb-1">WhatsApp</label>
                  <div className="flex items-center gap-2">
                    <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                      className="text-[17px] text-[#1C1C1E] bg-transparent outline-none font-medium shrink-0">
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code}>{c.name} {c.code}</option>
                      ))}
                    </select>
                    <div className="w-px h-5 bg-[#E5E5EA]" />
                    <input required type="tel" inputMode="numeric" autoComplete="tel"
                      value={formData.telefono}
                      onChange={e => setFormData({ ...formData, telefono: e.target.value.replace(/[^0-9]/g, '') })}
                      className="flex-1 text-[17px] text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]"
                      placeholder="987654321" />
                  </div>
                </div>

                {/* Fecha de cumpleaños — 3 selects, funciona perfecto en Android */}
                <div className="border-t border-[#E5E5EA] p-4">
                  <label className="block text-[13px] font-semibold text-[#636366] mb-2">
                    Fecha de cumpleaños
                  </label>
                  <BirthdayPicker
                    value={formData.fecha_nacimiento}
                    onChange={v => setFormData({ ...formData, fecha_nacimiento: v })}
                  />
                </div>
              </div>

              {/* Género */}
              <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4">
                <label className="block text-[13px] font-semibold text-[#636366] mb-3">Género</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: 'Masculino', label: 'Masculino' }, { id: 'Femenino', label: 'Femenino' }].map(g => (
                    <button key={g.id} type="button"
                      onClick={() => setFormData({ ...formData, genero: g.id })}
                      className={`py-3 rounded-xl text-[15px] font-semibold transition-all border ${formData.genero === g.id
                        ? 'border-transparent text-white'
                        : 'bg-[#F2F2F7] border-transparent text-[#636366]'
                      }`}
                      style={formData.genero === g.id ? { backgroundColor: BRAND } : {}}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-[15px] text-center">
                  {formError}
                </div>
              )}

              <button type="submit" disabled={formLoading}
                className="w-full text-white py-4 rounded-2xl font-semibold text-[17px] shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                style={{ backgroundColor: formLoading ? '#636366' : BRAND }}>
                {formLoading
                  ? <Loader2 className="animate-spin w-5 h-5" />
                  : <>¡Listo para jugar! <ChevronRight size={20} /></>
                }
              </button>
            </form>
          </div>
        )}

        {/* ══════════════════════ REDES (decorativo) ══════════════════════ */}
        {step === 'social' && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <h1 className="text-[32px] font-bold text-[#1C1C1E] leading-tight tracking-tight">Síguenos</h1>
              <p className="text-[17px] text-[#636366] mt-1">
                Toca nuestras redes para avanzar hacia la ruleta
              </p>
            </div>

            {/* Barra de progreso */}
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[15px] font-semibold text-[#1C1C1E]">Progreso</span>
                <span className="text-[15px] font-bold" style={{ color: BRAND }}>{progressPct}%</span>
              </div>
              <div className="h-[6px] bg-[#E5E5EA] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPct}%`, backgroundColor: BRAND }} />
              </div>
              <p className="text-[13px] text-[#AEAEB2] mt-2">
                {visitedCount} de {requiredSocials.length} redes visitadas
              </p>
            </div>

            {/* Lista de redes — solo incrementan barra, sin navegación */}
            <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden mb-4">
              {[
                { key: 'instagram', label: 'Instagram', sub: '@latravesia', icon: <Instagram size={20} />, color: 'bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045]' },
                { key: 'facebook',  label: 'Facebook',  sub: 'La Travesía',  icon: <Facebook size={20} />,  color: 'bg-[#1877F2]' },
                { key: 'tiktok',    label: 'TikTok',    sub: '@latravesia', icon: <Music2 size={20} />,    color: 'bg-[#010101]' },
              ].map(({ key, label, sub, icon, color }, idx) => {
                const visited = visitedSocials.has(key);
                return (
                  <button key={key} type="button"
                    onClick={() => onSocialClick(key)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all active:bg-[#F2F2F7] ${idx > 0 ? 'border-t border-[#E5E5EA]' : ''}`}>
                    <div className={`w-11 h-11 ${color} rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[17px] font-semibold text-[#1C1C1E] leading-tight">{label}</p>
                      <p className="text-[13px] text-[#AEAEB2] mt-0.5">{sub}</p>
                    </div>
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

            <button onClick={() => setStep('game')}
              className="w-full text-white py-4 rounded-2xl font-semibold text-[17px] shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-auto"
              style={{ backgroundColor: BRAND }}>
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

        {/* ══════════════════════ RULETA ══════════════════════ */}
        {step === 'game' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-500 select-none touch-none overflow-hidden pb-4">
            {saveLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
                <Loader2 className="animate-spin w-10 h-10" style={{ color: BRAND }} />
              </div>
            )}
            {formError && (
              <div className="w-full mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-[15px] text-center">
                {formError}
              </div>
            )}
            <h2 className="text-[28px] font-bold text-[#1C1C1E] mb-6 text-center leading-tight tracking-tight">
              ¡Gira la ruleta!
            </h2>
            <div className="w-full max-w-[360px] mx-auto">
              <Ruleta onWin={handleRegistroFinal} />
            </div>
          </div>
        )}

        {/* ══════════════════════ ÉXITO ══════════════════════ */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 select-none touch-none">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg"
              style={{ backgroundColor: '#34C759', boxShadow: '0 8px 24px rgba(52,199,89,0.25)' }}>
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-[34px] font-bold text-[#1C1C1E] leading-tight tracking-tight">
              ¡Ganaste!
            </h1>
            <p className="text-[17px] text-[#636366] mt-2 mb-8">
              ¡Bienvenido! Para reclamar tu premio debes unirte a nuestro grupo de WhatsApp
            </p>

            <div className="w-full bg-white border border-[#E5E5EA] rounded-3xl p-6 mb-6 shadow-sm">
              <p className="text-[13px] font-semibold text-[#AEAEB2] uppercase tracking-wide mb-2">
                Premio ganado
              </p>
              <p className="text-[24px] font-bold text-[#1C1C1E] leading-snug">{premioFinal}</p>
            </div>

            {whatsappConfig.enabled && socialLinks.whatsapp_group && (
              <a href={ensureProtocol(socialLinks.whatsapp_group)}
                target="_blank" rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl font-semibold text-[17px] transition-all flex items-center justify-center gap-3 mb-3 active:scale-[0.98] text-white"
                style={{ backgroundColor: '#25D366' }}>
                <Smartphone size={20} />
                {whatsappConfig.label}
              </a>
            )}

            <button onClick={() => {
              sessionStorage.clear();
              router.push('/');
            }}
              className="w-full text-white py-4 rounded-2xl font-semibold text-[17px] shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: BRAND }}>
              Volver al inicio <ArrowRight size={20} />
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
