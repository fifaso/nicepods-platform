// components/create-flow/details-step.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label"; // Label de shadcn para los RadioItems estilizados

export function DetailsStep() {
  const { control, watch } = useFormContext<PodcastCreationData>();
  // MEJORA: Observamos el valor del 'style' para renderizar condicionalmente el campo de Tono.
  // Esto hace que el componente sea reactivo y se adapte al flujo del usuario.
  const style = watch('style');

  return (
    <div className="flex flex-col space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Detalles Finales</h2>
        <p className="text-muted-foreground">Ajusta los últimos parámetros clave para tu guion.</p>
      </div>
      
      {/* ==================== Campo Condicional: Tono (Solo para 'link') ==================== */}
      {style === 'link' && (
        <FormField
          control={control}
          name="link_selectedTone"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold">Tono de la Narrativa *</FormLabel>
              <FormDescription>Elige la emoción o el enfoque que la IA debe adoptar al conectar tus ideas.</FormDescription>
              <FormControl>
                {/* MEJORA UX: Usamos un RadioGroup visualmente atractivo en lugar de un simple Select. */}
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 pt-2 md:grid-cols-3 gap-4">
                  <FormItem>
                    <FormControl>
                      {/* El input real está oculto para poder estilizar el Label como un botón. */}
                      <RadioGroupItem value="Educativo" id="tone-educational" className="sr-only" />
                    </FormControl>
                    <Label htmlFor="tone-educational" className="flex h-full flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary transition-colors">
                      Educativo
                    </Label>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="Inspirador" id="tone-inspirational" className="sr-only" />
                    </FormControl>
                    <Label htmlFor="tone-inspirational" className="flex h-full flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary transition-colors">
                      Inspirador
                    </Label>
                  </FormItem>
                   <FormItem>
                    <FormControl>
                      <RadioGroupItem value="Analítico" id="tone-analytical" className="sr-only" />
                    </FormControl>
                    <Label htmlFor="tone-analytical" className="flex h-full flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary transition-colors">
                      Analítico
                    </Label>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* ==================== Campo Común: Duración ==================== */}
      <FormField
        control={control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Duración Deseada *</FormLabel>
             <FormDescription>Esto ayudará a la IA a estructurar la longitud del guion.</FormDescription>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecciona una duración aproximada" /></SelectTrigger>
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

      {/* ==================== Campo Común: Profundidad Narrativa ==================== */}
      {/* MEJORA: Añadimos el campo 'narrativeDepth' que faltaba. */}
      <FormField
        control={control}
        name="narrativeDepth"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Profundidad Narrativa *</FormLabel>
            <FormDescription>Elige qué tan profundo quieres que la IA analice el tema.</FormDescription>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecciona un nivel de profundidad" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Superficial">Superficial (Introducción al tema)</SelectItem>
                <SelectItem value="Intermedia">Intermedia (Análisis detallado)</SelectItem>
                <SelectItem value="Profunda">Profunda (Exploración de experto)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}