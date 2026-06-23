'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function BackgroundEffects() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  // No mostrar en el panel de administrador
  if (pathname?.startsWith('/admin')) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#F2F2F7]">
      {/* Orb 1 */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#34C759]/15 to-transparent blur-[80px] animate-blob" />
      {/* Orb 2 */}
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[70%] rounded-full bg-gradient-to-bl from-[#D4AF37]/15 to-transparent blur-[100px] animate-blob animation-delay-2000" />
      {/* Orb 3 */}
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#000000]/5 to-transparent blur-[100px] animate-blob animation-delay-4000" />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-black/10 shadow-[0_0_10px_rgba(0,0,0,0.1)] animate-float"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDuration: Math.random() * 15 + 15 + 's',
              animationDelay: Math.random() * -20 + 's',
            }}
          />
        ))}
      </div>
      
      {/* Organic Wave at bottom */}
      <svg className="absolute bottom-0 w-full h-[15vh] opacity-[0.04] text-black fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,160C960,139,1056,149,1152,160C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </div>
  );
}
