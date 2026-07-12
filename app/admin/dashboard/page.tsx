'use client';

import Link from 'next/link';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getEcuadorMonthDay, getEcuadorDateStringDaysAgo } from '@/lib/date';
import { getCurrentDailyCode, rotateDailyCode } from '@/app/actions/daily-code';
import { triggerBirthdayEmails } from '@/app/actions/birthdays';
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
  RefreshCw,
  Gift
} from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalVisitas: 0,
    cumplesHoy: 0,
    ultimosClientes: [] as any[],
    clientesEnRiesgo: [] as any[],
    scoreFidelidad: '0%'
  });
  const [activeTab, setActiveTab] = useState<'nuevos' | 'riesgo'>('nuevos');
  const [loading, setLoading] = useState(true);
  const [dailyCode, setDailyCode] = useState<string>('····');
  const [rotating, setRotating] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [sendingGifts, setSendingGifts] = useState(false);

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
      
      // Conteo rápido y exacto de visitas totales desde la tabla de visitas
      const { count: visitasCount } = await supabase.from('visitas').select('*', { count: 'exact', head: true });
      const visitasTotal = visitasCount || 0;

      const hoy = getEcuadorMonthDay();
      const { count: cumplesCount } = await supabase.from('clientes').select('*', { count: 'exact', head: true }).like('fecha_nacimiento', `%${hoy}`);

      // Retención
      const { count: returningCount } = await supabase.from('clientes').select('*', { count: 'exact', head: true }).gt('total_visitas', 1);
      const retencion = clientesCount ? Math.round(((returningCount || 0) / clientesCount) * 100) : 0;

      // Clientes en Riesgo (sin visita en 30 días, pero con >3 visitas)
      const limitDate = getEcuadorDateStringDaysAgo(30);

      const { data: riskData } = await supabase.from('clientes')
        .select('*')
        .gt('total_visitas', 3)
        .lt('fecha_ultima_visita', limitDate)
        .order('fecha_ultima_visita', { ascending: false })
        .limit(5);

      setStats({
        totalClientes: clientesCount || 0,
        totalVisitas: visitasTotal,
        cumplesHoy: cumplesCount || 0,
        ultimosClientes: clientesData || [],
        clientesEnRiesgo: riskData || [],
        scoreFidelidad: `${retencion}%`
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { name: 'Total Miembros', value: stats.totalClientes, icon: Users, color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400' },
    { name: 'Visitas Registradas', value: stats.totalVisitas, icon: MapPin, color: 'from-[#333333]/20 to-travesia-gold/5', border: 'border-white/20', text: 'text-white' },
    { name: 'Cumpleaños Hoy', value: stats.cumplesHoy, icon: Cake, color: 'from-pink-500/20 to-pink-500/5', border: 'border-pink-500/20', text: 'text-pink-400' },
    { name: 'Score Fidelidad', value: stats.scoreFidelidad, icon: Star, color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  ];

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-12">

      {/* CÓDIGO DEL DÍA */}
      <div className="relative overflow-hidden bg-[#111111] border border-white/30 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-black/20">
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-white border border-white/30 flex items-center justify-center shrink-0">
              <KeyRound className="w-8 h-8 text-black" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] font-black text-white/30 mb-1">Código de Visita • {today}</p>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl font-mono font-black text-white tracking-[0.2em] leading-none select-all">
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
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${rotated ? 'bg-emerald-500 text-white border border-emerald-400' : 'bg-white/10 border border-white/30 text-white hover:bg-white text-black hover:text-[#000000]'}`}
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
            className={`relative group overflow-hidden bg-[#111111] ${card.border} border rounded-[32px] p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/40`}
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
            
          </div>
        ))}
      </div>

      {/* SECCIÓN INFERIOR: TABLA Y ACTIVIDAD */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* TABLAS PRO */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('nuevos')}>
                <div className={`w-1.5 h-6 rounded-full transition-colors ${activeTab === 'nuevos' ? 'bg-white' : 'bg-transparent'}`}></div>
                <h3 className={`text-2xl font-serif font-bold tracking-tight transition-colors ${activeTab === 'nuevos' ? 'text-white' : 'text-white/40'}`}>Nuevos Socios</h3>
              </div>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('riesgo')}>
                <div className={`w-1.5 h-6 rounded-full transition-colors ${activeTab === 'riesgo' ? 'bg-red-500' : 'bg-transparent'}`}></div>
                <h3 className={`text-2xl font-serif font-bold tracking-tight transition-colors ${activeTab === 'riesgo' ? 'text-red-400' : 'text-white/40'}`}>En Riesgo</h3>
              </div>
            </div>
            <Link href="/admin/dashboard/clientes" className="text-xs uppercase tracking-widest font-black text-white hover:text-white transition-colors flex items-center gap-2">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-[#111111]/40 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-4 md:p-6 lg:p-8 text-xs uppercase tracking-[0.3em] font-black text-white/30">Cliente</th>
                    <th className="p-4 md:p-6 lg:p-8 text-xs uppercase tracking-[0.3em] font-black text-white/30">Contacto</th>
                    <th className="p-4 md:p-6 lg:p-8 text-xs uppercase tracking-[0.3em] font-black text-white/30">{activeTab === 'riesgo' ? 'Progreso' : 'Estado'}</th>
                    <th className="p-4 md:p-6 lg:p-8 text-xs uppercase tracking-[0.3em] font-black text-white/30">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(activeTab === 'nuevos' ? stats.ultimosClientes : stats.clientesEnRiesgo).map((cliente) => (
                    <tr key={cliente.id} className="group hover:bg-white/5 transition-colors">
                      <td className="p-4 md:p-6 lg:p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white font-black text-lg shadow-lg">
                            {cliente.nombre[0]}
                          </div>
                          <div>
                            <p className="font-bold text-white text-base">{cliente.nombre} {cliente.apellido}</p>
                            <p className="text-xs text-white/30 uppercase tracking-widest mt-0.5">Socio desde {new Date(cliente.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 md:p-6 lg:p-8">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white/80">({cliente.codigo_pais || '+593'}) {cliente.telefono}</p>
                          <p className="text-xs text-white/40">{cliente.email}</p>
                        </div>
                      </td>
                      <td className="p-4 md:p-6 lg:p-8">
                        {activeTab === 'nuevos' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
                            <ShieldCheck size={12} /> Activo
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest">
                              <ShieldCheck size={12} /> {cliente.total_visitas} visitas
                            </span>
                            <p className="text-xs text-white/40">Inactivo desde {cliente.fecha_ultima_visita}</p>
                          </div>
                        )}
                      </td>
                      <td className="p-4 md:p-6 lg:p-8">
                        <Link href="/admin/dashboard/clientes" aria-label="Ver detalle del cliente" className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white hover:border-white/40 transition-all inline-block">
                          <ChevronRight size={18} />
                        </Link>
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

          <div className="bg-[#111111]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-400 shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="font-bold text-white">Automatización Activa</p>
                  <p className="text-sm text-white/40 leading-relaxed mt-1">
                    Hay {stats.cumplesHoy} clientes cumpliendo años hoy. El cron de Vercel enviará sus regalos digitales automáticamente.
                  </p>
                </div>
              </div>
              <button 
                onClick={async () => {
                  setSendingGifts(true);
                  const res = await triggerBirthdayEmails();
                  alert(res.message);
                  setSendingGifts(false);
                }}
                disabled={sendingGifts || stats.cumplesHoy === 0}
                className={`w-full py-4 border rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all
                  ${stats.cumplesHoy === 0 
                    ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed' 
                    : 'bg-pink-500/10 border-pink-500/20 text-pink-400 hover:bg-pink-500/20 hover:scale-[1.02] cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.1)]'
                  }`}
              >
                {sendingGifts ? (
                  <><RefreshCw size={14} className="animate-spin" /> ENVIANDO...</>
                ) : (
                  <><Gift size={16} /> ENVIAR REGALOS AHORA</>
                )}
              </button>
            </div>

            <div className="pt-8 border-t border-white/5">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs uppercase tracking-widest font-black text-white/30">Estado del Sistema</p>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-white" />
                    <span className="text-xs font-medium">Supabase Latency</span>
                  </div>
                  <span className="text-xs text-white font-bold">12ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
