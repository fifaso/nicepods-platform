/**
 * ARCHIVO: components/feed/insight-panel.tsx
 * VERSIÓN: 5.0 (NicePod Insight Panel - Sovereign Contract Alignment Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Visualizar el estado de resonancia, el prestigio y la salud del NKV 
 * sin latencia de hidratación, orquestando la "Doble Verdad" (Servidor + Cliente).
 * [REFORMA V5.0]: Resolución definitiva de errores TS2339. Sincronización nominal 
 * absoluta con el AuthProvider V5.1 y el contrato 'ProfileData' V4.1. 
 * Purificación léxica total bajo la Zero Abbreviations Policy (ZAP).
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
 * [SINCRO V5.0]: Actualización del tipo de 'initialAdministratorProfile' 
 * para satisfacer el contrato industrial ZAP de la Workstation.
 */
interface InsightPanelProperties {
  initialAdministratorProfile?: ProfileData | null;
  initialResonanceMetrics?: Tables<'user_resonance_profiles'> | null;
}

/**
 * InsightPanel: El monitor de telemetría táctica de la Malla.
 */
export function InsightPanel({ 
  initialAdministratorProfile, 
  initialResonanceMetrics 
}: InsightPanelProperties) {

  /**
   * [SINCRO V5.0]: CONSUMO DEL ESTADO CLIENTE (Auth Provider V5.1)
   * Extraemos los descriptores industriales en lugar de las abreviaturas obsoletas.
   */
  const { 
    administratorProfile: liveAdministratorProfile, 
    isInitialHandshakeLoading, 
    isProfileSynchronizationLoading 
  } = useAuth();

  /**
   * [SOBERANÍA DE DATOS]: La Doble Verdad.
   * Fusionamos la verdad inyectada en tiempo 0 (SSR) con la reactividad en vivo (Client).
   * Misión: Evitar el 'flicker' visual durante el Handshake.
   */
  const activeSovereignProfile = useMemo(() => {
    return liveAdministratorProfile || initialAdministratorProfile || null;
  }, [liveAdministratorProfile, initialAdministratorProfile]);

  const activeResonanceProfile = useMemo(() => {
    return initialResonanceMetrics || null;
  }, [initialResonanceMetrics]);

  /**
   * [ESTADO DE CARGA DEFENSIVO]:
   * Bloqueo de renderizado si el perfil es nulo y la sincronización está en curso.
   */
  const isWaitStateActive = !activeSovereignProfile && (isInitialHandshakeLoading || isProfileSynchronizationLoading);

  if (isWaitStateActive) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-inner" />
        <div className="p-8 bg-card/20 rounded-[2.5rem] border border-white/5 space-y-5">
          <div className="h-2 w-28 bg-white/10 rounded-full" />
          <div className="h-36 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">

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

          {/* Métricas del Curador (Síncronas) */}
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
          <div className="relative h-44 w-full bg-zinc-950/50 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center p-6 overflow-hidden group">
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

            {/* Línea de pulso cinemático */}
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Contract Sovereignty: Se resolvieron los 3 errores TS2339 al sincronizar la 
 *    desestructuración con el AuthProvider V5.1 (liveAdministratorProfile, 
 *    isInitialHandshakeLoading).
 * 2. Metal-to-Crystal Mapping: Se actualizó la interfaz de propiedades para 
 *    esperar el tipo 'ProfileData' en lugar del genérico 'Tables', garantizando 
 *    que el Dashboard pueda leer 'reputationScoreValue' sin errores.
 * 3. ZAP Enforcement: Purificación total. Se eliminaron términos obsoletos 
 *    (authProfile) por descriptores industriales (activeSovereignProfile).
 */