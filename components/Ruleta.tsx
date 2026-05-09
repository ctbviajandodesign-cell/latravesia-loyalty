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

  const playClickSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  const drawRuleta = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 5;
    const segmentAngle = (2 * Math.PI) / premios.length;

    ctx.clearRect(0, 0, size, size);

    premios.forEach((premio, i) => {
      const angle = i * segmentAngle;
      
      // Colores de la marca: Verde Profundo y Negro con acentos dorados
      const colors = ['#1a2e1c', '#0f1a10', '#1a2e1c', '#0f1a10', '#c5a96e'];
      const baseColor = colors[i % colors.length];

      // Dibujar Segmento con gradiente para efecto 3D
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + segmentAngle);
      ctx.closePath();
      
      const grad = ctx.createRadialGradient(center, center, radius * 0.2, center, center, radius);
      grad.addColorStop(0, baseColor);
      grad.addColorStop(1, i % 5 === 4 ? '#dac88c' : '#050a06');
      
      ctx.fillStyle = grad;
      ctx.fill();

      // Borde de segmento ultra fino
      ctx.strokeStyle = 'rgba(218, 200, 140, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Contenido (Emoji + Texto)
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + segmentAngle / 2);
      ctx.textAlign = 'right';
      
      // Sombra de texto para legibilidad premium
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      
      ctx.fillStyle = (i % 5 === 4) ? '#1a2e1c' : '#dac88c';
      ctx.font = 'bold 13px "Inter", sans-serif';
      ctx.fillText(`${premio.emoji || '🎁'}`, radius - 25, 5);
      
      ctx.font = '500 10px "Inter", sans-serif';
      ctx.fillText(premio.nombre.toUpperCase(), radius - 55, 4);
      
      ctx.restore();
    });

    // Brillo de cristal sobre la ruleta
    const overlayGrad = ctx.createLinearGradient(0, 0, size, size);
    overlayGrad.addColorStop(0, 'rgba(255,255,255,0.1)');
    overlayGrad.addColorStop(0.5, 'transparent');
    overlayGrad.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = overlayGrad;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
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

    // Calcular ganador
    const winningIndex = Math.floor(Math.random() * premios.length);
    const winner = premios[winningIndex];

    const spinDuration = 7000;
    const segmentAngle = (2 * Math.PI) / premios.length;
    const extraSpins = 12 * 2 * Math.PI;
    const targetAngle = (2 * Math.PI) - (winningIndex * segmentAngle + segmentAngle / 2);
    const finalRotation = extraSpins + targetAngle + (Math.PI * 1.5);
    
    const startTime = performance.now();
    let lastTick = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Easing: Mas lento al final para realismo
      const easeOut = 1 - Math.pow(1 - progress, 5);
      const currentRotation = finalRotation * easeOut;
      
      canvas.style.transform = `rotate(${currentRotation}rad)`;

      const currentTick = Math.floor(currentRotation / (segmentAngle / 2));
      if (currentTick !== lastTick) {
        playClickSound();
        lastTick = currentTick;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#c5a96e', '#1a2e1c'] });
        setTimeout(() => onResult(winner), 800);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center gap-12 py-10 relative">
      
      {/* EL MARCO "FÍSICO" DE LA RULETA */}
      <div className="relative group p-6 rounded-full bg-[#0a120b] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1)] border-[12px] border-[#1a1a1a]">
        
        {/* Anillo de Oro Pulido (CSS Bezel) */}
        <div className="absolute inset-0 rounded-full border-[6px] border-[#c5a96e] shadow-[inset_0_0_15px_rgba(0,0,0,0.5),0_0_20px_rgba(197,169,110,0.2)]" 
             style={{ background: 'linear-gradient(135deg, #c5a96e 0%, #dac88c 45%, #c5a96e 55%, #8e743a 100%)', margin: '-6px' }} 
        />

        {/* Luces LED "Diamante" */}
        {[...Array(24)].map((_, i) => (
          <div 
            key={i}
            className={`absolute w-1.5 h-1.5 rounded-full shadow-[0_0_8px_#dac88c] z-20 transition-all duration-300`}
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 15}deg) translate(0, -188px)`,
              background: isSpinning ? (i % 2 === Math.round(Date.now()/200)%2 ? '#fff' : '#c5a96e') : '#c5a96e',
              boxShadow: isSpinning && i % 2 === Math.round(Date.now()/200)%2 ? '0 0 12px #fff' : '0 0 5px #c5a96e'
            }}
          />
        ))}

        {/* Puntero de Lujo */}
        <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-40">
          <div className="w-10 h-14 bg-[#c5a96e] clip-path-pointer shadow-2xl flex items-center justify-center border-t-2 border-white/30">
             <div className="w-1 h-6 bg-black/20 rounded-full" />
          </div>
        </div>

        {/* Botón Central de Cristal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full z-40 bg-[#1a2e1c] border-4 border-[#c5a96e] shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.2)] flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
           <div className="w-2 h-2 bg-white/80 rounded-full blur-[1px] absolute top-3 left-4" />
           <span className="text-travesia-gold font-serif text-xl font-bold italic">LT</span>
        </div>

        {/* Canvas de la Ruleta */}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="rounded-full relative z-10 block"
        />
      </div>
      
      {/* Botón de Girar Premium */}
      <button
        onClick={spin}
        disabled={isSpinning || premios.length === 0}
        className="group relative px-20 py-7 bg-transparent overflow-hidden rounded-[32px] transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
      >
        <div className="absolute inset-0 bg-[#c5a96e] shadow-[0_20px_40px_-10px_rgba(197,169,110,0.4)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="relative z-10 text-[#1a2e1c] font-black text-2xl tracking-[0.2em] uppercase">
          {isSpinning ? 'La Suerte Gira...' : 'GIRAR RULETA'}
        </span>
        <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] group-hover:left-[100%] transition-all duration-1000" />
      </button>

      <style jsx>{`
        .clip-path-pointer {
          clip-path: polygon(50% 100%, 0 0, 100% 0);
          background: linear-gradient(135deg, #c5a96e 0%, #dac88c 45%, #8e743a 100%);
        }
      `}</style>
    </div>
  );
}
