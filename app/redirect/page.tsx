'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  Instagram, 
  Facebook, 
  Music2, 
  Smartphone, 
  ArrowLeft,
  Star,
  ExternalLink
} from 'lucide-react';

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-12 h-12" />,
  facebook:  <Facebook className="w-12 h-12" />,
  tiktok:    <Music2 className="w-12 h-12" />,
  whatsapp:  <Smartphone className="w-12 h-12" />,
  reseña:    <Star className="w-12 h-12 fill-current" />,
};

const SOCIAL_COLORS: Record<string, string> = {
  instagram: 'from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white',
  facebook:  'bg-[#1877F2] text-white',
  tiktok:    'bg-black text-white border border-white/20',
  whatsapp:  'bg-[#25D366] text-white',
  reseña:    'bg-travesia-gold/20 text-travesia-gold border border-travesia-gold/30',
};

export default function RedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#051A10] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-travesia-gold" />
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
}

function RedirectContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url') || '';
  const app = searchParams.get('app') || '';
  const key = searchParams.get('key') || 'red social';
  const from = searchParams.get('from') || 'registro';
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  const cleanKey = key.toLowerCase();
  const icon = SOCIAL_ICONS[cleanKey] || <ExternalLink className="w-12 h-12" />;
  const colorClass = SOCIAL_COLORS[cleanKey] || 'bg-travesia-gold text-[#051A10]';

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const socialName = capitalize(key === 'reseña' ? 'Google Maps' : key);

  // Redirigir automáticamente en el primer montaje
  useEffect(() => {
    if (!url || redirectAttempted) return;
    setRedirectAttempted(true);

    // Registrar en sessionStorage el inicio de redirección
    sessionStorage.setItem(`redir_done_${key}`, 'true');

    let fallbackTimeout: NodeJS.Timeout | null = null;
    let appOpened = false;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        appOpened = true;
        if (fallbackTimeout) {
          clearTimeout(fallbackTimeout);
          fallbackTimeout = null;
        }
      } else if (document.visibilityState === 'visible') {
        if (appOpened) {
          sessionStorage.setItem('reg_pending_social', key); // Asegurar que se marque al volver
          try {
            window.close();
            // Por si window.close() falla de forma silenciosa, redirigimos tras 500ms
            setTimeout(() => {
              window.location.replace(from === 'checkin' ? '/checkin' : '/registro');
            }, 500);
          } catch (e) {
            window.location.replace(from === 'checkin' ? '/checkin' : '/registro');
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (app && app !== '#') {
      window.location.href = app;

      // Si sigue visible tras 1.5s, no tiene la app instalada; usamos fallback a web
      fallbackTimeout = setTimeout(() => {
        if (document.visibilityState === 'visible') {
          window.location.href = url;
        }
      }, 1500);
    } else {
      fallbackTimeout = setTimeout(() => {
        window.location.href = url;
      }, 800);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [url, app, key, from, redirectAttempted]);

  const handleOpenApp = () => {
    sessionStorage.setItem(`redir_done_${key}`, 'true');
    if (app && app !== '#') {
      window.location.href = app;
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          window.location.href = url;
        }
      }, 1000);
    } else {
      window.location.href = url;
    }
  };

  const handleReturn = () => {
    sessionStorage.setItem(`redir_done_${key}`, 'true');
    sessionStorage.setItem('reg_pending_social', key); // Asegurar que se marque al volver
    
    try {
      window.close();
      setTimeout(() => {
        window.location.replace(from === 'checkin' ? '/checkin' : '/registro');
      }, 200);
    } catch (e) {
      window.location.replace(from === 'checkin' ? '/checkin' : '/registro');
    }
  };

  return (
    <main className="min-h-screen bg-[#051A10] text-white flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      
      {/* Luces de Fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-travesia-gold/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-sm space-y-10 text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Icono de la Red */}
        <div className="flex flex-col items-center gap-4">
          <div className={`w-24 h-24 rounded-[32px] bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-2xl animate-pulse`}>
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
              {key === 'reseña' ? 'Deja tu Reseña' : `Síguenos en ${socialName}`}
            </h1>
            <p className="text-white/40 text-xs uppercase tracking-widest font-black mt-1">
              Hostería La Travesía
            </p>
          </div>
        </div>

        {/* Mensaje Informativo */}
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-2">
          <p className="text-sm font-medium text-white/80 leading-relaxed">
            Estamos abriendo {socialName} para que puedas {key === 'reseña' ? 'escribir tu reseña' : 'unirte/seguirnos'}.
          </p>
          <p className="text-xs text-white/40 leading-relaxed font-sans">
            Una vez realizado, vuelve a esta pantalla y presiona el botón dorado para continuar.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="space-y-3">
          <button
            onClick={handleOpenApp}
            className="w-full bg-travesia-gold text-[#051A10] py-5 px-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-travesia-gold/25"
          >
            <ExternalLink size={14} /> ABRIR {socialName.toUpperCase()}
          </button>

          <button
            onClick={handleReturn}
            className="w-full bg-white/5 border border-white/15 text-white/80 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> REGRESAR / YA SEGUÍ
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-white/20 text-[10px] uppercase font-black tracking-[0.2em]">
          <Sparkles size={10} /> Loyalty App
        </div>
      </div>
    </main>
  );
}
