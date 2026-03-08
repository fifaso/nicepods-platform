// components/podcast/integrity-shield.tsx
// VERSIÓN: 2.0 (NicePod QA Flow - Full Integrity Standard)
// Misión: Gestionar el ciclo de vida del activo: Error, Construcción, Validación (QA) y Publicación.
// [ESTABILIZACIÓN]: Implementación de lógica de estado explícito para evitar limbos visuales.

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
  Users,
  CheckCircle2
} from 'lucide-react';

/**
 * INTERFAZ: IntegrityShieldProps
 * Define el contrato de resiliencia del podcast.
 */
interface IntegrityShieldProps {
  isFailed: boolean;          // Fallo crítico en la forja de activos
  isConstructing: boolean;    // Fase IV: Materialización de la síntesis
  isOwner: boolean;           // Soberanía: Solo el dueño puede publicar
  status: string;             // 'pending_approval' | 'published' | 'failed'
  listeningProgress: number;  // Progreso auditivo (0-100)
  hasListenedFully: boolean;  // Umbral de validación QA (>95%)
  onPublish: () => Promise<void>; // Disparador de liberación
}

/**
 * IntegrityShield: Orquestador de estados críticos de la Workstation.
 * 
 * Implementa una lógica de visualización que prioriza la información técnica 
 * sobre la estética si el sistema detecta inconsistencia en los activos.
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

  // PROTOCOLO DE SALIDA SILENCIOSA:
  // Si el activo es público y no hay errores, el escudo se repliega totalmente.
  if (!isFailed && !isConstructing && status === 'published') {
    return null;
  }

  return (
    <div className="w-full space-y-4 mb-8">

      {/* 1. NIVEL DE ALERTA: FALLO EN LA FORJA */}
      <AnimatePresence>
        {isFailed && (
          <motion.div
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
                El motor de NicePod detectó una anomalía durante la forja de activos. 
                El proceso ha sido detenido para proteger la integridad de la Bóveda.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. NIVEL DE CONTROL: PROTOCOLO DE VALIDACIÓN (QA FLOW) */}
      {!isFailed && !isConstructing && status === 'pending_approval' && isOwner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2.5rem] border border-primary/20 bg-zinc-950/60 p-6 md:p-8 backdrop-blur-3xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl"
        >
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest leading-none text-white">
                Validación de Soberanía
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
                "w-full md:w-auto h-12 px-8 font-black rounded-full transition-all duration-500 uppercase tracking-widest",
                hasListenedFully
                  ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(5,150,105,0.3)] hover:scale-105"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
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

      {/* 3. NIVEL DE SISTEMA: MALLA DE CONSTRUCCIÓN (Fase IV) */}
      {isConstructing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-[2.5rem] border border-white/5 bg-zinc-950/60 p-8 md:p-12 backdrop-blur-3xl flex flex-col items-center text-center space-y-8 min-h-[400px] justify-center shadow-inner"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[80px] animate-pulse rounded-full" />
            <Construction className="h-16 w-16 text-primary relative z-10 animate-bounce" />
          </div>

          <div className="space-y-3 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
              Sintonizando Frecuencia
            </h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-sm mx-auto font-medium leading-relaxed">
              La IA está materializando tu síntesis. Los activos digitales se están integrando en la malla.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <div className="flex items-center gap-3 text-primary/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-[9px] font-black uppercase tracking-[0.5em]">Forjando Activos Digitales</span>
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

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Estabilidad de Ciclo de Vida: El escudo ahora utiliza estados lógicos 
 *    mutuamente excluyentes. Esto elimina el riesgo de mostrar dos estados 
 *    contradictorios al usuario.
 * 2. Feedback Industrial: La barra de progreso Aurora (animación infinita) 
 *    proporciona feedback constante al usuario, disminuyendo la percepción 
 *    de latencia durante la síntesis.
 * 3. Integridad visual: Se ha elevado el borde a '2.5rem' para mantener la 
 *    cohesión estética con el resto de la Workstation NicePod V2.5.
 */