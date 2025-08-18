// components/create-flow/final-step.tsx

"use client"
import { CheckCircle } from "lucide-react"
import type { CreationFormData } from "../podcast-creation-form"

interface FinalStepProps {
  formData: CreationFormData;
}

export function FinalStep({ formData }: FinalStepProps) {
  const finalTitle = formData.style === 'solo' 
    ? formData.solo_topic 
    : formData.link_selectedNarrative?.title;
    
  return (
    <div className="flex flex-col h-full items-center justify-center text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
        <CheckCircle className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Ready to Create?</h2>
      <p className="text-lg text-gray-700 dark:text-gray-300 max-w-md mb-4">
        You've provided all the necessary details. The AI is ready to craft your micro-podcast.
      </p>
      {finalTitle && (
        <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg w-full max-w-lg">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Podcast Topic:</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">"{finalTitle}"</p>
        </div>
      )}
      <p className="text-sm text-muted-foreground mt-6">
        Click "Create Podcast" below to start the generation process.
      </p>
    </div>
  );
}