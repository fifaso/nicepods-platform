// components/create-flow/solo-talk-step.tsx
// VERSIÓN: 18.0 (Final Architecture: Pure Native Flexbox - No Hacks)

"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";

export function SoloTalkStep() {
  const { control, setValue, watch } = useFormContext<PodcastCreationData>();
  const motivationValue = watch('solo_motivation');

  // Lógica de autocompletado del título (Mantenemos la lógica de negocio intacta)
  useEffect(() => {
    if (motivationValue) {
      const autoTopic = motivationValue.length > 50 
        ? motivationValue.substring(0, 50) + "..." 
        : motivationValue;
      setValue('solo_topic', autoTopic, { shouldValidate: true });
    }
  }, [motivationValue, setValue]);

  const handleVoiceInput = (text: string) => {
    const currentText = motivationValue || '';
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('solo_motivation', newText, { shouldValidate: true, shouldDirty: true });
  };

  return (
    // CONTENEDOR PRINCIPAL:
    // h-full: Ocupa el 100% del espacio que le da el padre (que ya tiene 100dvh).
    // overflow-hidden: Evita que el scroll de la página global se active.
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 overflow-hidden">
      
      {/* 
         BLOQUE 1: HEADER
         - flex-shrink-0: Le decimos al navegador "Este bloque es sagrado, no lo encojas".
         - Siempre visible.
      */}
      <div className="flex-shrink-0 py-2 md:py-4 text-center">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-foreground drop-shadow-sm truncate">
          Cuéntanos tu idea
        </h2>
        <p className="text-[10px] md:text-sm text-muted-foreground font-medium mt-0.5 md:mt-1 truncate">
          Habla o escribe libremente.
        </p>
      </div>

      <div className="hidden">
        <FormField control={control} name="solo_topic" render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl></FormItem>} />
      </div>

      {/* 
         BLOQUE 2: ÁREA DE TRABAJO (Elástica)
         - flex-1: "Ocupa todo el espacio que sobra".
         - min-h-0: "Puedes encogerte hasta 0 píxeles si hace falta". ESTA ES LA CLAVE.
         Sin min-h-0, el flexbox se niega a encogerse más allá del contenido del textarea.
      */}
      <div className="flex-1 flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm">
        
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex flex-col h-full w-full space-y-0">
              
              <FormControl>
                {/* 
                   TEXTAREA
                   - h-full: Llena el contenedor elástico.
                   - resize-none: Evita tiradores manuales.
                   - Al no tener altura fija, fluirá con el contenedor padre.
                */}
                <Textarea
                  placeholder="Ej: Quiero explorar el impacto accidental de la ciencia..."
                  className="h-full w-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide" 
                  {...field}
                />
              </FormControl>
              
              {/* 
                 BLOQUE 3: BOTONERA VOZ
                 - flex-shrink-0: "Sagrado". No se encoge.
                 - Al estar dentro del flex-col, siempre se pintará al final del bloque gris.
              */}
              <div className="flex-shrink-0 p-3 md:p-4 bg-gradient-to-t from-white/95 via-white/90 dark:from-black/90 dark:via-black/80 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-md z-10">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
              </div>

            </FormItem>
          )}
        />
      </div>

      {/* Espaciador de seguridad para separar visualmente del footer global */}
      <div className="h-2 flex-shrink-0" />

    </div>
  );
}