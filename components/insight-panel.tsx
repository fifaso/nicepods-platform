// components/insight-panel.tsx 
// VERSIÓN POTENCIADA: Con dos cuadrantes de información internos y CTAs estratégicos.

"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, LogIn, Sparkles, Info } from "lucide-react";
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
        {/* [CAMBIO QUIRÚRGICO #1]: Se elimina el icono del encabezado */}
        <CardHeader>
          <CardTitle>Podcast sintéticos </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow flex flex-col">
          {/* Texto personalizado en la parte superior */}
          <div>
            <p className="text-sm text-muted-foreground">
              La Inteligencia Artificial como herramienta de valor para todos
            </p>
          </div>
          
          {/* [CAMBIO QUIRÚRGICO #2]: Contenedor que crece para empujar el botón hacia abajo */}
          <div className="flex-grow space-y-4">
            {/* Primer cuadrante de información */}
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-semibold text-sm flex items-center"><Info className="h-4 w-4 mr-2 text-primary" /> El Valor de NicePod</h4>
              {/* [EDITABLE TEXT - LOGGED-IN USER]: Contenido del primer cuadrante */}
              <p className="text-xs text-muted-foreground mt-1">
                Nuestra misión es transformar tus ideas en experiencias de audio memorables, sin fricción.
              </p>
            </div>
            
            {/* Segundo cuadrante de información */}
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-semibold text-sm flex items-center"><Sparkles className="h-4 w-4 mr-2 text-yellow-500" /> Novedades</h4>
              {/* [EDITABLE TEXT - LOGGED-IN USER]: Contenido del segundo cuadrante */}
              <p className="text-xs text-muted-foreground mt-1">
                - Puedes revisar, editar y publicar las etiquetas de tus podcasts.
                - Agregamos nuevas herramientas de creación. Descubrelas!
              </p>
            </div>
          </div>
          
          {/* Botón de acción en la parte inferior */}
          <Link href="/create">
            <Button className="w-full">
              <Mic className="mr-2 h-4 w-4" />
              Centro de Creación
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
      {/* [CAMBIO QUIRÚRGICO #1]: Se elimina el icono del encabezado */}
      <CardHeader>
        <CardTitle>Contenido que resuena</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col">
        {/* Texto principal en la parte superior */}
        <div>
            <p className="text-sm text-muted-foreground">
              La Inteligencia Artificial como herramienta de valor para todos
            </p>
        </div>

        {/* [CAMBIO QUIRÚRGICO #2]: Contenedor que crece para empujar el botón hacia abajo */}
        <div className="flex-grow space-y-4">
            {/* Primer cuadrante de información */}
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-semibold text-sm flex items-center"><Info className="h-4 w-4 mr-2 text-primary" /> El Valor de NicePod</h4>
              {/* [EDITABLE TEXT - GUEST USER]: Contenido del primer cuadrante */}
              <p className="text-xs text-muted-foreground mt-1">
                Nuestra misión es transformar ideas en experiencias de audio memorables, sin fricción.
              </p>
            </div>
            
            {/* Segundo cuadrante de información */}
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-semibold text-sm flex items-center"><Sparkles className="h-4 w-4 mr-2 text-yellow-500" /> Novedades</h4>
              {/* [EDITABLE TEXT - GUEST USER]: Contenido del segundo cuadrante */}
              <p className="text-xs text-muted-foreground mt-1">
                - Nuestro nuevo dashboard inteligente te recomienda contenido basado en tus gustos.
                - Agregamos nuevas herramientas de creación. Descubrelas!
              </p>
            </div>
        </div>
        
        {/* Botón de acción en la parte inferior */}
        <Link href="/login">
          <Button className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Ingresar
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}