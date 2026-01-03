// components/create-flow/layout-shell.tsx
// VERSIÓN: 2.1 (Aurora Shell - Navigation Contrast & Focus Fix)

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
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      
      {/* 1. HEADER: Fijo con Blur para legibilidad del progreso */}
      <header className="flex-shrink-0 w-full pt-20 pb-4 px-6 z-50 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          {!progress.isInitial && !isGenerating && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-700">
              <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col">
                  <h1 className="text-xl md:text-2xl font-black tracking-tighter text-foreground uppercase flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary animate-pulse" />
                    CONSTRUCCIÓN
                  </h1>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                    NicePod Intelligence Studio
                  </span>
                </div>
                <div className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  {progress.percent}%
                </div>
              </div>
              <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out" 
                  style={{ width: `${progress.percent}%` }} 
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. BODY: Escenario central */}
      <main className="flex-1 overflow-hidden flex flex-col items-center justify-center py-4">
        <div className={cn(
          "w-full h-full flex flex-col transition-all duration-700",
          progress.isInitial ? "max-w-5xl" : "max-w-4xl px-4"
        )}>
          <Card className={cn(
            "flex-1 flex flex-col overflow-hidden border-0 shadow-none relative",
            !progress.isInitial 
                ? "bg-card/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl" 
                : "bg-transparent"
          )}>
            <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden">
              {children}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 3. FOOTER: Navegación Blindada con Contraste Garantizado */}
      <footer className="flex-shrink-0 w-full p-6 md:p-10 z-50">
        <div className="max-w-4xl mx-auto">
          {!progress.isInitial && !isGenerating && (
            <div className="flex justify-between items-center gap-4 bg-black/20 dark:bg-white/5 backdrop-blur-md p-2 rounded-[2rem] border border-white/5 shadow-xl">
              
              {/* Botón ANTERIOR: Mejorado para ser legible siempre */}
              <Button 
                variant="ghost" 
                onClick={goBack} 
                className="h-12 px-8 rounded-2xl font-black text-xs tracking-widest text-foreground/70 hover:text-foreground hover:bg-white/10 transition-all uppercase"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> ANTERIOR
              </Button>
              
              <div className="flex items-center gap-3">
                {currentFlowState === 'LOCAL_DISCOVERY_STEP' ? (
                  <Button 
                    onClick={onAnalyzeLocal} 
                    className="bg-primary text-white rounded-2xl px-8 h-14 font-black shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center gap-2 uppercase text-xs tracking-widest"
                  >
                    <Compass className="h-5 w-5 animate-pulse" />
                    INTERPRETAR
                  </Button>
                ) : 
                
                currentFlowState === 'DETAILS_STEP' ? (
                  <Button 
                    onClick={onDraft} 
                    className="bg-primary text-white rounded-2xl px-8 h-14 font-black shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase text-xs tracking-widest"
                  >
                    <FileText className="mr-2 h-5 w-5" /> BORRADOR
                  </Button>
                ) : 
                
                currentFlowState === 'FINAL_STEP' ? (
                  <Button 
                    onClick={onProduce} 
                    disabled={isSubmitting} 
                    className="bg-primary text-white rounded-2xl px-10 h-14 font-black shadow-2xl shadow-primary/30 active:scale-95 transition-all group uppercase text-xs tracking-widest"
                  >
                    {isSubmitting ? (
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    ) : (
                        <Wand2 className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    )}
                    PRODUCIR
                  </Button>
                ) : (
                  
                  /* Botón SIGUIENTE: Color de marca para guiar la acción */
                  <Button 
                    onClick={onNext} 
                    className="bg-foreground text-background dark:bg-white dark:text-black rounded-2xl px-10 h-14 font-black hover:opacity-90 active:scale-95 transition-all uppercase text-xs tracking-widest shadow-xl"
                  >
                    SIGUIENTE <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}