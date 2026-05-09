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
  Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckInPage() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'identify' | 'pin' | 'success'>('identify');
  const [cliente, setCliente] = useState<any>(null);
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
  }, []);

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
    <div className="min-h-screen bg-[#f8f5f0] p-6 flex flex-col items-center justify-center font-serif">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 space-y-8 border border-gray-100 animate-in fade-in zoom-in duration-500">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-travesia-gold/10 rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-travesia-green-deep" />
          </div>
          <h1 className="text-3xl font-bold text-travesia-green-deep tracking-tight">Check-In</h1>
          <p className="text-gray-500 font-sans text-sm tracking-wide uppercase font-bold">La Travesía Loyalty</p>
        </div>

        {step === 'identify' && (
          <div className="space-y-6 text-center py-4">
            <p className="text-gray-600 italic">No te hemos reconocido en este dispositivo.</p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => router.push('/')}
                className="w-full bg-travesia-green-deep text-white py-5 rounded-2xl font-black text-sm tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
              >
                <UserPlus className="w-5 h-5 text-travesia-gold" /> REGISTRARME / INICIAR
              </button>
            </div>
          </div>
        )}

        {step === 'pin' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-xs uppercase font-black tracking-widest mb-1">Cliente</p>
              <h2 className="text-xl text-travesia-green-deep font-bold">{cliente.nombre} {cliente.apellido}</h2>
              <div className="mt-2 flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-travesia-gold" />
                <span className="text-xs font-bold text-gray-400">Visitas actuales: {cliente.visitas || 0}</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-center text-sm text-gray-500">Ingresa el PIN de seguridad del local para validar tu visita hoy:</p>
              <input 
                type="password" 
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="w-full text-center text-4xl tracking-[1em] py-4 bg-gray-50 border-2 border-gray-100 rounded-3xl outline-none focus:border-travesia-gold transition-all font-mono"
              />
              {error && <p className="text-red-500 text-xs text-center font-bold animate-bounce">{error}</p>}
            </div>

            <button 
              onClick={handleCheckIn}
              disabled={processing || pin.length < 4}
              className="w-full bg-travesia-green-deep text-white py-6 rounded-3xl font-black text-sm tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {processing ? <Loader2 className="animate-spin w-6 h-6" /> : <><CheckCircle2 className="w-6 h-6 text-travesia-gold" /> SUMAR MI VISITA</>}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-8 py-4 animate-in zoom-in duration-700">
            <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <Sparkles className="w-12 h-12 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">¡Visita Registrada!</h2>
              <p className="text-gray-500 italic">Gracias por acompañarnos hoy.</p>
            </div>
            <div className="bg-travesia-green-deep/5 p-6 rounded-[32px] border border-travesia-green-deep/10">
              <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-2">Tu Progreso</p>
              <p className="text-5xl font-black text-travesia-green-deep">{cliente.visitas} / 10</p>
              <p className="text-xs text-travesia-gold font-bold mt-2 tracking-widest">¡Sigue así para tu premio!</p>
            </div>
            <button 
              onClick={() => router.push('/')}
              className="text-travesia-green-deep font-bold text-sm underline underline-offset-8 decoration-travesia-gold"
            >
              Volver al inicio
            </button>
          </div>
        )}

      </div>
      
      <p className="mt-8 text-gray-400 text-[10px] uppercase tracking-[0.3em]">Hostería La Travesía • Luxury Experience</p>
    </div>
  );
}
