'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle2, 
  Sparkles, 
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
  Facebook,
  Music2
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
  const [step, setStep] = useState<'welcome' | 'form' | 'social' | 'game' | 'success'>('welcome');
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
  const [socialLinks, setSocialLinks] = useState({
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    tiktok: 'https://tiktok.com',
    whatsapp_group: ''
  });
  const router = useRouter();

  useEffect(() => {
    validarSesion();
    fetchSocialLinks();
  }, []);

  async function fetchSocialLinks() {
    const { data } = await supabase.from('config').select('*');
    if (data) {
      const links = { ...socialLinks };
      data.forEach(item => {
        if (item.clave === 'instagram_link') links.instagram = item.valor;
        if (item.clave === 'facebook_link') links.facebook = item.valor;
        if (item.clave === 'tiktok_link') links.tiktok = item.valor;
        if (item.clave === 'whatsapp_group_link') links.whatsapp_group = item.valor;
      });
      setSocialLinks(links);
    }
  }

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
        .insert([{ 
          ...formData, 
          telefono: telefonoFinal, 
          total_visitas: 1,
          visitas: 1, // Mantener ambos en sincronía
          fecha_ultima_visita: new Date().toISOString().split('T')[0]
        }])
        .select().single();

      if (error) throw error;
      
      // Log de la primera visita
      await supabase.from('visitas').insert([{
        cliente_id: data.id,
        fecha: new Date().toISOString().split('T')[0],
        premio_ganado: premioFinal // Se actualizará si ya ganó algo
      }]);

      localStorage.setItem('travesia_cliente_id', data.id);
      setClienteId(data.id);
      setStep('social');
      
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

      <div className="relative max-w-md mx-auto min-h-screen flex flex-col px-6 py-6">
        
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="w-12 h-12 bg-gradient-to-br from-travesia-gold to-[#B8860B] rounded-2xl flex items-center justify-center shadow-xl">
            <Sparkles className="w-6 h-6 text-[#051A10]" />
          </div>
          <h1 className="mt-2 text-xl font-serif font-bold text-travesia-gold">La Travesía</h1>
          <p className="text-[6px] uppercase tracking-[0.4em] font-black text-white/30 italic">Loyalty Experience</p>
        </div>

        {step === 'welcome' && (
          <div className="flex-1 flex flex-col justify-center space-y-6 animate-in fade-in slide-in-from-bottom-8">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-serif leading-tight font-bold text-white">Únete al Club.</h2>
              <p className="text-white/50 text-sm font-light">Registra tus datos y gana premios exclusivos desde hoy.</p>
            </div>
            <button onClick={() => setStep('form')} className="w-full bg-travesia-gold text-[#051A10] py-4 rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
              REGISTRARME AHORA <ArrowRight size={14} />
            </button>
          </div>
        )}

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-right-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 overflow-hidden">
                    <label className="text-[8px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><User size={9}/> Nombre</label>
                    <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-xs" />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <label className="text-[8px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><User size={9}/> Apellido</label>
                    <input required type="text" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-xs" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><Mail size={9}/> Correo Electrónico</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-xs" />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><Globe size={9}/> WhatsApp</label>
                  <div className="flex gap-2">
                    <select 
                      value={countryCode} 
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-[85px] bg-white/10 border border-white/10 px-1 rounded-xl text-travesia-gold font-bold text-[10px] outline-none focus:border-travesia-gold"
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code} className="bg-[#051A10] text-white">{c.name} {c.code}</option>
                      ))}
                    </select>
                    <input 
                      required 
                      type="tel" 
                      value={formData.telefono} 
                      onChange={(e) => setFormData({...formData, telefono: e.target.value.replace(/[^0-9]/g, '')})} 
                      className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-travesia-gold transition-all text-xs" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5"><Calendar size={9}/> Fecha de Cumpleaños</label>
                  <div className="relative w-full overflow-hidden rounded-xl">
                    <input 
                      required 
                      type="date" 
                      value={formData.fecha_nacimiento} 
                      onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 p-3 outline-none focus:border-travesia-gold transition-all [color-scheme:dark] text-xs appearance-none" 
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-travesia-gold flex items-center gap-1.5">Género</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Masculino', label: 'Hombre' },
                      { id: 'Femenino', label: 'Mujer' },
                    ].map(g => (
                      <button 
                        key={g.id}
                        type="button"
                        onClick={() => setFormData({...formData, genero: g.id})}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${formData.genero === g.id ? 'bg-travesia-gold/10 border-travesia-gold text-travesia-gold' : 'bg-white/5 border-white/10 text-white/40'}`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={formLoading}
                className="w-full bg-travesia-gold text-[#051A10] py-4.5 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {formLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>LISTO PARA JUGAR <ChevronRight size={14} /></>}
              </button>
            </form>
          </div>
        )}

        {step === 'social' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-right-8">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-travesia-gold/10 rounded-2xl flex items-center justify-center text-travesia-gold mb-1">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white">¡Paso Final!</h2>
              <p className="text-white/40 text-[8px] uppercase tracking-widest font-black italic">Síguenos para activar tu premio</p>
            </div>

            <div className="w-full space-y-2 px-2">
              <a href={socialLinks.instagram} target="_blank" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-travesia-gold/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] rounded-lg flex items-center justify-center text-white shadow-lg"><Instagram size={16} /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Instagram</span>
                </div>
                <ArrowRight size={12} className="text-white/20 group-hover:text-travesia-gold" />
              </a>

              <a href={socialLinks.facebook} target="_blank" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-travesia-gold/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#1877F2] rounded-lg flex items-center justify-center text-white shadow-lg"><Facebook size={16} /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
                </div>
                <ArrowRight size={12} className="text-white/20 group-hover:text-travesia-gold" />
              </a>

              <a href={socialLinks.tiktok} target="_blank" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-travesia-gold/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#000000] border border-white/10 rounded-lg flex items-center justify-center text-white shadow-lg"><Music2 size={16} /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">TikTok</span>
                </div>
                <ArrowRight size={12} className="text-white/20 group-hover:text-travesia-gold" />
              </a>

              {/* WHATSAPP GROUP */}
              <a href={socialLinks.whatsapp_group || '#'} target="_blank" className="flex items-center justify-between p-4 bg-white/5 border border-emerald-500/20 rounded-2xl group hover:border-emerald-500/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg"><Smartphone size={16} /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Grupo WhatsApp</span>
                </div>
                <ArrowRight size={12} className="text-emerald-500/20 group-hover:text-emerald-500" />
              </a>
            </div>

            <button 
              onClick={() => setStep('game')} 
              className="w-full bg-travesia-gold text-[#051A10] py-4 rounded-2xl font-black text-[9px] tracking-[0.3em] uppercase shadow-2xl hover:brightness-110 active:scale-95 transition-all mt-4"
            >
              CONTINUAR A JUGAR
            </button>
          </div>
        )}

        {step === 'game' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in h-full overflow-hidden select-none touch-none">
            <div className="w-full max-w-[320px] mx-auto">
              <Ruleta onWin={async (p) => { 
                setPremioFinal(p); 
                // Actualizar log de visita con el premio
                if (clienteId) {
                  const hoy = new Date().toISOString().split('T')[0];
                  await supabase.from('visitas')
                    .update({ premio_ganado: p })
                    .eq('cliente_id', clienteId)
                    .eq('fecha', hoy);
                }
                setStep('success'); 
              }} />
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in select-none touch-none">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-travesia-gold/20 rounded-2xl flex items-center justify-center border border-travesia-gold/30">
                <CheckCircle2 className="w-8 h-8 text-travesia-gold" />
              </div>
              <h2 className="text-3xl font-serif font-bold">¡Bienvenido!</h2>
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-travesia-gold/20 rounded-[32px] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-6 bg-white/5 border border-travesia-gold/30 rounded-[32px] backdrop-blur-2xl">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-travesia-gold font-black mb-2">Premio Ganado</p>
                  <p className="text-2xl font-black text-white leading-tight">{premioFinal}</p>
                </div>
              </div>
            </div>

            <button onClick={() => router.push('/checkin?new=true')} className="w-full bg-travesia-gold text-[#051A10] py-5 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:brightness-110 shadow-2xl transition-all flex items-center justify-center gap-2">
              IR A MI PANEL <ArrowRight size={14} />
            </button>
          </div>
        )}

      </div>

      <style jsx global>{`
        html, body {
          touch-action: manipulation;
          overscroll-behavior-y: contain;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </main>
  );
}
