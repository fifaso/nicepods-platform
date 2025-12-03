// components/create-flow/final-step.tsx
// VERSIÓN FINAL "RECEIPT": Diseño compacto, tipografía ajustada y cero desbordamiento.

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

  // Limpieza de etiquetas
  const toneLabel = formData.purpose === 'inspire' 
    ? formData.selectedArchetype?.replace('archetype-', '') 
    : formData.selectedTone;

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
      
      <div className="text-center mb-4 flex-shrink-0 w-full">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
          Confirmar Producción
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Revisa los detalles finales antes de lanzar.
        </p>
      </div>

      {/* TICKET DIGITAL */}
      <div className="w-full max-w-xl mx-auto bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg flex flex-col">
        
        {/* CABECERA DE TICKET (Título) */}
        <div className="p-6 border-b border-black/5 dark:border-white/5 text-center relative overflow-hidden">
            {/* Fondo decorativo sutil */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
            <span className="relative inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20 mb-3">
                {purposeLabel}
            </span>
            
            {/* Título con ajuste automático de tamaño */}
            <h3 className="relative text-xl md:text-2xl font-black text-foreground leading-tight tracking-tight line-clamp-3 px-2">
                {formData.final_title || "Sin Título"}
            </h3>
            
            <p className="relative text-[10px] md:text-xs text-muted-foreground mt-2 italic">
                "Guion validado • Listo para locución"
            </p>
        </div>

        {/* CUERPO DE TICKET (Metadatos en Fila) */}
        <div className="grid grid-cols-4 divide-x divide-black/5 dark:divide-white/5 bg-white/40 dark:bg-white/5">
            {[
              { icon: Clock, label: "Tiempo", value: formData.duration.split(' ')[0] }, // Solo "Corta/Media/Larga"
              { icon: BrainCircuit, label: "Nivel", value: formData.narrativeDepth },
              { icon: Sparkles, label: "Tono", value: toneLabel },
              { icon: Mic2, label: "Voz", value: formData.voiceGender === "Masculino" ? "Masc." : "Fem." }
            ].map((item, i) => (
              <div key={i} className="p-3 flex flex-col items-center justify-center text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <item.icon className="h-4 w-4 text-primary/70 mb-1" />
                  <span className="text-[9px] uppercase text-muted-foreground font-bold">{item.label}</span>
                  <span className="text-xs font-semibold text-foreground capitalize truncate w-full px-1">
                    {item.value || "-"}
                  </span>
              </div>
            ))}
        </div>

        {/* PIE DE TICKET (Acción) */}
        <div className="p-4 bg-black/5 dark:bg-black/20 border-t border-black/5 dark:border-white/5">
            <FormField
                control={control}
                name="generateAudioDirectly"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between bg-background/50 rounded-xl p-3 border border-border/50">
                    <div className="space-y-0.5">
                      <Label htmlFor="audio-switch" className="text-sm font-semibold text-foreground cursor-pointer">Generar Audio</Label>
                      <p className="text-[10px] text-muted-foreground">Crear archivo MP3 automáticamente.</p>
                    </div>
                    <FormControl>
                    <Switch
                        id="audio-switch"
                        checked={field.value}
                        onCheckedChange={field.onChange}
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