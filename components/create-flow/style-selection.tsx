// components/create-flow/style-selection.tsx
"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Link2, GraduationCap } from "lucide-react";
import type { CreationFormData } from "../podcast-creation-form";

interface StyleSelectionStepProps {
  updateFormData: (data: Partial<CreationFormData>) => void;
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
          <h2 className="text-2xl font-bold">Choose Your Creation Style</h2>
          <p className="text-muted-foreground">How do you want to bring your idea to life?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => handleSelectStyle('solo')} className="p-6 rounded-lg border-2 hover:border-primary cursor-pointer transition-colors">
            <Mic className="h-8 w-8 mx-auto text-primary mb-3" />
            <h3 className="font-semibold">Solo Talk</h3>
            <p className="text-sm text-muted-foreground">Provide a topic and motivation.</p>
          </div>
          <div onClick={() => handleSelectStyle('link')} className="p-6 rounded-lg border-2 hover:border-primary cursor-pointer transition-colors">
            <Link2 className="h-8 w-8 mx-auto text-primary mb-3" />
            <h3 className="font-semibold">Link Points</h3>
            <p className="text-sm text-muted-foreground">Connect two ideas with AI narratives.</p>
          </div>
          <div className="p-6 rounded-lg border-2 opacity-50 cursor-not-allowed">
            <div className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full">Soon</div>
            <GraduationCap className="h-8 w-8 mx-auto mb-3" />
            <h3 className="font-semibold">Learning Plan</h3>
            <p className="text-sm text-muted-foreground">Create a series of podcasts.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}