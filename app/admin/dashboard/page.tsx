'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentDailyCode, rotateDailyCode } from '@/app/actions/daily-code';
import {
  Users,
  MapPin,
  Cake,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Star,
  Zap,
  ChevronRight,
  ShieldCheck,
  Calendar,
  KeyRound,
  RefreshCw
} from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalVisitas: 0,
    cumplesHoy: 0,
    ultimosClientes: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [dailyCode, setDailyCode] = useState<string>('····');
  const [rotating, setRotating] = useState(false);
  const [rotated, setRotated] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchDailyCode();
  }, []);

  async function fetchDailyCode() {
    try {
      const code = await getCurrentDailyCode();
      setDailyCode(code);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRotate() {
    setRotating(true);
    try {
      const newCode = await rotateDailyCode();
      setDailyCode(newCode);
      setRotated(true);
      setTimeout(() => setRotated(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setRotating(false);
    }
  }

  async function fetchStats() {
    try {
      const { count: clientesCount } = await supabase.from('clientes').select('*', { count: 'exact', head: true });
      const { data: clientesData } = await supabase.from('clientes').select('*').order('created_at', { ascending: false }).limit(5);
      
      // Sumar visitas reales desde la tabla clientes
      const { data: allClientes } = await supabase.from('clientes').select('total_visitas');
      const visitasTotal = allClientes?.reduce((acc, c) => acc + (c.total_visitas || 0), 0) || 0;

      const hoy = new Date().toISOString().split('T')[0].slice(5); // MM-DD
      const { count: cumplesCount } = await supabase.from('clientes').select('*', { count: 'exact', head: true }).like('fecha_nacimiento', `%${hoy}`);

      setStats({
        totalClientes: clientesCount || 0,
        totalVisitas: visitasTotal,
        cumplesHoy: cumplesCount || 0,
        ultimosClientes: clientesData || []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { name: 'Total Miembros', value: stats.totalClientes, icon: Users, color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400' },
    { name: 'Visitas Registradas', value: stats.totalVisitas, icon: MapPin, color: 'from-travesia-gold/20 to-travesia-gold/5', border: 'border-travesia-gold/20', text: 'text-travesia-gold' },
    { name: 'Cumpleaños Hoy', value: stats.cumplesHoy, icon: Cake, color: 'from-pink-500/20 to-pink-500/5', border: 'border-pink-500/20', text: 'text-pink-400' },
    { name: 'Score Fidelidad', value: '98%', icon: Star, color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  ];

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-12">

      {/* CÓDIGO DEL DÍA */}
      <div className="relative overflow-hidden bg-gradient-to-br from-travesia-gold/15 via-travesia-gold/5 to-transparent border border-travesia-gold/30 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-travesia-gold/5">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-travesia-gold/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-travesia-gold/20 border border-travesia-gold/30 flex items-center justify-center shrink-0">
              <KeyRound className="w-8 h-8 text-travesia-gold" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30 mb-1">Código de Visita • {today}</p>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl font-mono font-black text-travesia-gold tracking-[0.2em] leading-none select-all">
                  {dailyCode}
                </span>
              </div>
              <p className="text-xs text-white/30 mt-2 font-medium">
                Díselo al cliente para validar su visita presencial
              </p>
            </div>
          </div>
          <button
            onClick={handleRotate}
            disabled={rotating}
            aria-label="Rotar código del día"
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${rotated ? 'bg-emerald-500 text-white border border-emerald-400' : 'bg-travesia-gold/10 border border-travesia-gold/30 text-travesia-gold hover:bg-travesia-gold hover:text-[#051A10]'}`}
          >
            <RefreshCw className={`w-4 h-4 ${rotating ? 'animate-spin' : ''}`} />
            {rotated ? '✓ Código rotado' : 'Rotar código'}
          </button>
        </div>
      </div>

      {/* GRID DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div 
            key={card.name}
            className={`relative group overflow-hidden bg-gradient-to-br ${card.color} ${card.border} border rounded-[32px] p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/40`}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="mb-8">
                <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${card.text} w-fit`}>
                  <card.icon size={24} />
                </div>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold mb-1">{card.name}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-serif font-black text-white">{card.value}</h3>
                  <ArrowUpRight size={20} className={card.text} />
                </div>
              </div>
            </div>
            {/* DECORATIVE LIGHT */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] rounded-full opacity-20 bg-current ${card.text}`}></div>
          </div>
        ))}
      </div>

      {/* SECCIÓN INFERIOR: TABLA Y ACTIVIDAD */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* ÚLTIMOS REGISTROS (TABLA PRO) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-travesia-gold rounded-full"></div>
              <h3 className="text-2xl font-serif font-bold text-white tracking-tight">Nuevos Socios</h3>
            </div>
            <button className="text-[10px] uppercase tracking-widest font-black text-travesia-gold hover:text-white transition-colors flex items-center gap-2">
              Ver todos <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-4 md:p-6 lg:p-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/30">Cliente</th>
                    <th className="p-4 md:p-6 lg:p-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/30">Contacto</th>
                    <th className="p-4 md:p-6 lg:p-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/30">Estado</th>
                    <th className="p-4 md:p-6 lg:p-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/30">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.ultimosClientes.map((cliente) => (
                    <tr key={cliente.id} className="group hover:bg-white/5 transition-colors">
                      <td className="p-4 md:p-6 lg:p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-travesia-gold to-[#B8860B] flex items-center justify-center text-[#051A10] font-black text-lg shadow-lg">
                            {cliente.nombre[0]}
                          </div>
                          <div>
                            <p className="font-bold text-white text-base">{cliente.nombre} {cliente.apellido}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Socio desde {new Date(cliente.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 md:p-6 lg:p-8">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white/80">{cliente.telefono}</p>
                          <p className="text-xs text-white/40">{cliente.email}</p>
                        </div>
                      </td>
                      <td className="p-4 md:p-6 lg:p-8">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                          <ShieldCheck size={12} /> Activo
                        </span>
                      </td>
                      <td className="p-4 md:p-6 lg:p-8">
                        <button aria-label="Ver detalle del cliente" className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-travesia-gold hover:border-travesia-gold/40 transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FEED DE ACTIVIDAD O RECORDATORIOS */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div>
            <h3 className="text-2xl font-serif font-bold text-white tracking-tight">Próximos Cumples</h3>
          </div>

          <div className="bg-[#0A2A18]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-400 shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="font-bold text-white">Campaña de Mayo</p>
                  <p className="text-sm text-white/40 leading-relaxed mt-1">
                    Tienes {stats.cumplesHoy} clientes cumpliendo años hoy. Recuerda enviarles su regalo digital.
                  </p>
                </div>
              </div>
              <button className="w-full py-4 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-pink-500 hover:text-white transition-all">
                Lanzar Notificaciones
              </button>
            </div>

            <div className="pt-8 border-t border-white/5">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] uppercase tracking-widest font-black text-white/30">Estado del Sistema</p>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-travesia-gold" />
                    <span className="text-xs font-medium">Supabase Latency</span>
                  </div>
                  <span className="text-xs text-travesia-gold font-bold">12ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
