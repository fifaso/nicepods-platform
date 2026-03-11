// components/insight-panel.tsx
// VERSIÓN: 3.1 (NicePod Architecture Standard - Strategic Telemetry)
// Misión: Visualizar el estado de resonancia y la salud del Knowledge Vault (NKV).
// [FIX]: Resolución de error 'reputation_score' y restauración de importación 'Globe'.

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Tables } from "@/types/supabase";
import {
  Activity,
  BarChart3,
  Cpu,
  Globe,
  ShieldCheck,
  Zap
} from "lucide-react";

/**
 * [TYPES]: Definición de la interfaz del componente.
 * resonanceProfile: Datos de impacto geospacial del usuario.
 */
interface InsightPanelProps {
  resonanceProfile: Tables<'user_resonance_profiles'> | null;
}

/**
 * InsightPanel: El módulo de telemetría táctica del Dashboard.
 */
export function InsightPanel({ resonanceProfile }: InsightPanelProps) {

  /**
   * [SINCRO V17.0]: Consumo de estados de identidad granulares.
   * Utilizamos isInitialLoading para la sincronía de red y isProfileLoading 
   * para la carga de metadatos desde la tabla pública.
   */
  const { profile, isInitialLoading, isProfileLoading } = useAuth();

  /**
   * [ESTADO DE CARGA]: Skeleton Shimmer de Alta Fidelidad
   * Se activa durante las fases T0 y T1 para evitar el Layout Shift.
   */
  if (isInitialLoading || isProfileLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton de Tarjeta de Soberanía */}
        <div className="h-44 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-inner" />

        {/* Skeleton de Gráfico Semántico */}
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
        {/* Capa de atmósfera Aurora interna */}
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

          {/* Métricas de Curador */}
          <div className="flex items-center justify-between px-2">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Prestigio</p>
              {/* [FIX]: Acceso seguro a reputation_score con casting preventivo */}
              <p className="text-xl font-black leading-none">
                {(profile as any)?.reputation_score ?? 0}
              </p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="space-y-0.5 text-right">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Nivel</p>
              <p className="text-xl font-black uppercase italic leading-none">Curador</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. PANEL DE TELEMETRÍA NKV (Knowledge Vault) */}
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
            {/* Gradiente dinámico de fondo */}
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

            {/* Línea de pulso técnico animada */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/10 overflow-hidden">
              <div className="h-full w-1/4 bg-primary/60 animate-[ping_3s_linear_infinite]" />
            </div>
          </div>

          {/* Metadatos de Infraestructura */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <Cpu size={12} className="text-primary/50" />
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Cerebro</span>
              </div>
              <p className="text-[11px] font-black text-foreground uppercase italic tracking-tighter">V2.5 Stable</p>
            </div>
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <Globe size={12} className="text-primary/50" />
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