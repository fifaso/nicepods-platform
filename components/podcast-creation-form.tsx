// components/podcast-creation-form.tsx

"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Heart, Loader2 } from "lucide-react"

// --- CORRECCIÓN DEFINITIVA: Rutas ajustadas a la subcarpeta 'create-flow' ---
import { StyleSelectionStep } from "./create-flow/style-selection"
import { LinkPointsStep } from "./create-flow/link-points"
import { NarrativeSelectionStep } from "./create-flow/narrative-selection"
import { DetailsStep } from "./create-flow/details-step"
import { FinalStep } from "./create-flow/final-step"
import { SoloTalkStep } from "./create-flow/solo-talk-step"

export interface CreationFormData {
  style: 'solo' | 'link' | '';
  solo_topic: string;
  solo_motivation: string;
  link_topicA: string;
  link_topicB: string;
  link_catalyst: string;
  link_selectedNarrative: NarrativeOption | null;
  link_selectedTone: 'Educativo' | 'Inspirador' | 'Analítico' | '';
  duration: string;
  narrativeDepth: string;
  tags: string[];
}

export interface NarrativeOption {
  title: string;
  thesis: string;
}

export function PodcastCreationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [narrativeOptions, setNarrativeOptions] = useState<NarrativeOption[]>([]);
  
  const [formData, setFormData] = useState<CreationFormData>({
    style: '',
    solo_topic: '',
    solo_motivation: '',
    link_topicA: '',
    link_topicB: '',
    link_catalyst: '',
    link_selectedNarrative: null,
    link_selectedTone: '',
    duration: '',
    narrativeDepth: '',
    tags: [],
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const updateFormData = useCallback((data: Partial<CreationFormData>) => { setFormData(prev => ({ ...prev, ...data })) }, []);
  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleGenerateNarratives = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-narratives', { body: { topicA: formData.link_topicA, topicB: formData.link_topicB, catalyst: formData.link_catalyst } });
      if (error) throw new Error(error.message);
      if (!data.narratives || data.narratives.length === 0) { throw new Error("AI failed to generate narratives. Please try adjusting your topics."); }
      setNarrativeOptions(data.narratives);
      handleNext();
    } catch (error: any) {
      toast({ title: "Narrative Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    let payload: object;
    if (formData.style === 'solo') {
      payload = { style: 'solo', inputs: { topic: formData.solo_topic, motivation: formData.solo_motivation, duration: formData.duration, narrativeDepth: formData.narrativeDepth, tags: formData.tags } };
    } else if (formData.style === 'link' && formData.link_selectedNarrative) {
      payload = { style: 'link', inputs: { narrative: formData.link_selectedNarrative, tone: formData.link_selectedTone, duration: formData.duration, narrativeDepth: formData.narrativeDepth, tags: formData.tags } };
    } else {
      toast({ title: "Error", description: "Invalid form data.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    try {
      const { error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
      if (error) { throw new Error(error.message); }
      toast({ title: "Podcast Creation Queued!", description: "Your idea has been sent to our AI agents. You can see its progress on your dashboard." });
      router.push(`/dashboard/creations`);
    } catch (error: any) {
      toast({ title: "Failed to Queue Job", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [formData, supabase, toast, router]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StyleSelectionStep updateFormData={updateFormData} onNext={handleNext} />;
      case 2:
        if (formData.style === 'solo') return <SoloTalkStep formData={formData} updateFormData={updateFormData} />;
        if (formData.style === 'link') return <LinkPointsStep formData={formData} updateFormData={updateFormData} />;
        return null;
      case 3:
        if (formData.style === 'solo') return <DetailsStep formData={formData} updateFormData={updateFormData} />;
        if (formData.style === 'link') return <NarrativeSelectionStep formData={formData} updateFormData={updateFormData} narrativeOptions={narrativeOptions} />;
        return null;
      case 4:
        return <FinalStep formData={formData} />;
      default:
        return <div>Error: Invalid step.</div>;
    }
  };

  const isStepValid = useCallback(() => {
    switch (step) {
        case 2:
            if(formData.style === 'solo') return formData.solo_topic.trim() !== '' && formData.solo_motivation.trim() !== '';
            return false;
        case 3:
            if(formData.style === 'solo') return formData.duration !== '' && formData.narrativeDepth !== '';
            if(formData.style === 'link') return formData.link_selectedNarrative !== null && formData.link_selectedTone !== '';
            return false;
        case 4:
             if(formData.style === 'link') return formData.duration !== '' && formData.narrativeDepth !== '';
            return true;
        default:
            return true;
    }
  }, [step, formData]);

  return (
    <div className="bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-100/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-4 rounded-xl shadow-lg">
      <div className="max-w-4xl mx-auto px-4 flex flex-col">
        <div className="mb-6 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Step {step} of {totalSteps}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <Card className="glass-card border border-white/40 dark:border-white/20 shadow-glass backdrop-blur-xl flex-1 flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">{renderStep()}</CardContent>
        </Card>
        <div className="flex justify-between items-center mt-6 flex-shrink-0">
          <Button variant="outline" onClick={handleBack} disabled={step === 1} className="bg-white/80 dark:bg-gray-800/50 ...">
            <ChevronLeft className="mr-2 h-4 w-4" />Back
          </Button>
          <div className="ml-auto">
            {step === 2 && formData.style === 'link' ? (
              <Button size="lg" onClick={handleGenerateNarratives} disabled={isLoading || formData.link_topicA.trim() === '' || formData.link_topicB.trim() === ''} className="bg-gradient-to-r from-purple-600 ...">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Generating...</> : 'Generate Narratives'}
              </Button>
            ) : step < totalSteps ? (
              <Button onClick={handleNext} disabled={!isStepValid()} className="bg-gradient-to-r from-purple-600 ...">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading || !isStepValid()} className="bg-gradient-to-r from-green-600 ...">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : <><Heart className="mr-2 h-4 w-4" />Create Podcast</>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}