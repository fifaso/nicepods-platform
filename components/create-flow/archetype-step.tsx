// components/create-flow/archetype-step.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField, FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, BookOpen, Compass, Zap, Construction, Shield } from "lucide-react";
import { VoiceInput } from "@/components/ui/voice-input";

export const archetypeOptions = [
    { 
        value: 'archetype-hero', 
        icon: <Shield className="h-7 w-7" />, 
        title: 'El Héroe', 
        description: <span className="hidden md:inline">Narra un viaje de desafío y transformación.</span> 
    },
    { 
        value: 'archetype-sage', 
        icon: <BookOpen className="h-7 w-7" />, 
        title: 'El Sabio', 
        description: <span className="hidden md:inline">Explica un tema complejo con claridad y autoridad.</span> 
    },
    { 
        value: 'archetype-explorer', 
        icon: <Compass className="h-7 w-7" />, 
        title: 'El Explorador', 
        description: <span className="hidden md:inline">Descubre lo nuevo con curiosidad y asombro.</span> 
    },
    { 
        value: 'archetype-rebel', 
        icon: <Zap className="h-7 w-7" />, 
        title: 'El Rebelde', 
        description: <span className="hidden md:inline">Desafía el status quo y propone un cambio radical.</span> 
    },
    { 
        value: 'archetype-creator', 
        icon: <Construction className="h-7 w-7" />, 
        title: 'El Creador', 
        description: <span className="hidden md:inline">Construye una idea desde la visión y la imaginación.</span> 
    },
    { 
        value: 'archetype-caregiver', 
        icon: <Heart className="h-7 w-7" />, 
        title: 'El Cuidador', 
        description: <span className="hidden md:inline">Conecta con la audiencia a través de la empatía.</span> 
    },
];

function ArchetypePreviewCard({ value }: { value: string }) {
    const archetype = archetypeOptions.find(opt => opt.value === value);
    if (!archetype) return null;

    return (
        <Card className="bg-primary/5 border-primary/20 h-full">
            <CardHeader>
                <div className="flex items-center space-x-3 text-primary">
                    {archetype.icon}
                    <CardTitle>{archetype.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription>{archetype.description}</CardDescription>
            </CardContent>
        </Card>
    );
}

export function ArchetypeStep() {
  const { control, watch, setValue, getValues } = useFormContext<PodcastCreationData>();
  const selectedArchetype = watch('selectedArchetype');

  const handleVoiceGoal = (text: string) => {
    const currentText = getValues('archetype_goal') || '';
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('archetype_goal', newText, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Desarrolla tu Historia</h2>
        <p className="text-muted-foreground">Utiliza la estructura de <span className="font-semibold text-primary">{archetypeOptions.find(opt => opt.value === selectedArchetype)?.title || 'tu Arquetipo'}</span> para darle forma a tu idea.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow">
        
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Arquetipo Seleccionado</h3>
            <ArchetypePreviewCard value={selectedArchetype || ''} />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <FormField
            control={control}
            name="archetype_topic"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="archetype_topic">Tema Principal</Label>
                <FormControl>
                  <Input id="archetype_topic" placeholder="Ej: La historia de la inteligencia artificial" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="archetype_goal"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="archetype_goal">Mensaje u Objetivo Final</Label>
                    <VoiceInput onTextGenerated={handleVoiceGoal} placeholder="Describir objetivo" />
                </div>
                <FormControl>
                  <Input id="archetype_goal" placeholder="Ej: Demostrar cómo ha evolucionado para cambiar nuestro mundo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}