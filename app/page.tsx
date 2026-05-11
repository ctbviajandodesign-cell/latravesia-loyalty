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
  Globe,
  Instagram,
  Facebook
} from 'lucide-react';
import Ruleta from '@/components/Ruleta';
import { useRouter } from 'next/navigation';

const COUNTRY_CODES = [
  { code: '+593', name: 'EC', label: 'Ecuador (+593)' },
  { code: '+57', name: 'CO', label: 'Colombia (+57)' },
  { code: '+51', name: 'PE', label: 'Perú (+51)' },
  { code: '+1', name: 'US', label: 'USA (+1)' },
  { code: '+34', name: 'ES', label: 'España (+34)' },
  { code: '+54', name: 'AR', label: 'Argentina (+54)' },
  { code: '+56', name: 'CL', label: 'Chile (+56)' },
  { code: '+52', name: 'MX', label: 'México (+52)' },
];

export default function Home() {
  const [step, setStep] = useState<'welcome' | 'form' | 'game' | 'success'>('welcome');
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+593');
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
      const { data, error } = await supabase.from('clientes').select('id').eq('id', savedId).single();
      if (error || !data) {
        localStorage.removeItem('travesia_cliente_id');
      } else {
        router.push('/checkin');
        return;
      }
    }
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    const numLimpio = formData.telefono.replace(/^0/, '').replace(/\s+/g, '');
    const telefonoFinal = `${countryCode}${numLimpio}`;

    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{ ...formData, telefono: telefonoFinal, visitas: 1 }])
        .select().single();

      if (error) throw error;
      
      localStorage.setItem('travesia_cliente_id', data.id);
      setClienteId(data.id);
      setStep('game');
      
      fetch('/api/marketing/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'BIRTHDAY_WELCOME', cliente: data })
      }).catch(e => console.error(e));

    } catch (error: any) {
      alert("Error en el registro. Verifica los datos.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#051A10] flex items-center justify-center"><Loader2 className="animate-spin text-travesia-gold w-10 h-10" /></div>;

  return (
    <main className="min-h-screen bg-[#051A10] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-travesia-gold/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative max-w-md mx-auto min-h-screen flex flex-col px-5 py-6">
        
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="w-14 h-14 bg-gradient-to-br from-travesia-gold to-[#B8860B] rounded-2xl flex items-center justify-center shadow-xl">
            <Sparkles className="w-7 h-7 text-[#051A10]" />
          </div>
          <h1 className="mt-3 text-2xl font-serif font-bold text-travesia-gold">La Travesía</h1>
          <p className="text-[7px] uppercase tracking-[0.4em] font-black text-white/30 italic">Loyalty Experience</p>
        </div>

        {step === 'welcome' && (
          <div className="flex-1 flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-bottom-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-serif leading-tight font-bold text-white">Únete al Club.</h2>
              <p className="text-white/50 text-sm font-light">Registra tus datos y gana premios exclusivos desde hoy.</p>
            </div>
            <button onClick={() => setStep('form')} className="w-full bg-travesia-gold text-[#051A10] py-5 rounded-[20px] font-black text-xs tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
              REGISTRARME AHORA <ArrowRight size={14} />
            </button>
          </div>
        )}

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-right-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><User size={10}/> Nombre</label>
                    <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm" placeholder="Juan" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><User size={10}/> Apellido</label>
                    <input required type="text" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm" placeholder="Marca" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><Mail size={10}/> Correo</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm" placeholder="juan@gmail.com" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><Globe size={10}/> País y WhatsApp</label>
                  <div className="flex gap-2">
                    <select 
                      value={countryCode} 
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-[100px] bg-white/10 border border-white/10 px-2 rounded-xl text-travesia-gold font-bold text-xs outline-none focus:border-travesia-gold"
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code} className="bg-[#051A10] text-white">{c.name} ({c.code})</option>
                      ))}
                    </select>
                    <input 
                      required 
                      type="tel" 
                      value={formData.telefono} 
                      onChange={(e) => setFormData({...formData, telefono: e.target.value.replace(/[^0-9]/g, '')})} 
                      className="flex-1 bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-travesia-gold transition-all text-sm" 
                      placeholder="968460705"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><Calendar size={10}/> Tu Cumpleaños</label>
                  <input required type="date" value={formData.fecha_nacimiento} onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-travesia-gold transition-all [color-scheme:dark] text-sm" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={formLoading}
                className="w-full bg-travesia-gold text-[#051A10] py-5 rounded-[20px] font-black text-xs tracking-[0.2em] uppercase shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                {formLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>FINALIZAR Y JUGAR <ChevronRight size={14} /></>}
              </button>
            </form>
          </div>
        )}

        {step === 'game' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in">
            <Ruleta onWin={(p) => { setPremioFinal(p); setStep('success'); }} />
          </div>
        )}

        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in">
            <div className="space-y-3">
              <div className="mx-auto w-16 h-16 bg-travesia-gold/20 rounded-2xl flex items-center justify-center border border-travesia-gold/30">
                <CheckCircle2 className="w-8 h-8 text-travesia-gold" />
              </div>
              <h2 className="text-3xl font-serif font-bold">¡Bienvenido!</h2>
              <div className="p-6 bg-white/5 border-2 border-travesia-gold/30 rounded-[30px] backdrop-blur-xl">
                <p className="text-[8px] uppercase tracking-widest text-travesia-gold font-black mb-1">Premio Ganado</p>
                <p className="text-2xl font-black text-white">{premioFinal}</p>
              </div>
            </div>
            <div className="space-y-4 w-full">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 text-center">¡Síguenos para más sorpresas!</p>
              <div className="grid grid-cols-2 gap-3">
                <a href="https://instagram.com/latravesia.ec" target="_blank" className="flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl text-travesia-gold hover:bg-white/10 transition-all">
                  <Instagram size={18} /> <span className="text-[9px] font-black uppercase tracking-widest">Instagram</span>
                </a>
                <a href="https://facebook.com/latravesia.ec" target="_blank" className="flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl text-travesia-gold hover:bg-white/10 transition-all">
                  <Facebook size={18} /> <span className="text-[9px] font-black uppercase tracking-widest">Facebook</span>
                </a>
              </div>
            </div>

            <button onClick={() => router.push('/checkin?new=true')} className="w-full bg-travesia-gold text-[#051A10] py-5 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:brightness-110 shadow-xl transition-all flex items-center justify-center gap-2">
              IR A MI PANEL <ArrowRight size={14} />
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
