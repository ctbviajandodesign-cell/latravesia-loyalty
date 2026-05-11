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
      
      // Cálculo preciso del ganador
      // El puntero está en el tope (0 grados)
      // La rotación es horaria, así que el segmento que queda arriba es el que estaba a -rotación
      const actualDegrees = newRotation % 360;
      const segmentSize = 360 / premios.length;
      
      // (360 - actualDegrees) nos da la posición original que ahora está en el tope
      // % 360 para asegurar rango 0-359
      const winDegrees = (360 - actualDegrees) % 360;
      const index = Math.floor(winDegrees / segmentSize);
      
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
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto overflow-visible px-4">
      
      {/* TÍTULO MINIMALISTA */}
      <div className="mb-8 text-center space-y-1 animate-in fade-in slide-in-from-top-4">
        <h3 className="text-2xl font-serif font-bold text-white tracking-tight">Tu Premio Especial</h3>
        <div className="w-8 h-0.5 bg-travesia-gold mx-auto rounded-full opacity-50"></div>
      </div>

      {/* CONTENEDOR DE LA RULETA - REDUCIDO PARA EVITAR DESBORDES */}
      <div className="relative w-full aspect-square max-w-[280px] xs:max-w-[320px]">
        
        {/* AURA SUTIL */}
        <div className={`absolute -inset-6 bg-travesia-gold/5 blur-[60px] rounded-full transition-opacity duration-1000 ${spinning ? 'opacity-100' : 'opacity-30'}`}></div>

        {/* PUNTERO MINIMALISTA */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-50">
          <div className="w-6 h-8 bg-travesia-gold rounded-b-full shadow-lg border border-white/20 flex items-center justify-center">
             <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>

        {/* MARCO ULTRAFINO PREMIUM */}
        <div className="relative w-full h-full rounded-full border-[1px] border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-[#051A10] p-1 flex items-center justify-center overflow-hidden">
          
          {/* RUEDA SVG */}
          <div 
            className="relative w-full h-full rounded-full transition-transform duration-[4000ms] cubic-bezier overflow-hidden"
            style={{ 
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dac88c" />
                  <stop offset="100%" stopColor="#b8a164" />
                </linearGradient>
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
                      fill={isEven ? "#1e3320" : "#051a10"}
                      stroke="#dac88c22"
                      strokeWidth="0.1"
                    />
                    <text
                      x="50"
                      y="12"
                      fill="#dac88c"
                      fontSize="3.2"
                      fontWeight="700"
                      textAnchor="middle"
                      transform={`rotate(${startAngle + segmentSize / 2} 50 50)`}
                      className="uppercase tracking-tighter"
                      style={{ opacity: 0.9 }}
                    >
                      {premio.nombre}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* HUB CENTRAL MINIMALISTA */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 z-40">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-2xl"></div>
            <div className="absolute inset-1.5 bg-[#051A10] rounded-full flex items-center justify-center border border-travesia-gold/20">
              <div className="w-1.5 h-1.5 bg-travesia-gold rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTÓN MINIMALISTA */}
      <div className="relative w-full mt-12 px-6">
        <button 
          onClick={handleSpin}
          disabled={spinning}
          className={`
            w-full group relative py-5 rounded-full font-black text-[10px] tracking-[0.4em] uppercase transition-all duration-500
            ${spinning 
              ? 'bg-white/5 text-white/10 cursor-not-allowed' 
              : 'bg-white text-[#051A10] hover:bg-travesia-gold transition-colors'
            }
          `}
        >
          {spinning ? 'ESPERANDO...' : 'GIRAR RULETA'}
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
