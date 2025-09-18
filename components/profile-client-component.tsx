// components/profile-client-component.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Crown, User as UserIcon, Bot, Heart } from "lucide-react";
import type { Tables } from "@/types/supabase";

export type ProfileData = Tables<'profiles'> & {
  subscriptions: (Tables<'subscriptions'> & {
    plans: Tables<'plans'> | null;
  }) | null;
};

export interface ProfileClientComponentProps {
  profile: ProfileData | null;
  podcastsCreatedThisMonth: number;
  totalPodcasts: number;
  totalLikes: number;
}

export function ProfileClientComponent({ 
  profile, 
  podcastsCreatedThisMonth,
  totalPodcasts,
  totalLikes
}: ProfileClientComponentProps) {
  const { user, signOut, supabase } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);
  
  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar tu perfil.", variant: "destructive" });
    } else {
      toast({ title: "¡Éxito!", description: "Tu perfil ha sido actualizado." });
      router.refresh(); 
    }
    setIsSaving(false);
  };
  
  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      </div>
    );
  }
  
  const plan = profile.subscriptions?.plans;
  const creationsLimit = plan?.monthly_creation_limit ?? 0;
  const creationsRemaining = Math.max(0, creationsLimit - podcastsCreatedThisMonth);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Columna Izquierda (1/3 del espacio) --- */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border-border/20 bg-card/50 flex flex-col items-center text-center shadow-lg">
              <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
                <AvatarFallback className="text-3xl bg-muted">
                  {profile.full_name ? profile.full_name.charAt(0) : <UserIcon />}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>

              {/* ================== MODIFICACIÓN QUIRÚRGICA: SE ELIMINA EL ID DE USUARIO ================== */}
              {/* La línea <p> que mostraba el @username (UUID) ha sido eliminada por completo. */}
              {/* ====================================================================================== */}
              
              <div className="mt-6 w-full">
                <Button onClick={signOut} variant="destructive" className="w-full">
                  Cerrar Sesión
                </Button>
              </div>
          </Card>

          <Card className="border-border/20 bg-card/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Estadísticas Generales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Bot className="h-4 w-4" /> Podcasts Creados</span>
                <span className="font-bold text-lg">{totalPodcasts}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Heart className="h-4 w-4" /> Likes Totales Recibidos</span>
                <span className="font-bold text-lg">{totalLikes}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* --- Columna Derecha (2/3 del espacio) --- */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/20 bg-card/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Detalles de la Suscripción</CardTitle>
              <CardDescription>Tu plan actual y el uso de este ciclo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-3">
                  <Crown className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-lg capitalize">{plan?.name ?? 'N/A'} Plan</p>
                    <Badge variant={profile.subscriptions?.status === 'active' ? 'default' : 'destructive'} className="capitalize">{profile.subscriptions?.status ?? 'Inactivo'}</Badge>
                  </div>
                </div>
                <Button variant="outline" onClick={() => router.push('/pricing')}>Administrar Plan</Button>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Uso Mensual de Creaciones</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 text-center font-medium text-lg">
                    <span>{podcastsCreatedThisMonth}</span>
                    <span className="text-muted-foreground">/{creationsLimit}</span>
                  </div>
                  <div className="w-full">
                    <progress value={podcastsCreatedThisMonth} max={creationsLimit} className="w-full h-2.5 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary" />
                    <p className="text-xs text-muted-foreground mt-1 text-right">Te quedan {creationsRemaining} creaciones este mes.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/20 bg-card/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Configuración de la Cuenta</CardTitle>
              <CardDescription>Gestiona tu información personal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Dirección de Email</Label>
                <Input id="email" type="email" value={user?.email || ""} disabled className="opacity-70" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre completo" />
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}