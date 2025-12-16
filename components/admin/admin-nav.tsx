"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShieldAlert, Users, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Definición de enlaces para no repetir código
  const NavLinks = () => (
    <nav className="space-y-2 px-2">
      <Link 
        href="/admin" 
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
          isActive("/admin") 
            ? "bg-blue-600/20 text-blue-400" 
            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
        )}
      >
        <LayoutDashboard className="h-4 w-4" /> Dashboard
      </Link>
      
      {/* Ya tenemos la tabla de usuarios, habilitamos el link */}
      <Link 
        href="/admin" // Por ahora apunta al mismo dashboard que tiene la tabla
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
          isActive("/admin/users") 
            ? "bg-blue-600/20 text-blue-400" 
            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
        )}
      >
        <Users className="h-4 w-4" /> Usuarios
      </Link>
    </nav>
  );

  return (
    <>
      {/* --- MOBILE HEADER (Solo visible en móviles) --- */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-red-500/20 p-1.5 rounded-lg">
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-200">Torre de Control</span>
        </div>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-400">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-slate-950 border-slate-800 p-0">
            <div className="p-6 border-b border-slate-800 mb-4">
               <span className="font-bold text-lg text-slate-200">Menú Admin</span>
            </div>
            <NavLinks />
            <div className="absolute bottom-8 left-0 w-full px-6">
                <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300">
                    <LogOut className="h-4 w-4" /> Salir a Pública
                </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* --- DESKTOP SIDEBAR (Oculto en móviles) --- */}
      <aside className="hidden md:flex w-64 border-r border-slate-800 flex-col fixed h-full bg-slate-950 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-lg">
            <ShieldAlert className="h-6 w-6 text-red-500" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-100">Torre de Control</span>
        </div>

        <div className="flex-1 mt-4">
            <NavLinks />
        </div>

        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <LogOut className="h-3 w-3" /> Volver a NicePod Público
          </Link>
        </div>
      </aside>
    </>
  );
}