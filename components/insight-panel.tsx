// components/insight-panel.tsx
// VERSIÓN POTENCIADA: Con llamados a la acción contextuales y textos editables claramente marcados.

"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, Target, Mic, LogIn } from "lucide-react";
import type { Tables } from "@/types/supabase";

type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface InsightPanelProps {
  resonanceProfile: ResonanceProfile | null;
}

const getQuadrantDescription = (center: any): string => {
  if (!center || typeof center !== 'string') return "explorando todos los cuadrantes por igual";
  const match = center.match(/\(([^,]+),([^)]+)\)/);
  if (!match) return "explorando todos los cuadrantes por igual";
  const x = parseFloat(match[1]);
  const y = parseFloat(match[2]);

  if (x >= 0 && y >= 0) return "el cuadrante de las Ideas Espirituales y Conceptuales";
  if (x < 0 && y >= 0) return "el cuadrante de las Ideas Abstractas y Conceptuales";
  if (x < 0 && y < 0) return "el cuadrante de las Ideas Abstractas y Prácticas";
  if (x >= 0 && y < 0) return "el cuadrante de las Ideas Espirituales y Prácticas";
  
  return "explorando todos los cuadrantes por igual";
};

export function InsightPanel({ resonanceProfile }: InsightPanelProps) {
  const { user, profile } = useAuth();

  // ==============================================================
  // VISTA PARA USUARIO AUTENTICADO
  // ==============================================================
  if (user && profile) {
    const quadrantDescription = getQuadrantDescription(resonanceProfile?.current_center);
    const userName = profile.full_name?.split(' ')[0] || user.email;

    return (
      <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg h-full flex flex-col">
        <CardHeader className="flex flex-row items-center space-x-3 pb-2">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <Target className="h-6 w-6" />
          </div>
          {/* [EDITABLE TEXT - LOGGED-IN USER]: Título del panel */}
          <CardTitle>Tu Universo Personalizado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow flex flex-col">
          <div className="flex-grow">
            {/* [EDITABLE TEXT - LOGGED-IN USER]: Cuerpo del mensaje */}
            <p className="text-sm text-muted-foreground">
              Hola, {userName}. Basado en tus escuchas, tu 'centro de gravedad' se encuentra en {quadrantDescription}.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Las estanterías a tu izquierda están curadas por nuestra IA para resonar con tu perspectiva única.
            </p>
          </div>
          {/* [CAMBIO QUIRÚRGICO]: El botón ahora lleva al Centro de Creación. */}
          <Link href="/create">
            <Button className="w-full">
              <Mic className="mr-2 h-4 w-4" />
              {/* [EDITABLE TEXT - LOGGED-IN USER]: Texto del botón */}
              Ir al Centro de Creación
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // ==============================================================
  // VISTA PARA INVITADO (NO AUTENTICADO)
  // ==============================================================
  return (
    <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg h-full flex flex-col">
      <CardHeader className="flex flex-row items-center space-x-3 pb-2">
        <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <Compass className="h-6 w-6" />
        </div>
        {/* [EDITABLE TEXT - GUEST USER]: Título del panel */}
        <CardTitle>Descubre Contenido que Resuena</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col">
        <div className="flex-grow">
            {/* [EDITABLE TEXT - GUEST USER]: Cuerpo del mensaje */}
            <p className="text-sm text-muted-foreground">
              NicePod va más allá de las categorías. Cada podcast tiene coordenadas en un 'Mapa Estelar' de ideas.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Al crear una cuenta, la plataforma aprende tu 'centro de gravedad' personal para recomendarte contenido que realmente te impactará.
            </p>
        </div>
        {/* [CAMBIO QUIRÚRGICO]: El botón ahora lleva a la página de Login. */}
        <Link href="/login">
          <Button className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            {/* [EDITABLE TEXT - GUEST USER]: Texto del botón */}
            Ingresar y Crear mi Brújula
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}