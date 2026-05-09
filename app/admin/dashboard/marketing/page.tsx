'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  Send, 
  Calendar, 
  Users, 
  Eye, 
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function MarketingPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [cumpleañerosSemana, setCumpleañerosSemana] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch Config
      const { data: configData } = await supabase.from('config').select('*');
      const configObj = configData?.reduce((acc: any, item: any) => {
        acc[item.clave] = item.valor;
        return acc;
      }, {});
      setConfig(configObj);

      // Fetch Clientes for this week
      const { data: clientes } = await supabase.from('clientes').select('nombre, fecha_nacimiento');
      
      const today = new Date();
      const nextSunday = new Date();
      nextSunday.setDate(today.getDate() + (7 - today.getDay()));
      
      const filtered = clientes?.filter(c => {
        if (!c.fecha_nacimiento) return false;
        const [, m, d] = c.fecha_nacimiento.split('-').map(Number);
        const bday = new Date(today.getFullYear(), m - 1, d);
        return bday >= today && bday <= nextSunday;
      }) || [];
      
      setCumpleañerosSemana(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-travesia-green-deep" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-[#4A5D4E] flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-travesia-gold" />
          Campañas de Marketing
        </h1>
        <p className="text-gray-600 mt-1">Automatiza el contacto con tus clientes y aumenta tus reservas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de Control */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#4A5D4E]" /> Próximo Envío: Lunes
            </h2>
            
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
              <Users className="w-5 h-5 text-amber-600 mt-1" />
              <div>
                <p className="text-amber-900 font-bold">Campaña de Cumpleaños</p>
                <p className="text-amber-700 text-sm">
                  {cumpleañerosSemana.length} clientes recibirán su invitación este lunes.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button className="w-full bg-[#4A5D4E] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#3D4D40] transition-all">
                <Send className="w-5 h-5" /> Enviar Prueba a mi Correo
              </button>
            </div>
          </div>
        </div>

        {/* Vista Previa del Email */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Eye className="w-4 h-4" /> Vista Previa del Email
          </h2>
          
          <div className="bg-gray-100 p-4 sm:p-8 rounded-[40px] shadow-inner">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto border border-gray-100">
              {/* Header con Imagen Generada */}
              <div className="relative aspect-square">
                <img 
                  src="https://img.freepik.com/premium-photo/premium-elegant-birthday-greeting-card-boutique-country-hotel-called-la-travesia-design-should-feature-golden-cake_1253457-11116.jpg" 
                  alt="Invitación Cumpleaños"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <h3 className="text-2xl font-serif text-white leading-tight">
                    {config?.email_asunto || '¡Feliz Cumpleaños!'}
                  </h3>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p className="font-serif text-xl text-gray-900">¡Hola, Cliente!</p>
                  <p>{config?.email_mensaje?.replace('{nombre}', 'Amigo/a') || 'Te invitamos a celebrar tu semana especial con nosotros.'}</p>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <button className="w-full bg-travesia-gold text-travesia-green-deep py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg">
                    Reservar mi Mesa
                  </button>
                </div>

                <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">
                  Hostería La Travesía • Solo Sábados y Domingos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
