/**
 * ARCHIVO: app/(platform)/pricing/page.tsx
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Terminal de suscripción y gestión de autoridad administrativa con SEO industrial.
 * NIVEL DE INTEGRIDAD: 100%
 */

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Metadata } from "next";

/**
 * METADATA SOBERANA: Optimización para motores de búsqueda industriales.
 */
export const metadata: Metadata = {
  title: "Planes de Autoridad | NicePod Intelligence",
  description: "Eleva tu rango de Voyager y accede a herramientas avanzadas de síntesis y forja de Capital Intelectual.",
};

/**
 * INTERFAZ: SubscriptionPlanDossier
 * Definición técnica de los niveles de autoridad disponibles en la Workstation.
 */
type SubscriptionPlanDossier = {
  identification: number;
  nameTextContent: string;
  descriptionTextContent: string | null;
  monthlyPriceMagnitude: number | null;
  monthlyCreationLimitMagnitude: number;
  featuresCollection: string[] | null;
};

/**
 * PricingPage: El orquestador de niveles de autoridad en el servidor.
 * Misión: Recuperar los planes de la Bóveda y validar la suscripción activa del Voyager.
 */
export default async function PricingPage() {
  const supabaseSovereignClient = createClient();

  // 1. COSECHA DE PLANES DESDE EL METAL
  const { data: plansDatabaseResultsCollection, error: plansQueryHardwareExceptionInformation } = await supabaseSovereignClient
    .from('plans')
    .select('*')
    .order('price_monthly', { ascending: true });

  // 2. HANDSHAKE DE IDENTIDAD SSR
  const { data: { user: authenticatedUserSnapshot } } = await supabaseSovereignClient.auth.getUser();

  /**
   * 3. VERIFICACIÓN DE VÍNCULO ACTIVO
   * Recuperamos la suscripción actual para determinar el rango vigente del perito.
   */
  const { data: activeUserSubscriptionSnapshot } = authenticatedUserSnapshot
    ? await supabaseSovereignClient
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', authenticatedUserSnapshot.id)
      .single()
    : { data: null };

  if (plansQueryHardwareExceptionInformation) {
    console.error("🔥 [Pricing] Fallo crítico al recuperar planes del Metal:", plansQueryHardwareExceptionInformation.message);
  }

  return (
    <div className="container py-12 md:py-20 isolate">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-black tracking-tighter sm:text-7xl uppercase italic text-white">
          RANGOS DE <span className="text-primary not-italic">AUTORIDAD</span>
        </h1>
        <p className="mt-4 text-sm md:text-lg text-zinc-500 font-bold uppercase tracking-[0.3em] max-w-2xl mx-auto">
          Selecciona el protocolo de forja adaptado a tus necesidades de análisis.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plansDatabaseResultsCollection?.map((planRow: any) => {
          // Transformación ZAP (Metal-to-Crystal mapping manual por simplicidad en vista)
          const planDossier: SubscriptionPlanDossier = {
             identification: planRow.id,
             nameTextContent: planRow.name,
             descriptionTextContent: planRow.description,
             monthlyPriceMagnitude: planRow.price_monthly,
             monthlyCreationLimitMagnitude: planRow.monthly_creation_limit,
             featuresCollection: planRow.features
          };

          const isCurrentAuthorityPlanStatus = activeUserSubscriptionSnapshot?.plan_id === planDossier.identification;
          const isHighlightedPlanStatus = planDossier.nameTextContent === "Pensador";

          return (
            <Card
              key={planDossier.identification}
              className={`backdrop-blur-3xl bg-[#050505]/80 border-white/5 flex flex-col rounded-[2.5rem] transition-all duration-500 ${
                isHighlightedPlanStatus && !isCurrentAuthorityPlanStatus ? "border-primary/40 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]" : ""
                } ${isCurrentAuthorityPlanStatus ? "ring-2 ring-primary" : ""}`}
            >
              <CardHeader className="space-y-2 pt-10 px-8">
                <CardTitle className="text-3xl font-black uppercase tracking-tighter italic text-white">
                    {planDossier.nameTextContent}
                </CardTitle>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter text-white">${planDossier.monthlyPriceMagnitude}</span>
                  {planDossier.monthlyPriceMagnitude !== 0 && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">/ mes</span>
                  )}
                </div>
                <CardDescription className="mt-2 h-12 text-[11px] font-bold uppercase tracking-widest leading-relaxed text-zinc-400">
                    {planDossier.descriptionTextContent}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow px-8 pb-8 mt-4">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                      {planDossier.monthlyCreationLimitMagnitude === 0 ? "Acceso restringido a escucha" :
                        planDossier.nameTextContent === 'Creador' ? `Ciclos de forja ilimitados` :
                          `Hasta ${planDossier.monthlyCreationLimitMagnitude} ciclos de forja al mes`}
                    </span>
                  </li>
                  {planDossier.featuresCollection?.map((featureTextContent) => (
                    <li key={featureTextContent} className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{featureTextContent}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="px-8 pb-10">
                {isCurrentAuthorityPlanStatus ? (
                  <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-white/10" disabled variant="outline">
                    Rango Vigente
                  </Button>
                ) : (
                  <Button
                    className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all active:scale-95 ${
                        isHighlightedPlanStatus ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-white text-black hover:bg-zinc-200"
                    }`}
                    variant={isHighlightedPlanStatus ? "default" : "outline"}
                  >
                    Sincronizar Protocolo
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
