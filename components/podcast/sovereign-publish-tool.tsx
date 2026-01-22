// components/podcast/sovereign-publish-tool.tsx
// VERSIÓN: 1.0 (Sovereign Curation Tool - Knowledge Liberation & Rewards)

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Globe,
  Loader2,
  Lock,
  Sparkles,
  TrendingUp
} from "lucide-react";
import React, { useState } from "react";

interface SovereignPublishToolProps {
  podcastId: number;
  currentStatus: 'draft' | 'published' | 'pending_approval' | string;
  isOwner: boolean;
  onPublished?: () => void;
}

export function SovereignPublishTool({
  podcastId,
  currentStatus,
  isOwner,
  onPublished
}: SovereignPublishToolProps) {
  const { supabase } = useAuth();
  const { toast } = useToast();

  const [isPublishing, setIsPublishing] = useState(false);
  const [hasJustPublished, setHasJustPublished] = useState(false);

  // Solo actuamos sobre borradores privados
  const isPrivate = currentStatus === 'draft';

  const handleLiberateKnowledge = async () => {
    if (!isOwner || !isPrivate) return;

    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('micro_pods')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', podcastId);

      if (error) throw error;

      setHasJustPublished(true);
      toast({
        title: "¡Conocimiento Liberado!",
        description: "Has sumado +10 puntos de reputación como curador.",
      });

      if (onPublished) onPublished();

    } catch (err: any) {
      toast({
        title: "Error de Publicación",
        description: "No se pudo sincronizar con la red global.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOwner || (!isPrivate && !hasJustPublished)) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Card className="relative overflow-hidden border-primary/20 bg-primary/5 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-8">

        {/* Efecto de Brillo Aurora de Fondo */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">

          {/* Lado Izquierdo: Estado y Promesa de Valor */}
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className={cn(
              "p-4 rounded-3xl transition-all duration-700 shadow-inner",
              hasJustPublished ? "bg-emerald-500/20 text-emerald-400" : "bg-primary/10 text-primary"
            )}>
              {hasJustPublished ? <CheckCircle2 size={32} /> : <Lock size={32} />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-black text-[9px] uppercase tracking-widest">
                  Soberanía de Curador
                </Badge>
                {hasJustPublished && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Badge className="bg-emerald-600 text-white border-none font-black text-[9px]">PÚBLICO</Badge>
                  </motion.div>
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
                {hasJustPublished ? "Conocimiento Compartido" : "¿Es valioso para la red?"}
              </h3>
              <p className="text-sm text-muted-foreground font-medium max-w-sm">
                {hasJustPublished
                  ? "Esta píldora de actualidad ahora alimenta la inteligencia colectiva de NicePod."
                  : "Si este podcast aporta valor estratégico, libéralo para la comunidad y aumenta tu impacto."}
              </p>
            </div>
          </div>

          {/* Lado Derecho: Acción y Recompensa */}
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            <AnimatePresence mode="wait">
              {!hasJustPublished ? (
                <motion.div
                  key="publish-btn"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 text-center md:text-right"
                >
                  <div className="flex items-center justify-center md:justify-end gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                    <TrendingUp size={12} />
                    Ganar +10 Reputación
                  </div>
                  <Button
                    onClick={handleLiberateKnowledge}
                    disabled={isPublishing}
                    className="h-14 px-10 rounded-2xl bg-white text-primary hover:bg-zinc-100 font-black uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all active:scale-95 group"
                  >
                    {isPublishing ? (
                      <><Loader2 className="mr-2 animate-spin" /> Sincronizando...</>
                    ) : (
                      <>
                        Liberar Conocimiento
                        <Globe className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                      </>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="success-msg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 bg-emerald-500/10 px-6 py-4 rounded-2xl border border-emerald-500/20"
                >
                  <Sparkles className="text-emerald-400 animate-pulse" />
                  <div className="text-left">
                    <p className="text-emerald-400 font-black text-xs uppercase tracking-tight">¡Impacto Generado!</p>
                    <p className="text-[10px] text-emerald-400/60 font-bold uppercase tracking-widest">Ya eres visible en el Hub</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </Card>
    </div>
  );
}

/**
 * Componente Wrapper para uso en UI interna
 */
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("border rounded-xl", className)}>
      {children}
    </div>
  );
}