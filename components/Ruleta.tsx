'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Trophy, Sparkles, Loader2, Pointer } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Premio {
  id: string;
  nombre: string;
  color: string;
  probabilidad: number;
}

export default function Ruleta({ onWin }: { onWin: (premio: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [premios, setPremios] = useState<Premio[]>([]);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // ESCALADO AUTOMÁTICO PARA MÓVILES
  const [scale, setScale] = useState(1);

  useEffect(() => {
    fetchPremios();
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 400) setScale(0.75);
      else if (width < 500) setScale(0.85);
      else setScale(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function fetchPremios() {
    const { data } = await supabase.from('premios').select('*');
    if (data) {
      // Mapeo de colores dinámicos: Esmeralda y Oro
      const styledPremios = data.map((p, i) => ({
        ...p,
        color: i % 2 === 0 ? '#0A2A18' : '#D4AF37' // Alternancia Esmeralda Profundo / Oro
      }));
      setPremios(styledPremios);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (premios.length > 0) drawWheel();
  }, [premios, rotation]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 400;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    ctx.clearRect(0, 0, size, size);

    // MARCO EXTERIOR DE ORO PULIDO (3D Effect)
    const goldGradient = ctx.createLinearGradient(0, 0, size, size);
    goldGradient.addColorStop(0, '#B8860B');
    goldGradient.addColorStop(0.5, '#D4AF37');
    goldGradient.addColorStop(1, '#8B6508');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, Math.PI * 2);
    ctx.fillStyle = goldGradient;
    ctx.fill();
    ctx.strokeStyle = '#5C4033';
    ctx.lineWidth = 2;
    ctx.stroke();

    // DIBUJAR SEGMENTOS
    const sliceAngle = (Math.PI * 2) / premios.length;
    premios.forEach((premio, i) => {
      const angle = rotation + i * sliceAngle;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = premio.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // TEXTO DE LOS PREMIOS
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = premio.color === '#D4AF37' ? '#0A1A12' : '#D4AF37';
      ctx.font = 'bold 14px serif';
      ctx.fillText(premio.nombre.toUpperCase(), radius - 40, 5);
      ctx.restore();
    });

    // PUNTOS LED (Iluminación dinámica)
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI * 2) / 24;
      const x = centerX + (radius + 5) * Math.cos(angle);
      const y = centerY + (radius + 5) * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = (Math.floor(Date.now() / 200) + i) % 3 === 0 ? '#FFF' : '#8B6508';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFF';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // BOTÓN CENTRAL "LT" (Vidrio Esmeralda)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    const glass = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
    glass.addColorStop(0, '#1A3A2A');
    glass.addColorStop(1, '#0A1A12');
    ctx.fillStyle = glass;
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.stroke();

    // LOGO LT
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 30px serif';
    ctx.textAlign = 'center';
    ctx.fillText('LT', centerX, centerY + 10);
  };

  const handleSpinClick = async () => {
    if (spinning) return;
    setShowPinModal(true);
  };

  const validatePinAndSpin = async () => {
    const { data } = await supabase.from('config').select('*').eq('clave', 'pin_ruleta').single();
    if (pin === (data?.valor || '1234')) {
      setShowPinModal(false);
      setPin('');
      setError('');
      spin();
    } else {
      setError('PIN incorrecto. Pídelo en caja.');
    }
  };

  const spin = () => {
    setSpinning(true);
    
    // Audio mecánico (Simulado por ritmo de giro)
    const spinDuration = 5000;
    const startTime = Date.now();
    const startRotation = rotation;
    
    // Lógica de probabilidad
    const totalProb = premios.reduce((acc, p) => acc + p.probabilidad, 0);
    let random = Math.random() * totalProb;
    let winnerIndex = 0;
    for (let i = 0; i < premios.length; i++) {
      random -= premios[i].probabilidad;
      if (random <= 0) {
        winnerIndex = i;
        break;
      }
    }

    const sliceAngle = (Math.PI * 2) / premios.length;
    const extraRotations = 8 * Math.PI * 2;
    const targetRotation = extraRotations + (premios.length - winnerIndex - 0.5) * sliceAngle;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Easing: Ease Out Quint
      const easeOut = 1 - Math.pow(1 - progress, 5);
      const currentRot = startRotation + targetRotation * easeOut;
      
      setRotation(currentRot);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setTimeout(() => onWin(premios[winnerIndex].nombre), 500);
      }
    };

    animate();
  };

  if (loading) return <Loader2 className="animate-spin text-travesia-gold w-10 h-10" />;

  return (
    <div className="relative flex flex-col items-center">
      
      {/* CONTENEDOR DE ESCALADO RESPONSIVO */}
      <div 
        style={{ transform: `scale(${scale})`, transition: 'transform 0.3s ease' }}
        className="relative"
      >
        <canvas ref={canvasRef} width={400} height={400} className="rounded-full shadow-[0_0_80px_rgba(0,0,0,0.6)]" />
        
        {/* INDICADOR SUPERIOR (FLECHA) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
          <div className="w-8 h-10 bg-travesia-gold rounded-full shadow-lg flex items-center justify-center border-2 border-[#8B6508]">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-travesia-green-deep"></div>
          </div>
        </div>

        {/* BOTÓN CENTRAL DE DISPARO */}
        {!spinning && (
          <button 
            onClick={handleSpinClick}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-transparent hover:scale-110 transition-transform cursor-pointer flex items-center justify-center group"
          >
            <div className="absolute inset-0 bg-travesia-gold/20 rounded-full animate-ping group-hover:bg-travesia-gold/40"></div>
            <Pointer className="text-travesia-gold w-10 h-10 drop-shadow-lg" />
          </button>
        )}
      </div>

      {/* MODAL DE PIN (GLASSMORPHISM) */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
          <div className="bg-[#0A1A12] border border-travesia-gold/30 p-10 rounded-[40px] w-full max-w-xs text-center space-y-6 shadow-2xl">
            <Trophy className="w-12 h-12 text-travesia-gold mx-auto" />
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-white">Validación de Visita</h3>
              <p className="text-xs text-white/40">Ingresa el PIN de la caja para girar.</p>
            </div>
            <input 
              autoFocus
              type="password" 
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-4xl tracking-[0.5em] bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold text-white font-mono"
            />
            {error && <p className="text-red-400 text-[10px] font-bold uppercase">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowPinModal(false)} className="flex-1 py-4 text-xs font-bold text-white/40 uppercase">Cancelar</button>
              <button onClick={validatePinAndSpin} className="flex-2 py-4 px-6 bg-travesia-gold text-[#0A1A12] rounded-xl font-black text-xs uppercase tracking-widest">Validar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
