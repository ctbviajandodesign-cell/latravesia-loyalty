'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

interface Premio {
  id: string;
  nombre: string;
  emoji: string;
  probabilidad: number;
}

interface RuletaProps {
  premios: Premio[];
  onResult: (premio: Premio) => void;
}

export default function Ruleta({ premios, onResult }: RuletaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const rotationRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Función para generar sonido de "click" mecánico
  const playClickSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const drawRuleta = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 15;
    const segmentAngle = (2 * Math.PI) / premios.length;

    ctx.clearRect(0, 0, size, size);

    premios.forEach((premio, i) => {
      const angle = i * segmentAngle;
      
      // Diseño de segmentos premium
      const colors = ['#1e3320', '#2c4a2e', '#1e3320', '#2c4a2e', '#dac88c'];
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + segmentAngle);
      ctx.closePath();
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      
      // Borde dorado fino
      ctx.strokeStyle = 'rgba(218, 200, 140, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = (i % 5 === 4) ? '#1e3320' : '#dac88c';
      ctx.font = 'bold 12px "Jost", sans-serif';
      ctx.fillText(`${premio.emoji || '🎁'} ${premio.nombre.substring(0, 15)}`, radius - 30, 5);
      ctx.restore();
    });

    // Círculo central "Gold Bezel"
    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    const goldGrad = ctx.createLinearGradient(center-25, center-25, center+25, center+25);
    goldGrad.addColorStop(0, '#c5a96e');
    goldGrad.addColorStop(0.5, '#dac88c');
    goldGrad.addColorStop(1, '#c5a96e');
    ctx.fillStyle = goldGrad;
    ctx.fill();
    ctx.strokeStyle = '#1e3320';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Punto central
    ctx.beginPath();
    ctx.arc(center, center, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e3320';
    ctx.fill();

  }, [premios]);

  useEffect(() => {
    drawRuleta();
  }, [premios, drawRuleta]);

  const spin = () => {
    if (isSpinning || premios.length === 0) return;
    setIsSpinning(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const winningIndex = Math.floor(Math.random() * premios.length);
    const winner = premios[winningIndex];

    const spinDuration = 6000;
    const segmentAngle = (2 * Math.PI) / premios.length;
    const extraSpins = 10 * 2 * Math.PI;
    const targetAngle = (2 * Math.PI) - (winningIndex * segmentAngle + segmentAngle / 2);
    const finalRotation = extraSpins + targetAngle + (Math.PI * 1.5);
    
    const startTime = performance.now();
    let lastSegmentHit = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Ease Out Quint para frenado de lujo
      const easeOut = 1 - Math.pow(1 - progress, 5);
      const currentRotation = finalRotation * easeOut;
      
      canvas.style.transform = `rotate(${currentRotation}rad)`;

      // Calcular si pasamos por un nuevo segmento para el sonido
      const currentSegment = Math.floor((currentRotation % (2 * Math.PI)) / segmentAngle);
      if (currentSegment !== lastSegmentHit) {
        playClickSound();
        lastSegmentHit = currentSegment;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#dac88c', '#2c4a2e'] });
        setTimeout(() => onResult(winner), 500);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center gap-10 py-10 relative">
      <div className="relative p-4 bg-travesia-green-dark rounded-full shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-travesia-gold/30">
        
        {/* Luces LED Perimetrales */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className={`absolute w-3 h-3 rounded-full bg-travesia-gold shadow-[0_0_10px_#dac88c] transition-opacity duration-300 z-20`}
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 30}deg) translate(0, -185px)`,
              opacity: isSpinning ? (Math.random() > 0.5 ? 1 : 0.3) : 1
            }}
          />
        ))}

        {/* Puntero Premium */}
        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-30 filter drop-shadow-xl">
          <div className="w-10 h-12 bg-travesia-gold clip-path-pointer border-2 border-travesia-green-deep flex items-center justify-center">
             <div className="w-1 h-5 bg-white/40 rounded-full blur-[1px]" />
          </div>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          className="rounded-full relative z-10 transition-transform duration-75"
        />
      </div>
      
      <button
        onClick={spin}
        disabled={isSpinning || premios.length === 0}
        className="px-16 py-6 bg-travesia-gold text-travesia-green-deep font-black text-2xl rounded-[24px] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 tracking-widest uppercase"
      >
        {isSpinning ? '¡GIRANDO! ✨' : 'PROBAR MI SUERTE'}
      </button>

      <style jsx>{`
        .clip-path-pointer {
          clip-path: polygon(50% 100%, 0 0, 100% 0);
        }
      `}</style>
    </div>
  );
}
