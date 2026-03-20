// components/insight-panel.tsx
// VERSIÓN: 4.0 (NiceCore V2.6 - Telemetría Síncrona T0)
// Misión: Visualizar el estado de resonancia y la salud del NKV sin latencia de hidratación.
// [ESTABILIZACIÓN]: Inyección de Initial Props para aniquilar el flicker de metadatos.

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Tables } from "@/types/database.types";
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
 * INTERFAZ: InsightPanelProps
 * initialProfile: Metadatos del curador cosechados en el servidor.
 * resonanceProfile: Snapshot del impacto geoespacial del usuario.
 */
interface InsightPanelProps {
  initialProfile?: Tables<'profiles'> | null;
  initialResonance?: Tables<'user_resonance_profiles'> | null;
}

/**
 * InsightPanel: El monitor de telemetría táctica.
 * [ESTRATEGIA HÍBRIDA]: Prioriza los datos del servidor para el renderizado T0 
 * y se sincroniza con el estado reactivo del AuthProvider para actualizaciones en vivo.
 */
export function InsightPanel({ initialProfile, initialResonance }: InsightPanelProps) {

  // Consumimos el estado del cliente para mantener la reactividad post-hidratación.
  const { profile: authProfile, isInitialLoading, isProfileLoading } = useAuth();

  /**
   * [SOBERANÍA DE DATOS]:
   * Fusionamos la verdad del servidor con la reactividad del cliente.
   * Si 'initialProfile' está presente, la UI se pintará inmediatamente en el servidor.
   */
  const activeProfile = useMemo(() => {
    return authProfile || initialProfile || null;
  }, [authProfile, initialProfile]);

  const resonanceProfile = useMemo(() => {
    return initialResonance || null;
  }, [initialResonance]);

  /**
   * [ESTADO DE CARGA DEFENSIVO]:
   * Solo activamos el skeleton si no hay datos ni del servidor ni del cliente.
   * En el Dashboard SSR, esto prácticamente nunca debería ocurrir.
   */
  if (!activeProfile && (isInitialLoading || isProfileLoading)) {
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

      {/* 1. TARJETA DE SOBERANÍA SEMÁNTICA */}
      <Card className="bg-primary text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative group">
        {/* Capa atmosférica inmersiva */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/30 pointer-events-none" />

        <CardHeader className="pb-4 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">
              Soberanía de Datos
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-white animate-pulse" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative">
          {/* Monitor de Resonancia Central */}
          <div className="flex items-center justify-between p-5 bg-black/30 rounded-2xl border border-white/10 shadow-inner">
            <div className="space-y-1">
              <span className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none">Resonancia de Red</span>
              <p className="text-2xl font-black italic tracking-tighter uppercase leading-none">Estable</p>
            </div>
            <Zap size={26} className="text-yellow-300 fill-current drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]" />
          </div>

          {/* Métricas del Curador (Síncronas) */}
          <div className="flex items-center justify-between px-2">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Prestigio</p>
              <p className="text-xl font-black leading-none">
                {activeProfile?.reputation_score ?? 0}
              </p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="space-y-0.5 text-right">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Nivel</p>
              <p className="text-xl font-black uppercase italic leading-none">
                {activeProfile?.role === 'admin' ? 'Administrador' : 'Curador'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. PANEL DE TELEMETRÍA DE LA MALLA */}
      <Card className="bg-card/30 backdrop-blur-xl border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden">
        <CardHeader className="p-8 pb-2">
          <div className="flex items-center gap-3">
            <Activity size={14} className="text-primary" />
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/80">
              Malla de Inteligencia
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {/* Visualizador de Actividad Semántica */}
          <div className="relative h-44 w-full bg-zinc-950/50 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center p-6 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-60" />

            <BarChart3 size={36} className="text-primary/20 mb-4 group-hover:scale-110 transition-transform duration-700" />

            <div className="text-center relative z-10 space-y-1.5">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                {resonanceProfile ? "Mapeo Semántico Activo" : "Inicializando Nodos..."}
              </span>
              <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                Sincronizado con Madrid Live
              </p>
            </div>

            {/* Línea de pulso cinemático */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/10 overflow-hidden">
              <div className="h-full w-1/4 bg-primary/60 animate-[ping_3s_linear_infinite]" />
            </div>
          </div>

          {/* Infraestructura de Núcleo */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors group/item">
              <div className="flex items-center gap-2 mb-1.5">
                <Cpu size={12} className="text-primary/50 group-hover/item:text-primary transition-colors" />
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Cerebro</span>
              </div>
              <p className="text-[11px] font-black text-foreground uppercase italic tracking-tighter">V2.6 Stable</p>
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
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Aniquilación de Shimmer: Al pasar 'initialProfile', el componente tiene datos
 *    antes de que 'useAuth' siquiera se evalúe en el cliente.
 * 2. Reactividad Dual: El uso de 'useMemo' para 'activeProfile' garantiza que si
 *    el usuario gana reputación durante la sesión, la UI se actualizará sin recargar.
 * 3. Robusto ante Roles: La lógica de visualización del nivel (Admin vs Curador)
 *    está ahora protegida contra nulos y estados de carga.
 */