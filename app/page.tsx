'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import FlujoPaso from '@/components/FlujoPaso';
import Ruleta from '@/components/Ruleta';
import { Instagram, Facebook, Music as TikTok, Send, CheckCircle2, MessageCircle } from 'lucide-react';

export default function Home() {
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [telefono, setTelefono] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    fecha_nacimiento: '',
    como_conocio: '',
    acepta_marketing: true,
  });
  const [cliente, setCliente] = useState<any>(null);
  const [ruletaActiva, setRuletaActiva] = useState<any>(null);
  const [premios, setPremios] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [config, setConfig] = useState<any>({});
  const [socialCheck, setSocialCheck] = useState({
    instagram: false,
    facebook: false,
    tiktok: false,
    whatsapp: false
  });

  // Cargar configuración inicial y ruleta del día
  useEffect(() => {
    const fetchInitialData = async () => {
      // Config
      const { data: configData } = await supabase.from('config').select('*');
      const configObj = configData?.reduce((acc: any, item: any) => {
        acc[item.clave] = item.valor;
        return acc;
      }, {});
      setConfig(configObj || {});

      // Ruleta activa hoy
      const hoy = new Date();
      const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const nombreDia = diasSemana[hoy.getDay()];
      
      const { data: ruleta } = await supabase
        .from('ruletas')
        .select('*, premios(*)')
        .eq('activa', true)
        .contains('dias', [nombreDia])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ruleta) {
        setRuletaActiva(ruleta);
        setPremios(ruleta.premios?.filter((p: any) => p.activo) || []);
      }
    };

    fetchInitialData();
  }, []);

  // Paso 1: Identificación
  const handleIdentificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('telefono', telefono)
        .maybeSingle();

      if (data) {
        setCliente(data);
        const yaRegistrado = await verificarVisitaHoy(data.id);
        if (yaRegistrado) {
          setMensaje(`¡Hola de nuevo, ${data.nombre}! 👋 Ya registraste tu visita hoy. ¡Gracias por venir!`);
          setPaso(5); // Pantalla final directa
        } else {
          // Si ya existe, saltamos registro pero vamos a redes para fidelizar
          setPaso(3);
        }
      } else {
        setPaso(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Registro
  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          ...formData,
          telefono,
          fecha_ultima_visita: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (data) {
        setCliente(data);
        setPaso(3);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verificarVisitaHoy = async (clienteId: string) => {
    const hoy = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('visitas')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('fecha', hoy)
      .maybeSingle();
    return !!data;
  };

  const registrarVisita = async (premioGanado?: string) => {
    if (!cliente) return;
    
    const { error } = await supabase
      .from('visitas')
      .insert([{
        cliente_id: cliente.id,
        ruleta_id: ruletaActiva?.id || null,
        premio_ganado: premioGanado || null
      }]);

    if (!error) {
      // Actualizar contador visitas cliente
      const nuevaVisita = (cliente.total_visitas || 0) + 1;
      const nuevaFecha = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('clientes')
        .update({ 
          total_visitas: nuevaVisita,
          fecha_ultima_visita: nuevaFecha
        })
        .eq('id', cliente.id);
        
      setCliente({
        ...cliente,
        total_visitas: nuevaVisita,
        fecha_ultima_visita: nuevaFecha
      });
    }
  };

  const handleResultadoRuleta = async (premio: any) => {
    await registrarVisita(premio.nombre);
    setMensaje(`¡FELICIDADES! 🎉 Ganaste: ${premio.nombre}`);
    setTimeout(() => setPaso(5), 2000); // Ir a final después de ver confetti
  };

  const handleFinalizarRedes = async () => {
    // Si es un cliente antiguo que ya visitó hoy, esto no debería pasar por la lógica del paso 1
    // Si es nuevo o cliente antiguo en su primera visita de hoy:
    if (ruletaActiva) {
      setPaso(4);
    } else {
      await registrarVisita();
      setMensaje(`¡Gracias por visitarnos, ${cliente?.nombre}!`);
      setPaso(5);
    }
  };

  return (
    <main className="min-h-screen dark-theme text-travesia-gold flex flex-col items-center justify-start relative overflow-x-hidden pt-10 pb-20">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 bg-travesia-green-deep pointer-events-none opacity-50 z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--color-travesia-green-dark)_0%,_transparent_70%)] opacity-30 z-0" />

      <div className="z-10 w-full px-4 max-w-md">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tighter text-travesia-gold mb-2">
            LA TRAVESÍA
          </h1>
          <div className="h-px w-24 bg-travesia-gold/30 mx-auto mb-2" />
          <p className="text-travesia-gold-dark font-medium tracking-[0.3em] text-xs uppercase">
            Hostería Campiña
          </p>
        </header>

        {/* PASO 1: IDENTIFICACIÓN */}
        <FlujoPaso active={paso === 1}>
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-semibold">Bienvenido</h2>
              <p className="text-travesia-gold/60">Ingresa tu número para comenzar</p>
            </div>
            <form onSubmit={handleIdentificacion} className="space-y-4">
              <input
                type="tel"
                placeholder="Ej: 0998765432"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                className="w-full bg-travesia-green-dark/40 border-2 border-travesia-gold/20 rounded-2xl px-6 py-5 text-2xl text-center focus:border-travesia-gold focus:bg-travesia-green-dark/60 outline-none transition-all placeholder:text-travesia-gold/20"
              />
              <button
                type="submit"
                disabled={loading || telefono.length < 9}
                className="w-full bg-travesia-gold text-travesia-green-deep font-black py-5 rounded-2xl hover:bg-travesia-gold-light hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 shadow-xl"
              >
                {loading ? 'VERIFICANDO...' : 'ENTRAR'}
              </button>
            </form>
          </div>
        </FlujoPaso>

        {/* PASO 2: REGISTRO */}
        <FlujoPaso active={paso === 2}>
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-center">Tus Datos</h2>
            <form onSubmit={handleRegistro} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full bg-travesia-green-dark/40 border border-travesia-gold/20 rounded-xl px-5 py-4 outline-none focus:border-travesia-gold transition-all"
              />
              <input
                type="text"
                placeholder="Apellido"
                required
                value={formData.apellido}
                onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                className="w-full bg-travesia-green-dark/40 border border-travesia-gold/20 rounded-xl px-5 py-4 outline-none focus:border-travesia-gold transition-all"
              />
              <div className="space-y-1">
                <label className="text-xs text-travesia-gold/50 ml-2 uppercase tracking-widest">Fecha de Nacimiento</label>
                <input
                  type="date"
                  required
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                  className="w-full bg-travesia-green-dark/40 border border-travesia-gold/20 rounded-xl px-5 py-4 outline-none focus:border-travesia-gold transition-all"
                />
              </div>
              <select
                required
                value={formData.como_conocio}
                onChange={(e) => setFormData({...formData, como_conocio: e.target.value})}
                className="w-full bg-travesia-green-dark/40 border border-travesia-gold/20 rounded-xl px-5 py-4 outline-none focus:border-travesia-gold transition-all"
              >
                <option value="" disabled className="bg-travesia-green-deep">¿Cómo nos conociste?</option>
                <option value="Instagram" className="bg-travesia-green-deep">Instagram</option>
                <option value="Facebook" className="bg-travesia-green-deep">Facebook</option>
                <option value="TikTok" className="bg-travesia-green-deep">TikTok</option>
                <option value="Recomendación" className="bg-travesia-green-deep">Recomendación</option>
                <option value="Pasé por aquí" className="bg-travesia-green-deep">Pasé por aquí</option>
              </select>
              
              <label className="flex items-center gap-3 px-2 py-4">
                <input 
                  type="checkbox" 
                  checked={formData.acepta_marketing}
                  onChange={(e) => setFormData({...formData, acepta_marketing: e.target.checked})}
                  className="w-5 h-5 accent-travesia-gold"
                />
                <span className="text-sm text-travesia-gold/80">Deseo recibir sorpresas y promociones</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-travesia-gold text-travesia-green-deep font-black py-5 rounded-2xl hover:bg-travesia-gold-light transition-all shadow-xl"
              >
                {loading ? 'GUARDANDO...' : 'REGISTRARME'}
              </button>
            </form>
          </div>
        </FlujoPaso>

        {/* PASO 3: REDES SOCIALES */}
        <FlujoPaso active={paso === 3}>
          <div className="space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold">¡Síguenos!</h2>
              <p className="text-travesia-gold/60 italic">Apóyanos en nuestras redes para continuar</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <a 
                href={config.link_instagram} 
                target="_blank" 
                onClick={() => setSocialCheck({...socialCheck, instagram: true})}
                className="flex items-center justify-between bg-travesia-green-dark/40 border border-travesia-gold/20 p-5 rounded-2xl hover:border-travesia-gold transition-all"
              >
                <div className="flex items-center gap-4">
                  <Instagram className="w-6 h-6" />
                  <span className="font-medium text-lg">Instagram</span>
                </div>
                {socialCheck.instagram && <CheckCircle2 className="text-travesia-gold w-6 h-6" />}
              </a>
              
              <a 
                href={config.link_facebook} 
                target="_blank" 
                onClick={() => setSocialCheck({...socialCheck, facebook: true})}
                className="flex items-center justify-between bg-travesia-green-dark/40 border border-travesia-gold/20 p-5 rounded-2xl hover:border-travesia-gold transition-all"
              >
                <div className="flex items-center gap-4">
                  <Facebook className="w-6 h-6" />
                  <span className="font-medium text-lg">Facebook</span>
                </div>
                {socialCheck.facebook && <CheckCircle2 className="text-travesia-gold w-6 h-6" />}
              </a>

              <a 
                href={config.link_tiktok} 
                target="_blank" 
                onClick={() => setSocialCheck({...socialCheck, tiktok: true})}
                className="flex items-center justify-between bg-travesia-green-dark/40 border border-travesia-gold/20 p-5 rounded-2xl hover:border-travesia-gold transition-all"
              >
                <div className="flex items-center gap-4">
                  <TikTok className="w-6 h-6" />
                  <span className="font-medium text-lg">TikTok</span>
                </div>
                {socialCheck.tiktok && <CheckCircle2 className="text-travesia-gold w-6 h-6" />}
              </a>

              <a 
                href={config.link_whatsapp} 
                target="_blank" 
                onClick={() => setSocialCheck({...socialCheck, whatsapp: true})}
                className="flex items-center justify-between bg-travesia-gold/10 border-2 border-travesia-gold/30 p-5 rounded-2xl hover:border-travesia-gold transition-all"
              >
                <div className="flex items-center gap-4 text-travesia-gold">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-bold text-lg">Unirme al WhatsApp</span>
                </div>
                {socialCheck.whatsapp && <CheckCircle2 className="text-travesia-gold w-6 h-6" />}
              </a>
            </div>

            <button
              onClick={handleFinalizarRedes}
              className="w-full bg-travesia-gold text-travesia-green-deep font-black py-5 rounded-2xl hover:bg-travesia-gold-light transition-all shadow-xl mt-4"
            >
              CONTINUAR
            </button>
          </div>
        </FlujoPaso>

        {/* PASO 4: RULETA */}
        <FlujoPaso active={paso === 4}>
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-semibold">Gira y Gana</h2>
            <p className="text-travesia-gold/60 italic">¡La suerte está de tu lado!</p>
            {premios.length > 0 ? (
              <Ruleta premios={premios} onResult={handleResultadoRuleta} />
            ) : (
              <div className="py-10">
                <p>Cargando premios...</p>
              </div>
            )}
          </div>
        </FlujoPaso>

        {/* PASO 5: FINAL */}
        <FlujoPaso active={paso === 5}>
          <div className="space-y-10 text-center py-10">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-travesia-gold rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-travesia-green-deep" />
              </div>
              <h2 className="text-4xl font-bold">{mensaje}</h2>
            </div>
            
            <div className="bg-travesia-green-dark/30 border border-travesia-gold/20 p-6 rounded-3xl space-y-2">
              <p className="text-travesia-gold/60 uppercase tracking-widest text-xs">Visitas Acumuladas</p>
              <p className="text-5xl font-black text-travesia-gold">{cliente?.total_visitas || 0}</p>
              {cliente?.total_visitas >= parseInt(config.visitas_para_premio || '10') && (
                <div className="mt-4 p-3 bg-travesia-gold text-travesia-green-deep rounded-xl font-bold animate-pulse">
                  🎁 ¡TIENES UN PREMIO VIP PENDIENTE!
                </div>
              )}
            </div>

            <p className="text-travesia-gold/40 text-sm">
              Muestra esta pantalla al personal del restaurante para reclamar tu premio si ganaste.
            </p>
          </div>
        </FlujoPaso>
      </div>
    </main>
  );
}
