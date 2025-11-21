// components/create-flow/LegacyStep.tsx
// Nuevo paso de formulario para la intención "Reflexionar / Documentar".

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { PenSquare } from "lucide-react";

export function LegacyStep() {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
          <PenSquare className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Deja tu Legado</h2>
        <p className="text-muted-foreground">¿Qué sabiduría quieres preservar? Captura una experiencia o lección importante.</p>
      </div>
      <div className="flex-grow">
        <FormField
          control={control}
          name="legacy_lesson" // Este campo deberá ser añadido al schema de validación
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe la lección de vida o experiencia clave que quieres compartir:</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Aprendí que la vulnerabilidad no es una debilidad, sino la puerta de entrada a la conexión auténtica. Recuerdo una vez que..."
                  className="resize-none min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}