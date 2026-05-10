'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';

interface RuletaProps {
  onWin: (premio: string) => void;
}

export default function Ruleta({ onWin }: RuletaProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [premios, setPremios] = useState<any[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPremios();
  }, []);

  async function fetchPremios() {
    const { data } = await supabase.from('premios').select('*').eq('activo', true);
    if (data) setPremios(data);
  }

  const handleSpin = () => {
    if (spinning || premios.length === 0) return;

    setSpinning(true);
    const extraDegrees = Math.floor(Math.random() * 360) + 1440; // Mínimo 4 vueltas
    const newRotation = rotation + extraDegrees;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      const actualDegrees = newRotation % 360;
      const segmentSize = 360 / premios.length;
      // Invertimos el cálculo para que coincida con el puntero arriba
      const index = Math.floor(((360 - actualDegrees + (segmentSize / 2)) % 360) / segmentSize);
      const premioGanado = premios[index % premios.length];
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#0A2A18', '#FFFFFF']
      });

      onWin(premioGanado.nombre);
    }, 4000);
  };

  if (premios.length === 0) return <div className="text-travesia-gold animate-pulse uppercase tracking-widest text-[10px] font-black">Cargando premios...</div>;

  const segmentSize = 360 / premios.length;

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-4">
      
      {/* CONTENEDOR DE LA RULETA */}
      <div className="relative group">
        
        {/* LUCES LED EXTERNAS (AURA) */}
        <div className="absolute -inset-4 bg-travesia-gold/10 blur-[50px] rounded-full animate-pulse"></div>
        
        {/* MARCO EXTERIOR CON LUCES */}
        <div className="relative w-[320px] h-[320px] xs:w-[350px] xs:h-[350px] rounded-full border-[8px] border-[#1A1A1A] shadow-[0_0_50px_rgba(212,175,55,0.2)] bg-[#0A0A0A] p-2 flex items-center justify-center overflow-hidden">
          
          {/* LUCES LED DE PUNTO */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={`absolute w-1.5 h-1.5 rounded-full bg-travesia-gold shadow-[0_0_10px_#D4AF37] z-20 transition-opacity duration-300 ${spinning ? 'animate-ping' : 'opacity-60'}`}
              style={{
                transform: `rotate(${i * 30}deg) translateY(-165px)`
              }}
            />
          ))}

          {/* LA RUEDA REAL */}
          <div 
            ref={wheelRef}
            className="relative w-full h-full rounded-full transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1) shadow-inner border-4 border-travesia-gold/20"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              background: 'radial-gradient(circle, #1A3A2A 0%, #051A10 100%)'
            }}
          >
            {premios.map((premio, i) => (
              <div 
                key={premio.id}
                className="absolute top-0 left-1/2 w-1/2 h-full origin-left overflow-hidden"
                style={{ transform: `rotate(${i * segmentSize}deg)` }}
              >
                {/* DIVISOR METÁLICO */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-travesia-gold/30 to-transparent z-10"></div>
                
                {/* TEXTO DEL PREMIO */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-y-1/2 w-[140px] text-right pr-12 font-black text-[9px] uppercase tracking-widest text-white/90"
                  style={{ transform: `rotate(${segmentSize / 2}deg) translateY(-50%)` }}
                >
                  <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{premio.nombre}</span>
                </div>
              </div>
            ))}

            {/* CENTRO DE LA RULETA */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#0A0A0A] rounded-full border-4 border-travesia-gold shadow-2xl z-30 flex items-center justify-center">
              <div className="w-8 h-8 bg-travesia-gold/20 rounded-full animate-pulse border border-travesia-gold/30"></div>
            </div>
          </div>
        </div>

        {/* PUNTERO (INDICADOR SUPERIOR) */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-40">
          <div className="relative">
            {/* SOMBRA DEL PUNTERO */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-10 bg-travesia-gold/20 blur-md rounded-full"></div>
            {/* PUNTERO FÍSICO */}
            <div className="w-8 h-10 bg-gradient-to-b from-travesia-gold to-[#B8860B] clip-path-pointer shadow-2xl"></div>
          </div>
        </div>
      </div>

      {/* BOTÓN DE ACCIÓN */}
      <div className="relative w-full max-w-[280px] pt-4">
        <button 
          onClick={handleSpin}
          disabled={spinning}
          className={`
            w-full group relative overflow-hidden py-6 rounded-[32px] font-black text-xs tracking-[0.4em] uppercase transition-all duration-500
            ${spinning 
              ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10' 
              : 'bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] text-[#051A10] shadow-[0_10px_40px_rgba(212,175,55,0.3)] hover:shadow-[0_20px_60px_rgba(212,175,55,0.5)] active:scale-95'
            }
          `}
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            {spinning ? 'SUERTE...' : '¡GIRAR AHORA!'}
          </span>
          
          {/* EFECTO DE BRILLO AL PASAR EL MOUSE */}
          {!spinning && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
          )}
        </button>
        
        {!spinning && (
          <p className="mt-4 text-center text-[8px] text-white/30 uppercase tracking-[0.3em] font-bold animate-bounce">
            Toca para ganar tu premio
          </p>
        )}
      </div>

      <style jsx>{`
        .cubic-bezier {
          transition-timing-function: cubic-bezier(0.15, 0, 0.15, 1);
        }
        .clip-path-pointer {
          clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
