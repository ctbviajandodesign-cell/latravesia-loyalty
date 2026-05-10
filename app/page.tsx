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
  Info
} from 'lucide-react';
import Ruleta from '@/components/Ruleta';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [step, setStep] = useState<'welcome' | 'form' | 'game' | 'success'>('welcome');
  const [loading, setLoading] = useState(true); // Empezamos en loading para validar sesión
  const [formLoading, setFormLoading] = useState(false);
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
    validarSesion();
  }, []);

  async function validarSesion() {
    const savedId = localStorage.getItem('travesia_cliente_id');
    
    if (savedId) {
      // VALIDACIÓN CRÍTICA: ¿El usuario existe realmente en la DB?
      const { data, error } = await supabase
        .from('clientes')
        .select('id')
        .eq('id', savedId)
        .single();

      if (error || !data) {
        // El usuario fue borrado o el ID es inválido -> Limpiamos fantasma
        console.log("Sesión fantasma detectada. Limpiando...");
        localStorage.removeItem('travesia_cliente_id');
        setClienteId(null);
        setStep('welcome');
      } else {
        // El usuario es real -> Mandamos al check-in
        router.push('/checkin');
        return; // Salimos para no quitar el loading y evitar parpadeo
      }
    }
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
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

      if (error) throw error;
      
      localStorage.setItem('travesia_cliente_id', data.id);
      setClienteId(data.id);
      setStep('game');
      
      fetch('/api/marketing/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'BIRTHDAY_WELCOME', cliente: data })
      }).catch(e => console.error("Notif error:", e));

    } catch (error: any) {
      alert("Hubo un problema al registrarte. Por favor intenta de nuevo.");
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#051A10] flex items-center justify-center">
        <Loader2 className="animate-spin text-travesia-gold w-10 h-10" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#051A10] text-white selection:bg-travesia-gold selection:text-travesia-green-deep overflow-x-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-travesia-gold/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative max-w-lg mx-auto min-h-screen flex flex-col px-6 py-8">
        
        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="w-16 h-16 bg-gradient-to-br from-travesia-gold to-[#B8860B] rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
            <Sparkles className="w-8 h-8 text-[#051A10]" />
          </div>
          <h1 className="mt-4 text-3xl font-serif font-bold tracking-tighter text-travesia-gold">La Travesía</h1>
          <p className="text-[8px] uppercase tracking-[0.5em] font-black text-white/40 mt-1 italic">Loyalty Experience</p>
        </div>

        {/* STEP: WELCOME */}
        {step === 'welcome' && (
          <div className="flex-1 flex flex-col justify-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-4">
              <h2 className="text-4xl font-serif leading-tight font-bold">
                Bienvenido a <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-travesia-gold to-[#FFD700]">La Travesía.</span>
              </h2>
              <p className="text-white/60 text-base leading-relaxed font-light">
                Únete a nuestro club de fidelidad y gana premios exclusivos desde tu primer registro.
              </p>
            </div>
            
            <button 
              onClick={() => setStep('form')}
              className="group w-full bg-gradient-to-r from-travesia-gold to-[#B8860B] text-[#051A10] py-6 rounded-3xl font-black text-xs tracking-[0.3em] uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              EMPEZAR REGISTRO <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP: FORM */}
        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Crea tu Perfil</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><User size={12}/> Nombre</label>
                  <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><User size={12}/> Apellido</label>
                  <input required type="text" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><Mail size={12}/> Correo Electrónico</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all text-sm" />
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
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-2"><Calendar size={12}/> Tu Cumpleaños</label>
                  <input required type="date" value={formData.fecha_nacimiento} onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-travesia-gold transition-all [color-scheme:dark] text-sm min-h-[52px]" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={formLoading}
                className="w-full bg-travesia-gold text-[#051A10] py-6 rounded-3xl font-black text-xs tracking-[0.3em] uppercase shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {formLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>FINALIZAR Y JUGAR <ChevronRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}

        {/* STEP: GAME */}
        {step === 'game' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-1000">
            <Ruleta onWin={(p) => { setPremioFinal(p); setStep('success'); }} />
          </div>
        )}

        {/* STEP: SUCCESS */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in zoom-in duration-1000">
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 bg-travesia-gold/20 rounded-[30px] flex items-center justify-center border border-travesia-gold/30">
                <CheckCircle2 className="w-10 h-10 text-travesia-gold" />
              </div>
              <h2 className="text-4xl font-serif font-bold tracking-tight">¡Bienvenido!</h2>
              <div className="p-8 bg-white/5 border-2 border-travesia-gold/30 rounded-[40px] backdrop-blur-xl shadow-2xl">
                <p className="text-[10px] uppercase tracking-[0.3em] text-travesia-gold font-black mb-2">Premio Ganado</p>
                <p className="text-3xl font-black text-white leading-tight">{premioFinal}</p>
              </div>
            </div>

            <button 
              onClick={() => router.push('/checkin')}
              className="w-full bg-travesia-gold text-[#051A10] py-5 rounded-2xl font-black text-xs tracking-[0.3em] uppercase shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
              IR A MI PANEL <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
