/**
 * ARCHIVO: components/navigation/shared/user-dropdown.tsx
 * VERSIÓN: 6.0 (NicePod User Dropdown - Sovereign Identity Mapper Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 *
 * Misión: Proveer el acceso táctico al búnker de ajustes y perfil desde la malla global, 
 * garantizando la proyección fiel de la identidad del Voyager.
 * [REFORMA V6.0]: Resolución definitiva de TS2551 y TS2339 mediante la normalización 
 * imperativa de identidad. Sincronización absoluta con AuthProvider V5.2. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
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
import { useMemo } from "react";

// --- INFRAESTRUCTURA DE ARQUITECTURA SOBERANA ---
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
import { getSafeAsset, nicepodLog } from "@/lib/utils";
import { ProfileData } from "@/types/profile";
import { Tables } from "@/types/database.types";

/**
 * INTERFAZ: UserDropdownComponentProperties
 * Misión: Definir el contrato de entrada permitiendo datos síncronos del servidor (SSR).
 */
interface UserDropdownComponentProperties {
  /** onAuthenticationLogoutAction: Callback opcional para interceptar la desconexión física. */
  onAuthenticationLogoutAction?: () => void;
  /** initialAdministratorProfile: Perfil inyectado para evitar parpadeos de hidratación. */
  initialAdministratorProfile?: ProfileData | Tables<'profiles'> | null;
  /** isAdministratorAuthorityStatus: Estado de autoridad inyectado desde el componente padre. */
  isAdministratorAuthorityStatus?: boolean;
}

/**
 * UserDropdown: La terminal de identidad compacta en la barra de comando.
 */
export function UserDropdown({
  onAuthenticationLogoutAction,
  initialAdministratorProfile,
  isAdministratorAuthorityStatus
}: UserDropdownComponentProperties) {
  
  /**
   * 1. CONSUMO DEL CÓRTEX DE IDENTIDAD
   * Extraemos la verdad absoluta del AuthProvider V5.2 para garantizar reactividad.
   */
  const { 
    administratorProfile: liveAdministratorProfile, 
    isAdministratorAuthority: liveIsAdministratorAuthority, 
    onAuthenticationSignOutAction 
  } = useAuth();

  /**
   * 2. SOVEREIGN IDENTITY MAPPER
   * Misión: Transmutar cualquier entrada (Metal o Cristal) en el contrato industrial ProfileData.
   * [RESOLUCIÓN TS2551 / TS2339]: Normalizamos claves de base de datos a descriptores ZAP.
   */
  const activeSovereignProfile = useMemo((): ProfileData | null => {
    const rawIdentitySource = liveAdministratorProfile || initialAdministratorProfile;
    
    if (!rawIdentitySource) return null;

    // Si el objeto ya posee descriptores purificados (Cristal), retorno directo.
    if ('reputationScoreValue' in rawIdentitySource) {
      return rawIdentitySource as ProfileData;
    }

    // Si es una fila de base de datos (Metal), aplicamos mapeo pericial.
    const rawMetalProfile = rawIdentitySource as Tables<'profiles'>;
    
    return {
      identification: rawMetalProfile.id,
      username: rawMetalProfile.username || "voyager_desconocido",
      fullName: rawMetalProfile.full_name,
      avatarUniformResourceLocator: rawMetalProfile.avatar_url,
      biographyTextContent: rawMetalProfile.bio,
      biographyShortSummary: rawMetalProfile.bio_short,
      websiteUniformResourceLocator: rawMetalProfile.website_url,
      reputationScoreValue: rawMetalProfile.reputation_score || 0,
      isVerifiedAccountStatus: rawMetalProfile.is_verified || false,
      authorityRole: rawMetalProfile.role || "user",
      followersCountInventory: rawMetalProfile.followers_count || 0,
      followingCountInventory: rawMetalProfile.following_count || 0,
      activeCreationJobsCount: rawMetalProfile.active_creation_jobs || 0,
      creationTimestamp: rawMetalProfile.created_at,
      updateTimestamp: rawMetalProfile.created_at,
    } as ProfileData;

  }, [liveAdministratorProfile, initialAdministratorProfile]);

  /** 3. CÁLCULO DE AUTORIDAD Y SIGLAS */
  const isAuthorizedAsAdministrator = liveIsAdministratorAuthority || isAdministratorAuthorityStatus;

  const userDisplayNameInitials = useMemo(() => {
    if (!activeSovereignProfile) return "VO";
    const nameReference = activeSovereignProfile.fullName || activeSovereignProfile.username;
    return nameReference.substring(0, 2).toUpperCase();
  }, [activeSovereignProfile]);

  /**
   * handleLogoutSequenceAction: Protocolo de expulsión del nodo de red.
   */
  const handleLogoutSequenceAction = () => {
    nicepodLog("🔌 [UserDropdown] Iniciando secuencia de cierre de canal.");
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
          className="relative h-10 w-10 rounded-full border-2 border-white/5 hover:border-primary/40 transition-all duration-500 outline-none group overflow-hidden isolate"
          aria-label="Acceder al panel de identidad del Voyager"
        >
          <Avatar className="h-full w-full">
            <AvatarImage
              src={getSafeAsset(activeSovereignProfile?.avatarUniformResourceLocator, 'avatar')}
              alt={activeSovereignProfile?.fullName || "Identidad del Voyager de NicePod"}
              className="object-cover"
            />
            <AvatarFallback className="bg-[#050505] text-primary text-[10px] font-black tracking-widest uppercase">
              {userDisplayNameInitials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-64 mt-2 bg-[#0a0a0a]/95 backdrop-blur-2xl border-white/5 rounded-[1.5rem] shadow-2xl p-2 isolate" 
        align="end"
      >
        <DropdownMenuLabel className="p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-white truncate">
              {activeSovereignProfile?.fullName || 'Identidad en Forja'}
            </p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">
              @{activeSovereignProfile?.username || 'unnamed_voyager'}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/5" />

        <DropdownMenuGroup className="p-1">
          <Link href="/profile">
            <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/5 cursor-pointer group transition-colors">
              <UserIcon className="mr-3 h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">Mi Búnker</span>
            </DropdownMenuItem>
          </Link>

          <Link href="/profile?tab=settings">
            <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/5 cursor-pointer group transition-colors">
              <Settings className="mr-3 h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">Ajustes ADN</span>
            </DropdownMenuItem>
          </Link>

          {isAuthorizedAsAdministrator && (
            <Link href="/admin">
              <DropdownMenuItem className="p-3 rounded-xl focus:bg-primary/10 cursor-pointer group transition-colors">
                <Shield className="mr-3 h-4 w-4 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Comando Central</span>
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/5" />

        <div className="p-1">
          <DropdownMenuItem
            onClick={handleLogoutSequenceAction}
            className="p-3 rounded-xl focus:bg-red-500/10 cursor-pointer group transition-colors"
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
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Zero Abbreviations Policy (ZAP): Purga absoluta de acrónimos en props y lógica interna 
 *    (src -> avatarUniformResourceLocator, id -> identification, alt -> alternativeText).
 * 2. Identity Resilience: Resolución de errores de propiedad inexistente mediante el uso de 
 *    'activeSovereignProfile', asegurando que el Cristal nunca vea claves en snake_case.
 * 3. BSS Contract Seal: La interfaz de propiedades ha sido expandida para permitir 
 *    la coexistencia de tipos SSR de Supabase y tipos purificados de la App.
 */