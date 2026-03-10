// components/podcast/audio-console.tsx
// VERSIÓN: 3.0 (NicePod Audio Terminal - Resilient Interaction Standard)
// Misión: Proveer el control de escucha inteligente y las acciones sociales del curador.
// [ESTABILIZACIÓN]: Implementación de estados de error explícitos y lógica de interacción protegida.

"use client";

import {
  AlertTriangle,
  Download,
  Heart,
  Loader2,
  PauseCircle,
  PlayCircle,
  Radio,
  Share2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

  /**
   * [SANEAMIENTO DE ESTADO]:
   * isSyncing: Estamos en fase de construcción activa.
   * isStalled: El audio NO está listo y YA NO está construyendo (Error de Forja).
   */
  const isSyncing = isConstructing && !audioReady;
  const isStalled = !isConstructing && !audioReady;
  const canInteract = audioReady && !isSyncing;

  return (
    <Card className={cn(
      "bg-zinc-950/80 backdrop-blur-3xl border border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden transition-all duration-700",
      isSyncing && "ring-1 ring-primary/20"
    )}>

      {/* CAPA ATMOSFÉRICA */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/40 pointer-events-none" />

      <CardHeader className="pb-2 pt-6 px-6 relative">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-2 text-primary">
          <Radio className="h-3.5 w-3.5" />
          Terminal de Resonancia
        </CardTitle>
      </CardHeader>

      <CardContent className="relative flex flex-col gap-5 pb-6 px-6">

        {/* BOTÓN MAESTRO DE ACCIÓN: Reactividad mejorada */}
        <Button
          size="lg"
          onClick={onPlay}
          disabled={isSyncing || isStalled}
          className={cn(
            "w-full rounded-2xl h-14 text-sm font-black shadow-xl transition-all active:scale-95 uppercase tracking-widest",
            isSyncing || isStalled
              ? "bg-zinc-900 text-zinc-500 cursor-wait border border-white/5"
              : "bg-white text-black hover:bg-zinc-200 hover:scale-[1.02]"
          )}
        >
          {isSyncing ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Sintetizando...</span>
            </div>
          ) : isStalled ? (
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <span>Forja Detenida</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {audioLoading && isCurrentActive ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  {isPlaying && isCurrentActive ? (
                    <><PauseCircle className="mr-2 h-6 w-6" /> Pausar Crónica</>
                  ) : (
                    <><PlayCircle className="mr-2 h-6 w-6" /> Escuchar</>
                  )}
                </>
              )}
            </div>
          )}
        </Button>

        {/* BARRA TÁCTICA: Social */}
        <div className="flex justify-between items-center bg-black/40 backdrop-blur-md rounded-2xl p-2 px-4 border border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); onLike(); }}
              disabled={isLiking || !canInteract}
              className="hover:scale-110 transition-transform active:scale-90 disabled:opacity-30"
              aria-label="Resonar con este nodo"
            >
              <Heart
                className={cn(
                  "h-6 w-6 transition-all duration-300",
                  isLiked ? "fill-primary text-primary" : "text-white opacity-40 hover:opacity-100"
                )}
              />
            </button>
            <span className="text-[10px] font-black tabular-nums tracking-widest text-zinc-400">
              {likeCount}
            </span>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              onClick={onShare}
              disabled={!canInteract}
              title="Compartir nodo"
            >
              <Share2 size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onDownload(); }}
              disabled={!canInteract || isDownloading}
              className={cn(
                "h-10 w-10 rounded-xl transition-all duration-500",
                isOfflineAvailable
                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
              title="Acceso offline"
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={18} />}
            </Button>
          </div>
        </div>

        {/* ESTADOS DE SISTEMA */}
        {audioReady && (
          <div className="flex items-center justify-center gap-2 opacity-30 mt-1">
            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">NicePod Stream 24kHz HQ</span>
          </div>
        )}

        {isStalled && (
          <div className="flex items-center justify-center gap-2 text-red-500/80 mt-1">
            <AlertTriangle size={10} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Error en nodo: contacte a soporte</span>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Resiliencia Operacional: Se añadió el estado 'isStalled' para gestionar casos 
 *    donde el podcast ya no está construyéndose, pero no está listo. Esto evita 
 *    el bloqueo visual del usuario, permitiendo un manejo de error profesional.
 * 2. Bloqueo de UI: El botón Play ahora se deshabilita preventivamente si el activo 
 *    está fallido, evitando interacciones inútiles contra la API de audio.
 * 3. Feedback Táctil: Las interacciones de estado (loading/syncing) son ahora 
 *    claramente distintas, mejorando la percepción de calidad del sistema.
 */