"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Check } from "lucide-react"

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubscribe = async (plan: string) => {
    setIsLoading(plan)

    try {
      // If user is not logged in, redirect to login page with return URL
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent("/pricing")}`)
        return
      }

      // Mock subscription process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Subscription updated",
        description: `You are now subscribed to the ${plan} plan.`,
      })

      // Redirect to profile page
      router.push("/profile")
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic access to micro-podcasts",
      features: ["Listen to 5 micro-podcasts per day", "Basic recommendation algorithm", "Standard audio quality"],
      cta: "Current Plan",
      disabled: profile?.subscription_plan === "free",
    },
    {
      name: "Thinker",
      price: "$4.99",
      period: "per month",
      description: "Enhanced access for curious minds",
      features: [
        "Unlimited listening",
        "Create up to 10 micro-podcasts per month",
        "Advanced recommendation algorithm",
        "High-quality audio",
        "Download for offline listening",
      ],
      cta: profile?.subscription_plan === "thinker" ? "Current Plan" : "Subscribe",
      disabled: profile?.subscription_plan === "thinker",
      highlighted: true,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "Full platform access for creators",
      features: [
        "Everything in Thinker",
        "Unlimited micro-podcast creation",
        "Priority recommendation placement",
        "Studio-quality audio",
        "Analytics dashboard",
        "Custom branding options",
      ],
      cta: profile?.subscription_plan === "pro" ? "Current Plan" : "Subscribe",
      disabled: profile?.subscription_plan === "pro",
    },
  ]

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Pricing Plans</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan to enhance your micro-podcast experience
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`backdrop-blur-lg bg-card/80 border-muted/30 flex flex-col ${
              plan.highlighted ? "border-primary/50 shadow-lg shadow-primary/10" : ""
            }`}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
              </div>
              <CardDescription className="mt-2">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                disabled={plan.disabled || isLoading === plan.name.toLowerCase()}
                onClick={() => handleSubscribe(plan.name.toLowerCase())}
              >
                {isLoading === plan.name.toLowerCase() ? "Processing..." : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
