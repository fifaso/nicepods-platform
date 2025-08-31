// app/profile/profile-client-component.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import Link from "next/link";

// Definimos un tipo estricto para las props que esperamos del servidor.
export type ProfileData = {
  full_name: string | null;
  subscriptions: {
    status: string | null;
    plans: {
      name: string | null;
      monthly_creation_limit: number;
    } | null;
  } | null;
} | null;

export type ProfileClientComponentProps = {
  profile: ProfileData;
  podcastsCreatedThisMonth: number;
};

export function ProfileClientComponent({ profile, podcastsCreatedThisMonth }: ProfileClientComponentProps) {
  // Solo usamos el hook 'useAuth' para la función 'signOut' y el objeto 'user' básico (para el email y avatar).
  const { signOut, user } = useAuth();

  // Todos los cálculos se basan directamente en las props inmutables. No hay estado, no hay useEffect, no hay bucle.
  const monthlyLimit = profile?.subscriptions?.plans?.monthly_creation_limit ?? 0;
  const podcastsRemaining = Math.max(0, monthlyLimit - podcastsCreatedThisMonth);
  const usagePercentage = monthlyLimit > 0 ? (podcastsCreatedThisMonth / monthlyLimit) * 100 : 0;
  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 animate-fade-in">
      <div className="grid gap-10 md:grid-cols-3">
        {/* Columna Izquierda: Avatar e Información Básica */}
        <div className="md:col-span-1">
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
              <AvatarImage src={user?.user_metadata.avatar_url} alt={profile?.full_name ?? ''} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
            <p className="text-sm text-muted-foreground break-all mt-1">{user?.id}</p>
            <Button onClick={signOut} variant="destructive" className="mt-6 w-full">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Columna Derecha: Detalles de Suscripción y Cuenta */}
        <div className="md:col-span-2 space-y-8">
          {/* Tarjeta de Suscripción */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Suscripción</CardTitle>
              <CardDescription>Tu plan actual y el uso de este ciclo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center">
                  <Crown className="h-6 w-6 mr-3 text-primary" />
                  <div>
                    <p className="font-semibold">{profile?.subscriptions?.plans?.name ?? 'Sin Plan'}</p>
                    <Badge>{profile?.subscriptions?.status ?? 'Inactivo'}</Badge>
                  </div>
                </div>
                <Button asChild>
                  <Link href="/pricing">Administrar Plan</Link>
                </Button>
              </div>

              <div>
                <Label className="text-sm font-medium">Uso Mensual de Creaciones</Label>
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-2 mb-1">
                  <span>{podcastsCreatedThisMonth} creados</span>
                  <span>Límite: {monthlyLimit}</span>
                </div>
                <Progress value={usagePercentage} className="w-full" />
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Te quedan <span className="font-bold text-primary">{podcastsRemaining}</span> creaciones disponibles este mes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta de Configuración de Cuenta */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la Cuenta</CardTitle>
              <CardDescription>Gestiona tu información personal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Dirección de Email</Label>
                <Input id="email" type="email" value={user?.email ?? ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input id="full_name" type="text" defaultValue={profile?.full_name ?? ''} />
              </div>
               <div className="flex justify-end pt-2">
                  <Button>Guardar Cambios</Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}