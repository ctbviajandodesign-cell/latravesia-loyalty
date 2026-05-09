'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Calendar,
  Loader2,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisitas: 0,
    totalClientes: 0,
    premiosEntregados: 0,
    visitasHoy: 0,
    visitasPorDia: [] as { fecha: string, count: number }[],
    topPremios: [] as { nombre: string, count: number }[]
  });

  // const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      
      const [visitasRes, clientesRes] = await Promise.all([
        supabase.from('visitas').select('*'),
        supabase.from('clientes').select('id')
      ]);

      if (visitasRes.error) throw visitasRes.error;
      if (clientesRes.error) throw clientesRes.error;

      const visitas = visitasRes.data || [];
      const clientes = clientesRes.data || [];

      // Procesar visitas por día (últimos 7 días)
      const visitasDiaMap: any = {};
      const premiosMap: any = {};
      let hoyCount = 0;
      let premiosCount = 0;

      visitas.forEach(v => {
        const d = v.fecha;
        visitasDiaMap[d] = (visitasDiaMap[d] || 0) + 1;
        if (d === hoy) hoyCount++;
        
        if (v.premio_ganado) {
          premiosCount++;
          premiosMap[v.premio_ganado] = (premiosMap[v.premio_ganado] || 0) + 1;
        }
      });

      // Formatear para gráficas
      const ultimos7Dias = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const f = d.toISOString().split('T')[0];
        return { fecha: f, count: visitasDiaMap[f] || 0 };
      }).reverse();

      const topPremios = Object.entries(premiosMap)
        .map(([nombre, count]: any) => ({ nombre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalVisitas: visitas.length,
        totalClientes: clientes.length,
        premiosEntregados: premiosCount,
        visitasHoy: hoyCount,
        visitasPorDia: ultimos7Dias,
        topPremios
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#4A5D4E]" />
        <p className="text-gray-500">Generando reportes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-[#4A5D4E] flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Panel de Analíticas
        </h1>
        <p className="text-gray-600 mt-1">Monitorea el crecimiento y compromiso de tus clientes.</p>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Visitas" 
          value={stats.totalVisitas} 
          icon={<Calendar className="w-6 h-6" />}
          trend="+12%"
          positive={true}
        />
        <StatCard 
          title="Nuevos Clientes" 
          value={stats.totalClientes} 
          icon={<Users className="w-6 h-6" />}
          trend="+5%"
          positive={true}
        />
        <StatCard 
          title="Premios Entregados" 
          value={stats.premiosEntregados} 
          icon={<Award className="w-6 h-6" />}
          trend="+8%"
          positive={true}
        />
        <StatCard 
          title="Visitas Hoy" 
          value={stats.visitasHoy} 
          icon={<TrendingUp className="w-6 h-6" />}
          trend="En tiempo real"
          positive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfica de Visitas (Barras CSS) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Visitas Últimos 7 Días</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {stats.visitasPorDia.map((dia, i) => {
              const maxCount = Math.max(...stats.visitasPorDia.map(d => d.count), 1);
              const height = (dia.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex justify-center items-end h-full">
                    <div 
                      style={{ height: `${height}%` }}
                      className="w-full max-w-[40px] bg-[#4A5D4E]/10 group-hover:bg-[#4A5D4E]/30 transition-all rounded-t-lg relative"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {dia.count} visitas
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase overflow-hidden whitespace-nowrap">
                    {new Date(dia.fecha).toLocaleDateString('es', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Premios */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Premios Más Entregados</h3>
          <div className="space-y-4">
            {stats.topPremios.length === 0 ? (
              <p className="text-center py-10 text-gray-400">Aún no se han ganado premios.</p>
            ) : stats.topPremios.map((p, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{p.nombre}</span>
                  <span className="font-bold text-[#4A5D4E]">{p.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#4A5D4E]" 
                    style={{ width: `${(p.count / stats.premiosEntregados) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, positive }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-[#4A5D4E]/30 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-gray-900 mt-2">{value}</p>
      <div className={`mt-4 flex items-center gap-1 text-xs font-bold ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
    </div>
  );
}
