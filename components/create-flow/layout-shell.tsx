// components/create-flow/layout-shell.tsx
// VERSIÓN: 2.3 (Aurora Shell - Syntax Fix & Mobile Density Optimization)

"use client";

import { ReactNode } from "react";
import { useCreationContext } from "./shared/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  FileText, 
  Wand2, 
  Compass,
  Zap,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

export function LayoutShell({ 
  children, 
  onNext, 
  onProduce, 
  onDraft, 
  onAnalyzeLocal,
  isGenerating, 
  isSubmitting,
  progress 
}: LayoutShellProps) {
  const { currentFlowState, goBack } = useCreationContext();

  return (
    <div className="fixed inset-0 flex flex-col bg-transparent overflow-hidden h-[100dvh]">
      
      {/* 1. HEADER: Estabilidad de Progreso y Branding */}
      <header className="flex-shrink-0 w-full pt-16 sm:pt-20 pb-2 px-6 z-50">
        <div className="max-w-4xl mx-auto">
          {!progress.isInitial && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-700">
              <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                    NicePod Studio
                  </span>
                  <h1 className="text-base sm:text-xl font-black tracking-tighter text-foreground uppercase flex items-center gap-2 leading-none">
                    {isGenerating ? "Procesando..." : "Construcción"}
                  </h1>
                </div>
                <div className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  {progress.percent}%
                </div>
              </div>
              <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percent}%` }}
                  transition={{ duration: 1, ease: "circOut" }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. BODY: Escenario central adaptativo */}
      <main className="flex-1 overflow-hidden flex flex-col items-center justify-center p-4 py-2 sm:py-6">
        <div className={cn(
          "w-full h-full flex flex-col transition-all duration-700",
          progress.isInitial ? "max-w-5xl" : "max-w-4xl"
        )}>
          <Card className={cn(
            "flex-1 flex flex-col overflow-hidden border-0 shadow-none relative",
            !progress.isInitial 
                ? "bg-card/40 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl" 
                : "bg-transparent"
          )}>
            <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden">
              {children}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 3. FOOTER: Isla de Navegación Compacta (Contraste Garantizado) */}
      <footer className="flex-shrink-0 w-full p-4 sm:p-10 z-50 mb-4 sm:mb-0">
        <div className="max-w-4xl mx-auto">
          {!progress.isInitial && (
            <div className="bg-zinc-950/80 dark:bg-zinc-900/90 backdrop-blur-3xl p-1.5 sm:p-2 rounded-2xl sm:rounded-[2rem] border border-white/10 shadow-2xl min-h-[60px] flex items-center">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="loader"
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="w-full flex items-center justify-center gap-3 text-primary animate-pulse"
                  >
                    <Sparkles size={14} className="animate-spin-slow" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Escaneando intención...</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="nav"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="w-full flex justify-between items-center gap-2"
                  >
                    {/* Botón ATRÁS: Más compacto para móvil */}
                    <Button 
                      variant="ghost" 
                      onClick={goBack} 
                      className="h-10 sm:h-12 px-3 sm:px-8 rounded-xl sm:rounded-2xl font-black text-[10px] tracking-widest text-foreground/50 hover:text-foreground transition-all uppercase"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" /> ATRÁS
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {currentFlowState === 'LOCAL_DISCOVERY_STEP' ? (
                        <Button onClick={onAnalyzeLocal} className="bg-primary text-white rounded-xl sm:rounded-2xl px-4 sm:px-8 h-10 sm:h-12 font-black shadow-lg shadow-primary/20 text-[10px] tracking-widest uppercase">
                          <Compass className="mr-2 h-4 w-4" /> INTERPRETAR
                        </Button>
                      ) : currentFlowState === 'DETAILS_STEP' ? (
                        <Button onClick={onDraft} className="bg-primary text-white rounded-xl sm:rounded-2xl px-4 sm:px-8 h-10 sm:h-12 font-black shadow-lg shadow-primary/20 text-[10px] tracking-widest uppercase">
                          <FileText className="mr-2 h-4 w-4" /> BORRADOR
                        </Button>
                      ) : currentFlowState === 'FINAL_STEP' ? (
                        <Button onClick={onProduce} disabled={isSubmitting} className="bg-primary text-white rounded-xl sm:rounded-2xl px-5 sm:px-10 h-10 sm:h-12 font-black shadow-2xl text-[10px] tracking-widest uppercase">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                          PRODUCIR
                        </Button>
                      ) : (
                        <Button 
                          onClick={onNext} 
                          className="bg-white text-black dark:bg-white dark:text-black rounded-xl sm:rounded-2xl px-5 sm:px-10 h-10 sm:h-12 font-black hover:opacity-90 transition-all text-[10px] tracking-widest uppercase shadow-xl"
                        >
                          SIGUIENTE <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}