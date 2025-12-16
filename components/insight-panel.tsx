// components/insight-panel.tsx 
// VERSIÓN: 2.0 (Fix: Auth Loading State + Admin Shortcut)

"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mic, LogIn, Sparkles, Info, ShieldCheck } from "lucide-react";
import type { Tables } from "@/types/supabase";

type ResonanceProfile = Tables<'user_resonance_profiles'>;

interface InsightPanelProps {
  resonanceProfile: ResonanceProfile | null;
}

export function InsightPanel({ resonanceProfile }: InsightPanelProps) {
  // [MEJORA]: Extraemos isAdmin e isLoading para manejar la UI correctamente
  const { user, profile, isAdmin, isLoading } = useAuth();

  // 1. ESTADO DE CARGA (Evita el parpadeo de "Ingresar")
  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg h-full flex flex-col">
        <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
        <CardContent className="space-y-4 flex-grow flex flex-col">
           <Skeleton className="h-4 w-full" />
           <div className="flex-grow space-y-4 mt-4">
             <Skeleton className="h-24 w-full rounded-lg" />
             <Skeleton className="h-24 w-full rounded-lg" />
           </div>
           <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // 2. VISTA PARA USUARIO AUTENTICADO
  if (user && profile) {
    return (
      <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg h-full flex flex-col">
        <CardHeader>
          <CardTitle>Tu Estudio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow flex flex-col">
          <div>
            <p className="text-sm text-muted-foreground">
              Bienvenido a tu espacio creativo, {profile.full_name?.split(' ')[0]}.
            </p>
          </div>
          
          <div className="flex-grow space-y-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-semibold text-sm flex items-center"><Info className="h-4 w-4 mr-2 text-primary" /> Misión</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Transformar tus ideas en audio memorable.
              </p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-semibold text-sm flex items-center"><Sparkles className="h-4 w-4 mr-2 text-yellow-500" /> Novedades</h4>
              <p className="text-xs text-muted-foreground mt-1">
                - Gestiona tus etiquetas desde el perfil.
                - Nuevos arquetipos disponibles.
              </p>
            </div>
          </div>
          
          <div className="space-y-2 mt-auto">
            <Link href="/create" className="w-full block">
                <Button className="w-full font-semibold shadow-md">
                <Mic className="mr-2 h-4 w-4" />
                Centro de Creación
                </Button>
            </Link>

            {/* [NUEVO]: Acceso directo al Admin si tienes permisos */}
            {isAdmin && (
                <Link href="/admin" className="w-full block">
                    <Button variant="outline" className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Torre de Control
                    </Button>
                </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 3. VISTA PARA INVITADO (Default)
  return (
    <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle>Contenido que resuena</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col">
        <div>
            <p className="text-sm text-muted-foreground">
              La Inteligencia Artificial como herramienta de valor para todos
            </p>
        </div>

        <div className="flex-grow space-y-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-semibold text-sm flex items-center"><Info className="h-4 w-4 mr-2 text-primary" /> El Valor de NicePod</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Nuestra misión es transformar ideas en experiencias de audio memorables, sin fricción.
              </p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-semibold text-sm flex items-center"><Sparkles className="h-4 w-4 mr-2 text-yellow-500" /> Novedades</h4>
              <p className="text-xs text-muted-foreground mt-1">
                - Dashboard inteligente personalizado.
                - Nuevas herramientas de creación.
              </p>
            </div>
        </div>
        
        <Link href="/login" className="mt-auto">
          <Button className="w-full" variant="secondary">
            <LogIn className="mr-2 h-4 w-4" />
            Ingresar
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}