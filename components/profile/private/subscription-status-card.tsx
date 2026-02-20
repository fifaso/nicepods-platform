// components/profile/private/subscription-status-card.tsx
// VERSIÓN: 1.0 (NicePod Sovereignty Monitor - High-Impact Quota Standard)
// Misión: Visualizar el rango del curador, cuotas de creación y límites de sincronía.
// [ESTABILIZACIÓN]: Integración de métricas de borradores concurrentes y diseño Aurora de alto contraste.

"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Crown,
  Layout
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

// --- INFRAESTRUCTURA UI ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

/**
 * INTERFAZ: SubscriptionStatusCardProps
 * Define los datos de telemetría necesarios para proyectar la capacidad del búnker.
 */
interface SubscriptionStatusCardProps {
  planName: string | null;
  status: string | null;
  podcastsCreated: number;
  monthlyLimit: number;
  maxConcurrentDrafts: number;
  features: string[] | null;
}

/**
 * SubscriptionStatusCard: La terminal de potencia del curador.
 * 
 * Este componente utiliza el color 'primary' absoluto de NicePod para 
 * diferenciarse de los módulos de configuración y destacar el estatus del usuario.
 */
export function SubscriptionStatusCard({
  planName,
  status,
  podcastsCreated,
  monthlyLimit,
  maxConcurrentDrafts,
  features
}: SubscriptionStatusCardProps) {

  /**
   * usagePercentage: Cálculo de saturación de la cuota mensual.
   */
  const usagePercentage = useMemo(() => {
    if (monthlyLimit === 0) return 0;
    return Math.min(100, (podcastsCreated / monthlyLimit) * 100);
  }, [podcastsCreated, monthlyLimit]);

  // Fallback de características si el plan no las define explícitamente
  const activeFeatures = features?.length ? features : [
    "IA Multimodal Pro",
    "Geolocalización Activa",
    "Bóveda de 768 dimensiones"
  ];

  return (
    <Card className="bg-primary text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative group transition-all duration-700 hover:shadow-primary/20">

      {/* CAPA ATMOSFÉRICA: Gradiente Aurora dinámico de alta intensidad */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/40 pointer-events-none" />

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">
            Nivel de Sabiduría
          </CardTitle>
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
            <Crown className="h-4 w-4 text-yellow-300 animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-10 relative z-10">

        {/* BLOQUE I: RANGO Y ESTADO */}
        <div>
          <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
            {planName || 'Explorador'}
          </h3>
          <div className="mt-4 flex items-center gap-2">
            <Badge className="bg-black/30 text-white border-white/10 text-[9px] font-black tracking-widest uppercase px-3 py-1 backdrop-blur-md">
              Estado: {status === 'active' ? 'Sincronizado' : 'En espera'}
            </Badge>
            <div className="h-1 w-1 rounded-full bg-white/40" />
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
              Malla v2.5
            </span>
          </div>
        </div>

        {/* BLOQUE II: MÉTRICAS DE FORJA (CUOTAS) */}
        <div className="space-y-6">

          {/* Cuota: Podcasts Mensuales */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                Forja Mensual
              </span>
              <span className="text-xs font-black tabular-nums">
                {podcastsCreated} / {monthlyLimit}
              </span>
            </div>
            <Progress
              value={usagePercentage}
              className="h-2.5 bg-black/20 border border-white/5 shadow-inner"
            />
          </div>

          {/* Cuota: Sincronía Simultánea (Borradores) */}
          <div className="flex items-center justify-between p-4 bg-black/10 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <Layout size={16} className="text-white/60" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                Sincronía Simultánea
              </span>
            </div>
            <span className="text-xs font-black">
              {maxConcurrentDrafts} <span className="opacity-40 font-medium">Slots</span>
            </span>
          </div>

        </div>

        {/* BLOQUE III: MALLA DE CAPACIDADES (FEATURES) */}
        <div className="space-y-3 border-t border-white/10 pt-8">
          {activeFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 group/feat">
              <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center border border-white/10 group-hover/feat:bg-white/20 transition-colors">
                <CheckCircle2 size={12} className="text-white/60" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter opacity-90">
                {feature}
              </span>
            </div>
          ))}
        </div>

      </CardContent>

      {/* FOOTER: ACCIÓN DE ESCALADO */}
      <CardFooter className="relative z-10 p-6 md:p-8 pt-0">
        <Button
          asChild
          className="w-full bg-white text-primary hover:bg-zinc-100 font-black rounded-2xl h-14 shadow-2xl text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-95"
        >
          <Link href="/pricing" className="flex items-center justify-center gap-2">
            MEJORAR CAPACIDAD <ArrowUpRight size={14} />
          </Link>
        </Button>
      </CardFooter>

    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este componente es un 'Pure UI Module'. No realiza peticiones de red, lo que lo hace 
 * instantáneo durante la hidratación. He incluido 'maxConcurrentDrafts' para que el 
 * usuario entienda la limitación física de la Sala de Forja antes de intentar 
 * crear múltiples podcasts, reduciendo la frustración y los tickets de soporte.
 */