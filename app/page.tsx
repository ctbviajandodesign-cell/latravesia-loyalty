'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle2, 
  Sparkles, 
  Gift, 
  ChevronRight, 
  Star, 
  User, 
  Mail, 
  Calendar,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import Ruleta from '@/components/Ruleta';

export default function Home() {
  const [step, setStep] = useState<'welcome' | 'form' | 'game' | 'success'>('welcome');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: 'Otro'
  });
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [premioFinal, setPremioFinal] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem('travesia_cliente_id');
    if (savedId) {
      setClienteId(savedId);
      setStep('game');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{ ...formData, visitas: 1 }])
        .select()
        .single();

      if (error) throw error;
      
      localStorage.setItem('travesia_cliente_id', data.id);
      setClienteId(data.id);
      setStep('game');
      
      // Notificación de bienvenida
      await fetch('/api/marketing/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'BIRTHDAY_WELCOME', cliente: data })
      });

    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A1A12] text-white selection:bg-travesia-gold selection:text-travesia-green-deep">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-travesia-green-deep/20 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-travesia-gold/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative max-w-lg mx-auto min-h-screen flex flex-col px-6 py-12">
        
        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="w-20 h-20 bg-gradient-to-br from-travesia-gold to-[#B8860B] rounded-3xl rotate-12 flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.3)] border border-white/20">
            <Sparkles className="w-10 h-10 text-[#0A1A12] -rotate-12" />
          </div>
          <h1 className="mt-6 text-4xl font-serif font-bold tracking-tighter text-travesia-gold">La Travesía</h1>
          <p className="text-xs uppercase tracking-[0.4em] font-bold text-white/40 mt-1">Loyalty Experience</p>
        </div>

        {/* STEP: WELCOME */}
        {step === 'welcome' && (
          <div className="flex-1 flex flex-col justify-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-4">
              <h2 className="text-5xl font-serif leading-[1.1] font-bold">
                Bienvenido a <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-travesia-gold to-[#FFD700]">algo especial.</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed font-light">
                Únete a nuestro club exclusivo y gana premios increíbles desde tu primera visita.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-[32px] backdrop-blur-md">
                <div className="w-12 h-12 bg-travesia-gold/20 rounded-2xl flex items-center justify-center text-travesia-gold"><Gift /></div>
                <div><p className="font-bold">Premios al Instante</p><p className="text-xs text-white/40">Gira la ruleta al registrarte.</p></div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-[32px] backdrop-blur-md">
                <div className="w-12 h-12 bg-travesia-green-deep/40 rounded-2xl flex items-center justify-center text-travesia-gold"><Star /></div>
                <div><p className="font-bold">Fidelidad Premium</p><p className="text-xs text-white/40">Cada visita te acerca a la meta.</p></div>
              </div>
            </div>

            <button 
              onClick={() => setStep('form')}
              className="group w-full bg-gradient-to-r from-travesia-gold to-[#B8860B] text-[#0A1A12] py-6 rounded-full font-black text-sm tracking-[0.3em] uppercase shadow-[0_20px_50px_rgba(212,175,55,0.2)] hover:shadow-[0_20px_60px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              COMENZAR EXPERIENCIA <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        )}

        {/* STEP: FORM */}
        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-serif font-bold">Crea tu Perfil</h2>
                <p className="text-white/40 text-sm">Completa tus datos para empezar a ganar.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><User size={12}/> Nombre</label>
                  <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><User size={12}/> Apellido</label>
                  <input required type="text" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><Mail size={12}/> Correo Electrónico</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><Smartphone size={12}/> WhatsApp</label>
                  <input required type="tel" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><Calendar size={12}/> Tu Cumpleaños</label>
                  <input required type="date" value={formData.fecha_nacimiento} onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all [color-scheme:dark]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold">Género</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Femenino', 'Masculino', 'Otro'].map((g) => (
                    <button key={g} type="button" onClick={() => setFormData({...formData, genero: g})} className={`py-3 rounded-xl border text-[10px] font-bold tracking-widest uppercase transition-all ${formData.genero === g ? 'bg-travesia-gold border-travesia-gold text-[#0A1A12]' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-travesia-green-deep text-white py-6 rounded-full font-black text-sm tracking-[0.3em] uppercase shadow-2xl hover:brightness-125 active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/10"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>REGISTRARME <ChevronRight /></>}
              </button>
            </form>
          </div>
        )}

        {/* STEP: GAME */}
        {step === 'game' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-1000">
            <div className="text-center mb-8 space-y-2">
              <h2 className="text-4xl font-serif font-bold text-travesia-gold">Gira y Gana</h2>
              <p className="text-white/40 text-sm italic">Tu aventura comienza con un regalo.</p>
            </div>
            
            <div className="w-full flex justify-center py-4">
              <Ruleta onWin={(p) => { setPremioFinal(p); setStep('success'); }} />
            </div>

            <div className="mt-12 flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full text-xs text-white/60">
              <ShieldCheck className="text-travesia-gold" size={16} /> Verificación por PIN requerida en caja
            </div>
          </div>
        )}

        {/* STEP: SUCCESS */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in zoom-in duration-1000">
            <div className="relative">
              <div className="absolute inset-0 bg-travesia-gold blur-[60px] opacity-20 animate-pulse"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-travesia-gold to-[#B8860B] rounded-[40px] flex items-center justify-center shadow-2xl border border-white/20">
                <CheckCircle2 className="w-16 h-16 text-[#0A1A12]" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-5xl font-serif font-bold tracking-tight">¡Felicidades!</h2>
              <div className="p-8 bg-white/5 border-2 border-travesia-gold/30 rounded-[40px] backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-travesia-gold font-bold mb-2">Has ganado</p>
                <p className="text-3xl font-black text-white">{premioFinal}</p>
              </div>
              <p className="text-white/40 text-sm leading-relaxed max-w-[280px] mx-auto italic">
                Captura esta pantalla y muéstrala en caja para reclamar tu premio.
              </p>
            </div>

            <div className="pt-8 border-t border-white/10 w-full">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black mb-4">Siguiente Paso</p>
              <div className="flex items-center gap-3 justify-center text-travesia-gold font-serif italic text-lg">
                <Smartphone className="w-5 h-5" /> Escanea el QR en tu próxima visita
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
