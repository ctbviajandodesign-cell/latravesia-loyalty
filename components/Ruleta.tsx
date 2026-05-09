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

  const drawRuleta = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 10;
    const segmentAngle = (2 * Math.PI) / premios.length;

    ctx.clearRect(0, 0, size, size);

    premios.forEach((premio, i) => {
      const angle = i * segmentAngle;
      
      // Sombreado y gradientes para efecto 3D
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
      const colors = ['#2c4a2e', '#1e3320', '#3d6b4f', '#dac88c', '#c5a96e'];
      const baseColor = colors[i % colors.length];
      
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, baseColor);

      // Dibujar segmento
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + segmentAngle);
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Borde de segmento
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Texto y Emoji
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + segmentAngle / 2);
      ctx.textAlign = 'right';
      
      // Color de texto contrastado
      ctx.fillStyle = i % 5 < 3 ? '#dac88c' : '#1e3320';
      ctx.font = 'bold 14px "Jost", sans-serif';
      
      const displayText = `${premio.emoji || '🎁'} ${premio.nombre}`;
      ctx.fillText(displayText.substring(0, 20), radius - 30, 5);
      ctx.restore();
    });

    // Círculo central decorativo
    ctx.beginPath();
    ctx.arc(center, center, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#dac88c';
    ctx.fill();
    ctx.strokeStyle = '#1e3320';
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [premios]);

  useEffect(() => {
    if (!canvasRef.current || premios.length === 0) return;
    drawRuleta();
  }, [premios, drawRuleta]);

  const spin = () => {
    if (isSpinning || premios.length === 0) return;
    setIsSpinning(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Calcular ganador por probabilidad real
    const totalProb = premios.reduce((acc, p) => acc + Number(p.probabilidad), 0);
    let random = Math.random() * totalProb;
    let winningIndex = 0;
    
    for (let i = 0; i < premios.length; i++) {
      random -= Number(premios[i].probabilidad);
      if (random <= 0) {
        winningIndex = i;
        break;
      }
    }

    const winner = premios[winningIndex];

    // 2. Configurar animación
    const spinDuration = 5000;
    const segmentAngle = (2 * Math.PI) / premios.length;
    
    // Calcular el ángulo necesario para que el puntero (arriba, -PI/2) coincida con el segmento ganador
    // El puntero está en -90deg (3*PI/2). Queremos que el centro del segmento winningIndex termine ahí.
    const extraSpins = 8 * 2 * Math.PI; // 8 vueltas completas
    const targetAngle = (2 * Math.PI) - (winningIndex * segmentAngle + segmentAngle / 2);
    const finalRotation = extraSpins + targetAngle + (Math.PI * 1.5); // Ajuste para el puntero arriba
    
    const startTime = performance.now();
    const startRotation = rotationRef.current % (2 * Math.PI);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Ease Out Cubic para un frenado suave y elegante
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + (finalRotation * easeOut);
      
      rotationRef.current = currentRotation;
      canvas.style.transform = `rotate(${currentRotation}rad)`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        
        // Efecto visual de victoria
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#dac88c', '#2c4a2e', '#f5f0e8']
        });

        // Notificar resultado
        setTimeout(() => onResult(winner), 500);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-10 relative">
      <div className="relative group">
        {/* Glow effect background */}
        <div className={`absolute inset-0 bg-travesia-gold/20 rounded-full blur-3xl transition-opacity duration-1000 ${isSpinning ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Pointer (Premium Gold) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
          <div className="w-8 h-10 bg-travesia-gold clip-path-pointer shadow-xl border-2 border-travesia-green-deep flex items-center justify-center">
            <div className="w-1 h-4 bg-travesia-green-deep/30 rounded-full" />
          </div>
        </div>

        {/* Canvas de la Ruleta */}
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          className="rounded-full shadow-[0_0_50px_rgba(0,0,0,0.3)] border-8 border-travesia-green-dark relative z-10 transition-transform duration-75"
        />
        
        {/* Marco decorativo externo */}
        <div className="absolute inset-[-12px] border-2 border-travesia-gold/20 rounded-full z-0" />
      </div>
      
      <button
        onClick={spin}
        disabled={isSpinning || premios.length === 0}
        className="relative group px-12 py-5 bg-travesia-gold text-travesia-green-deep font-black text-xl rounded-2xl transition-all shadow-[0_10px_20px_rgba(218,200,140,0.3)] hover:shadow-[0_15px_30px_rgba(218,200,140,0.4)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-30 disabled:scale-100 overflow-hidden"
      >
        <span className="relative z-10">{isSpinning ? '¡SUERTE! ✨' : 'GIRAR AHORA'}</span>
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      </button>

      <style jsx>{`
        .clip-path-pointer {
          clip-path: polygon(50% 100%, 0 0, 100% 0);
        }
      `}</style>
    </div>
  );
}
