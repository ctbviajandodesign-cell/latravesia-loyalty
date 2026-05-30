'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

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
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#B5933A] w-8 h-8" />
      </div>
    );
  }

  return null;
}
