// components/podcast/integrity-shield.tsx
// VERSIÓN: 1.0 (Integrity Shield & QA Flow Standard)
// Misión: Gestionar alertas de producción, progreso de síntesis y el protocolo de publicación (QA).
// [ESTABILIZACIÓN]: Aislamiento de lógica de negocio visual para eliminar ruidos en el Dashboard.

"use client";

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Construction,
  Ear,
  Loader2,
  Lock,
  Users
} from 'lucide-react';

/**
 * INTERFAZ: IntegrityShieldProps
 * Define los estados necesarios para orquestar la resiliencia del podcast.
 */
interface IntegrityShieldProps {
  isFailed: boolean;          // ¿Hubo un error fatal en la forja de audio o imagen?
  isConstructing: boolean;    // ¿Está el sistema en Fase IV de materialización?
  isOwner: boolean;           // ¿Es el usuario el creador soberano del contenido?
  status: string;             // 'pending_approval' | 'published' | 'failed'
  listeningProgress: number;  // Porcentaje real de escucha (0-100)
  hasListenedFully: boolean;  // ¿Se alcanzó el umbral de validación (>95%)?
  onPublish: () => Promise<void>; // Acción para liberar el podcast a la red pública
}

/**
 * IntegrityShield: El orquestador de estados críticos.
 */
export function IntegrityShield({
  isFailed,
  isConstructing,
  isOwner,
  status,
  listeningProgress,
  hasListenedFully,
  onPublish
}: IntegrityShieldProps) {

  // No renderizamos nada si el podcast ya es público y no hay fallos.
  if (!isFailed && !isConstructing && status === 'published') {
    return null;
  }

  return (
    <div className="w-full space-y-4 mb-6">

      {/* 1. NIVEL DE ALERTA: ERROR DE PRODUCCIÓN (Fase IV Fail) */}
      <AnimatePresence>
        {isFailed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 backdrop-blur-2xl rounded-3xl shadow-xl">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                Interrupción de Síntesis
              </AlertTitle>
              <AlertDescription className="text-xs font-medium opacity-80">
                El motor de NicePod detectó una anomalía en la forja de activos.
                Los registros administrativos han sido notificados para su intervención.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. NIVEL DE CONTROL: PROTOCOLO DE VALIDACIÓN (QA FLOW)
          Solo visible para el dueño del podcast si está en espera de aprobación.
      */}
      {isOwner && !isConstructing && !isFailed && status === 'pending_approval' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2rem] border border-primary/20 bg-primary/5 p-4 md:p-5 backdrop-blur-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl"
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight leading-tight">
                Soberanía en Curso
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium mt-1">
                El conocimiento está forjado. Escucha el 95% para publicarlo en la red pública de Madrid.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Indicador de Progreso Circular/Badge */}
            <div className="flex-grow md:flex-grow-0">
              <Button
                onClick={onPublish}
                disabled={!hasListenedFully}
                className={cn(
                  "w-full md:w-auto h-11 px-8 font-black rounded-full transition-all duration-500",
                  hasListenedFully
                    ? "bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)] hover:scale-105 hover:bg-green-500"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
                )}
              >
                {hasListenedFully ? (
                  <><Users className="mr-2 h-4 w-4" /> LIBERAR EN RED</>
                ) : (
                  <><Ear className="mr-2 h-4 w-4" /> VALIDACIÓN QA: {Math.round(listeningProgress)}%</>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. NIVEL DE SISTEMA: MALLA DE CONSTRUCCIÓN (71% Progress)
          Solo visible durante la fase de procesamiento multimedia.
      */}
      {isConstructing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-[2.5rem] border border-white/5 bg-zinc-950/40 p-6 md:p-10 backdrop-blur-3xl flex flex-col items-center text-center space-y-8 min-h-[400px] justify-center shadow-inner"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[60px] animate-pulse rounded-full" />
            <Construction className="h-16 w-16 text-primary relative z-10 animate-bounce" />
          </div>

          <div className="space-y-3 relative z-10">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">
              Sintonizando Frecuencia
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto font-medium leading-relaxed">
              La IA está materializando tu síntesis. La carátula y el audio neuronal aparecerán automáticamente.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <div className="flex items-center gap-3 text-primary/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">Malla Multimedia Activa</span>
            </div>

            {/* Barra de Progreso Aurora */}
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}