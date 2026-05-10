'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle2, 
  UserPlus, 
  KeyRound, 
  Loader2, 
  MapPin, 
  Sparkles,
  Trophy,
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckInPage() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'identify' | 'pin' | 'success'>('identify');
  const [cliente, setCliente] = useState<any>(null);
  const [googleLink, setGoogleLink] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Intentar recuperar cliente de localStorage
    const savedId = localStorage.getItem('travesia_cliente_id');
    if (savedId) {
      fetchCliente(savedId);
    } else {
      setLoading(false);
    }
    fetchGoogleLink();
  }, []);

  async function fetchGoogleLink() {
    const { data } = await supabase.from('config').select('*').eq('clave', 'google_maps_link').single();
    // Prioridad al link que me pasaste, si no hay en DB usamos este por defecto
    if (data && data.valor) {
      setGoogleLink(data.valor);
    } else {
      setGoogleLink('https://share.google/yGsbHgktdSzFzW1e8');
    }
  }

  async function fetchCliente(id: string) {
    const { data } = await supabase.from('clientes').select('*').eq('id', id).single();
    if (data) {
      setCliente(data);
      setStep('pin');
    }
    setLoading(false);
  }

  async function handleCheckIn() {
    setProcessing(true);
    setError('');
    
    try {
      // 1. Validar PIN (reusamos el de la configuración)
      const { data: configData } = await supabase.from('config').select('*').eq('clave', 'pin_ruleta').single();
      
      if (pin !== (configData?.valor || '1234')) {
        throw new Error('PIN incorrecto. Pídelo en la caja.');
      }

      // 2. Sumar visita
      const nuevasVisitas = (cliente.visitas || 0) + 1;
      const { error: updateError } = await supabase
        .from('clientes')
        .update({ visitas: nuevasVisitas, ultima_visita: new Date().toISOString() })
        .eq('id', cliente.id);

      if (updateError) throw updateError;

      // 3. Verificar si llegó a la meta (ej: 10 visitas)
      const { data: configVisitas } = await supabase.from('config').select('*').eq('clave', 'visitas_para_premio').single();
      const meta = parseInt(configVisitas?.valor || '10');

      if (nuevasVisitas >= meta) {
        // Disparar notificación de premio
        await fetch('/api/marketing/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'LOYALTY_REWARD', cliente: { ...cliente, visitas: nuevasVisitas } })
        });
      }

      setStep('success');
      // Actualizar cliente local
      setCliente({ ...cliente, visitas: nuevasVisitas });
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
                <span className="text-xs font-bold text-white/40 tracking-widest uppercase">Puntos: {cliente.visitas || 0}</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-center text-xs text-white/60 uppercase tracking-wider font-bold">Ingresa el PIN del Local</p>
              <input 
                type="password" 
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="w-full text-center text-4xl tracking-[1em] py-5 bg-white/5 border-2 border-white/10 rounded-3xl outline-none focus:border-travesia-gold transition-all font-mono text-white"
              />
              {error && <p className="text-red-400 text-[10px] text-center font-bold uppercase tracking-widest animate-pulse">{error}</p>}
            </div>

            <button 
              onClick={handleCheckIn}
              disabled={processing || pin.length < 4}
              className="w-full bg-travesia-gold text-[#051A10] py-6 rounded-3xl font-black text-xs tracking-[0.2em] shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 uppercase"
            >
              {processing ? <Loader2 className="animate-spin w-6 h-6" /> : <><CheckCircle2 className="w-6 h-6" /> VALIDAR VISITA</>}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-8 py-4 animate-in zoom-in duration-700">
            <div className="mx-auto w-24 h-24 bg-travesia-gold/20 rounded-[32px] flex items-center justify-center border-2 border-travesia-gold/30 shadow-2xl">
              <Sparkles className="w-12 h-12 text-travesia-gold" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight">¡Visita Registrada!</h2>
              <p className="text-white/40 italic text-sm font-light">Un paso más cerca de tu próximo premio.</p>
            </div>
            
            <div className="bg-gradient-to-br from-travesia-gold to-[#B8860B] p-8 rounded-[40px] shadow-2xl border border-white/20">
              <p className="text-[10px] text-[#051A10]/60 uppercase font-black tracking-widest mb-1">Tu Progreso Actual</p>
              <p className="text-6xl font-black text-[#051A10] tracking-tighter">{cliente.visitas} / 10</p>
              <p className="text-[10px] text-[#051A10] font-bold mt-2 tracking-[0.2em] uppercase">¡Vas por muy buen camino!</p>
            </div>

            {/* CTA GOOGLE REVIEWS */}
            {cliente.visitas >= 2 && googleLink && (
              <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 space-y-4">
                <div className="flex items-center justify-center gap-1 text-travesia-gold">
                  <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-xs font-bold text-white tracking-widest uppercase">¿Te gusta la experiencia?</p>
                <a 
                  href={googleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full border border-travesia-gold text-travesia-gold py-3 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase hover:bg-travesia-gold hover:text-[#051A10] transition-all"
                >
                  DEJAR MI RESEÑA ⭐
                </a>
              </div>
            )}

            <button 
              onClick={() => router.push('/')}
              className="text-travesia-gold/60 font-bold text-xs uppercase tracking-widest hover:text-travesia-gold transition-colors"
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
