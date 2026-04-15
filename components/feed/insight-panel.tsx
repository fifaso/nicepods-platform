/**
 * ARCHIVO: components/feed/insight-panel.tsx
 * VERSIÓN: 6.0 (NicePod Insight Panel - Sovereign Normalization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Visualizar el estado de resonancia, el prestigio y la salud de la malla 
 * urbana sin latencia, orquestando la normalización entre datos del Metal y el Cristal.
 * [REFORMA V6.0]: Resolución definitiva de TS2339 mediante el 'Sovereign Normalization Mapper'.
 * Sincronización absoluta con AuthProvider V5.2 y el contrato ProfileData V4.1. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Tables } from "@/types/database.types";
import { ProfileData } from "@/types/profile";
import {
  Activity,
  BarChart3,
  Cpu,
  Globe,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useMemo } from "react";

/**
 * INTERFAZ: InsightPanelProperties
 * Misión: Definir la entrada de datos síncronos (SSR) para evitar el flicker.
 */
interface InsightPanelProperties {
  /** initialAdministratorProfile: Perfil inyectado desde el servidor (Metal o Cristal). */
  initialAdministratorProfile?: ProfileData | Tables<'profiles'> | null;
  /** initialResonanceMetrics: Telemetría de resonancia inyectada desde el servidor. */
  initialResonanceMetrics?: Tables<'user_resonance_profiles'> | null;
}

/**
 * InsightPanel: El monitor de telemetría táctica de la Workstation.
 */
export function InsightPanel({ 
  initialAdministratorProfile, 
  initialResonanceMetrics 
}: InsightPanelProperties) {

  /**
   * 1. CONSUMO DEL CÓRTEX DE AUTORIDAD
   * Extraemos descriptores industriales del AuthProvider V5.2.
   */
  const { 
    administratorProfile: liveAdministratorProfile, 
    isInitialHandshakeLoading, 
    isProfileSynchronizationLoading 
  } = useAuth();

  /**
   * 2. SOVEREIGN NORMALIZATION MAPPER
   * Misión: Garantizar que el objeto de perfil cumpla con la interfaz ProfileData,
   * mapeando las claves de snake_case (Metal) a camelCase (Cristal) si es necesario.
   */
  const activeSovereignProfile = useMemo((): ProfileData | null => {
    const rawProfileSource = liveAdministratorProfile || initialAdministratorProfile;
    
    if (!rawProfileSource) return null;

    // Si ya es un objeto purificado (Cristal), lo retornamos directamente.
    if ('reputationScoreValue' in rawProfileSource) {
      return rawProfileSource as ProfileData;
    }

    // Si es una fila de base de datos (Metal), ejecutamos la transmutación industrial.
    const rawMetalProfile = rawProfileSource as Tables<'profiles'>;
    
    return {
      identification: rawMetalProfile.id,
      username: rawMetalProfile.username || "voyager_anonimo",
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
      updateTimestamp: rawMetalProfile.created_at, // Fallback en caso de nulidad
    } as ProfileData;

  }, [liveAdministratorProfile, initialAdministratorProfile]);

  /**
   * 3. GESTIÓN DE MÉTRICAS DE RESONANCIA
   */
  const activeResonanceProfile = useMemo(() => {
    return initialResonanceMetrics || null;
  }, [initialResonanceMetrics]);

  /**
   * 4. PROTOCOLO DE ESPERA TÉCNICA (HARDWARE HYGIENE)
   * Bloqueo de renderizado para evitar asimetrías visuales durante la carga.
   */
  const isWaitStateProcessActive = 
    !activeSovereignProfile && 
    (isInitialHandshakeLoading || isProfileSynchronizationLoading);

  if (isWaitStateProcessActive) {
    return (
      <div className="space-y-6 animate-pulse isolate">
        <div className="h-44 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-inner" />
        <div className="p-8 bg-card/20 rounded-[2.5rem] border border-white/5 space-y-5">
          <div className="h-2 w-28 bg-white/10 rounded-full" />
          <div className="h-36 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700 isolate">

      {/* I. TARJETA DE SOBERANÍA SEMÁNTICA (IDENTIDAD & RANGO) */}
      <Card className="bg-primary text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative group isolate">
        
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/30 pointer-events-none z-0" />

        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">
              Soberanía de Datos
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-white animate-pulse" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          {/* Monitor de Resonancia Central */}
          <div className="flex items-center justify-between p-5 bg-black/30 rounded-2xl border border-white/10 shadow-inner">
            <div className="space-y-1">
              <span className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none">
                Resonancia de Red
              </span>
              <p className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                Estable
              </p>
            </div>
            <Zap size={26} className="text-yellow-300 fill-current drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]" />
          </div>

          {/* Métricas del Curador (Sincronizadas por el Normalizer) */}
          <div className="flex items-center justify-between px-2">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Prestigio</p>
              <p className="text-xl font-black leading-none">
                {activeSovereignProfile?.reputationScoreValue ?? 0}
              </p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="space-y-0.5 text-right">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Nivel</p>
              <p className="text-xl font-black uppercase italic leading-none">
                {activeSovereignProfile?.authorityRole === 'admin' ? 'Administrador' : 'Curador'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* II. PANEL DE TELEMETRÍA DE LA MALLA (INFRAESTRUCTURA) */}
      <Card className="bg-card/30 backdrop-blur-xl border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden isolate">
        <CardHeader className="p-8 pb-2 relative z-10">
          <div className="flex items-center gap-3">
            <Activity size={14} className="text-primary" />
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/80">
              Malla de Inteligencia
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6 relative z-10">
          {/* Visualizador de Actividad Semántica */}
          <div className="relative h-44 w-full bg-zinc-950/50 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center p-6 overflow-hidden group shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-60" />

            <BarChart3 size={36} className="text-primary/20 mb-4 group-hover:scale-110 transition-transform duration-700" />

            <div className="text-center relative z-10 space-y-1.5">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                {activeResonanceProfile ? "Mapeo Semántico Activo" : "Inicializando Nodos..."}
              </span>
              <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                Sincronizado con Madrid Resonance
              </p>
            </div>

            {/* Línea de pulso cinemático de red */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/10 overflow-hidden">
              <div className="h-full w-1/4 bg-primary/60 animate-[ping_3s_linear_infinite]" />
            </div>
          </div>

          {/* Infraestructura de Núcleo (Telemetry Readout) */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors group/item">
              <div className="flex items-center gap-2 mb-1.5">
                <Cpu size={12} className="text-primary/50 group-hover/item:text-primary transition-colors" />
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Cerebro</span>
              </div>
              <p className="text-[11px] font-black text-foreground uppercase italic tracking-tighter">V4.9 Stable</p>
            </div>
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors group/item">
              <div className="flex items-center gap-2 mb-1.5">
                <Globe size={12} className="text-primary/50 group-hover/item:text-primary transition-colors" />
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Sintonía</span>
              </div>
              <p className="text-[11px] font-black text-foreground uppercase italic tracking-tighter">Hub Activo</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Build Shield Resolution: Se erradicó el error TS2339 mediante un mapeador 
 *    que garantiza el cumplimiento de la interfaz 'ProfileData' antes del renderizado.
 * 2. ZAP Compliance: Purificación nominal total. Términos como 'bio', 'url' o 'score' 
 *    han sido transmutados a descriptores industriales en el objeto normalizado.
 * 3. Contractual Resillience: El panel ahora es inmune a si los datos provienen de 
 *    una fila de Supabase (snake_case) o del estado soberano de la App (camelCase).
 */