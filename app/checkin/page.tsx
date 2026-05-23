'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  CheckCircle2, UserPlus, Loader2, MapPin, Sparkles,
  Trophy, Star, AlertCircle, ArrowLeft, Phone, RefreshCw
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { findClientByPhone, validateCheckin } from '@/app/actions/checkin';

const COUNTRY_CODES = [
  { code: '+593', name: 'EC' }, { code: '+57', name: 'CO' },
  { code: '+51', name: 'PE' }, { code: '+1', name: 'US' },
  { code: '+34', name: 'ES' }, { code: '+54', name: 'AR' },
  { code: '+56', name: 'CL' }, { code: '+52', name: 'MX' },
];

export default function CheckInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#051A10] flex items-center justify-center">
        <Loader2 className="animate-spin text-travesia-gold w-10 h-10" />
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
  const [visitData, setVisitData] = useState<{ nuevasVisitas: number; meta: number } | null>(null);
  const [alreadyToday, setAlreadyToday] = useState(false);
  const [reviewOpened, setReviewOpened] = useState(false);
  const [googleReviewLink, setGoogleReviewLink] = useState('https://g.page/r/CSyFh_Ou1msUEBM/review');

  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  useEffect(() => {
    // Pre-rellenar teléfono desde localStorage
    const savedPhone = localStorage.getItem('travesia_phone');
    if (savedPhone) {
      const match = savedPhone.match(/^(\+\d{1,4})(.+)$/);
      if (match) {
        setCountryCode(match[1]);
        setPhone(match[2]);
      }
    }

    // Cargar link de reseña
    supabase.from('config').select('valor').eq('clave', 'google_review_link').single()
      .then(({ data }) => { if (data?.valor) setGoogleReviewLink(data.valor); });

    // Si viene de registro nuevo (?new=true), mostrar panel directo
    if (isNew) {
      const savedId = localStorage.getItem('travesia_cliente_id');
      if (savedId) {
        Promise.all([
          supabase.from('clientes').select('nombre, apellido, total_visitas').eq('id', savedId).single(),
          supabase.from('config').select('valor').eq('clave', 'visitas_para_premio').single(),
        ]).then(([{ data: c }, { data: m }]) => {
          if (c) {
            setCliente(c);
            setVisitData({ nuevasVisitas: c.total_visitas, meta: parseInt(m?.valor || '10') });
            setAlreadyToday(false);
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

      if (result.showReview) {
        setStep('review');
      } else {
        setStep('success');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  function handleCambiarPersona() {
    localStorage.removeItem('travesia_cliente_id');
    localStorage.removeItem('travesia_phone');
    setPhone('');
    setCode('');
    setError('');
    setCliente(null);
    setStep('phone');
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-[#051A10] p-6 flex flex-col items-center justify-center font-serif text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-travesia-gold/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="mx-auto w-14 h-14 bg-travesia-gold/20 rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <MapPin className="w-7 h-7 text-travesia-gold" />
          </div>
          <h1 className="text-2xl font-bold text-travesia-gold tracking-tight">Check-In</h1>
          <p className="text-white/30 text-[9px] uppercase tracking-[0.4em] font-black mt-1">La Travesía Loyalty</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">

          {/* STEP: PHONE */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="text-center space-y-1">
                <Phone className="mx-auto w-7 h-7 text-travesia-gold/50" />
                <p className="text-sm text-white/50 font-sans">Ingresa tu número de WhatsApp</p>
              </div>

              <div className="flex gap-2">
                <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                  className="w-[90px] bg-white/10 border border-white/10 px-2 rounded-xl text-travesia-gold font-bold text-[11px] outline-none focus:border-travesia-gold">
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code} className="bg-[#051A10]">{c.name} {c.code}</option>
                  ))}
                </select>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="987654321" required
                  className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm font-sans" />
              </div>

              {error && <p className="text-red-400 text-[10px] text-center font-bold uppercase tracking-widest">{error}</p>}

              <button type="submit" disabled={processing || !phone}
                className="w-full bg-travesia-gold text-[#051A10] py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30">
                {processing ? <Loader2 className="animate-spin w-5 h-5" /> : 'BUSCAR MI CUENTA →'}
              </button>

              <button type="button" onClick={() => router.push('/registro')}
                className="w-full text-white/30 text-[9px] uppercase tracking-widest font-black hover:text-white/50 transition-colors flex items-center justify-center gap-2">
                <UserPlus size={12} /> ¿Primera vez? Regístrate
              </button>

              <button type="button" onClick={handleCambiarPersona}
                className="w-full text-white/20 text-[9px] uppercase tracking-widest font-black hover:text-white/40 transition-colors flex items-center justify-center gap-1.5">
                <RefreshCw size={10} /> Soy otra persona
              </button>
            </form>
          )}

          {/* STEP: CODE */}
          {step === 'code' && cliente && (
            <form onSubmit={handleCodeSubmit} className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="text-center p-5 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-travesia-gold/60 text-[9px] uppercase font-black tracking-widest mb-1">Bienvenido de vuelta</p>
                <h2 className="text-xl text-white font-bold">{cliente.nombre} {cliente.apellido}</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Trophy className="w-4 h-4 text-travesia-gold" />
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{cliente.total_visitas || 0} visitas</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-center text-[9px] text-white/50 uppercase tracking-wider font-bold">Código del día (pídelo al personal)</p>
                <input type="password" inputMode="numeric" value={code}
                  onChange={e => setCode(e.target.value)} placeholder="••••" required
                  className="w-full text-center text-4xl tracking-[1em] py-5 bg-white/5 border-2 border-white/10 rounded-2xl outline-none focus:border-travesia-gold transition-all font-mono" />
                {error && <p className="text-red-400 text-[10px] text-center font-bold uppercase tracking-widest animate-pulse">{error}</p>}
              </div>

              <button type="submit" disabled={processing || !code}
                className="w-full bg-travesia-gold text-[#051A10] py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30">
                {processing ? <Loader2 className="animate-spin w-5 h-5" /> : <><CheckCircle2 className="w-5 h-5" /> VALIDAR VISITA</>}
              </button>

              <button type="button" onClick={() => { setStep('phone'); setCode(''); setError(''); }}
                className="w-full text-white/30 text-[9px] uppercase tracking-widest font-black hover:text-white/50 transition-colors flex items-center justify-center gap-1.5">
                <ArrowLeft size={11} /> Cambiar número
              </button>
            </form>
          )}

          {/* STEP: REVIEW (visita 5 y 10) */}
          {step === 'review' && visitData && (
            <div className="space-y-6 text-center animate-in zoom-in duration-500">
              <div className="space-y-2">
                <p className="text-[9px] uppercase font-black tracking-widest text-travesia-gold/60">
                  {visitData.nuevasVisitas === visitData.meta ? '¡Meta cumplida!' : `¡Visita ${visitData.nuevasVisitas}!`}
                </p>
                <h2 className="text-2xl font-bold text-white">
                  {visitData.nuevasVisitas === visitData.meta
                    ? '¡Lo lograste! Comparte tu experiencia'
                    : '¿Cómo ha sido tu experiencia?'}
                </h2>
                <p className="text-white/40 text-sm">
                  {visitData.nuevasVisitas === visitData.meta
                    ? 'Has completado el reto de fidelidad. ¡Cuéntale al mundo!'
                    : 'A mitad del camino. Una reseña nos ayuda mucho.'}
                </p>
              </div>

              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={28}
                    className={`text-travesia-gold transition-all duration-500 ${reviewOpened ? 'fill-current scale-110' : 'opacity-30'}`}
                    style={{ transitionDelay: reviewOpened ? `${(i - 1) * 80}ms` : '0ms' }} />
                ))}
              </div>

              {!reviewOpened ? (
                <button onClick={() => { setReviewOpened(true); window.open(googleReviewLink, '_blank', 'noopener,noreferrer'); }}
                  className="w-full bg-travesia-gold text-[#051A10] py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Star size={14} className="fill-current" /> DEJAR MI RESEÑA ⭐
                </button>
              ) : (
                <button onClick={() => setStep('success')}
                  className="w-full bg-travesia-gold text-[#051A10] py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} /> YA DEJÉ MI RESEÑA →
                </button>
              )}
              <button onClick={() => setStep('success')}
                className="w-full text-white/25 text-[9px] uppercase tracking-widest font-black hover:text-white/40 transition-colors">
                Ahora no
              </button>
            </div>
          )}

          {/* STEP: SUCCESS */}
          {step === 'success' && visitData && (
            <div className="text-center space-y-6 animate-in zoom-in duration-700">
              <div className="space-y-2">
                <div className="mx-auto w-16 h-16 bg-travesia-gold/20 rounded-[24px] flex items-center justify-center border-2 border-travesia-gold/30">
                  {alreadyToday
                    ? <AlertCircle className="w-8 h-8 text-travesia-gold" />
                    : <Sparkles className="w-8 h-8 text-travesia-gold" />}
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {alreadyToday ? '¡Hola de nuevo!' : '¡Visita Registrada!'}
                </h2>
                <p className="text-white/40 text-sm italic">
                  {alreadyToday
                    ? 'Ya registraste tu visita de hoy.'
                    : 'Un paso más cerca de tu premio.'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-travesia-gold to-[#B8860B] p-5 rounded-[28px] shadow-2xl border border-white/10">
                <p className="text-[9px] text-[#051A10]/60 uppercase font-black tracking-widest mb-1">Tu Progreso</p>
                <p className="text-5xl font-black text-[#051A10] tracking-tighter">
                  {visitData.nuevasVisitas} / {visitData.meta}
                </p>
                {visitData.nuevasVisitas >= visitData.meta && (
                  <p className="text-[10px] text-[#051A10] font-black mt-2 uppercase tracking-widest opacity-80">¡Premio disponible!</p>
                )}
              </div>

              <button onClick={() => router.push('/')}
                className="text-travesia-gold/60 font-bold text-xs uppercase tracking-widest hover:text-travesia-gold transition-colors">
                Volver al inicio
              </button>

              <button onClick={handleCambiarPersona}
                className="w-full text-white/20 text-[9px] uppercase tracking-widest font-black hover:text-white/40 transition-colors flex items-center justify-center gap-1.5 mt-1">
                <RefreshCw size={10} /> Soy otra persona
              </button>
            </div>
          )}

        </div>
      </div>

      <p className="mt-8 text-white/20 text-[9px] uppercase tracking-[0.4em] font-black italic">
        Hostería La Travesía • High Fidelity Loyalty
      </p>
    </div>
  );
}
