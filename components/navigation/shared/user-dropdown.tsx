// components/navigation/shared/user-dropdown.tsx
// VERSIÓN: 1.0

"use client";

import {
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  User as UserIcon
} from "lucide-react";
import Link from "next/link";

// --- INFRAESTRUCTURA UI ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// --- TIPOS DE DATOS ---
// Importamos el tipo ProfileData que definimos en la Fase 1 de la reconstrucción.
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: UserDropdownProps
 * Contrato de datos necesarios para renderizar la identidad del curador.
 */
interface UserDropdownProps {
  profile: ProfileData | null;
  isAdmin: boolean;
  onLogout: () => void;
}

/**
 * COMPONENTE: UserDropdown
 * El menú contextual de identidad soberana.
 * 
 * [UX]:
 * - Alineación 'end' para asegurar que no se salga de la pantalla en móviles.
 * - Iconografía consistente con el sistema Lucide.
 */
export function UserDropdown({ profile, isAdmin, onLogout }: UserDropdownProps) {

  // Cálculo de iniciales para fallback (Resiliencia Visual)
  const userInitials = profile?.full_name
    ? profile.full_name.substring(0, 2).toUpperCase()
    : "NP";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 md:h-10 md:w-10 rounded-full p-0 hover:bg-transparent group outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Abrir menú de usuario"
        >
          <Avatar className="h-9 w-9 md:h-9 md:w-9 border border-white/10 group-hover:border-primary/50 transition-colors shadow-lg">
            <AvatarImage
              src={profile?.avatar_url || ""}
              alt={profile?.username || "Avatar de Usuario"}
              className="object-cover"
            />
            <AvatarFallback className="bg-zinc-800 text-primary font-bold text-[10px] md:text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-60 p-2 rounded-2xl bg-[#0A0A0A] border-white/10 shadow-2xl text-zinc-300 mt-2 animate-in zoom-in-95 duration-200"
      >
        {/* CABECERA DE IDENTIDAD (Tarjeta de Presentación Mini) */}
        <div className="px-3 py-2.5 bg-white/5 rounded-xl mb-1 select-none">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">
            Identidad Activa
          </p>
          <p className="text-sm font-bold text-white truncate">
            {profile?.full_name || 'Curador Anónimo'}
          </p>
          <p className="text-[10px] font-mono text-primary/80 truncate">
            @{profile?.username || 'user'}
          </p>
        </div>

        <DropdownMenuSeparator className="bg-white/5 my-1" />

        {/* GRUPO DE ACCIONES PRINCIPALES */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="rounded-lg focus:bg-white/10 cursor-pointer">
            <Link href="/profile" className="flex items-center py-2">
              <UserIcon className="mr-3 h-4 w-4 text-zinc-500" />
              <span className="text-xs font-bold uppercase tracking-wide">Tu Identidad</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="rounded-lg focus:bg-white/10 cursor-pointer">
            <Link href="/dashboard" className="flex items-center py-2">
              <LayoutDashboard className="mr-3 h-4 w-4 text-zinc-500" />
              <span className="text-xs font-bold uppercase tracking-wide">Workstation</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="rounded-lg focus:bg-white/10 cursor-pointer">
            <Link href="/profile?tab=settings" className="flex items-center py-2">
              <Settings className="mr-3 h-4 w-4 text-zinc-500" />
              <span className="text-xs font-bold uppercase tracking-wide">Ajustes</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* ZONA ADMINISTRATIVA (Solo si tiene rango) */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator className="bg-white/5 my-1" />
            <DropdownMenuItem asChild className="rounded-lg focus:bg-red-500/10 focus:text-red-400 text-red-500 cursor-pointer">
              <Link href="/admin" className="flex items-center py-2">
                <ShieldCheck className="mr-3 h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wide">Admin Control</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="bg-white/5 my-1" />

        {/* ACCIÓN DE SALIDA */}
        <DropdownMenuItem
          onClick={onLogout}
          className="rounded-lg focus:bg-red-950/30 focus:text-red-400 text-zinc-500 cursor-pointer py-2 group/logout"
        >
          <LogOut className="mr-3 h-4 w-4 group-focus/logout:text-red-400 transition-colors" />
          <span className="text-xs font-bold uppercase tracking-wide">Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}