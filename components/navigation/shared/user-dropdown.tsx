/**
 * ARCHIVO: components/navigation/shared/user-dropdown.tsx
 * VERSIÓN: 5.0 (NicePod User Dropdown - Absolute Nominal Identity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 *
 * Misión: Proveer el acceso táctico al búnker de ajustes y perfil desde la malla global, 
 * garantizando la proyección fiel de la identidad del Voyager.
 * [REFORMA V5.0]: Sincronización absoluta con AuthProvider V5.1. Se elimina la 
 * amnesia de identidad ("Curador Anónimo") mediante la inyección directa de 
 * 'administratorProfile' desde el Córtex, en lugar de depender de props volátiles. 
 * Cumplimiento estricto de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import {
  LogOut,
  Settings,
  Shield,
  User as UserIcon
} from "lucide-react";
import Link from "next/link";

// --- INFRAESTRUCTURA CORE V4.9 ---
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
import { getSafeAsset } from "@/lib/utils";

/**
 * INTERFAZ: UserDropdownComponentProperties
 * Misión: Mantener el contrato con los NavBars padres, aunque la inteligencia 
 * ahora provenga directamente del Córtex.
 */
interface UserDropdownComponentProperties {
  /** onAuthenticationLogoutAction: Callback opcional para interceptar la desconexión. */
  onAuthenticationLogoutAction?: () => void;
}

/**
 * UserDropdown: La terminal de identidad compacta en la barra de comando.
 */
export function UserDropdown({
  onAuthenticationLogoutAction
}: UserDropdownComponentProperties) {
  
  /**
   * 1. CONSUMO DEL CÓRTEX DE IDENTIDAD (ZAP Compliance V5.1)
   * Extraemos la verdad absoluta del AuthProvider para evitar propiedades nulas.
   */
  const { 
    administratorProfile, 
    isAdministratorAuthority, 
    onAuthenticationSignOutAction 
  } = useAuth();

  // 2. EXTRACCIÓN DE IDENTIDAD (FALLBACK SEGURO)
  const userDisplayNameInitials = administratorProfile?.fullName
    ? administratorProfile.fullName.substring(0, 2).toUpperCase()
    : (administratorProfile?.username?.substring(0, 2).toUpperCase() || "VO");

  /**
   * handleLogoutAction: Protocolo de expulsión con doble redundancia.
   */
  const handleLogoutAction = () => {
    if (onAuthenticationLogoutAction) {
        onAuthenticationLogoutAction();
    } else {
        onAuthenticationSignOutAction();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="relative h-10 w-10 rounded-full border-2 border-white/5 hover:border-primary/40 transition-all duration-500 outline-none group overflow-hidden"
          aria-label="Abrir panel de identidad"
        >
          <Avatar className="h-full w-full">
            <AvatarImage
              src={getSafeAsset(administratorProfile?.avatarUniformResourceLocator, 'avatar')}
              alt={administratorProfile?.fullName || "Voyager de NicePod"}
              className="object-cover"
            />
            <AvatarFallback className="bg-[#050505] text-primary text-[10px] font-black tracking-widest uppercase">
              {userDisplayNameInitials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 mt-2 bg-[#0a0a0a]/95 backdrop-blur-2xl border-white/5 rounded-[1.5rem] shadow-2xl p-2" align="end">
        <DropdownMenuLabel className="p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-white truncate">
              {administratorProfile?.fullName || 'Identidad en Forja'}
            </p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">
              @{administratorProfile?.username || 'unnamed_voyager'}
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

          {isAdministratorAuthority && (
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
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500/60 group-hover:text-red-500">
              Cerrar Canal
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Authority Decoupling: Se eliminó la dependencia de las propiedades 'profile' e 
 *    'isAdministratorAuthority' inyectadas desde los NavBars. El componente ahora 
 *    extrae su propia identidad desde el Singleton de Auth, garantizando la sintonía ZAP.
 * 2. Visual Integrity: Se utiliza la función 'getSafeAsset' para prevenir errores 
 *    de carga en la etiqueta <Image> cuando la URL del avatar es defectuosa o nula.
 * 3. ZAP Absolute Compliance: Purificación total de la interfaz de propiedades.
 */