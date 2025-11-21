// components/create-flow/QuestionStep.tsx
// Nuevo paso de formulario para la intención "Responder una Pregunta".

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { HelpCircle } from "lucide-react";

export function QuestionStep() {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Responde una Pregunta</h2>
        <p className="text-muted-foreground">Proporciona una respuesta clara y concisa a una duda específica.</p>
      </div>
      <div className="flex-grow">
        <FormField
          control={control}
          name="question_to_answer" // Este campo deberá ser añadido al schema de validación
          render={({ field }) => (
            <FormItem>
              <FormLabel>¿Qué pregunta quieres responder?</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: ¿Cómo funciona la edición genética con CRISPR?"
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