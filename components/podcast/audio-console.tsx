// components/podcast/audio-console.tsx
// VERSIÓN: 1.0 (NicePod Audio Terminal - Interaction & Sync Standard)
// Misión: Proveer el control de escucha inteligente y las acciones sociales del curador.
// [ESTABILIZACIÓN]: Integración de estados de síntesis en tiempo real y optimización de densidad.

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Download,
  Heart,
  Loader2,
  Mic,
  PauseCircle,
  PlayCircle,
  Share2
} from "lucide-react";

/**
 * INTERFAZ: AudioConsoleProps
 * Contrato de datos para sincronizar la UI con el motor de audio y la base de datos.
 */
interface AudioConsoleProps {
  audioReady: boolean;         // Bandera de semáforo de la DB
  audioLoading: boolean;       // Estado de carga del AudioProvider
  isPlaying: boolean;          // ¿El audio está sonando ahora?
  isCurrentActive: boolean;    // ¿Este podcast es el cargado en el player global?
  isConstructing: boolean;     // Estado general de producción (Fase IV)
  likeCount: number;
  isLiked: boolean;
  isLiking: boolean;
  isOfflineAvailable: boolean;
  isDownloading: boolean;
  onPlay: () => void;
  onLike: () => Promise<void>;
  onDownload: () => void;
  onShare?: () => void;
}

/**
 * AudioConsole: La terminal de mandos de la estación de escucha.
 */
export function AudioConsole({
  audioReady,
  audioLoading,
  isPlaying,
  isCurrentActive,
  isConstructing,
  likeCount,
  isLiked,
  isLiking,
  isOfflineAvailable,
  isDownloading,
  onPlay,
  onLike,
  onDownload,
  onShare
}: AudioConsoleProps) {

  return (
    <Card className={cn(
      "bg-primary text-white border-none shadow-2xl rounded-[2rem] overflow-hidden relative group transition-all duration-700",
      isConstructing && !audioReady && "opacity-60 saturate-50 translate-y-2"
    )}>
      {/* CAPA ATMOSFÉRICA: Gradiente dinámico Aurora */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />

      <CardHeader className="pb-3 pt-6 px-6 relative text-center md:text-left">
        <CardTitle className="text-xs font-black uppercase tracking-[0.25em] flex items-center justify-center md:justify-start gap-2 opacity-80">
          <Mic className="h-4 w-4" />
          Estación de Escucha
        </CardTitle>
      </CardHeader>

      <CardContent className="relative flex flex-col gap-4 pb-6 px-6">

        {/* BOTÓN MAESTRO DE ACCIÓN (Smart Toggle) */}
        <Button
          size="lg"
          onClick={onPlay}
          disabled={(!audioReady && isConstructing) || (audioLoading && isCurrentActive)}
          className={cn(
            "w-full bg-white text-primary hover:bg-zinc-100 rounded-2xl h-14 text-lg font-black shadow-xl transition-all active:scale-95",
            !audioReady && "cursor-wait"
          )}
        >
          {!audioReady ? (
            /* ESTADO: SÍNTESIS (Fase IV) */
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="tracking-tighter">SINTETIZANDO VOZ...</span>
            </div>
          ) : (
            /* ESTADO: REPRODUCCIÓN (Fase V) */
            <div className="flex items-center gap-2">
              {audioLoading && isCurrentActive ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  {isPlaying && isCurrentActive ? (
                    <><PauseCircle className="mr-2 h-6 w-6" /> PAUSAR</>
                  ) : (
                    <><PlayCircle className="mr-2 h-6 w-6" /> REPRODUCIR</>
                  )}
                </>
              )}
            </div>
          )}
        </Button>

        {/* BARRA TÁCTICA: Social y Herramientas */}
        <div className="flex justify-between items-center bg-black/20 backdrop-blur-md rounded-2xl p-2 px-4 border border-white/5">

          {/* Lógica de Likes */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              disabled={isLiking || !audioReady}
              className="hover:scale-110 transition-transform active:scale-90 disabled:opacity-30"
            >
              <Heart
                className={cn(
                  "h-6 w-6 transition-all duration-300",
                  isLiked ? "fill-red-500 text-red-500 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "text-white opacity-40"
                )}
              />
            </button>
            <span className="text-xs font-black tabular-nums tracking-tight">
              {likeCount}
            </span>
          </div>

          {/* Acciones de Sistema */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              onClick={onShare}
              disabled={!audioReady}
            >
              <Share2 size={18} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
              disabled={!audioReady || isDownloading}
              className={cn(
                "h-10 w-10 rounded-xl transition-all duration-500",
                isOfflineAvailable
                  ? "text-green-400 bg-green-500/10 border border-green-500/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {isDownloading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
            </Button>
          </div>
        </div>

        {/* Indicador de Calidad del Stream */}
        {audioReady && (
          <div className="flex items-center justify-center gap-2 opacity-30 mt-1">
            <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-bold uppercase tracking-[0.3em]">
              Neural Stream 24kHz HQ
            </span>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este componente es el primer beneficiario del desacoplamiento. Al no gestionar 
 * directamente la suscripción a Supabase, puede concentrarse exclusivamente 
 * en reaccionar a las props 'audioReady' e 'isPlaying'. El uso de 'backdrop-blur-md' 
 * en la barra social asegura que la legibilidad se mantenga alta incluso 
 * con la intensidad de color del fondo primario.
 */