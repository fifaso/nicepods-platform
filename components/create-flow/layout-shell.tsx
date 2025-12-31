// components/create-flow/layout-shell.tsx
// VERSIÓN: 1.0 (Master Visual Shell - Transparency & Viewport Safety)

"use client";

import { ReactNode } from "react";
import { useCreationContext } from "./shared/context";
import { useFlowNavigation } from "./hooks/use-flow-navigation";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Sparkles, Loader2, FileText, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutShellProps {
  children: ReactNode;
  onNext: () => void;
  onProduce: () => void;
  onDraft: () => void;
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
  isGenerating, 
  isSubmitting,
  progress 
}: LayoutShellProps) {
  const { currentFlowState, goBack } = useCreationContext();

  return (
    <div className="fixed inset-0 flex flex-col bg-transparent overflow-hidden h-[100dvh]">
      
      {/* 1. HEADER: Progreso y Branding (Fijo) */}
      <header className="flex-shrink-0 w-full pt-24 md:pt-14 pb-4 px-6 z-50">
        <div className="max-w-4xl mx-auto">
          {!progress.isInitial && !isGenerating && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-700">
              <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col">
                  <h1 className="text-xl md:text-2xl font-black tracking-tighter text-foreground/90 uppercase">
                    Construcción
                  </h1>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                    Paso {progress.step} de {progress.total}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                  {progress.percent}%
                </div>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                  style={{ width: `${progress.percent}%` }} 
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. BODY: Step Renderer (Flexible con Scroll Interno) */}
      <main className="flex-1 overflow-hidden flex flex-col items-center justify-center">
        <div className={cn(
          "w-full h-full flex flex-col transition-all duration-700",
          progress.isInitial ? "max-w-5xl" : "max-w-4xl px-4"
        )}>
          <Card className={cn(
            "flex-1 flex flex-col overflow-hidden border-0 shadow-none relative",
            !progress.isInitial ? "bg-card/40 backdrop-blur-3xl rounded-3xl border border-border/40 shadow-2xl" : "bg-transparent"
          )}>
            <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden">
              {children}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 3. FOOTER: Navegación (Fijo y Ergonómico) */}
      <footer className="flex-shrink-0 w-full p-6 md:p-8 bg-transparent z-50">
        <div className="max-w-4xl mx-auto">
          {!progress.isInitial && !isGenerating && currentFlowState !== 'LOCAL_DISCOVERY_STEP' && (
            <div className="flex justify-between items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={goBack} 
                className="h-12 px-6 rounded-xl font-bold text-muted-foreground/80 hover:bg-white/10"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> ANTERIOR
              </Button>
              
              <div className="flex items-center gap-3">
                {currentFlowState === 'DETAILS_STEP' ? (
                  <Button onClick={onDraft} className="bg-primary text-white rounded-full px-8 h-12 font-bold shadow-lg">
                    <FileText className="mr-2 h-4 w-4" /> GENERAR BORRADOR
                  </Button>
                ) : currentFlowState === 'FINAL_STEP' ? (
                  <Button onClick={onProduce} disabled={isSubmitting} className="bg-primary text-white rounded-full px-10 h-12 font-black shadow-xl group">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4 group-hover:rotate-12" />}
                    PRODUCIR
                  </Button>
                ) : (
                  <Button onClick={onNext} className="bg-foreground text-background rounded-full px-8 h-12 font-bold">
                    SIGUIENTE <ChevronRight className="ml-1 h-4 w-4" />
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