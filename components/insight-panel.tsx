// components/insight-panel.tsx
// Un componente inteligente que muestra información contextual al usuario.

"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, Target, User } from "lucide-react";
import type { Tables } from "@/types/supabase";

// Definimos el tipo para el perfil de resonancia que recibiremos como prop.
type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface InsightPanelProps {
  resonanceProfile: ResonanceProfile | null;
}

// Función auxiliar para interpretar las coordenadas y devolver un texto descriptivo.
const getQuadrantDescription = (center: any): string => {
  if (!center || typeof center !== 'string') {
    return "explorando todos los cuadrantes por igual";
  }

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

  // Vista para el usuario autenticado
  if (user && profile) {
    const quadrantDescription = getQuadrantDescription(resonanceProfile?.current_center);
    const userName = profile.full_name?.split(' ')[0] || user.email;

    return (
      <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg sticky top-24">
        <CardHeader className="flex flex-row items-center space-x-3 pb-2">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <Target className="h-6 w-6" />
          </div>
          <CardTitle>Tu Universo Personalizado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Hola, {userName}. Basado en tus escuchas, tu 'centro de gravedad' se encuentra en {quadrantDescription}.
          </p>
          <p className="text-sm text-muted-foreground">
            Las estanterías a tu izquierda están curadas por nuestra IA para resonar con tu perspectiva única.
          </p>
          <Link href="/podcasts?view=compass">
            <Button className="w-full">
              <Compass className="mr-2 h-4 w-4" />
              Explorar mi Mapa Estelar
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Vista para el usuario no autenticado (invitado)
  return (
    <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg sticky top-24">
      <CardHeader className="flex flex-row items-center space-x-3 pb-2">
        <div className="p-3 bg-primary/10 rounded-lg text-primary">
          <Compass className="h-6 w-6" />
        </div>
        <CardTitle>Descubre Contenido que Resuena</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          NicePod va más allá de las categorías. Cada podcast tiene coordenadas en un 'Mapa Estelar' de ideas.
        </p>
        <p className="text-sm text-muted-foreground">
          Al crear una cuenta, la plataforma aprende tu 'centro de gravedad' personal para recomendarte contenido que realmente te impactará.
        </p>
        <Link href="/signup">
          <Button className="w-full">
            <User className="mr-2 h-4 w-4" />
            Crear mi Brújula Personal
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}