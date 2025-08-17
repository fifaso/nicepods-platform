"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  ChevronRight,
  Mic,
  Clock,
  Users,
  BookOpen,
  Lightbulb,
  Target,
  Heart,
  Brain,
  Zap,
  Star,
  Layers,
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { FormData } from "@/types/podcast"

interface FormatOption {
  id: string
  label: string
  description: string
  icon: typeof Users
  color: "purple" | "blue" | "indigo"
}

interface DurationOption {
  id: string
  label: string
  description: string
  icon: typeof Zap
}

interface NarrativeDepthOption {
  id: string
  label: string
  description: string
  icon: typeof Lightbulb
}

export function PodcastCreationForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    topic: "",
    motivation: "",
    format: "",
    duration: "",
    audience: "",
    title: "",
    description: "",
    tags: [],
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, totalSteps])

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleTagAdd = useCallback((tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag],
    }))
  }, [])

  const handleTagRemove = useCallback((tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }, [])

  const validateCurrentStep = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return formData.topic.trim().length > 0 && formData.motivation.trim().length > 0
      case 2:
        return formData.format.length > 0
      case 3:
        return formData.duration.length > 0 && formData.audience.length > 0
      case 4:
        // Assuming 'title' here refers to the perspective selection, which is a required field for this step
        return formData.title.length > 0
      default:
        return true
    }
  }, [currentStep, formData])

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a mock podcast ID
      const podcastId = `podcast-${Date.now()}`

      toast({
        title: "Success!",
        description: "Your podcast has been created successfully.",
      })

      // Navigate to the podcast display page
      router.push(`/podcast/${podcastId}`)
    } catch (error) {
      console.error("Failed to create podcast:", error)
      toast({
        title: "Error",
        description: "Failed to create podcast. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [validateCurrentStep, router, toast])

  const formatOptions: FormatOption[] = [
    {
      id: "interview",
      label: "Interview",
      description: "Q&A with guests",
      icon: Users,
      color: "purple",
    },
    {
      id: "solo",
      label: "Solo Talk",
      description: "Just you sharing insights",
      icon: Mic,
      color: "blue",
    },
    {
      id: "story",
      label: "Story",
      description: "Narrative format",
      icon: BookOpen,
      color: "indigo",
    },
  ]

  const durationOptions: DurationOption[] = [
    { id: "short", label: "3-5 min", description: "Quick insights", icon: Zap },
    { id: "medium", label: "5-7 min", description: "Deep dive", icon: Clock },
    { id: "long", label: "8-10 min", description: "Full exploration", icon: Target },
  ]

  const narrativeDepthOptions: NarrativeDepthOption[] = [
    { id: "surface", label: "Surface Level", description: "High-level overview", icon: Lightbulb },
    { id: "detailed", label: "Detailed", description: "In-depth exploration", icon: Brain },
    { id: "comprehensive", label: "Comprehensive", description: "Complete analysis", icon: Star },
  ]

  const suggestedTags = [
    "Technology",
    "Business",
    "Health",
    "Education",
    "Science",
    "Philosophy",
    "Psychology",
    "Productivity",
    "Leadership",
    "Innovation",
  ]

  const isNextDisabled = !validateCurrentStep()

  return (
    <div className="bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-100/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-4 rounded-xl shadow-lg">
      <div className="max-w-4xl mx-auto px-4 flex flex-col">
        <div className="mb-6 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content Area - Flexible */}
        <Card className="glass-card border border-white/40 dark:border-white/20 shadow-glass backdrop-blur-xl flex-1 flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            {/* Step 1: Topic & Motivation - Enhanced Layout */}
            {currentStep === 1 && (
              <div className="flex flex-col h-full">
                <div className="text-center mb-6 flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-3">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose Your Topic</h2>
                  <p className="text-base text-gray-700 dark:text-gray-300">
                    What ideas would you like to explore and share with your audience?
                  </p>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="topic"
                      className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center"
                    >
                      <Target className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                      Which topic would you like to explore? *
                    </Label>
                    <Input
                      id="topic"
                      placeholder="AI in healthcare, productivity tips, mindfulness..."
                      value={formData.topic}
                      onChange={(e) => handleInputChange("topic", e.target.value)}
                      className="h-11 text-base bg-white/80 dark:bg-gray-800/50 border-white/60 dark:border-gray-700/30 text-gray-900 dark:text-gray-100 placeholder:text-gray-600 dark:placeholder:text-gray-400 shadow-sm focus:shadow-md transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="motivation"
                      className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center"
                    >
                      <Heart className="h-4 w-4 mr-2 text-red-500 dark:text-red-400" />
                      What is your motivation for exploring this topic? *
                    </Label>
                    <Textarea
                      id="motivation"
                      placeholder="Share your passion, expertise, or unique perspective on this topic..."
                      value={formData.motivation}
                      onChange={(e) => handleInputChange("motivation", e.target.value)}
                      className="text-base bg-white/80 dark:bg-gray-800/50 border-white/60 dark:border-gray-700/30 text-gray-900 dark:text-gray-100 placeholder:text-gray-600 dark:placeholder:text-gray-400 resize-none shadow-sm focus:shadow-md transition-all duration-200"
                      rows={4}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Format - Enhanced Layout */}
            {currentStep === 2 && (
              <div className="flex flex-col h-full">
                <div className="text-center mb-6 flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-3">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pick Your Style</h2>
                  <p className="text-base text-gray-700 dark:text-gray-300">
                    How would you like to present your content?
                  </p>
                </div>

                <div className="flex-1 flex items-center">
                  <RadioGroup
                    value={formData.format}
                    onValueChange={(value) => handleInputChange("format", value)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
                  >
                    {formatOptions.map((option) => {
                      const IconComponent = option.icon
                      return (
                        <div key={option.id} className="relative">
                          <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                          <Label
                            htmlFor={option.id}
                            className={`flex flex-col items-center space-y-3 p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                              option.color === "purple"
                                ? "border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-100/80 dark:peer-data-[state=checked]:bg-purple-900/30 peer-data-[state=checked]:shadow-purple-200 dark:peer-data-[state=checked]:shadow-purple-900/50"
                                : option.color === "blue"
                                  ? "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-100/80 dark:peer-data-[state=checked]:bg-blue-900/30 peer-data-[state=checked]:shadow-blue-200 dark:peer-data-[state=checked]:shadow-blue-900/50"
                                  : "border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-100/80 dark:peer-data-[state=checked]:bg-indigo-900/30 peer-data-[state=checked]:shadow-indigo-200 dark:peer-data-[state=checked]:shadow-indigo-900/50"
                            } bg-white/90 dark:bg-gray-800/50 shadow-md h-full`}
                          >
                            <div
                              className={`p-3 rounded-xl shadow-sm ${
                                option.color === "purple"
                                  ? "bg-purple-200/80 dark:bg-purple-900/50"
                                  : option.color === "blue"
                                    ? "bg-blue-200/80 dark:bg-blue-900/50"
                                    : "bg-indigo-200/80 dark:bg-indigo-900/50"
                              }`}
                            >
                              <IconComponent
                                className={`h-8 w-8 ${
                                  option.color === "purple"
                                    ? "text-purple-700 dark:text-purple-400"
                                    : option.color === "blue"
                                      ? "text-blue-700 dark:text-blue-400"
                                      : "text-indigo-700 dark:text-indigo-400"
                                }`}
                              />
                            </div>
                            <div className="text-center">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                {option.label}
                              </h3>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{option.description}</p>
                            </div>
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 3: Duration & Narrative Depth - Enhanced Layout */}
            {currentStep === 3 && (
              <div className="flex flex-col h-full">
                <div className="text-center mb-6 flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Set Details</h2>
                  <p className="text-base text-gray-700 dark:text-gray-300">
                    Define the length and narrative depth for your podcast
                  </p>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/60 dark:bg-gray-800/30 p-5 rounded-xl shadow-sm border border-white/50 dark:border-gray-700/30">
                    <Label className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 block flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                      Duration *
                    </Label>
                    <RadioGroup
                      value={formData.duration}
                      onValueChange={(value) => handleInputChange("duration", value)}
                      className="space-y-3"
                    >
                      {durationOptions.map((option) => {
                        const IconComponent = option.icon
                        return (
                          <div key={option.id} className="relative">
                            <RadioGroupItem value={option.id} id={`duration-${option.id}`} className="peer sr-only" />
                            <Label
                              htmlFor={`duration-${option.id}`}
                              className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-md border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-100/80 dark:peer-data-[state=checked]:bg-purple-900/30 peer-data-[state=checked]:shadow-md bg-white/80 dark:bg-gray-800/50"
                            >
                              <IconComponent className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              <div className="flex-1">
                                <span className="font-medium text-gray-900 dark:text-gray-100 text-base block">
                                  {option.label}
                                </span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{option.description}</span>
                              </div>
                            </Label>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  </div>

                  <div className="bg-white/60 dark:bg-gray-800/30 p-5 rounded-xl shadow-sm border border-white/50 dark:border-gray-700/30">
                    <Label className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 block flex items-center">
                      <Layers className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Narrative Depth *
                    </Label>
                    <RadioGroup
                      value={formData.audience}
                      onValueChange={(value) => handleInputChange("audience", value)}
                      className="space-y-3"
                    >
                      {narrativeDepthOptions.map((option) => {
                        const IconComponent = option.icon
                        return (
                          <div key={option.id} className="relative">
                            <RadioGroupItem
                              value={option.id}
                              id={`narrativeDepth-${option.id}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`narrativeDepth-${option.id}`}
                              className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-md border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-100/80 dark:peer-data-[state=checked]:bg-blue-900/30 peer-data-[state=checked]:shadow-md bg-white/80 dark:bg-gray-800/50"
                            >
                              <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              <div className="flex-1">
                                <span className="font-medium text-gray-900 dark:text-gray-100 text-base block">
                                  {option.label}
                                </span>
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
            )}

            {/* Step 4: Perspective Selection & Tags - Enhanced Layout */}
            {currentStep === 4 && (
              <div className="flex flex-col h-full">
                <div className="text-center mb-6 flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-3">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Final Details</h2>
                  <p className="text-base text-gray-700 dark:text-gray-300">
                    Choose your perspective and add relevant tags for your podcast
                  </p>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="bg-white/60 dark:bg-gray-800/30 p-5 rounded-xl shadow-sm border border-white/50 dark:border-gray-700/30 mb-6">
                    <Label className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 block flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                      Choose Your Perspective *
                    </Label>
                    <p className="text-sm text-gray-700 dark:text-gray-400 mb-4">
                      Select the angle or perspective you want to take when creating your podcast script
                    </p>
                    <RadioGroup
                      value={formData.title}
                      onValueChange={(value) => handleInputChange("title", value)}
                      className="space-y-3"
                    >
                      <div className="relative">
                        <RadioGroupItem value="educational" id="perspective-educational" className="peer sr-only" />
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-start h-auto p-0"
                          onClick={() => handleInputChange("title", "educational")}
                        >
                          <Label
                            htmlFor="perspective-educational"
                            className="flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-md border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-100/80 dark:peer-data-[state=checked]:bg-green-900/30 peer-data-[state=checked]:shadow-md bg-white/80 dark:bg-gray-800/50 w-full"
                          >
                            <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <div className="flex-1 text-left">
                              <span className="font-medium text-gray-900 dark:text-gray-100 text-base block">
                                Educational & Informative
                              </span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Focus on teaching concepts, sharing knowledge, and providing clear explanations
                              </span>
                            </div>
                          </Label>
                        </Button>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="personal" id="perspective-personal" className="peer sr-only" />
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-start h-auto p-0"
                          onClick={() => handleInputChange("title", "personal")}
                        >
                          <Label
                            htmlFor="perspective-personal"
                            className="flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-md border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-100/80 dark:peer-data-[state=checked]:bg-blue-900/30 peer-data-[state=checked]:shadow-md bg-white/80 dark:bg-gray-800/50 w-full"
                          >
                            <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div className="flex-1 text-left">
                              <span className="font-medium text-gray-900 dark:text-gray-100 text-base block">
                                Personal & Experiential
                              </span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Share personal stories, experiences, and lessons learned from your journey
                              </span>
                            </div>
                          </Label>
                        </Button>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="analytical" id="perspective-analytical" className="peer sr-only" />
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-start h-auto p-0"
                          onClick={() => handleInputChange("title", "analytical")}
                        >
                          <Label
                            htmlFor="perspective-analytical"
                            className="flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-md border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-100/80 dark:peer-data-[state=checked]:bg-purple-900/30 peer-data-[state=checked]:shadow-md bg-white/80 dark:bg-gray-800/50 w-full"
                          >
                            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                            <div className="flex-1 text-left">
                              <span className="font-medium text-gray-900 dark:text-gray-100 text-base block">
                                Analytical & Critical
                              </span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Provide deep analysis, critical thinking, and evidence-based perspectives
                              </span>
                            </div>
                          </Label>
                        </Button>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="inspirational" id="perspective-inspirational" className="peer sr-only" />
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-start h-auto p-0"
                          onClick={() => handleInputChange("title", "inspirational")}
                        >
                          <Label
                            htmlFor="perspective-inspirational"
                            className="flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-md border-gray-300 dark:border-gray-600 hover:border-yellow-400 dark:hover:border-yellow-500 peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:bg-yellow-100/80 dark:peer-data-[state=checked]:bg-yellow-900/30 peer-data-[state=checked]:shadow-md bg-white/80 dark:bg-gray-800/50 w-full"
                          >
                            <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div className="flex-1 text-left">
                              <span className="font-medium text-gray-900 dark:text-gray-100 text-base block">
                                Inspirational & Motivational
                              </span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Inspire action, motivate change, and encourage listeners to pursue their goals
                              </span>
                            </div>
                          </Label>
                        </Button>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="bg-white/60 dark:bg-gray-800/30 p-5 rounded-xl shadow-sm border border-white/50 dark:border-gray-700/30">
                    <Label className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 block flex items-center">
                      <Target className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                      Tags (Optional)
                    </Label>
                    <p className="text-sm text-gray-700 dark:text-gray-400 mb-4">
                      Select relevant tags to help listeners discover your podcast
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {suggestedTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={formData.tags.includes(tag) ? "default" : "outline"}
                          className={`cursor-pointer transition-all duration-200 text-sm py-1.5 px-3 hover:scale-105 ${
                            formData.tags.includes(tag)
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md"
                              : "border-gray-400 dark:border-gray-600 text-gray-800 dark:text-gray-300 bg-white/80 dark:bg-gray-800/50 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 shadow-sm"
                          }`}
                          onClick={() => (formData.tags.includes(tag) ? handleTagRemove(tag) : handleTagAdd(tag))}
                        >
                          {tag}
                          {formData.tags.includes(tag) && <CheckCircle className="ml-1.5 h-3 w-3" />}
                        </Badge>
                      ))}
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">
                          Selected tags: {formData.tags.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Navigation */}
        <div className="flex justify-between items-center mt-6 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="bg-white/80 dark:bg-gray-800/50 border-white/60 dark:border-gray-700/30 text-gray-800 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={isNextDisabled}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg border-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isNextDisabled || isSubmitting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg border-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Create Podcast
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
