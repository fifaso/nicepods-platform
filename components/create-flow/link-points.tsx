// components/create-flow/link-points.tsx
"use client"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lightbulb, Link2 } from "lucide-react";
import type { CreationFormData } from "../podcast-creation-form";

interface LinkPointsStepProps {
  formData: CreationFormData;
  updateFormData: (data: Partial<CreationFormData>) => void;
}

export function LinkPointsStep({ formData, updateFormData }: LinkPointsStepProps) {
  return (
    <div>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3"><Link2 className="h-6 w-6 text-primary" /></div>
        <h2 className="text-2xl font-bold">Link Your Points</h2>
        <p className="text-muted-foreground">Provide two concepts for the AI to connect.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <Label htmlFor="link_topicA">Topic A *</Label>
          <Input id="link_topicA" value={formData.link_topicA} onChange={(e) => updateFormData({ link_topicA: e.target.value })} placeholder="e.g., Stoic Philosophy" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="link_topicB">Topic B *</Label>
          <Input id="link_topicB" value={formData.link_topicB} onChange={(e) => updateFormData({ link_topicB: e.target.value })} placeholder="e.g., Modern Productivity" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="link_catalyst" className="flex items-center"><Lightbulb className="h-4 w-4 mr-2 text-yellow-500"/>Creative Catalyst (Optional)</Label>
        <Input id="link_catalyst" value={formData.link_catalyst} onChange={(e) => updateFormData({ link_catalyst: e.target.value })} placeholder="e.g., from a neuroscience perspective" />
      </div>
    </div>
  );
}