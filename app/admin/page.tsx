'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from './actions';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(password);

    if (result.success) {
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      setError(result.error || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-travesia-cream flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white p-8 rounded-3xl shadow-xl space-y-8 border border-travesia-gold/20">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-travesia-green-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-travesia-gold w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-travesia-green-deep tracking-tight">
            Dashboard Admin
          </h1>
          <p className="text-travesia-green-dark/60 text-sm">
            Ingresa la clave de acceso para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-4 bg-travesia-cream border border-travesia-gold/30 rounded-xl focus:border-travesia-green-dark outline-none transition-all text-center text-lg"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-travesia-green-dark text-white font-bold py-4 rounded-xl hover:bg-travesia-green-deep transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'ACCEDIENDO...' : 'ENTRAR AL PANEL'}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => router.push('/')}
            className="text-travesia-green-dark/40 hover:text-travesia-green-dark text-xs uppercase tracking-widest transition-colors"
          >
            Volver al flujo cliente
          </button>
        </div>
      </div>
    </main>
  );
}
