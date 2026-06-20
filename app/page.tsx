'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserPlus, QrCode, ChevronRight } from 'lucide-react';

const BRAND = '#3c5b39';

export default function QRLanding() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl border border-[#E5E5EA] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex flex-col items-center">
          <Image
            src="/logo_travesia.png"
            alt="La Travesía"
            width={130}
            height={130}
            className="object-contain mb-4"
            priority
          />
          <h1 className="text-[26px] font-bold text-[#1C1C1E] text-center leading-tight tracking-tight">
            ¡Bienvenido!
          </h1>
          <p className="text-[16px] text-[#636366] mt-2 text-center">
            ¿Qué deseas hacer hoy?
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => router.push('/registro')}
            className="w-full bg-[#1C1C1E] text-white py-4 px-5 rounded-2xl font-semibold text-[17px] shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group hover:bg-black"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <UserPlus size={20} className="text-white" />
              </div>
              <span className="text-left">
                <span className="block leading-tight">Registrarme</span>
                <span className="block text-[13px] font-normal text-white/60 mt-0.5">Soy un cliente nuevo</span>
              </span>
            </div>
            <ChevronRight size={20} className="text-white/40 group-hover:text-white transition-colors" />
          </button>

          <button 
            onClick={() => router.push('/checkin')}
            className="w-full text-white py-4 px-5 rounded-2xl font-semibold text-[17px] shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group"
            style={{ backgroundColor: BRAND }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <QrCode size={20} className="text-white" />
              </div>
              <span className="text-left">
                <span className="block leading-tight">Registrar visita</span>
                <span className="block text-[13px] font-normal text-white/70 mt-0.5">Ya tengo una cuenta</span>
              </span>
            </div>
            <ChevronRight size={20} className="text-white/50 group-hover:text-white transition-colors" />
          </button>
        </div>

      </div>
    </main>
  );
}
