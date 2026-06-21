'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import {
  CheckCircle2, UserPlus, Loader2, Sparkles,
  Trophy, Star, AlertCircle, ArrowLeft, RefreshCw,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { findClientByPhone, validateCheckin } from '@/app/actions/checkin';
import Image from 'next/image';

const BRAND = '#111111';

const COUNTRY_CODES = [
  { code: '+593', name: 'EC' }, { code: '+57', name: 'CO' },
  { code: '+51', name: 'PE' }, { code: '+1', name: 'US' },
  { code: '+34', name: 'ES' }, { code: '+54', name: 'AR' },
  { code: '+56', name: 'CL' }, { code: '+52', name: 'MX' },
];

export default function CheckInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" style={{ color: BRAND }} />
      </div>
    }>
      <CheckInContent />
    </Suspense>
  );
}

function CheckInContent() {
  const [step, setStep] = useState<'phone' | 'code' | 'review' | 'success'>('phone');
  const [countryCode, setCountryCode] = useState('+593');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [cliente, setCliente] = useState<any>(null);
  const [visitData, setVisitData] = useState<{ nuevasVisitas: number; meta: number; premio_ganado?: string } | null>(null);
  const [alreadyToday, setAlreadyToday] = useState(false);
  const [reviewOpened, setReviewOpened] = useState(false);
  const [googleReviewLink, setGoogleReviewLink] = useState('https://g.page/r/CSyFh_Ou1msUEBM/review');

  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  // Google Review: detección de retorno
  useEffect(() => {
    function handleReturn() {
      const isReviewPending = sessionStorage.getItem('chk_review_pending') === 'true';
      if (isReviewPending && (document.visibilityState === 'visible' || document.hasFocus())) {
        sessionStorage.removeItem('chk_review_pending');
        setReviewOpened(true);
        setStep('success');
      }
    }
    handleReturn();
    document.addEventListener('visibilitychange', handleReturn);
    window.addEventListener('focus', handleReturn);
    return () => {
      document.removeEventListener('visibilitychange', handleReturn);
      window.removeEventListener('focus', handleReturn);
    };
  }, [step]);

  useEffect(() => {
    const savedStep = sessionStorage.getItem('chk_step');
    const savedCliente = sessionStorage.getItem('chk_cliente');
    const savedVisitData = sessionStorage.getItem('chk_visit_data');
    const savedAlreadyToday = sessionStorage.getItem('chk_already_today');
    const savedReviewOpened = sessionStorage.getItem('chk_review_opened');
    const isReviewPending = sessionStorage.getItem('chk_review_pending') === 'true';

    let targetStep = savedStep as any;
    let targetReviewOpened = savedReviewOpened === 'true';

    if (isReviewPending) {
      sessionStorage.removeItem('chk_review_pending');
      targetReviewOpened = true;
      targetStep = 'success';
    }

    if (targetStep) setStep(targetStep);
    if (savedCliente) setCliente(JSON.parse(savedCliente));
    if (savedVisitData) setVisitData(JSON.parse(savedVisitData));
    if (savedAlreadyToday) setAlreadyToday(savedAlreadyToday === 'true');
    setReviewOpened(targetReviewOpened);
  }, []);

  useEffect(() => {
    if (step !== 'phone') {
      sessionStorage.setItem('chk_step', step);
      if (cliente) sessionStorage.setItem('chk_cliente', JSON.stringify(cliente));
      if (visitData) sessionStorage.setItem('chk_visit_data', JSON.stringify(visitData));
      sessionStorage.setItem('chk_already_today', String(alreadyToday));
      sessionStorage.setItem('chk_review_opened', String(reviewOpened));
    } else {
      ['chk_step', 'chk_cliente', 'chk_visit_data', 'chk_already_today', 'chk_review_opened'].forEach(k =>
        sessionStorage.removeItem(k)
      );
    }
  }, [step, cliente, visitData, alreadyToday, reviewOpened]);

  useEffect(() => {
    const savedPhone = localStorage.getItem('travesia_phone');
    if (savedPhone) {
      const match = savedPhone.match(/^(\+\d{1,4})(.+)$/);
      if (match) { setCountryCode(match[1]); setPhone(match[2]); }
    }

    supabase.from('config').select('clave, valor').in('clave', ['google_review_link', 'google_maps_link'])
      .then(({ data }) => {
        if (!data) return;
        const m: Record<string, string> = {};
        data.forEach(({ clave, valor }) => { if (valor) m[clave] = valor; });
        const link = m['google_review_link'] || m['google_maps_link'] || '';
        if (link) setGoogleReviewLink(link);
      });

    if (isNew) {
      const savedId = localStorage.getItem('travesia_cliente_id');
      if (savedId) {
        const hoy = new Date().toISOString().split('T')[0];
        Promise.all([
          supabase.from('clientes').select('nombre, apellido, total_visitas').eq('id', savedId).single(),
          supabase.from('config').select('valor').eq('clave', 'visitas_para_premio').single(),
          supabase.from('visitas').select('id').eq('cliente_id', savedId).eq('fecha', hoy)
        ]).then(([{ data: c }, { data: m }, { data: v }]) => {
          if (c) {
            setCliente(c);
            setVisitData({ nuevasVisitas: c.total_visitas, meta: parseInt(m?.valor || '10') });
            setAlreadyToday(v && v.length > 0 ? true : false);
            setStep('success');
          }
        });
      }
    }
  }, [isNew]);

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setProcessing(true);
    try {
      const fullPhone = `${countryCode}${phone.replace(/^0/, '').replace(/\s+/g, '')}`;
      const result = await findClientByPhone(fullPhone);
      if (result.error) throw new Error(result.error);
      setCliente(result.cliente);
      setStep('code');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setProcessing(true);
    try {
      const result = await validateCheckin(cliente.id, code);
      if (result.alreadyToday) {
        setAlreadyToday(true);
        setVisitData({ nuevasVisitas: result.nuevasVisitas!, meta: result.meta! });
        setCliente(result.cliente);
        setStep('success');
        return;
      }
      if (result.error) throw new Error(result.error);
      setCliente(result.cliente);
      setVisitData({ nuevasVisitas: result.nuevasVisitas!, meta: result.meta! });
      localStorage.setItem('travesia_cliente_id', result.cliente!.id);
      localStorage.setItem('travesia_phone', `${countryCode}${phone.replace(/^0/, '')}`);
      setStep(result.showReview ? 'review' : 'success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  function handleCambiarPersona() {
    localStorage.removeItem('travesia_cliente_id');
    localStorage.removeItem('travesia_phone');
    setPhone(''); setCode(''); setError(''); setCliente(null);
    setStep('phone');
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 px-4 pt-10 pb-8">

        {/* Logo */}
        <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <Image
            src="/logo_travesia.png"
            alt="La Travesía"
            width={100}
            height={100}
            className="object-contain"
            priority
          />
        </div>

        {/* Título de sección */}
        <div className="mb-6">
          <h1 className="text-[32px] font-bold text-[#1C1C1E] tracking-tight">
            {step === 'phone' && 'Registrar visita'}
            {step === 'code' && 'Validar entrada'}
            {step === 'review' && 'Tu opinión'}
            {step === 'success' && (alreadyToday ? '¡Hola de nuevo!' : visitData?.premio_ganado ? '¡Felicidades, ganaste!' : '¡Visita registrada!')}
          </h1>
          <p className="text-[17px] text-[#636366] mt-1">
            {step === 'phone' && 'Ingresa tu número de WhatsApp'}
            {step === 'code' && 'Ingresa el código del día'}
            {step === 'review' && 'Comparte tu experiencia'}
            {step === 'success' && (alreadyToday ? 'Ya registraste tu visita de hoy.' : 'Un paso más cerca de tu premio.')}
          </p>
        </div>

        {/* ── PASO: TELÉFONO ── */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-3 animate-in fade-in duration-400">
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4">
              <label className="block text-[13px] font-semibold text-[#636366] mb-2">
                Número de WhatsApp
              </label>
              <div className="flex items-center gap-2">
                <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                  className="text-[17px] text-[#1C1C1E] bg-transparent outline-none font-medium shrink-0">
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.name} {c.code}</option>
                  ))}
                </select>
                <div className="w-px h-6 bg-[#E5E5EA]" />
                <input type="tel" inputMode="numeric" autoComplete="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="987654321" required
                  className="flex-1 text-[17px] text-[#1C1C1E] bg-transparent outline-none placeholder:text-[#AEAEB2]" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-[15px] text-center">
                {error}
              </div>
            )}

            <button type="submit" disabled={processing || !phone}
              className="w-full text-white py-4 rounded-2xl font-semibold text-[17px] shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ backgroundColor: BRAND }}>
              {processing ? <Loader2 className="animate-spin w-5 h-5" /> : 'Buscar mi cuenta →'}
            </button>

            <button type="button" onClick={() => router.push('/registro')}
              className="w-full bg-white border border-[#E5E5EA] text-[#3c5b39] py-4 rounded-2xl font-semibold text-[17px] active:bg-[#F2F2F7] transition-all flex items-center justify-center gap-2">
              <UserPlus size={18} /> Soy cliente nuevo
            </button>

            <button type="button" onClick={handleCambiarPersona}
              className="w-full text-[#636366] text-[15px] py-2 flex items-center justify-center gap-2 hover:text-[#1C1C1E] transition-colors">
              <RefreshCw size={15} /> Soy otra persona
            </button>
          </form>
        )}

        {/* ── PASO: CÓDIGO ── */}
        {step === 'code' && cliente && (
          <form onSubmit={handleCodeSubmit} className="space-y-4 animate-in slide-in-from-bottom-4 duration-400">
            {/* Card del cliente */}
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
              <p className="text-[13px] font-semibold text-[#AEAEB2] mb-1">Bienvenido de vuelta</p>
              <h2 className="text-[22px] font-semibold text-[#1C1C1E]">
                {cliente.nombre} {cliente.apellido}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <Trophy className="w-4 h-4 text-[#B5933A]" />
                <span className="text-[15px] text-[#636366]">{cliente.total_visitas || 0} visitas acumuladas</span>
              </div>
            </div>

            {/* Input del código */}
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
              <label className="block text-[13px] font-semibold text-[#636366] mb-3">
                Código del día (pídelo al personal)
              </label>
              <input type="password" inputMode="numeric" value={code}
                onChange={e => setCode(e.target.value)} placeholder="••••" required
                className="w-full text-center text-[40px] tracking-[0.8em] py-2 bg-transparent border-b-2 border-[#E5E5EA] focus:border-[#3c5b39] outline-none transition-colors font-mono text-[#1C1C1E]" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-[15px] text-center">
                {error}
              </div>
            )}

            <button type="submit" disabled={processing || !code}
              className="w-full text-white py-4 rounded-2xl font-semibold text-[17px] shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ backgroundColor: BRAND }}>
              {processing ? <Loader2 className="animate-spin w-5 h-5" /> : <><CheckCircle2 className="w-5 h-5" /> Validar visita</>}
            </button>

            <button type="button" onClick={() => { setStep('phone'); setCode(''); setError(''); }}
              className="w-full text-[#636366] text-[15px] py-2 flex items-center justify-center gap-2 hover:text-[#1C1C1E] transition-colors">
              <ArrowLeft size={16} /> Cambiar número
            </button>
          </form>
        )}

        {/* ── PASO: REVIEW ── */}
        {step === 'review' && visitData && (
          <div className="space-y-5 animate-in zoom-in duration-500">
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 text-center">
              <div className="flex justify-center gap-1.5 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={30}
                    className={`text-[#B5933A] transition-all duration-500 ${reviewOpened ? 'fill-current' : 'opacity-25'}`}
                    style={{ transitionDelay: reviewOpened ? `${(i - 1) * 80}ms` : '0ms' }} />
                ))}
              </div>
              <h2 className="text-[22px] font-bold text-[#1C1C1E] mb-2">
                {visitData.nuevasVisitas === visitData.meta
                  ? '¡Lo lograste!'
                  : visitData.nuevasVisitas === 1
                  ? 'Primera visita'
                  : '¿Cómo te fue?'}
              </h2>
              <p className="text-[15px] text-[#636366]">
                {visitData.nuevasVisitas === visitData.meta
                  ? 'Completaste el reto de fidelidad. ¡Cuéntale al mundo!'
                  : visitData.nuevasVisitas === 1
                  ? 'Déjanos tu opinión sobre tu primera visita.'
                  : 'Tu reseña nos ayuda mucho a mejorar.'}
              </p>
            </div>

            {!reviewOpened ? (
              <a href={googleReviewLink}
                onClick={() => {
                  setReviewOpened(true);
                  sessionStorage.setItem('chk_review_pending', 'true');
                  sessionStorage.setItem('chk_step', step);
                  if (cliente) sessionStorage.setItem('chk_cliente', JSON.stringify(cliente));
                  if (visitData) sessionStorage.setItem('chk_visit_data', JSON.stringify(visitData));
                  sessionStorage.setItem('chk_already_today', String(alreadyToday));
                  sessionStorage.setItem('chk_review_opened', 'true');
                }}
                className="w-full text-white py-4 rounded-2xl font-semibold text-[17px] shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: BRAND }}>
                <Star size={18} className="fill-current" /> Dejar mi reseña ⭐
              </a>
            ) : (
              <button onClick={() => setStep('success')}
                className="w-full text-white py-4 rounded-2xl font-semibold text-[17px] shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: BRAND }}>
                <CheckCircle2 size={18} /> Ya dejé mi reseña →
              </button>
            )}

            <button onClick={() => setStep('success')}
              className="w-full text-[#636366] text-[15px] py-2 hover:text-[#1C1C1E] transition-colors">
              Ahora no
            </button>
          </div>
        )}

        {/* ── PASO: ÉXITO ── */}
        {step === 'success' && visitData && (
          <div className="flex flex-col items-center text-center animate-in zoom-in duration-500">
            {/* Ícono */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-lg ${alreadyToday ? 'bg-[#FF9500] shadow-orange-200' : 'bg-[#34C759] shadow-green-200'}`}>
              {alreadyToday
                ? <AlertCircle className="w-10 h-10 text-white" />
                : <Sparkles className="w-10 h-10 text-white" />
              }
            </div>

            {/* Progreso */}
            <div className="w-full bg-white rounded-3xl border border-[#E5E5EA] p-6 mb-5 shadow-sm">
              <p className="text-[13px] font-semibold text-[#AEAEB2] uppercase tracking-wide mb-1">
                Tu progreso
              </p>
              <p className="text-[48px] font-bold text-[#1C1C1E] leading-none tracking-tight">
                {visitData.nuevasVisitas}
                <span className="text-[28px] text-[#AEAEB2] font-medium"> / {visitData.meta}</span>
              </p>

              {/* Barra progreso */}
              <div className="mt-4 h-[6px] bg-[#E5E5EA] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min((visitData.nuevasVisitas / visitData.meta) * 100, 100)}%`,
                    backgroundColor: visitData.nuevasVisitas >= visitData.meta ? '#34C759' : '#B5933A',
                  }}
                />
              </div>

              {visitData.nuevasVisitas >= visitData.meta && (
                <p className="text-[15px] font-semibold text-[#34C759] mt-3">
                  🎉 ¡Premio disponible! Habla con el personal.
                </p>
              )}
            </div>

            <button onClick={() => {
              ['chk_step', 'chk_cliente', 'chk_visit_data', 'chk_already_today', 'chk_review_opened']
                .forEach(k => sessionStorage.removeItem(k));
              router.push('/');
            }}
              className="text-[17px] font-semibold mb-3 hover:opacity-70 transition-opacity"
              style={{ color: BRAND }}>
              Volver al inicio
            </button>

            <button onClick={handleCambiarPersona}
              className="text-[#636366] text-[15px] flex items-center gap-1.5 hover:text-[#1C1C1E] transition-colors">
              <RefreshCw size={14} /> Soy otra persona
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
    </div>
  );
}
