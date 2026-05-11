'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy } from 'lucide-react';

interface RuletaProps {
  onWin: (premio: string) => void;
}

export default function Ruleta({ onWin }: RuletaProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [premios, setPremios] = useState<any[]>([]);
  const [mustShowWin, setMustShowWin] = useState(false);
  const [winningLabel, setWinningLabel] = useState('');
  
  useEffect(() => {
    fetchPremios();
  }, []);

  async function fetchPremios() {
    try {
      const { data } = await supabase.from('premios').select('*').eq('activo', true);
      if (data && data.length > 0) {
        setPremios(data);
      } else {
        // Fallback en caso de que no haya premios en la DB para no romper la UI
        setPremios([
          { id: 1, nombre: '5% DESCUENTO' },
          { id: 2, nombre: 'CÓCTEL CASA' },
          { id: 3, nombre: 'SORPRESA' },
          { id: 4, nombre: 'POSTRE GRATIS' },
          { id: 5, nombre: '10% DESCUENTO' },
          { id: 6, nombre: 'LA TRAVESÍA' }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleSpin = () => {
    if (spinning || premios.length === 0) return;

    setSpinning(true);
    setMustShowWin(false);
    
    // Rotación: Mínimo 5 vueltas (1800 deg) + random
    const extraDegrees = Math.floor(Math.random() * 360) + 1800; 
    const newRotation = rotation + extraDegrees;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      const actualDegrees = newRotation % 360;
      const segmentSize = 360 / premios.length;
      
      // Cálculo del índice ganador (el puntero está arriba a 0/360 grados)
      const index = Math.floor(((360 - actualDegrees + (segmentSize / 2)) % 360) / segmentSize);
      const premioGanado = premios[index % premios.length];
      
      setWinningLabel(premioGanado.nombre);
      setMustShowWin(true);

      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.7 },
        colors: ['#dac88c', '#1e3320', '#ffffff', '#c5a96e'],
        ticks: 300
      });

      setTimeout(() => {
        onWin(premioGanado.nombre);
      }, 2000);
    }, 4000);
  };

  if (premios.length === 0) return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-travesia-gold/20 border-t-travesia-gold rounded-full animate-spin"></div>
      <p className="text-travesia-gold text-[10px] font-black uppercase tracking-[0.3em]">Preparando Premios...</p>
    </div>
  );

  const segmentSize = 360 / premios.length;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
      
      {/* TÍTULO EMOCIONAL */}
      <div className="mb-10 text-center space-y-2 animate-in fade-in slide-in-from-top-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-travesia-gold/10 border border-travesia-gold/20 rounded-full mb-2">
          <Trophy size={12} className="text-travesia-gold" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-travesia-gold">Momento de Suerte</span>
        </div>
        <h3 className="text-3xl font-serif font-bold text-white leading-none">Gira la Ruleta</h3>
        <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Descubre tu beneficio exclusivo</p>
      </div>

      {/* CONTENEDOR DE LA RULETA */}
      <div className="relative w-full aspect-square max-w-[320px] xs:max-w-[360px] group">
        
        {/* AURA DE FONDO */}
        <div className={`absolute -inset-10 bg-travesia-gold/5 blur-[80px] rounded-full transition-opacity duration-1000 ${spinning ? 'opacity-100' : 'opacity-40'}`}></div>

        {/* PUNTERO (INDICADOR SUPERIOR) - REDISEÑADO PREMIUM */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
          <div className="w-8 h-10 bg-gradient-to-b from-travesia-gold via-[#c5a96e] to-[#dac88c] rounded-b-lg shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center border-x border-white/20">
             <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]"></div>
          </div>
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-[#dac88c]"></div>
        </div>

        {/* MARCO EXTERIOR TIPO RELOJ DE LUJO */}
        <div className="relative w-full h-full rounded-full border-[12px] border-[#0A0A0A] shadow-[0_20px_80px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(218,200,140,0.1)] bg-[#051A10] p-1.5 flex items-center justify-center overflow-hidden ring-1 ring-white/5">
          
          {/* LUCES LED PERIMETRALES */}
          {[...Array(24)].map((_, i) => (
            <div 
              key={i} 
              className={`absolute w-1 h-1 rounded-full z-20 transition-all duration-300 ${spinning ? 'bg-white shadow-[0_0_10px_white] scale-125' : 'bg-travesia-gold/30 shadow-none scale-100'}`}
              style={{
                transform: `rotate(${i * 15}deg) translateY(-142px)`,
                opacity: spinning ? (i % 2 === 0 ? 1 : 0.4) : 0.6
              }}
            />
          ))}

          {/* RUEDA SVG PARA MÁXIMA NITIDEZ */}
          <div 
            className="relative w-full h-full rounded-full transition-transform duration-[4000ms] cubic-bezier overflow-hidden"
            style={{ 
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <radialGradient id="grad-gold" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#dac88c" />
                  <stop offset="100%" stopColor="#c5a96e" />
                </radialGradient>
                <radialGradient id="grad-green" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e3320" />
                  <stop offset="100%" stopColor="#051A10" />
                </radialGradient>
              </defs>
              {premios.map((premio, i) => {
                const startAngle = i * segmentSize;
                const endAngle = (i + 1) * segmentSize;
                const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);
                const largeArc = segmentSize > 180 ? 1 : 0;
                
                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
                const isEven = i % 2 === 0;

                return (
                  <g key={i}>
                    <path 
                      d={pathData} 
                      fill={isEven ? "url(#grad-green)" : "url(#grad-gold)"}
                      stroke={isEven ? "#dac88c44" : "#1e332022"}
                      strokeWidth="0.2"
                    />
                    {/* TEXTO ORIENTADO AL CENTRO */}
                    <text
                      x="50"
                      y="15"
                      fill={isEven ? "#dac88c" : "#1e3320"}
                      fontSize="3.8"
                      fontWeight="900"
                      textAnchor="middle"
                      transform={`rotate(${startAngle + segmentSize / 2} 50 50)`}
                      className="uppercase tracking-tight"
                      style={{ fontFamily: 'var(--font-jost), sans-serif' }}
                    >
                      {premio.nombre}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* OVERLAY DE TEXTURA Y BRILLO */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none"></div>
          </div>

          {/* CENTRO DE LA RULETA (HUB PREMIUM) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 z-40">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-[#1e3320] to-[#051A10] rounded-full flex items-center justify-center shadow-inner border border-travesia-gold/30">
              <Sparkles size={20} className="text-travesia-gold animate-pulse" />
            </div>
            {/* ANILLO DECORATIVO */}
            <div className="absolute -inset-1 border border-travesia-gold/10 rounded-full scale-110"></div>
          </div>
        </div>
      </div>

      {/* BOTÓN DE ACCIÓN REDISEÑADO */}
      <div className="relative w-full mt-16 px-4">
        <button 
          onClick={handleSpin}
          disabled={spinning}
          className={`
            w-full group relative overflow-hidden py-5 rounded-2xl font-black text-[11px] tracking-[0.5em] uppercase transition-all duration-700
            ${spinning 
              ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
              : 'bg-travesia-gold text-[#051A10] shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(218,200,140,0.2)] hover:scale-[1.02] active:scale-95'
            }
          `}
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            {spinning ? 'GIRANDO...' : '¡GIRAR AHORA!'}
          </span>
          
          {!spinning && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer transition-transform duration-1000"></div>
          )}
        </button>
        
        {!spinning && (
          <div className="mt-5 flex flex-col items-center gap-2 animate-bounce opacity-40">
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-white">Pulsa para jugar</p>
          </div>
        )}
      </div>

      {/* MODAL DE VICTORIA (OPCIONAL/TEMPORAL) */}
      {mustShowWin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#051A10]/90 backdrop-blur-xl animate-in fade-in">
          <div className="text-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-travesia-gold rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(218,200,140,0.5)]">
               <Trophy size={48} className="text-[#051A10]" />
            </div>
            <div className="space-y-2">
              <p className="text-travesia-gold font-black uppercase tracking-[0.3em] text-[10px]">¡Felicidades!</p>
              <h4 className="text-4xl font-serif font-bold text-white uppercase">{winningLabel}</h4>
            </div>
            <p className="text-white/40 text-[10px] font-medium max-w-[200px] mx-auto uppercase tracking-widest">Tu premio se ha registrado en tu perfil.</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .cubic-bezier {
          transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
