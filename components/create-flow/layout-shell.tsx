// components/create-flow/layout-shell.tsx
// VERSIÓN: 2.0 (Master Visual Shell - Situational Awareness & Global Orchestration)

"use client";

import { ReactNode } from "react";
import { useCreationContext } from "./shared/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Loader2, 
  FileText, 
  Wand2, 
  Compass,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * INTERFAZ DE CONTRATO VISUAL
 * Define las acciones que el Orquestador Padre delega en el Caparazón.
 */
interface LayoutShellProps {
  children: ReactNode;
  onNext: () => void;
  onProduce: () => void;
  onDraft: () => void;
  onAnalyzeLocal: () => void; // Gatillo para la rama de turismo local
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
    /**
     * CONTENEDOR RAÍZ:
     * bg-transparent para dejar pasar el fondo Aurora global.
     * h-[100dvh] para estabilidad total en navegadores móviles.
     */
    <div className="fixed inset-0 flex flex-col bg-transparent overflow-hidden h-[100dvh]">
      
      {/* 1. HEADER: Progreso y Branding Situacional (Fijo) */}
      <header className="flex-shrink-0 w-full pt-28 pb-4 px-6 z-50">
        <div className="max-w-4xl mx-auto">
          {!progress.isInitial && !isGenerating && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-700">
              <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col">
                  <h1 className="text-xl md:text-2xl font-black tracking-tighter text-foreground/90 uppercase flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary animate-pulse" />
                    CONSTRUCCIÓN
                  </h1>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                    NicePod Intelligence Studio
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                  {progress.percent}%
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                  style={{ width: `${progress.percent}%` }} 
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. BODY: Escenario de Renderizado (Flexible) */}
      <main className="flex-1 overflow-hidden flex flex-col items-center justify-center">
        <div className={cn(
          "w-full h-full flex flex-col transition-all duration-700",
          progress.isInitial ? "max-w-5xl" : "max-w-4xl px-4"
        )}>
          <Card className={cn(
            "flex-1 flex flex-col overflow-hidden border-0 shadow-none relative",
            !progress.isInitial 
                ? "bg-card/40 backdrop-blur-3xl rounded-3xl border border-border/40 shadow-2xl" 
                : "bg-transparent"
          )}>
            <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden">
              {children}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 3. FOOTER: Navegación Ergonómica (Fijo) */}
      <footer className="flex-shrink-0 w-full p-6 md:p-10 bg-transparent z-50">
        <div className="max-w-4xl mx-auto">
          {!progress.isInitial && !isGenerating && (
            <div className="flex justify-between items-center gap-4">
              
              {/* Botón Universal de Retroceso */}
              <Button 
                variant="ghost" 
                onClick={goBack} 
                className="h-12 px-6 rounded-xl font-bold text-muted-foreground hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> ANTERIOR
              </Button>
              
              <div className="flex items-center gap-3">
                {/* CASO A: Disparador Sensorial (Vivir lo Local) */}
                {currentFlowState === 'LOCAL_DISCOVERY_STEP' ? (
                  <Button 
                    onClick={onAnalyzeLocal} 
                    className="bg-primary text-white rounded-full px-10 h-14 font-black shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Compass className="h-5 w-5 animate-pulse" />
                    INTERPRETAR MI MUNDO
                  </Button>
                ) : 
                
                /* CASO B: Cierre de Investigación (Borrador) */
                currentFlowState === 'DETAILS_STEP' ? (
                  <Button 
                    onClick={onDraft} 
                    className="bg-primary text-white rounded-full px-10 h-14 font-black shadow-xl shadow-primary/30 active:scale-95 transition-all"
                  >
                    <FileText className="mr-2 h-5 w-5" /> CREAR BORRADOR
                  </Button>
                ) : 
                
                /* CASO C: Ejecución Final (Producir) */
                currentFlowState === 'FINAL_STEP' ? (
                  <Button 
                    onClick={onProduce} 
                    disabled={isSubmitting} 
                    className="bg-primary text-white rounded-full px-12 h-14 font-black shadow-2xl shadow-primary/40 active:scale-95 transition-all group"
                  >
                    {isSubmitting ? (
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    ) : (
                        <Wand2 className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    )}
                    PRODUCIR PODCAST
                  </Button>
                ) : (
                  
                /* CASO D: Navegación Estándar */
                  <Button 
                    onClick={onNext} 
                    className="bg-foreground text-background rounded-full px-10 h-14 font-black hover:opacity-90 active:scale-95 transition-all"
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