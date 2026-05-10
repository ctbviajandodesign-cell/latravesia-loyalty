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
  Smartphone,
  Info,
  RefreshCw,
  LogOut
} from 'lucide-react';
import Ruleta from '@/components/Ruleta';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    const savedId = localStorage.getItem('travesia_cliente_id');
    if (savedId) {
      setClienteId(savedId);
      // Solo saltamos al juego si el usuario quiere, o si no ha jugado aún.
      // Para pruebas, permitiremos que el usuario vea la bienvenida primero.
    }
  }, []);

  const handleResetSession = () => {
    localStorage.removeItem('travesia_cliente_id');
    setClienteId(null);
    setStep('welcome');
    window.location.reload(); // Limpiar todo el estado
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const numLimpio = formData.telefono.replace(/^0/, '');
    const telefonoFinal = `+593${numLimpio}`;

    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{ 
          ...formData, 
          telefono: telefonoFinal,
          visitas: 1 
        }])
        .select()
        .single();

      if (error) {
        if (error.message.includes('visitas')) {
          alert('⚠️ ERROR DE BASE DE DATOS: Por favor, ejecuta el comando SQL en Supabase para añadir la columna "visitas".');
          throw error;
        }
        throw error;
      }
      
      localStorage.setItem('travesia_cliente_id', data.id);
      setClienteId(data.id);
      setStep('game');
      
      await fetch('/api/marketing/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'BIRTHDAY_WELCOME', cliente: data })
      });

    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#051A10] text-white selection:bg-travesia-gold selection:text-travesia-green-deep overflow-x-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-travesia-gold/5 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-travesia-green-deep/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative max-w-lg mx-auto min-h-screen flex flex-col px-6 py-8">
        
        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="w-16 h-16 bg-gradient-to-br from-travesia-gold to-[#B8860B] rounded-2xl rotate-12 flex items-center justify-center shadow-2xl border border-white/20">
            <Sparkles className="w-8 h-8 text-[#051A10] -rotate-12" />
          </div>
          <h1 className="mt-4 text-3xl font-serif font-bold tracking-tighter text-travesia-gold">La Travesía</h1>
          <p className="text-[8px] uppercase tracking-[0.5em] font-black text-white/40 mt-1">Loyalty Experience</p>
        </div>

        {/* STEP: WELCOME */}
        {step === 'welcome' && (
          <div className="flex-1 flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-4">
              <h2 className="text-4xl font-serif leading-tight font-bold">
                Tu fidelidad tiene <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-travesia-gold to-[#FFD700]">un lugar aquí.</span>
              </h2>
              <p className="text-white/60 text-base leading-relaxed font-light">
                {clienteId ? '¡Qué gusto verte de nuevo! Ya eres parte de nuestra comunidad.' : 'Regístrate hoy y gana tu primer premio girando nuestra ruleta de lujo.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {!clienteId ? (
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-[28px] backdrop-blur-md">
                  <div className="w-10 h-10 bg-travesia-gold/20 rounded-xl flex items-center justify-center text-travesia-gold"><Gift size={20}/></div>
                  <div><p className="font-bold text-sm">Premio de Bienvenida</p><p className="text-[10px] text-white/40 uppercase tracking-widest font-black italic">Solo por registrarte</p></div>
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-[28px] backdrop-blur-md">
                  <div className="w-10 h-10 bg-travesia-green-deep/40 rounded-xl flex items-center justify-center text-travesia-gold"><ShieldCheck size={20}/></div>
                  <div><p className="font-bold text-sm">Ya estás registrado</p><p className="text-[10px] text-white/40 uppercase tracking-widest font-black italic">Escanea el QR en el local</p></div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {!clienteId ? (
                <button 
                  onClick={() => setStep('form')}
                  className="group w-full bg-gradient-to-r from-travesia-gold to-[#B8860B] text-[#051A10] py-6 rounded-3xl font-black text-xs tracking-[0.3em] uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  EMPEZAR REGISTRO <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => router.push('/checkin')}
                    className="w-full bg-travesia-gold text-[#051A10] py-6 rounded-3xl font-black text-xs tracking-[0.3em] uppercase shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                  >
                    HACER MI CHECK-IN <MapPin size={18} />
                  </button>
                  <button 
                    onClick={handleResetSession}
                    className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-black hover:text-travesia-gold transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={12} /> Nuevo Registro (Borrar sesión de prueba)
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP: FORM */}
        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Crea tu Perfil</h2>
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-black">Paso 1 de 2</p>
                </div>
                <button type="button" onClick={() => setStep('welcome')} className="text-white/20 hover:text-white transition-colors">
                  <LogOut size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><User size={12}/> Nombre</label>
                  <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all text-sm" placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><User size={12}/> Apellido</label>
                  <input required type="text" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all text-sm" placeholder="Tu apellido" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><Mail size={12}/> Correo Electrónico</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all text-sm" placeholder="ejemplo@correo.com" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><Smartphone size={12}/> WhatsApp (Ecuador)</label>
                  <div className="flex gap-2">
                    <div className="bg-white/10 border border-white/10 px-4 flex items-center rounded-2xl text-travesia-gold font-bold text-sm">+593</div>
                    <input 
                      required 
                      type="tel" 
                      value={formData.telefono} 
                      onChange={(e) => setFormData({...formData, telefono: e.target.value.replace(/[^0-9]/g, '')})} 
                      className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all text-sm" 
                      placeholder="999999999" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><Calendar size={12}/> Tu Cumpleaños</label>
                  <input required type="date" value={formData.fecha_nacimiento} onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all [color-scheme:dark] text-sm min-h-[52px]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold">Género</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Femenino', 'Masculino', 'Otro'].map((g) => (
                    <button key={g} type="button" onClick={() => setFormData({...formData, genero: g})} className={`py-3 rounded-xl border text-[9px] font-black tracking-widest uppercase transition-all ${formData.genero === g ? 'bg-travesia-gold border-travesia-gold text-[#051A10]' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-travesia-gold text-[#051A10] py-6 rounded-3xl font-black text-xs tracking-[0.3em] uppercase shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>FINALIZAR REGISTRO <ChevronRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}

        {/* STEP: GAME */}
        {step === 'game' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-1000">
            <div className="text-center mb-8 space-y-1">
              <h2 className="text-4xl font-serif font-bold text-travesia-gold">Gira y Gana</h2>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-black">Tu primer beneficio</p>
            </div>
            
            <div className="w-full flex justify-center py-4">
              <Ruleta onWin={(p) => { setPremioFinal(p); setStep('success'); }} />
            </div>
          </div>
        )}

        {/* STEP: SUCCESS */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in zoom-in duration-1000">
            <div className="relative">
              <div className="absolute inset-0 bg-travesia-gold blur-[60px] opacity-20 animate-pulse"></div>
              <div className="relative w-28 h-28 bg-gradient-to-br from-travesia-gold to-[#B8860B] rounded-[38px] flex items-center justify-center shadow-2xl border border-white/20">
                <CheckCircle2 className="w-14 h-14 text-[#051A10]" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-serif font-bold tracking-tight">¡Bienvenido!</h2>
              <div className="p-8 bg-white/5 border-2 border-travesia-gold/30 rounded-[40px] backdrop-blur-xl shadow-2xl">
                <p className="text-[10px] uppercase tracking-[0.3em] text-travesia-gold font-black mb-2">Has ganado</p>
                <p className="text-3xl font-black text-white leading-tight">{premioFinal}</p>
              </div>
              <p className="text-white/40 text-xs leading-relaxed max-w-[260px] mx-auto italic">
                Captura esta pantalla y muéstrala en caja para reclamar tu premio.
              </p>
            </div>

            <div className="pt-8 border-t border-white/10 w-full space-y-4">
              <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black">Siguiente Paso</p>
              <button 
                onClick={() => router.push('/checkin')}
                className="flex items-center gap-3 justify-center text-travesia-gold font-serif italic text-lg hover:brightness-125 transition-all"
              >
                <Smartphone className="w-5 h-5 text-travesia-gold/60" /> Registrar visita en el local
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
