// app/pricing/page.tsx
import { createClient } from "@/lib/supabase/server"; // Para obtener datos

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast" // Se movería a un componente cliente si la lógica de suscripción se mantiene
import { Check } from "lucide-react";

// Definimos un tipo para los datos del plan que vienen de la base de datos
type Plan = {
  id: number;
  name: string;
  description: string | null;
  price_monthly: number | null;
  monthly_creation_limit: number;
  features: string[] | null;
};

export default async function PricingPage() {
  const supabase = createClient();

  // Obtenemos los datos de los planes y la sesión del usuario del lado del servidor
  const { data: plansData, error: plansError } = await supabase
    .from('plans')
    .select('*')
    .order('price_monthly', { ascending: true });

  const { data: { user } } = await supabase.auth.getUser();

  // Obtenemos la suscripción actual del usuario para saber qué plan resaltar
  const { data: userSubscription } = user
    ? await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', user.id)
      .single()
    : { data: null };

  if (plansError) {
    console.error("Error al obtener los planes:", plansError);
    // Podríamos mostrar un mensaje de error aquí
  }

  return (
    <div className="container py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Planes de Suscripción</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Elige el plan perfecto para potenciar tu experiencia de creación.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plansData?.map((plan: Plan) => {
          const isCurrentPlan = userSubscription?.plan_id === plan.id;
          const isHighlighted = plan.name === "Pensador"; // El plan "Pensador" es el que destacamos

          return (
            <Card
              key={plan.name}
              className={`backdrop-blur-lg bg-card/80 border-muted/30 flex flex-col ${isHighlighted && !isCurrentPlan ? "border-primary/50 shadow-lg shadow-primary/10" : ""
                } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
            >
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">${plan.price_monthly}</span>
                  {plan.price_monthly !== 0 && <span className="text-muted-foreground ml-1">/ mes</span>}
                </div>
                <CardDescription className="mt-2 h-10">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {/* Característica principal basada en el límite de creación */}
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                    <span className="text-sm">
                      {plan.monthly_creation_limit === 0 ? "Acceso de solo escucha" :
                        plan.name === 'Creador' ? `Creaciones ilimitadas de micro-podcasts` :
                          `Hasta ${plan.monthly_creation_limit} creaciones de micro-podcasts al mes`}
                    </span>
                  </li>
                  {/* Resto de características del array */}
                  {plan.features?.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrentPlan ? (
                  <Button className="w-full" disabled variant="outline">
                    Tu Plan Actual
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={isHighlighted ? "default" : "outline"}
                  >
                    Suscribirse
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}