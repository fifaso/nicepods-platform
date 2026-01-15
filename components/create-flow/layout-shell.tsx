// components/create-flow/layout-shell.tsx
// VERSIÓN: 2.6 (Aurora Shell - Vertical Expansion & Workspace Mode)

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, FileText, Loader2, Wand2 } from "lucide-react";
import { ReactNode } from "react";
import { useCreationContext } from "./shared/context";

interface LayoutShellProps {
  children: ReactNode;
  onNext: () => void;
  onProduce: () => void;
  onDraft: () => void;
  onAnalyzeLocal: () => void;
  isGenerating: boolean;
  isSubmitting: boolean;
  progress: {
    step: number;
    total: number;
    percent: number;
    isInitial: boolean;
  };
}

export function LayoutShell({ children, onNext, onProduce, onDraft, isSubmitting, progress }: LayoutShellProps) {
  const { currentFlowState, goBack } = useCreationContext();
  const isTransitioning = currentFlowState === 'DRAFT_GENERATION_LOADER';

  return (
    <div className="fixed inset-0 flex flex-col bg-transparent overflow-hidden h-[100dvh]">

      {/* HEADER: Altura fija */}
      <header className="flex-shrink-0 w-full pt-16 sm:pt-20 pb-2 px-6 z-50">
        <div className="max-w-4xl mx-auto">
          {!progress.isInitial && !isTransitioning && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-700">
              <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">NicePod Studio</span>
                  <h1 className="text-base sm:text-xl font-black tracking-tighter text-foreground uppercase">Construcción</h1>
                </div>
                <div className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{progress.percent}%</div>
              </div>
              <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${progress.percent}%` }} />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* BODY: Expansión total / [MEJORA]: Eliminamos items-center y justify-center para permitir stretch vertical */}
      <main className="flex-1 overflow-hidden flex flex-col items-center p-4">
        <div className={cn(
          "w-full flex-1 flex flex-col transition-all duration-700 min-h-0", // min-h-0 es clave para scroll interno
          progress.isInitial ? "max-w-6xl" : "max-w-4xl"
        )}>
          <Card className={cn(
            "flex-1 flex flex-col overflow-hidden border-0 shadow-none relative",
            !progress.isInitial ? "bg-card/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl" : "bg-transparent"
          )}>
            <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden">
              {children}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* FOOTER: Altura fija */}
      <footer className="flex-shrink-0 w-full p-4 sm:p-10 z-50">
        <div className="max-w-4xl mx-auto">
          {!progress.isInitial && !isTransitioning && (
            <div className="bg-zinc-950/80 backdrop-blur-3xl p-1.5 sm:p-2 rounded-2xl sm:rounded-[2rem] border border-white/10 shadow-2xl flex items-center min-h-[64px]">
              <div className="w-full flex justify-between items-center gap-2">
                <Button variant="ghost" onClick={goBack} className="h-10 sm:h-12 px-4 rounded-xl font-black text-[10px] tracking-widest text-foreground/50 uppercase">
                  <ChevronLeft className="mr-1 h-4 w-4" /> ATRÁS
                </Button>
                <div className="flex items-center gap-2">
                  {currentFlowState === 'DETAILS_STEP' ? (
                    <Button onClick={onDraft} className="bg-primary text-white rounded-xl px-8 h-10 sm:h-12 font-black text-[10px] tracking-widest uppercase">
                      <FileText className="mr-2 h-4 w-4" /> BORRADOR
                    </Button>
                  ) : currentFlowState === 'FINAL_STEP' ? (
                    <Button onClick={onProduce} disabled={isSubmitting} className="bg-primary text-white rounded-xl px-6 h-10 sm:h-12 font-black text-[10px] tracking-widest uppercase">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} PRODUCIR
                    </Button>
                  ) : (
                    <Button onClick={onNext} className="bg-white text-black rounded-xl px-6 h-10 sm:h-12 font-black text-[10px] tracking-widest uppercase">
                      SIGUIENTE <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}