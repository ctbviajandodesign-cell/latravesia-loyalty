'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
        <AlertTriangle size={28} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-serif font-bold text-white">Algo salió mal</h2>
        <p className="text-white/40 text-sm max-w-sm">
          {error.message || 'Ocurrió un error inesperado. Por favor intenta de nuevo.'}
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-6 py-3 bg-travesia-gold text-[#051A10] rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all"
      >
        <RefreshCcw size={14} /> Reintentar
      </button>
    </div>
  );
}
