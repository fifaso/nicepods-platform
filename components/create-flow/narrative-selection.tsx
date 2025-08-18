// components/create-flow/narrative-selection.tsx

"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BookOpen } from "lucide-react"
import type { CreationFormData, NarrativeOption } from "../podcast-creation-form"

interface NarrativeSelectionStepProps {
  formData: CreationFormData;
  updateFormData: (data: Partial<CreationFormData>) => void;
  narrativeOptions: NarrativeOption[];
}

export function NarrativeSelectionStep({ formData, updateFormData, narrativeOptions }: NarrativeSelectionStepProps) {
  const handleSelectNarrative = (narrative: NarrativeOption) => {
    updateFormData({ link_selectedNarrative: narrative });
  };

  const handleSelectTone = (tone: 'Educativo' | 'Inspirador' | 'Analítico') => {
    updateFormData({ link_selectedTone: tone });
  };
  
  return (
    <div className="flex flex-col h-full">
        <div className="text-center mb-6 flex-shrink-0">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mb-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose Your Narrative</h2>
            <p className="text-base text-gray-700 dark:text-gray-300">Select one of these creative angles to build your podcast upon.</p>
        </div>
        <div className="space-y-4 flex-1">
            {narrativeOptions.map((narrative, index) => (
                <div 
                  key={index} 
                  onClick={() => handleSelectNarrative(narrative)} 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.link_selectedNarrative?.title === narrative.title 
                      ? 'border-purple-500 bg-purple-100/50 dark:bg-purple-900/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 bg-gray-800/10'
                  }`}
                >
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{narrative.title}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{narrative.thesis}</p>

                    {formData.link_selectedNarrative?.title === narrative.title && (
                        <div className="mt-4">
                            <Label className="font-semibold mb-2 block text-gray-800 dark:text-gray-200">Choose Tone</Label>
                            <RadioGroup onValueChange={(value) => handleSelectTone(value as any)} value={formData.link_selectedTone} className="flex flex-wrap gap-x-4 gap-y-2">
                                <div><RadioGroupItem value="Educativo" id={`tone-edu-${index}`} /><Label htmlFor={`tone-edu-${index}`} className="ml-2 cursor-pointer">Educativo</Label></div>
                                <div><RadioGroupItem value="Inspirador" id={`tone-ins-${index}`} /><Label htmlFor={`tone-ins-${index}`} className="ml-2 cursor-pointer">Inspirador</Label></div>
                                <div><RadioGroupItem value="Analítico" id={`tone-ana-${index}`} /><Label htmlFor={`tone-ana-${index}`} className="ml-2 cursor-pointer">Analítico</Label></div>
                            </RadioGroup>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
}