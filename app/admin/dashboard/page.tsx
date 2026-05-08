import { supabase } from '@/lib/supabase';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Cake, 
  Trophy, 
  Star,
  AlertCircle
} from 'lucide-react';

async function getMetrics() {
  const hoy = new Date().toISOString().split('T')[0];
  const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  // 1. Clientes totales
  const { count: totalClientes } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true });

  // 2. Nuevos esta semana
  const { count: nuevosSemana } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', hace7Dias);

  // 3. Visitas hoy
  const { count: visitasHoy } = await supabase
    .from('visitas')
    .select('*', { count: 'exact', head: true })
    .eq('fecha', hoy);

  // 4. Premios este mes
  const { count: premiosMes } = await supabase
    .from('visitas')
    .select('*', { count: 'exact', head: true })
    .gte('fecha', inicioMes)
    .not('premio_ganado', 'is', null);

  // 5. Clientes VIP (10+ visitas)
  const { count: clientesVip } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true })
    .gte('total_visitas', 10);

  // 6. Cumpleaños próximos 7 días
  // Lógica simple: clientes con mes/día de nacimiento cerca
  // Nota: Esto es aproximado en SQL, pero para el dashboard lo manejamos aquí
  const { data: todosClientes } = await supabase
    .from('clientes')
    .select('nombre, apellido, fecha_nacimiento');
  
  const cumpleaniosProximos = todosClientes?.filter(c => {
    if (!c.fecha_nacimiento) return false;
    const f = new Date(c.fecha_nacimiento);
    const m = f.getMonth();
    const d = f.getDate();
    const hoyM = new Date().getMonth();
    const hoyD = new Date().getDate();
    
    // Simplificado: si el mes es igual y el día está entre hoy y hoy+7
    return m === hoyM && d >= hoyD && d <= hoyD + 7;
  }).length || 0;

  return {
    totalClientes: totalClientes || 0,
    nuevosSemana: nuevosSemana || 0,
    visitasHoy: visitasHoy || 0,
    premiosMes: premiosMes || 0,
    clientesVip: clientesVip || 0,
    cumpleaniosProximos
  };
}

export default async function DashboardPage() {
  const metrics = await getMetrics();

  const cards = [
    { title: 'Clientes Totales', value: metrics.totalClientes, icon: Users, color: 'text-blue-600' },
    { title: 'Nuevos (7d)', value: metrics.nuevosSemana, icon: UserPlus, color: 'text-green-600' },
    { title: 'Visitas Hoy', value: metrics.visitasHoy, icon: Calendar, color: 'text-purple-600' },
    { title: 'Premios del Mes', value: metrics.premiosMes, icon: Trophy, color: 'text-amber-600' },
    { title: 'Clientes VIP', value: metrics.clientesVip, icon: Star, color: 'text-travesia-gold-dark' },
    { title: 'Cumpleaños (7d)', value: metrics.cumpleaniosProximos, icon: Cake, color: 'text-pink-600', alert: metrics.cumpleaniosProximos > 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-travesia-green-deep tracking-tight">Inicio</h1>
        <p className="text-travesia-green-dark/60 font-medium">Resumen general de actividad</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title}
              className="bg-white p-6 rounded-3xl shadow-sm border border-travesia-gold/10 hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-travesia-green-dark/40 uppercase tracking-widest">{card.title}</p>
                  <p className="text-4xl font-black text-travesia-green-deep">{card.value}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-travesia-cream ${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              
              {card.alert && (
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-pink-600 bg-pink-50 p-2 rounded-lg animate-pulse">
                  <AlertCircle size={14} />
                  ¡Hay cumpleaños próximamente!
                </div>
              )}

              {/* Decoración sutil */}
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={120} />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Sección de bienvenida o avisos rápidos */}
      <div className="bg-travesia-green-deep p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-lg space-y-4">
          <h2 className="text-3xl font-bold text-travesia-gold">Hola, Administrador 👋</h2>
          <p className="text-white/70 leading-relaxed">
            El sistema está funcionando correctamente. Hoy hemos tenido <span className="text-travesia-gold font-bold">{metrics.visitasHoy} visitas</span> registradas.
          </p>
          <div className="flex gap-4">
            <button className="bg-travesia-gold text-travesia-green-deep px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
              Ver Clientes
            </button>
            <button className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all">
              Configuración
            </button>
          </div>
        </div>
        
        {/* Gráfico o ilustración decorativa */}
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-travesia-gold/20 to-transparent hidden lg:block" />
      </div>
    </div>
  );
}
