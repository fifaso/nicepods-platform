// components/create-flow/solo-talk-step.tsx

"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Lightbulb, Target, Heart } from "lucide-react"
import type { CreationFormData } from "../podcast-creation-form"

interface SoloTalkStepProps {
  formData: CreationFormData;
  updateFormData: (data: Partial<CreationFormData>) => void;
}

export function SoloTalkStep({ formData, updateFormData }: SoloTalkStepProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6 flex-shrink-0">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-3">
          <Lightbulb className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Define Your Topic</h2>
        <p className="text-base text-gray-700 dark:text-gray-300">
          What is the core idea you want to share with the world?
        </p>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="solo_topic" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Target className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
            Topic *
          </Label>
          <Input
            id="solo_topic"
            placeholder="e.g., The Stoic Key to Inner Peace"
            value={formData.solo_topic}
            onChange={(e) => updateFormData({ solo_topic: e.target.value })}
            className="h-11 text-base bg-white/80 dark:bg-gray-800/50 border-white/60 dark:border-gray-700/30 text-gray-900 dark:text-gray-100 placeholder:text-gray-600 dark:placeholder:text-gray-400 shadow-sm focus:shadow-md transition-all duration-200"
            required
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="solo_motivation" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Heart className="h-4 w-4 mr-2 text-red-500 dark:text-red-400" />
            Motivation / Core Message *
          </Label>
          <Textarea
            id="solo_motivation"
            placeholder="e.g., To explain how ancient philosophy can solve modern anxiety..."
            value={formData.solo_motivation}
            onChange={(e) => updateFormData({ solo_motivation: e.target.value })}
            className="text-base bg-white/80 dark:bg-gray-800/50 border-white/60 dark:border-gray-700/30 text-gray-900 dark:text-gray-100 placeholder:text-gray-600 dark:placeholder:text-gray-400 resize-none shadow-sm focus:shadow-md transition-all duration-200"
            rows={4}
            required
          />
        </div>
      </div>
    </div>
  )
}