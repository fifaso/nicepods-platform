// components/create-flow/details-step.tsx

"use client"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Clock, Layers, Brain, Lightbulb, Star } from "lucide-react"
import type { CreationFormData } from "../podcast-creation-form"

interface DetailsStepProps {
  formData: CreationFormData;
  updateFormData: (data: Partial<CreationFormData>) => void;
  isSoloFlow?: boolean;
}

const durationOptions = [
  { id: "short", label: "3-5 min", description: "Quick insights" },
  { id: "medium", label: "5-7 min", description: "Deep dive" },
  { id: "long", label: "8-10 min", description: "Full exploration" },
];

const narrativeDepthOptions = [
  { id: "surface", label: "Surface Level", description: "High-level overview", icon: Lightbulb },
  { id: "detailed", label: "Detailed", description: "In-depth exploration", icon: Brain },
  { id: "comprehensive", label: "Comprehensive", description: "Complete analysis", icon: Star },
];

export function DetailsStep({ formData, updateFormData }: DetailsStepProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6 flex-shrink-0">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-3">
          <Clock className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Fine-tune Your Podcast</h2>
        <p className="text-base text-gray-700 dark:text-gray-300">Define the final details for the script generation.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/60 dark:bg-gray-800/30 p-5 rounded-xl shadow-sm border border-white/50 dark:border-gray-700/30">
          <Label className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 block flex items-center">
            <Clock className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
            Duration *
          </Label>
          <RadioGroup value={formData.duration} onValueChange={(value) => updateFormData({ duration: value })} className="space-y-3">
            {durationOptions.map((option) => (
              <div key={option.id}>
                <RadioGroupItem value={option.id} id={`duration-${option.id}`} className="peer sr-only" />
                <Label
                  htmlFor={`duration-${option.id}`}
                  className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-md border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-100/80 dark:peer-data-[state=checked]:bg-purple-900/30 peer-data-[state=checked]:shadow-md bg-white/80 dark:bg-gray-800/50"
                >
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-base block">{option.label}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option.description}</span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="bg-white/60 dark:bg-gray-800/30 p-5 rounded-xl shadow-sm border border-white/50 dark:border-gray-700/30">
          <Label className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 block flex items-center">
            <Layers className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Narrative Depth *
          </Label>
          <RadioGroup value={formData.narrativeDepth} onValueChange={(value) => updateFormData({ narrativeDepth: value })} className="space-y-3">
            {narrativeDepthOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <div key={option.id}>
                  <RadioGroupItem value={option.id} id={`depth-${option.id}`} className="peer sr-only" />
                  <Label
                    htmlFor={`depth-${option.id}`}
                    className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-md border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-100/80 dark:peer-data-[state=checked]:bg-blue-900/30 peer-data-[state=checked]:shadow-md bg-white/80 dark:bg-gray-800/50"
                  >
                    <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-base block">{option.label}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{option.description}</span>
                    </div>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}