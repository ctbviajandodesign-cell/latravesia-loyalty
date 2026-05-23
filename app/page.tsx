'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Sparkles, UserPlus, MapPin, Loader2 } from 'lucide-react';

export default function QRLanding() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const savedId = localStorage.getItem('travesia_cliente_id');
      if (savedId) {
        const { data } = await supabase.from('clientes').select('id').eq('id', savedId).single();
        if (data) { router.replace('/checkin'); return; }
        localStorage.removeItem('travesia_cliente_id');
      }
      router.replace('/registro');
    }
    checkSession();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#051A10] flex items-center justify-center">
        <Loader2 className="animate-spin text-travesia-gold w-10 h-10" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#051A10] text-white flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-travesia-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] bg-travesia-green-deep/30 blur-[100px] rounded-full" />
      </div>

      <div className="relative w-full max-w-sm space-y-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-gradient-to-br from-travesia-gold to-[#B8860B] rounded-[32px] flex items-center justify-center shadow-2xl shadow-travesia-gold/20">
            <Sparkles className="w-12 h-12 text-[#051A10]" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-travesia-gold tracking-tight">La Travesía</h1>
            <p className="text-xs uppercase tracking-[0.4em] font-bold text-white/50 mt-1">Loyalty Experience</p>
          </div>
        </div>

        {/* Botones principales */}
        <div className="space-y-4">
          {/* Botón primario — nuevo cliente */}
          <button
            onClick={() => router.push('/registro')}
            className="w-full bg-travesia-gold text-[#051A10] py-5 px-6 rounded-2xl shadow-2xl shadow-travesia-gold/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-4 text-left"
          >
            <div className="w-11 h-11 bg-[#051A10]/15 rounded-xl flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-widest leading-tight">Registrarme</p>
              <p className="text-xs font-semibold opacity-70 mt-0.5">Soy cliente nuevo</p>
            </div>
          </button>

          {/* Botón secundario — cliente existente */}
          <button
            onClick={() => router.push('/checkin')}
            className="w-full bg-white/8 border-2 border-white/20 text-white py-5 px-6 rounded-2xl hover:border-travesia-gold/60 hover:bg-white/12 active:scale-95 transition-all flex items-center gap-4 text-left"
          >
            <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-travesia-gold" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-widest leading-tight">Registrar Visita</p>
              <p className="text-xs font-semibold text-white/50 mt-0.5">Ya estoy registrado</p>
            </div>
          </button>
        </div>

        <p className="text-white/40 text-xs uppercase tracking-widest font-bold">
          Hostería La Travesía • Loyalty
        </p>
      </div>
    </main>
  );
}
