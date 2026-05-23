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
      setChecking(false);
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

      <div className="relative w-full max-w-sm space-y-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-gradient-to-br from-travesia-gold to-[#B8860B] rounded-[32px] flex items-center justify-center shadow-2xl shadow-travesia-gold/20">
            <Sparkles className="w-12 h-12 text-[#051A10]" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-travesia-gold tracking-tight">La Travesía</h1>
            <p className="text-[8px] uppercase tracking-[0.5em] font-black text-white/30 mt-1">Loyalty Experience</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/registro')}
            className="w-full bg-travesia-gold text-[#051A10] py-6 rounded-2xl font-black text-sm tracking-widest uppercase shadow-2xl shadow-travesia-gold/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <UserPlus className="w-5 h-5" />
            SOY NUEVO
          </button>

          <button
            onClick={() => router.push('/checkin')}
            className="w-full bg-white/5 border-2 border-white/15 text-white py-6 rounded-2xl font-black text-sm tracking-widest uppercase hover:border-travesia-gold/60 hover:text-travesia-gold active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <MapPin className="w-5 h-5" />
            REGISTRAR MI VISITA
          </button>
        </div>

        <p className="text-white/20 text-[9px] uppercase tracking-[0.4em] font-black italic">
          Hostería La Travesía • High Fidelity Loyalty
        </p>
      </div>
    </main>
  );
}
