'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  RotateCw, 
  Gift, 
  Cake, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { logout } from '@/app/admin/actions';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { name: 'Inicio', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/admin/dashboard/clientes', icon: Users },
  { name: 'Ruletas', href: '/admin/dashboard/ruletas', icon: RotateCw },
  { name: 'Premios', href: '/admin/dashboard/gestion-premios', icon: Gift },
  { name: 'Cumpleaños', href: '/admin/dashboard/cumpleanos', icon: Cake },
  { name: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
  { name: 'Configuración', href: '/admin/dashboard/config', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-travesia-cream flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-travesia-green-deep text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="font-bold text-travesia-gold tracking-tight">Admin Travesía</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-travesia-green-deep text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-travesia-gold tracking-tighter border-b border-travesia-gold/20 pb-4 mb-6">
            LA TRAVESÍA
            <span className="block text-[10px] font-medium tracking-[0.3em] uppercase opacity-60">Admin Panel</span>
          </h2>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive 
                      ? 'bg-travesia-gold text-travesia-green-deep font-bold shadow-lg' 
                      : 'hover:bg-white/10 text-white/70 hover:text-white'}
                  `}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/10 bg-travesia-green-deep/50">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
