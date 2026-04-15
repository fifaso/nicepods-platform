/**
 * ARCHIVO: components/navigation/shared/user-dropdown.tsx
 * VERSIÓN: 4.0 (NicePod User Dropdown - Sovereign Protocol V4.0)
 * PROTOCOLO: MADRID RESONANCE V4.0
 *
 * Misión: Proveer el acceso táctico al búnker de ajustes y perfil desde la malla global.
 * [REFORMA V4.0]: Sincronización absoluta con ProfileData V4.0 y ZAP.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

"use client";

import {
  LogOut,
  Settings,
  Shield,
  User as UserIcon
} from "lucide-react";
import Link from "next/link";

// --- INFRAESTRUCTURA CORE ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: UserDropdownComponentProperties
 */
interface UserDropdownComponentProperties {
  profile: ProfileData | null;
  isAdministratorAuthority?: boolean;
  onLogout?: () => void;
}

/**
 * UserDropdown: La terminal de identidad compacta en la barra de comando.
 */
export function UserDropdown({
  profile,
  isAdministratorAuthority,
  onLogout
}: UserDropdownComponentProperties) {
  const { signOut: signOutAction } = useAuth();

  // Resolución táctica de iniciales para el Avatar
  const userDisplayNameInitials = profile?.fullName
    ? profile.fullName.substring(0, 2).toUpperCase()
    : (profile?.username?.substring(0, 2).toUpperCase() || "NC");

  const handleLogoutAction = () => {
    if (onLogout) {
        onLogout();
    } else {
        signOutAction();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-10 w-10 rounded-full border-2 border-white/5 hover:border-primary/40 transition-all duration-500 outline-none group overflow-hidden">
          <Avatar className="h-full w-full">
            <AvatarImage
              src={profile?.avatarUniformResourceLocator || ""}
              alt={profile?.fullName || "Curador NicePod"}
              className="object-cover"
            />
            <AvatarFallback className="bg-[#050505] text-primary text-[10px] font-black tracking-widest">
              {userDisplayNameInitials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 mt-2 bg-[#0a0a0a]/95 backdrop-blur-2xl border-white/5 rounded-[1.5rem] shadow-2xl p-2" align="end">
        <DropdownMenuLabel className="p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-white truncate">
              {profile?.fullName || 'Curador Anónimo'}
            </p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">
              @{profile?.username || 'unnamed_voyager'}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/5" />

        <DropdownMenuGroup className="p-1">
          <Link href="/profile">
            <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/5 cursor-pointer group">
              <UserIcon className="mr-3 h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">Mi Búnker</span>
            </DropdownMenuItem>
          </Link>

          <Link href="/profile?tab=settings">
            <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/5 cursor-pointer group">
              <Settings className="mr-3 h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">Ajustes ADN</span>
            </DropdownMenuItem>
          </Link>

          {(profile?.authorityRole === 'admin' || isAdministratorAuthority) && (
            <Link href="/admin">
              <DropdownMenuItem className="p-3 rounded-xl focus:bg-primary/10 cursor-pointer group">
                <Shield className="mr-3 h-4 w-4 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Comando Central</span>
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/5" />

        <div className="p-1">
          <DropdownMenuItem
            onClick={handleLogoutAction}
            className="p-3 rounded-xl focus:bg-red-500/10 cursor-pointer group"
          >
            <LogOut className="mr-3 h-4 w-4 text-red-500/60 group-hover:text-red-500 transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500/60 group-hover:text-red-500">Cerrar Canal</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
