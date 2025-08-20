// components/create-flow/details-step.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DetailsStep() {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="space-y-6">
       <div className="text-center">
        <h2 className="text-2xl font-bold">Detalles Finales</h2>
        <p className="text-muted-foreground">Ajusta el tono y la duración.</p>
      </div>
      <FormField
        control={control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duración Deseada *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una duración" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Corta (1-2 minutos)">Corta (1-2 minutos)</SelectItem>
                <SelectItem value="Media (3-5 minutos)">Media (3-5 minutos)</SelectItem>
                <SelectItem value="Larga (5-7 minutos)">Larga (5-7 minutos)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
        />
         {/* Puedes añadir más campos como 'narrativeDepth' de la misma manera */}
      </div>
    );
  }