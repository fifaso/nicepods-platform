"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Mic, Link2, GraduationCap } from "lucide-react";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";

// Se actualizan los tipos para ser consistentes con el formulario principal
interface StyleSelectionStepProps {
  updateFormData: (data: Partial<PodcastCreationData>) => void;
  onNext: () => void;
}

export function StyleSelectionStep({ updateFormData, onNext }: StyleSelectionStepProps) {
  const handleSelectStyle = (style: 'solo' | 'link') => {
    updateFormData({ style });
    onNext();
  };

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardContent className="p-0">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Elige tu Estilo Creativo</h2>
          <p className="text-muted-foreground">¿Cómo quieres darle vida a tu idea?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => handleSelectStyle('solo')} className="p-6 rounded-lg border-2 hover:border-primary cursor-pointer transition-colors">
            <Mic className="h-8 w-8 mx-auto text-primary mb-3" />
            <h3 className="font-semibold">Monólogo</h3>
            <p className="text-sm text-muted-foreground">Proporciona un tema y una motivación.</p>
          </div>
          <div onClick={() => handleSelectStyle('link')} className="p-6 rounded-lg border-2 hover:border-primary cursor-pointer transition-colors">
            <Link2 className="h-8 w-8 mx-auto text-primary mb-3" />
            <h3 className="font-semibold">Unir Ideas</h3>
            <p className="text-sm text-muted-foreground">Conecta dos conceptos con narrativas de IA.</p>
          </div>
          <div className="relative p-6 rounded-lg border-2 opacity-50 cursor-not-allowed">
            <div className="absolute top-2 right-2 text-xs font-bold px-2 py-1 bg-muted rounded-full">Próximamente</div>
            <GraduationCap className="h-8 w-8 mx-auto mb-3" />
            <h3 className="font-semibold">Plan de Aprendizaje</h3>
            <p className="text-sm text-muted-foreground">Crea una serie de podcasts.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}