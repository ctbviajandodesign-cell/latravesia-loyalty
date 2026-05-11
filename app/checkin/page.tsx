'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle2, 
  UserPlus, 
  Loader2, 
  MapPin, 
  Sparkles,
  Trophy,
  Star,
  AlertCircle
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#051A10] flex items-center justify-center text-white font-serif">Cargando...</div>}>
      <CheckInContent />
    </Suspense>
  );
}

function CheckInContent() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'identify' | 'pin' | 'success'>('identify');
  const [cliente, setCliente] = useState<any>(null);
  const [googleLink, setGoogleLink] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [alreadyCheckedInToday, setAlreadyCheckedInToday] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  useEffect(() => {
    const savedId = localStorage.getItem('travesia_cliente_id');
    if (savedId) {
      fetchCliente(savedId);
    } else {
      setLoading(false);
    }
    fetchGoogleLink();
  }, [searchParams]);

  async function fetchGoogleLink() {
    const { data } = await supabase.from('config').select('*').eq('clave', 'google_maps_link').single();
    if (data && data.valor) {
      setGoogleLink(data.valor);
    } else {
      setGoogleLink('https://share.google/yGsbHgktdSzFzW1e8');
    }
  }

  async function fetchCliente(id: string) {
    try {
      const { data } = await supabase.from('clientes').select('*').eq('id', id).single();
      if (data) {
        setCliente(data);
        
        // Verificar si ya registró hoy (solo si no viene de registro nuevo)
        const hoy = new Date().toISOString().split('T')[0];
        if (data.fecha_ultima_visita === hoy && !isNew) {
          setAlreadyCheckedInToday(true);
          setStep('success');
        } else if (isNew) {
          setStep('success');
        } else {
          setStep('pin');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    setProcessing(true);
    setError('');
    
    try {
      // 0. Verificar si ya registró hoy
      const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      if (cliente.fecha_ultima_visita === hoy) {
        throw new Error('Ya has registrado tu visita de hoy. ¡Vuelve pronto!');
      }

      // 1. Validar PIN
      const { data: configData } = await supabase.from('config').select('*').eq('clave', 'pin_validacion').single();
      const correctPin = configData?.valor || '1234';
      
      if (pin.trim() !== correctPin.trim()) {
        throw new Error('PIN incorrecto. Pídelo en la caja.');
      }

      // 2. Sumar visita
      const nuevasVisitas = (cliente.total_visitas || 0) + 1;
      const { error: updateError } = await supabase
        .from('clientes')
        .update({ 
          total_visitas: nuevasVisitas,
          visitas: nuevasVisitas, // Mantener ambos en sincronía
          fecha_ultima_visita: hoy 
        })
        .eq('id', cliente.id);

      if (updateError) throw updateError;

      // Log de la visita para analíticas
      await supabase.from('visitas').insert([{
        cliente_id: cliente.id,
        fecha: hoy
      }]);

      // 3. Verificar si llegó a la meta (ej: 10 visitas)
      const { data: configVisitas } = await supabase.from('config').select('*').eq('clave', 'visitas_para_premio').single();
      const meta = parseInt(configVisitas?.valor || '10');

      if (nuevasVisitas >= meta) {
        // Disparar notificación de premio
        await fetch('/api/marketing/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'LOYALTY_REWARD', cliente: { ...cliente, total_visitas: nuevasVisitas } })
        });
      }

      setStep('success');
      // Actualizar cliente local
      setCliente({ ...cliente, total_visitas: nuevasVisitas, fecha_ultima_visita: hoy });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]"><Loader2 className="animate-spin w-10 h-10 text-travesia-green-deep" /></div>;

  return (
    <div className="min-h-screen bg-[#051A10] p-6 flex flex-col items-center justify-center font-serif text-white">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-travesia-gold/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative w-full max-w-md bg-white/5 border border-white/10 rounded-[40px] shadow-2xl p-10 space-y-8 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-travesia-gold/20 rounded-2xl flex items-center justify-center shadow-lg">
            <MapPin className="w-8 h-8 text-travesia-gold" />
          </div>
          <h1 className="text-3xl font-bold text-travesia-gold tracking-tight">Check-In</h1>
          <p className="text-white/40 font-sans text-[10px] tracking-[0.4em] uppercase font-black">La Travesía Loyalty</p>
        </div>

        {step === 'identify' && (
          <div className="space-y-6 text-center py-4">
            <p className="text-white/60 italic text-sm">No te hemos reconocido en este dispositivo.</p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => router.push('/')}
                className="w-full bg-travesia-gold text-[#051A10] py-5 rounded-2xl font-black text-xs tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 uppercase"
              >
                <UserPlus className="w-5 h-5" /> REGISTRARME / INICIAR
              </button>
            </div>
          </div>
        )}

        {step === 'pin' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            <div className="text-center p-6 bg-white/5 border border-white/10 rounded-3xl">
              <p className="text-travesia-gold/60 text-[10px] uppercase font-black tracking-widest mb-1">Bienvenido de vuelta</p>
              <h2 className="text-2xl text-white font-bold">{cliente.nombre} {cliente.apellido}</h2>
              <div className="mt-3 flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-travesia-gold" />
                <span className="text-xs font-bold text-white/40 tracking-widest uppercase">Puntos: {cliente.total_visitas || 0}</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-center text-xs text-white/60 uppercase tracking-wider font-bold">Ingresa el PIN del Local</p>
              <input 
                type="password" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="w-full text-center text-4xl tracking-[1em] py-5 bg-white/5 border-2 border-white/10 rounded-3xl outline-none focus:border-travesia-gold transition-all font-mono text-white"
              />
              {error && <p className="text-red-400 text-[10px] text-center font-bold uppercase tracking-widest animate-pulse">{error}</p>}
            </div>

            <button 
              onClick={handleCheckIn}
              disabled={processing || !pin}
              className="w-full bg-travesia-gold text-[#051A10] py-6 rounded-3xl font-black text-xs tracking-[0.2em] shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 uppercase"
            >
              {processing ? <Loader2 className="animate-spin w-6 h-6" /> : <><CheckCircle2 className="w-6 h-6" /> VALIDAR VISITA</>}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-6 py-2 animate-in zoom-in duration-700">
            <div className="mx-auto w-20 h-20 bg-travesia-gold/20 rounded-[32px] flex items-center justify-center border-2 border-travesia-gold/30 shadow-2xl">
              {alreadyCheckedInToday ? <AlertCircle className="w-10 h-10 text-travesia-gold" /> : <Sparkles className="w-10 h-10 text-travesia-gold" />}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {alreadyCheckedInToday ? '¡Hola de nuevo!' : '¡Visita Registrada!'}
              </h2>
              <p className="text-white/40 italic text-sm font-light">
                {alreadyCheckedInToday ? 'Ya registraste tu visita de hoy.' : 'Un paso más cerca de tu próximo premio.'}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-travesia-gold to-[#B8860B] p-5 rounded-[32px] shadow-2xl border border-white/20">
              <p className="text-[9px] text-[#051A10]/60 uppercase font-black tracking-widest mb-1">Tu Progreso Actual</p>
              <p className="text-5xl font-black text-[#051A10] tracking-tighter">{cliente.total_visitas} / 10</p>
              <p className="text-[10px] text-[#051A10] font-bold mt-2 tracking-[0.2em] uppercase opacity-80">¡Vas por muy buen camino!</p>
            </div>

            {/* CTA GOOGLE REVIEWS */}
            {cliente.total_visitas >= 2 && googleLink && !alreadyCheckedInToday && (
              <div className="bg-white/5 p-5 rounded-[28px] border border-white/10 space-y-3">
                <div className="flex items-center justify-center gap-1 text-travesia-gold">
                  <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                </div>
                <p className="text-[10px] font-bold text-white tracking-widest uppercase">¿Te gusta la experiencia?</p>
                <a 
                  href={googleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full border border-travesia-gold text-travesia-gold py-3 rounded-xl font-black text-[9px] tracking-[0.3em] uppercase hover:bg-travesia-gold hover:text-[#051A10] transition-all"
                >
                  DEJAR MI RESEÑA ⭐
                </a>
              </div>
            )}

            <button 
              onClick={() => router.push('/')}
              className="text-travesia-gold/60 font-bold text-xs uppercase tracking-widest hover:text-travesia-gold transition-colors pt-2"
            >
              Volver al inicio
            </button>
          </div>
        )}

      </div>
      
      <p className="mt-8 text-white/20 text-[9px] uppercase tracking-[0.4em] font-black italic">Hostería La Travesía • High Fidelity Loyalty</p>
    </div>
  );
}
