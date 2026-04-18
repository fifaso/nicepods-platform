/**
 * ARCHIVO: components/podcast/sovereign-publish-tool.tsx
 * VERSIÓN: 2.0 (NicePod Sovereign Curation Tool - Knowledge Liberation Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proveer la interfaz de autoridad para la liberación de conocimiento en la Malla,
 * gestionando la transición de estados de 'borrador' a 'publicado' y la asignación de reputación.
 * [REFORMA V2.0]: Sincronización nominal total con PulsePillView V1.4, erradicación 
 * absoluta de abreviaturas y blindaje de tipos en la persistencia.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn, nicepodLog } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Globe,
  Loader2,
  Lock,
  Sparkles,
  TrendingUp
} from "lucide-react";
import React, { useState, useCallback } from "react";

/**
 * INTERFAZ: SovereignPublishToolProperties
 * [FIX V2.0]: Alineación con el contrato de la PulsePillView (podcastIdentification).
 */
interface SovereignPublishToolProperties {
  podcastIdentification: number;
  currentPublicationStatus: 'draft' | 'published' | 'pending_approval' | string;
  isAdministratorOwner: boolean;
  onPublicationSuccessAction?: () => void;
}

/**
 * SovereignPublishTool: La terminal de autoridad para la validación y liberación de capital intelectual.
 */
export function SovereignPublishTool({
  podcastIdentification,
  currentPublicationStatus,
  isAdministratorOwner,
  onPublicationSuccessAction
}: SovereignPublishToolProperties) {
  
  const { supabase: supabaseClient } = useAuth();
  const { toast } = useToast();

  // --- ESTADOS DE PROCESAMIENTO TÉCNICO ---
  const [isPublishingProcessActive, setIsPublishingProcessActive] = useState<boolean>(false);
  const [hasSuccessfullyPublished, setHasSuccessfullyPublished] = useState<boolean>(false);

  // Solo se permite la liberación si el activo reside en estado de borrador privado.
  const isPrivateDraft = currentPublicationStatus === 'draft';

  /**
   * handleKnowledgeLiberationAction:
   * Misión: Ejecutar el commit de autoridad en el Metal para abrir el nodo a la red global.
   */
  const handleKnowledgeLiberationAction = useCallback(async () => {
    if (!isAdministratorOwner || !isPrivateDraft) {
      return;
    }

    setIsPublishingProcessActive(true);
    
    try {
      nicepodLog(`🚀 [SovereignTool] Liberando conocimiento del Nodo #${podcastIdentification}`);

      const { error: databaseUpdateError } = await supabaseClient
        .from('micro_pods')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', podcastIdentification);

      if (databaseUpdateError) {
        throw databaseUpdateError;
      }

      setHasSuccessfullyPublished(true);
      
      toast({
        title: "¡Conocimiento Liberado!",
        description: "Has sumado +10 puntos de reputación como curador industrial.",
      });

      if (onPublicationSuccessAction) {
        onPublicationSuccessAction();
      }

    } catch (exception: any) {
      nicepodLog("🔥 [SovereignTool-Fatal] Error en liberación:", exception.message, 'exceptionInformation');
      
      toast({
        title: "Error de Publicación",
        description: "No se pudo sincronizar la autoridad con la red global.",
        variant: "destructive"
      });
    } finally {
      setIsPublishingProcessActive(false);
    }
  }, [isAdministratorOwner, isPrivateDraft, podcastIdentification, supabaseClient, toast, onPublicationSuccessAction]);

  // Guardia de Visibilidad: El componente se oculta si no hay autoridad o el activo ya es público (excepto tras la acción).
  if (!isAdministratorOwner || (!isPrivateDraft && !hasSuccessfullyPublished)) {
    return null;
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <SovereignToolContainer className="relative overflow-hidden border-primary/20 bg-primary/5 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl">

        {/* Efecto de Brillo Aurora (Atmósfera Técnica) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">

          {/* SECTOR ALFA: IDENTIDAD Y PROMESA DE VALOR */}
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className={cn(
              "p-5 rounded-[2rem] transition-all duration-1000 shadow-inner border border-white/5",
              hasSuccessfullyPublished ? "bg-emerald-500/20 text-emerald-400" : "bg-primary/10 text-primary"
            )}>
              {hasSuccessfullyPublished ? <CheckCircle2 size={32} /> : <Lock size={32} />}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-black text-[9px] uppercase tracking-[0.3em]">
                  Soberanía de Curador
                </Badge>
                {hasSuccessfullyPublished && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Badge className="bg-emerald-600 text-white border-none font-black text-[9px] uppercase">Registro Público</Badge>
                  </motion.div>
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic font-serif">
                {hasSuccessfullyPublished ? "Conocimiento Compartido" : "¿Es valioso para la red?"}
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium max-w-sm uppercase tracking-wider leading-relaxed">
                {hasSuccessfullyPublished
                  ? "Esta píldora de inteligencia industrial ahora alimenta la malla colectiva de NicePod."
                  : "Si este peritaje aporta valor estratégico, libérelo para la comunidad y aumente su impacto."}
              </p>
            </div>
          </div>

          {/* SECTOR OMEGA: ACCIÓN DE AUTORIDAD */}
          <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
            <AnimatePresence mode="wait">
              {!hasSuccessfullyPublished ? (
                <motion.div
                  key="action_button_container"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 text-center md:text-right"
                >
                  <div className="flex items-center justify-center md:justify-end gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1 animate-pulse">
                    <TrendingUp size={12} />
                    Ganar +10 Reputación
                  </div>
                  <Button
                    onClick={handleKnowledgeLiberationAction}
                    disabled={isPublishingProcessActive}
                    className="h-16 px-12 rounded-2xl bg-white text-primary hover:bg-zinc-100 font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] transition-all active:scale-95 group"
                  >
                    {isPublishingProcessActive ? (
                      <><Loader2 className="mr-3 animate-spin" /> Sincronizando Bóveda...</>
                    ) : (
                      <>
                        Liberar Conocimiento
                        <Globe className="ml-3 h-4 w-4 group-hover:rotate-45 transition-transform duration-700" />
                      </>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="success_status_container"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-5 bg-emerald-500/10 px-8 py-5 rounded-[1.8rem] border border-emerald-500/20 shadow-2xl"
                >
                  <Sparkles className="text-emerald-400 animate-pulse" />
                  <div className="text-left">
                    <p className="text-emerald-400 font-black text-xs uppercase tracking-widest">¡Impacto Generado!</p>
                    <p className="text-[9px] text-emerald-500/60 font-bold uppercase tracking-[0.2em]">Visibilidad nominal activa</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </SovereignToolContainer>
    </div>
  );
}

/**
 * SovereignToolContainer: Contenedor táctico de alto contraste.
 */
function SovereignToolContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("border", className)}>
      {children}
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Contract Synchronization: El cambio de 'podcastId' a 'podcastIdentification' resuelve el 
 *    error TS2322 en PulsePillView, sincronizando los dos extremos de la Malla.
 * 2. Zero Abbreviations Policy: Purificación absoluta de términos (isPublishingProcessActive, 
 *    isAdministratorOwner, databaseUpdateError).
 * 3. Atomic Dispatch: La acción de liberación de conocimiento utiliza una coreografía 
 *    asíncrona protegida por estados de carga para evitar colisiones en el Metal (SQL).
 */