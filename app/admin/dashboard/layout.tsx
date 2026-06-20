'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Gift, 
  Mail, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  BarChart3,
  CalendarDays,
  Bell
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Resumen', icon: LayoutDashboard, href: '/admin/dashboard' },
    { name: 'Clientes', icon: Users, href: '/admin/dashboard/clientes' },
    { name: 'Campañas', icon: Mail, href: '/admin/dashboard/marketing' },
    { name: 'Premios', icon: Gift, href: '/admin/dashboard/premios' },
    { name: 'Análisis', icon: BarChart3, href: '/admin/dashboard/analytics' },
    { name: 'Configuración', icon: Settings, href: '/admin/dashboard/config' },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-white text-black selection:text-[#000000]">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        
        
      </div>

      {/* MOBILE HEADER */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#000000]" />
          </div>
          <span className="font-serif font-bold text-white tracking-tight">Admin Travesía</span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-white">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      <div className="flex relative">
        
        {/* SIDEBAR */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 z-50 transition-transform duration-500
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-[#111111]/60 backdrop-blur-3xl border-r border-white/5 p-8 flex flex-col
        `}>
          {/* LOGO */}
          <div className="mb-12 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#111111] rounded-xl flex items-center justify-center shadow-xl rotate-3">
              <Sparkles className="w-6 h-6 text-[#000000] -rotate-3" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl text-white tracking-tight leading-none">La Travesía</h1>
              <p className="text-xs uppercase tracking-[0.4em] font-black text-white/40 mt-1 italic">Loyalty Admin</p>
            </div>
          </div>

          {/* NAV */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
                    ${isActive 
                      ? 'bg-[#111111] text-white border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
                      : 'text-white/50 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="font-bold text-sm tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* USER INFO & LOGOUT */}
          <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold">A</div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">Administrador</p>
                <p className="text-xs text-white/40 uppercase tracking-widest truncate">Master Access</p>
              </div>
            </div>
            <button className="w-full flex items-center gap-4 px-6 py-4 text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all group">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-h-screen p-6 lg:p-12 pt-24 lg:pt-12 relative">
          
          {/* TOP BAR DESKTOP */}
          <div className="hidden lg:flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Bienvenido de vuelta</h2>
              <p className="text-white/40 text-sm italic">Aquí tienes un resumen de la actividad hoy.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-white text-black rounded-full animate-ping"></span>
              </button>
              <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                <CalendarDays size={20} className="text-white" />
                <span className="text-sm font-bold">{new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long' })}</span>
              </div>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #000000;
        }
        ::-webkit-scrollbar-thumb {
          background: #111111;
          border-radius: 10px;
          border: 2px solid #000000;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #D4AF37;
        }
      `}</style>
    </div>
  );
}
