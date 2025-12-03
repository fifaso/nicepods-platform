// components/create-flow/final-step.tsx
// VERSIÓN FINAL: Resumen Ejecutivo "Ticket Style", Cero Scroll y Data Real (Final Title).

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Clock, BrainCircuit, Sparkles, Mic2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FinalStep() {
  const { control, watch } = useFormContext<PodcastCreationData>();
  const formData = watch();

  // Mapeo de etiquetas para mostrar nombres bonitos
  const toneLabel = formData.purpose === 'inspire' ? formData.selectedArchetype : formData.selectedTone;
  const purposeLabel = {
      learn: "Lección",
      inspire: "Historia",
      explore: "Exploración",
      reflect: "Reflexión",
      answer: "Respuesta",
      freestyle: "Freestyle"
  }[formData.purpose] || "Podcast";

  return (
    <div className="flex flex-col h-full w-full justify-center animate-fade-in px-2 md:px-6 overflow-y-auto scrollbar-hide pb-2">
      
      {/* CABECERA */}
      <div className="text-center mb-4 md:mb-6 flex-shrink-0 w-full">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
          Confirma tu Creación
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Todo listo para producir. Revisa los detalles finales.
        </p>
      </div>

      {/* TARJETA RESUMEN "TICKET" */}
      <div className="w-full max-w-2xl mx-auto bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg flex flex-col">
        
        {/* SECCIÓN 1: TÍTULO HEROICO (Lo más importante) */}
        <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/5 text-center bg-gradient-to-b from-white/50 to-transparent dark:from-white/5">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-3 border border-primary/20">
                {purposeLabel}
            </span>
            <h3 className="text-2xl md:text-4xl font-black text-foreground leading-tight tracking-tight">
                {formData.final_title || "Sin Título Definido"}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-3 italic opacity-80 max-w-md mx-auto">
                "Guion validado y listo para locución"
            </p>
        </div>

        {/* SECCIÓN 2: GRID DE DETALLES TÉCNICOS */}
        <div className="grid grid-cols-2 gap-px bg-black/5 dark:bg-white/5">
            
            {/* Duración */}
            <div className="bg-white/40 dark:bg-[#1a1a1a] p-4 flex flex-col items-center justify-center text-center group">
                <Clock className="h-5 w-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Duración</span>
                <span className="text-sm font-semibold text-foreground mt-0.5">{formData.duration}</span>
            </div>

            {/* Profundidad */}
            <div className="bg-white/40 dark:bg-[#1a1a1a] p-4 flex flex-col items-center justify-center text-center group">
                <BrainCircuit className="h-5 w-5 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Nivel</span>
                <span className="text-sm font-semibold text-foreground mt-0.5">{formData.narrativeDepth}</span>
            </div>

            {/* Tono / Arquetipo */}
            <div className="bg-white/40 dark:bg-[#1a1a1a] p-4 flex flex-col items-center justify-center text-center group">
                <Sparkles className="h-5 w-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Tono</span>
                <span className="text-sm font-semibold text-foreground mt-0.5 capitalize">
                    {toneLabel?.replace('archetype-', '') || "Estándar"}
                </span>
            </div>

            {/* Voz */}
            <div className="bg-white/40 dark:bg-[#1a1a1a] p-4 flex flex-col items-center justify-center text-center group">
                <Mic2 className="h-5 w-5 text-pink-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Voz</span>
                <span className="text-sm font-semibold text-foreground mt-0.5">
                    {formData.voiceGender} / {formData.voiceStyle}
                </span>
            </div>
        </div>

        {/* SECCIÓN 3: SWITCH DE AUDIO */}
        <div className="p-5 bg-white/40 dark:bg-black/20 border-t border-black/5 dark:border-white/5">
            <FormField
                control={control}
                name="generateAudioDirectly"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3 shadow-sm">
                    <div className="space-y-0.5 pl-1">
                    <Label htmlFor="generate-audio-switch" className="text-sm font-bold text-primary">Generar Audio Automáticamente</Label>
                    <p className="text-[10px] text-muted-foreground">
                        Creará el archivo MP3 inmediatamente tras guardar.
                    </p>
                    </div>
                    <FormControl>
                    <Switch
                        id="generate-audio-switch"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                    />
                    </FormControl>
                </FormItem>
                )}
            />
        </div>

      </div>
    </div>
  );
}