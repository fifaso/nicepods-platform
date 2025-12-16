// components/profile-client-component.tsx
// VERSIÓN: 4.0 (Split View Architecture: Public vs Private)

"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, PlayCircle, Calendar, Mic } from "lucide-react";
import Link from "next/link";

// --- TIPOS EXPORTADOS (Esto soluciona los errores de importación) ---
export type ProfileData = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  subscriptions?: {
    status: string | null;
    plans: { name: string | null; monthly_creation_limit: number } | null;
  } | null;
};

export type PublicPodcast = {
  id: number;
  title: string;
  description: string | null;
  audio_url: string | null;
  created_at: string;
  duration_seconds: number | null;
};

// =====================================================================
// COMPONENTE A: PERFIL PRIVADO (DASHBOARD)
// Este es el que usa 'app/profile/page.tsx'
// =====================================================================
interface PrivateProps {
  profile: ProfileData;
  podcastsCreatedThisMonth: number;
}

export function PrivateProfileDashboard({ profile, podcastsCreatedThisMonth }: PrivateProps) {
  const { signOut, user } = useAuth();
  
  const monthlyLimit = profile?.subscriptions?.plans?.monthly_creation_limit ?? 3;
  const podcastsRemaining = Math.max(0, monthlyLimit - podcastsCreatedThisMonth);
  const usagePercentage = Math.min(100, (podcastsCreatedThisMonth / monthlyLimit) * 100);
  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* SIDEBAR PERSONAL */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <Card className="text-center overflow-hidden border-primary/20">
            <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5"></div>
            <div className="px-6 pb-6 -mt-12 relative">
                <Avatar className="h-24 w-24 mx-auto border-4 border-background shadow-lg">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="text-2xl">{userInitial}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mt-4">{profile?.full_name}</h2>
                <p className="text-sm text-muted-foreground">@{profile?.username}</p>
                
                <div className="mt-6 space-y-2">
                    {profile?.username && (
                      <Link href={`/profile/${profile.username}`} className="w-full block">
                          <Button variant="outline" className="w-full">Ver mi Perfil Público</Button>
                      </Link>
                    )}
                    <Button onClick={signOut} variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10">
                        Cerrar Sesión
                    </Button>
                </div>
            </div>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Suscripción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        <span className="font-semibold">{profile?.subscriptions?.plans?.name || 'Free Tier'}</span>
                    </div>
                    <Badge variant={profile?.subscriptions?.status === 'active' ? 'default' : 'secondary'}>
                        {profile?.subscriptions?.status || 'Active'}
                    </Badge>
                </div>
                
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span>Uso del ciclo</span>
                        <span>{podcastsCreatedThisMonth} / {monthlyLimit}</span>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center pt-1">
                        Te quedan <span className="font-bold text-foreground">{podcastsRemaining}</span> creaciones.
                    </p>
                </div>
                
                <Button className="w-full" variant="secondary" asChild>
                    <Link href="/pricing">Gestionar Plan</Link>
                </Button>
            </CardContent>
          </Card>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="w-full md:w-2/3 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Configuración</CardTitle>
                    <CardDescription>Información privada de tu cuenta.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input value={user?.email || ''} disabled className="bg-muted" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Nombre Visible</Label>
                        <Input defaultValue={profile?.full_name || ''} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Bio</Label>
                        <Input defaultValue={profile?.bio || ''} placeholder="Cuéntanos sobre ti..." />
                    </div>
                    <div className="flex justify-end">
                        <Button>Guardar Cambios</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// COMPONENTE B: PERFIL PÚBLICO (SOCIAL)
// Este es el que usa 'app/profile/[username]/page.tsx'
// =====================================================================
interface PublicProps {
  profile: ProfileData;
  podcasts: PublicPodcast[];
  totalLikes: number;
}

export function PublicProfilePage({ profile, podcasts, totalLikes }: PublicProps) {
  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 animate-fade-in">
      {/* HEADER PÚBLICO */}
      <div className="flex flex-col items-center text-center mb-12">
        <Avatar className="h-32 w-32 border-4 border-background shadow-xl mb-4">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="text-4xl bg-primary/10 text-primary">{userInitial}</AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold tracking-tight">{profile?.full_name}</h1>
        <p className="text-muted-foreground mt-1 text-lg">@{profile?.username}</p>
        
        {profile?.bio && (
            <p className="max-w-lg mt-4 text-sm text-muted-foreground/80 leading-relaxed">
                {profile.bio}
            </p>
        )}

        <div className="flex gap-6 mt-6">
            <div className="text-center">
                <span className="block font-bold text-xl">{podcasts.length}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Podcasts</span>
            </div>
            <div className="text-center">
                <span className="block font-bold text-xl">{totalLikes}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Likes</span>
            </div>
        </div>
      </div>

      {/* LISTA DE CONTENIDO */}
      <Tabs defaultValue="podcasts" className="w-full">
        <TabsList className="w-full justify-center bg-transparent border-b rounded-none h-auto p-0 mb-8">
            <TabsTrigger value="podcasts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3 text-sm">
                Publicaciones
            </TabsTrigger>
        </TabsList>

        <TabsContent value="podcasts" className="space-y-4">
            {podcasts.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed">
                    <Mic className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">Este usuario aún no ha publicado contenido.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {podcasts.map((pod) => (
                        <Card key={pod.id} className="group hover:border-primary/50 transition-all cursor-pointer bg-card/50">
                            <CardContent className="p-5 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{pod.title}</h3>
                                    {pod.created_at && (
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(pod.created_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                                    {pod.description || "Sin descripción disponible."}
                                </p>
                                <div className="pt-4 border-t flex justify-between items-center">
                                    <Badge variant="secondary" className="text-[10px]">
                                        {Math.floor((pod.duration_seconds || 0) / 60)} min
                                    </Badge>
                                    <Link href={`/podcast/${pod.id}`}>
                                        <Button size="sm" className="gap-2 rounded-full h-8">
                                            <PlayCircle className="h-3.5 w-3.5" /> Escuchar
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}