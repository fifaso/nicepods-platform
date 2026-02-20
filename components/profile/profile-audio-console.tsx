// components/profile/profile-audio-console.tsx
// VERSIÓN: 1.0 (NicePod Profile Audio Terminal - Performance Standard)
// Misión: Proveer el control de escucha inteligente y las acciones de resonancia social.
// [ESTABILIZACIÓN]: Sincronía con el estado 'audioReady' y optimización de densidad visual.

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
 * INTERFAZ: ProfileAudioConsoleProps
 * Contrato de datos para sincronizar la UI con el estado global de la Workstation.
 */
interface ProfileAudioConsoleProps {
  audioReady: boolean;         // Señal de integridad de la base de datos
  audioLoading: boolean;       // Estado de buffer del reproductor global
  isPlaying: boolean;          // ¿El audio está en ejecución?
  isCurrentActive: boolean;    // ¿Este podcast es la frecuencia activa?
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
 * ProfileAudioConsole: La consola de operaciones de audio para la vista de perfil.
 */
export function ProfileAudioConsole({
  audioReady,
  audioLoading,
  isPlaying,
  isCurrentActive,
  likeCount,
  isLiked,
  isLiking,
  isOfflineAvailable,
  isDownloading,
  onPlay,
  onLike,
  onDownload,
  onShare
}: ProfileAudioConsoleProps) {

  return (
    <Card className={cn(
      "bg-primary text-white border-none shadow-2xl rounded-[2.2rem] overflow-hidden relative group transition-all duration-700",
      !audioReady && "opacity-70 saturate-50 translate-y-2 cursor-wait"
    )}>
      {/* CAPA ATMOSFÉRICA: Gradiente Aurora dinámico */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />

      <CardHeader className="pb-3 pt-6 px-6 relative text-center md:text-left">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-2 opacity-80">
          <Mic className="h-3.5 w-3.5" />
          Estación de Escucha
        </CardTitle>
      </CardHeader>

      <CardContent className="relative flex flex-col gap-4 pb-6 px-6">

        {/* CONTROL PRINCIPAL DE EMISIÓN */}
        <Button
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          disabled={(!audioReady) || (audioLoading && isCurrentActive)}
          className={cn(
            "w-full bg-white text-primary hover:bg-zinc-100 rounded-2xl h-14 text-base font-black shadow-xl transition-all active:scale-95",
            !audioReady && "animate-pulse"
          )}
        >
          {!audioReady ? (
            /* ESTADO: SÍNTESIS DE VOZ NEURONAL */
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="tracking-tighter">SINTETIZANDO VOZ...</span>
            </div>
          ) : (
            /* ESTADO: DISPONIBLE PARA REPRODUCCIÓN */
            <div className="flex items-center gap-2">
              {audioLoading && isCurrentActive ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  {isPlaying && isCurrentActive ? (
                    <><PauseCircle className="mr-2 h-6 w-6 fill-primary/10" /> PAUSAR</>
                  ) : (
                    <><PlayCircle className="mr-2 h-6 w-6 fill-primary/10" /> REPRODUCIR</>
                  )}
                </>
              )}
            </div>
          )}
        </Button>

        {/* BARRA TÁCTICA: Resonancia y Herramientas */}
        <div className="flex justify-between items-center bg-black/20 backdrop-blur-md rounded-2xl p-2 px-4 border border-white/5">

          {/* Lógica de Resonancia (Likes) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              disabled={isLiking || !audioReady}
              className="hover:scale-110 transition-transform active:scale-90 disabled:opacity-30"
              aria-label="Anclar Resonancia"
            >
              <Heart
                className={cn(
                  "h-6 w-6 transition-all duration-300",
                  isLiked ? "fill-red-500 text-red-500 filter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "text-white opacity-40"
                )}
              />
            </button>
            <span className="text-xs font-black tabular-nums tracking-tighter">
              {likeCount}
            </span>
          </div>

          {/* Acciones de Sistema y PWA */}
          <div className="flex gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.();
              }}
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

        {/* FEEDBACK DE CALIDAD SÓNICA */}
        {audioReady && (
          <div className="flex items-center justify-center gap-2 opacity-30 mt-1">
            <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">
              Neural Sync 24kHz HQ
            </span>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este componente implementa el 'Event Guard' mediante e.stopPropagation() en todas 
 * sus acciones internas. Esto es vital en la vista de perfil para asegurar que 
 * la interacción con la consola no dispare accidentalmente eventos del layout 
 * superior o del SmoothScrollWrapper. La densidad de 24px entre elementos garantiza 
 * una usabilidad táctica perfecta en dispositivos móviles.
 */