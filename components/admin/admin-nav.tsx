// components/admin/admin-nav.tsx
// VERSIÓN: 3.0 (Madrid Resonance - Admin Shield & Architecture Fix)
// Misión: Orquestador de navegación para la Torre de Control con arquitectura de componentes puros.

"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Activity,
  ChevronRight,
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/**
 * CONFIGURACIÓN DE NAVEGACIÓN
 * Centralizamos los accesos para facilitar el escalado de la Torre de Control.
 */
const ADMIN_NAV_ITEMS = [
  {
    title: "Panel General",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Métricas y estado global"
  },
  {
    title: "Gestión de Usuarios",
    href: "/admin/users", // Asumiendo que esta será la ruta futura
    icon: Users,
    description: "Control de acceso y roles"
  },
  {
    title: "Bóveda de Datos",
    href: "/admin/vault",
    icon: Database,
    description: "Gestión de conocimiento IA"
  }
];

/**
 * COMPONENTE: NavLinkItem (Componente Puro)
 * [SISTEMA]: Definido fuera de AdminNav para evitar recreaciones innecesarias de DOM.
 */
function NavLinkItem({
  item,
  isActive,
  onClick
}: {
  item: typeof ADMIN_NAV_ITEMS[0],
  isActive: boolean,
  onClick?: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all duration-300",
        isActive
          ? "bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          : "text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg transition-colors",
        isActive ? "bg-red-500 text-white" : "bg-slate-800 text-slate-500 group-hover:text-slate-200"
      )}>
        <item.icon size={18} />
      </div>
      <div className="flex-1 flex flex-col">
        <span className="uppercase tracking-tight">{item.title}</span>
        <span className="text-[9px] font-medium opacity-60 lowercase tracking-widest">{item.description}</span>
      </div>
      {isActive && <ChevronRight size={14} className="animate-pulse" />}
    </Link>
  );
}

export function AdminNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Verificamos si la ruta es activa considerando sub-rutas
  const checkActive = (href: string) => pathname === href;

  return (
    <>
      {/* --- CABECERA MÓVIL (TÁCTICA) --- */}
      <div className="md:hidden flex items-center justify-between p-4 bg-black border-b border-white/5 sticky top-0 z-[60] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-xl">
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm uppercase tracking-tighter text-white">Torre de Control</span>
            <span className="text-[8px] font-bold text-red-500/60 uppercase tracking-[0.3em]">Nivel Admin</span>
          </div>
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/5 rounded-full">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-zinc-950 border-white/5 p-0 flex flex-col rounded-r-[3rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex flex-col gap-1 bg-gradient-to-br from-red-500/5 to-transparent">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/50">NicePod Command Center</span>
              <span className="font-black text-2xl text-white tracking-tighter uppercase italic">Menu <span className="text-red-500">Operativo</span></span>
            </div>

            <nav className="flex-1 p-6 space-y-3">
              {ADMIN_NAV_ITEMS.map((item) => (
                <NavLinkItem
                  key={item.href}
                  item={item}
                  isActive={checkActive(item.href)}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </nav>

            <div className="p-8 border-t border-white/5 bg-black/40">
              <Link href="/" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all">
                <LogOut className="h-4 w-4" /> Salir a Interfaz Pública
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* --- DESKTOP SIDEBAR (SÓLIDO) --- */}
      <aside className="hidden md:flex w-72 border-r border-white/5 flex-col fixed h-full bg-black z-50 shadow-[20px_0_40px_rgba(0,0,0,0.4)]">

        {/* LOGO DE TORRE DE CONTROL */}
        <div className="p-8 flex items-center gap-4 border-b border-white/5 mb-6 bg-gradient-to-br from-red-500/[0.03] to-transparent">
          <div className="bg-red-500/10 p-2.5 rounded-2xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
            <ShieldAlert className="h-6 w-6 text-red-500 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tighter text-white uppercase leading-none">Torre de Control</span>
            <span className="text-[9px] font-bold text-red-500/40 uppercase tracking-[0.4em] mt-1">Admin Ops</span>
          </div>
        </div>

        {/* LISTA DE ENLACES PRINCIPAL */}
        <nav className="flex-1 px-4 space-y-2">
          <div className="px-4 mb-4">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Módulos del Sistema</span>
          </div>
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLinkItem
              key={item.href}
              item={item}
              isActive={checkActive(item.href)}
            />
          ))}
        </nav>

        {/* ESTADO DEL SISTEMA (DECORATIVO/UX) */}
        <div className="px-8 mb-6">
          <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={12} className="text-emerald-500" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Estado Online</span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full" />
            </div>
          </div>
        </div>

        {/* BOTÓN DE RETORNO */}
        <div className="p-6 border-t border-white/5 bg-zinc-950/30">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" /> Volver a NicePod
          </Link>
        </div>
      </aside>
    </>
  );
}