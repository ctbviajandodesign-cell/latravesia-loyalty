'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

interface Premio {
  id: string;
  nombre: string;
  emoji: string;
}

interface RuletaProps {
  premios: Premio[];
  onResult: (premio: Premio) => void;
}

export default function Ruleta({ premios, onResult }: RuletaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || premios.length === 0) return;
    drawRuleta();
  }, [premios]);

  const drawRuleta = () => {
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
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + segmentAngle);
      ctx.closePath();
      
      // Colors
      const colors = ['#2c4a2e', '#1e3320', '#3d6b4f', '#dac88c', '#c5a96e'];
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#f5f0e8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = i % 5 < 3 ? '#dac88c' : '#1e3320';
      ctx.font = 'bold 14px Jost';
      ctx.fillText(`${premio.emoji} ${premio.nombre}`, radius - 20, 5);
      ctx.restore();
    });
  };

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const spinDuration = 4000;
    const startRotation = 0;
    const extraSpins = 5 + Math.random() * 5;
    const finalRotation = extraSpins * 2 * Math.PI;
    
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Ease out quartic
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentRotation = startRotation + finalRotation * easeOut;

      canvas.style.transform = `rotate(${currentRotation}rad)`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winningIndex = Math.floor(
          (premios.length - (currentRotation % (2 * Math.PI)) / ((2 * Math.PI) / premios.length)) % premios.length
        );
        const winner = premios[winningIndex];
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#dac88c', '#2c4a2e', '#f5f0e8']
        });

        onResult(winner);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-travesia-gold shadow-lg" />
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="rounded-full shadow-2xl transition-transform duration-75"
        />
      </div>
      
      <button
        onClick={spin}
        disabled={isSpinning}
        className="px-8 py-3 bg-travesia-gold hover:bg-travesia-gold-dark text-travesia-green-deep font-bold rounded-full transition-all shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
      >
        {isSpinning ? 'Girando...' : 'GIRAR RULETA'}
      </button>
    </div>
  );
}
