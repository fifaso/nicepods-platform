// components/podcast/integrity-shield.tsx
// VERSIÓN: 2.1 (NicePod QA Flow - Topological Stability Edition)
// Misión: Orquestar la resiliencia del podcast desde la Forja hasta la Liberación Pública.
// [ESTABILIZACIÓN]: Implementación de lógica de exclusión mutua para evitar "flashing" de interfaz.

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
 */
interface IntegrityShieldProps {
  isFailed: boolean;
  isConstructing: boolean;
  isOwner: boolean;
  status: string;
  listeningProgress: number;
  hasListenedFully: boolean;
  onPublish: () => Promise<void>;
}

/**
 * IntegrityShield: Orquestador de estados críticos.
 * 
 * [ESTRATEGIA VISUAL]: 
 * Se ha optimizado para mantener un flujo lógico estricto: Error > Construcción > QA.
 * La exclusión mutua garantiza que el usuario nunca vea estados solapados.
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

  // PROTOCOLO DE REPLIEGUE:
  // Si el podcast es público y no hay errores, el escudo se oculta para no restar espacio.
  if (!isFailed && !isConstructing && status === 'published') {
    return null;
  }

  return (
    <div className="w-full space-y-4 mb-8">
      <AnimatePresence mode="wait">

        {/* 1. NIVEL DE ALERTA: FALLO EN LA FORJA */}
        {isFailed && (
          <motion.div
            key="error-state"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Alert variant="destructive" className="border-red-900/50 bg-red-950/20 rounded-[2rem] shadow-xl">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                Fallo Crítico de Síntesis
              </AlertTitle>
              <AlertDescription className="text-xs font-medium text-red-200/80">
                El motor de NicePod detectó una anomalía durante la forja.
                El proceso ha sido detenido para proteger la integridad de la Bóveda.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* 2. NIVEL DE SISTEMA: MALLA DE CONSTRUCCIÓN (Fase IV) */}
        {isConstructing && (
          <motion.div
            key="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-[2.5rem] border border-white/5 bg-zinc-950/60 p-8 md:p-12 backdrop-blur-3xl flex flex-col items-center text-center space-y-8 min-h-[400px] justify-center shadow-inner"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-[80px] animate-pulse rounded-full" />
              <Construction className="h-16 w-16 text-primary relative z-10 animate-bounce" />
            </div>

            <div className="space-y-3 relative z-10">
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">
                Sintonizando Frecuencia
              </h2>
              <p className="text-zinc-400 text-sm md:text-base max-w-sm mx-auto font-medium leading-relaxed">
                La IA está materializando tu síntesis. Los activos digitales se están integrando en la malla.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              <div className="flex items-center gap-3 text-primary/60">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Malla Multimedia Activa</span>
              </div>

              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. NIVEL DE CONTROL: PROTOCOLO DE VALIDACIÓN (QA FLOW) */}
        {!isFailed && !isConstructing && status === 'pending_approval' && isOwner && (
          <motion.div
            key="qa-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-[2.5rem] border border-primary/20 bg-zinc-950/60 p-6 md:p-8 backdrop-blur-3xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl"
          >
            <div className="flex items-center gap-5 text-center md:text-left">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest leading-none text-white">
                  Soberanía en Curso
                </h3>
                <p className="text-[11px] text-zinc-400 font-medium mt-2 max-w-sm">
                  La forja ha concluido. Valida la integridad escuchando el 95% de la pieza para activar el permiso de publicación.
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <Button
                onClick={onPublish}
                disabled={!hasListenedFully}
                className={cn(
                  "w-full md:w-auto h-12 px-8 font-black rounded-full transition-all duration-500 uppercase tracking-widest text-xs",
                  hasListenedFully
                    ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)] hover:scale-105 hover:bg-emerald-500"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60"
                )}
              >
                {hasListenedFully ? (
                  <><Users className="mr-2 h-4 w-4" /> LIBERAR EN RED</>
                ) : (
                  <><Ear className="mr-2 h-4 w-4" /> QA: {Math.round(listeningProgress)}%</>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (IntegrityShield V2.1):
 * 1. Exclusión Mutua (Mode: "wait"): Al configurar AnimatePresence con mode="wait", 
 *    garantizamos que un estado no se superponga sobre el otro, eliminando 
 *    el parpadeo visual durante la transición de 'Constructing' a 'QA Flow'.
 * 2. Bloqueo de UI: El escudo ahora ocupa espacio en el layout de forma inteligente 
 *    para evitar que los componentes inferiores salten de posición cuando el 
 *    escudo se oculta.
 * 3. Integridad del Contrato: La lógica es ahora declarativa y lineal, facilitando 
 *    auditorías futuras sobre el estado de la forja.
 */