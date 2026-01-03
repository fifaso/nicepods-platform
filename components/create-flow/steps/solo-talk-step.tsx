// components/create-flow/steps/solo-talk-step.tsx
// VERSIÓN: 2.0 (Aurora Standard - Cognitive Canvas & Focus Logic)

"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  PenTool, 
  Mic2, 
  BrainCircuit,
  MessageSquarePlus
} from "lucide-react";
import { cn } from "@/lib/utils";

import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";

export function SoloTalkStep() {
  const { control, setValue, watch } = useFormContext<PodcastCreationData>();
  const motivationValue = watch('solo_motivation');

  /**
   * SINCRONIZACIÓN TÉCNICA:
   * Generamos el solo_topic (ID de búsqueda) basado en la motivación.
   * Esto asegura que el Backend tenga un título semilla si el usuario no define uno.
   */
  useEffect(() => {
    if (motivationValue && motivationValue.length > 10) {
      const autoTopic = motivationValue.length > 60 
        ? motivationValue.substring(0, 60) + "..." 
        : motivationValue;
      setValue('solo_topic', autoTopic, { shouldValidate: true });
    }
  }, [motivationValue, setValue]);

  const handleVoiceInput = (text: string) => {
    const currentText = motivationValue || '';
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('solo_motivation', newText, { 
      shouldValidate: true, 
      shouldDirty: true 
    });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-4 py-2 justify-between overflow-hidden">
      
      {/* HEADER: Magnetismo Aurora (Consistente con los pasos anteriores) */}
      <header className="text-center mb-4 md:mb-6 pt-2 shrink-0">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-foreground leading-none"
        >
          Siembra tu <span className="text-primary italic">Idea</span>
        </motion.h1>
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 mt-2 flex items-center justify-center gap-2">
          <BrainCircuit size={14} className="text-primary" />
          Libera tu conocimiento para el Agente AI
        </p>
      </header>

      {/* ÁREA DE TRABAJO: El "Lienzo Cognitivo" */}
      <div className="flex-1 flex flex-col min-h-0 relative group">
        {/* Glow de fondo sutil que reacciona al foco (vía CSS o estado si fuera necesario) */}
        <div className="absolute -inset-1 bg-gradient-to-b from-primary/10 to-transparent rounded-[2rem] blur-2xl opacity-0 group-within:opacity-100 transition-opacity duration-1000 pointer-events-none" />

        <div className="flex-1 flex flex-col min-h-0 bg-card/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden relative z-10">
          <FormField
            control={control}
            name="solo_motivation"
            render={({ field }) => (
              <FormItem className="flex-1 flex flex-col min-h-0 space-y-0">
                <FormControl className="flex-1 min-h-0">
                  <div className="relative flex-1 flex flex-col min-h-0">
                    {/* Icono decorativo de marca de agua */}
                    <PenTool className="absolute top-6 right-6 text-white/5 h-24 w-24 -rotate-12 pointer-events-none" />
                    
                    <Textarea
                      placeholder="Ej: Quiero desglosar el concepto de 'Entropía' aplicado a la gestión de equipos modernos..."
                      className={cn(
                        "flex-1 w-full resize-none border-0 focus-visible:ring-0",
                        "text-base md:text-xl font-medium leading-relaxed p-8 md:p-10",
                        "bg-transparent text-foreground placeholder:text-muted-foreground/20",
                        "custom-scrollbar"
                      )}
                      {...field}
                    />
                  </div>
                </FormControl>
                
                {/* FOOTER DEL LIENZO: Acción de Voz e Indicador */}
                <div className="p-6 bg-zinc-900/40 border-t border-white/5 backdrop-blur-md">
                   <div className="flex flex-col gap-4">
                      <VoiceInput 
                        onTextGenerated={handleVoiceInput} 
                        className="w-full h-14 rounded-2xl bg-white/5 border-white/5 hover:bg-white/10 transition-all"
                      />
                      
                      <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-2">
                           <Sparkles size={12} className="text-primary animate-pulse" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-white/30">IA Ready</span>
                        </div>
                        <FormMessage className="text-[10px] font-bold text-destructive uppercase" />
                      </div>
                   </div>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* CAMPO TÉCNICO OCULTO (Para integridad del esquema Zod) */}
      <div className="hidden">
        <FormField 
            control={control} 
            name="solo_topic" 
            render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl></FormItem>} 
        />
      </div>

      {/* ESPACIADO PARA EL FOOTER DEL SHELL */}
      <div className="h-4 md:h-8 shrink-0" />
    </div>
  );
}