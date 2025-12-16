// components/profile-client-component.tsx
// VERSIÓN: 5.0 (Feature Complete: Testimonials Integration)

"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, PlayCircle, Calendar, Mic, MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// [NUEVO] Importamos el diálogo de creación
import { LeaveTestimonialDialog } from "@/components/leave-testimonial-dialog";

// --- TIPOS ---
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

// [NUEVO] Tipo para Testimonios
export type TestimonialWithAuthor = {
  id: number;
  comment_text: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  author: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

// =====================================================================
// COMPONENTE A: PERFIL PRIVADO (DASHBOARD)
// =====================================================================
interface PrivateProps {
  profile: ProfileData;
  podcastsCreatedThisMonth: number;
  initialTestimonials?: TestimonialWithAuthor[]; // [NUEVO]
}

export function PrivateProfileDashboard({ profile, podcastsCreatedThisMonth, initialTestimonials = [] }: PrivateProps) {
  const { signOut, user, supabase } = useAuth();
  const { toast } = useToast();
  
  // Estado local para gestionar aprobaciones sin recargar
  const [testimonials, setTestimonials] = useState(initialTestimonials);

  const handleStatusChange = async (id: number, newStatus: 'approved' | 'rejected') => {
    if (!supabase) return;
    const { error } = await supabase
        .from('profile_testimonials')
        .update({ status: newStatus })
        .eq('id', id);

    if (error) {
        toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
    } else {
        setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        toast({ title: "Actualizado", description: `Testimonio ${newStatus === 'approved' ? 'aprobado' : 'rechazado'}.` });
    }
  };

  const monthlyLimit = profile?.subscriptions?.plans?.monthly_creation_limit ?? 3;
  const podcastsRemaining = Math.max(0, monthlyLimit - podcastsCreatedThisMonth);
  const usagePercentage = Math.min(100, (podcastsCreatedThisMonth / monthlyLimit) * 100);
  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U';

  // Filtramos pendientes para mostrarlos destacados
  const pendingTestimonials = testimonials.filter(t => t.status === 'pending');
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');

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
            
            {/* GESTIÓN DE TESTIMONIOS */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" /> Testimonios
                        </CardTitle>
                        {pendingTestimonials.length > 0 && (
                            <Badge variant="destructive">{pendingTestimonials.length} Pendientes</Badge>
                        )}
                    </div>
                    <CardDescription>Lo que la comunidad dice de ti.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="pending" className="w-full">
                        <TabsList className="w-full mb-4">
                            <TabsTrigger value="pending" className="flex-1">Pendientes ({pendingTestimonials.length})</TabsTrigger>
                            <TabsTrigger value="approved" className="flex-1">Aprobados ({approvedTestimonials.length})</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="pending" className="space-y-4">
                            {pendingTestimonials.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No tienes testimonios pendientes.</p>
                            ) : (
                                pendingTestimonials.map(t => (
                                    <div key={t.id} className="p-4 rounded-lg bg-muted/40 border flex gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={t.author?.avatar_url || ''} />
                                            <AvatarFallback>{t.author?.full_name?.substring(0,1) || '?'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{t.author?.full_name || 'Usuario Anónimo'}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{t.comment_text}</p>
                                            <div className="flex gap-2 mt-3">
                                                <Button size="sm" onClick={() => handleStatusChange(t.id, 'approved')} className="h-8 gap-1 bg-green-600 hover:bg-green-700">
                                                    <ThumbsUp className="h-3 w-3" /> Aprobar
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(t.id, 'rejected')} className="h-8 gap-1 text-red-500 hover:text-red-600">
                                                    <ThumbsDown className="h-3 w-3" /> Rechazar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>
                        
                        <TabsContent value="approved" className="space-y-4">
                             {approvedTestimonials.map(t => (
                                <div key={t.id} className="p-3 rounded-lg bg-card border flex gap-3 items-center">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={t.author?.avatar_url || ''} />
                                        <AvatarFallback>{t.author?.full_name?.substring(0,1)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm line-clamp-1">{t.comment_text}</p>
                                    </div>
                                    <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">Visible</Badge>
                                </div>
                             ))}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

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
// =====================================================================
interface PublicProps {
  profile: ProfileData;
  podcasts: PublicPodcast[];
  totalLikes: number;
  initialTestimonials?: TestimonialWithAuthor[]; // [NUEVO]
}

export function PublicProfilePage({ profile, podcasts, totalLikes, initialTestimonials = [] }: PublicProps) {
  const { user } = useAuth();
  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U';
  
  // Como es vista pública, los testimonios vienen pre-filtrados (solo aprobados) desde el servidor.
  // Pero usamos estado por si agregamos uno nuevo dinámicamente.
  const [testimonials, setTestimonials] = useState(initialTestimonials);

  const handleTestimonialAdded = () => {
    // En una app real, aquí haríamos refetch o agregaríamos uno optimista pendiente.
    // Por ahora, solo refrescamos la página para simplificar
    window.location.reload(); 
  };

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

      {/* TABS DE CONTENIDO */}
      <Tabs defaultValue="podcasts" className="w-full">
        <TabsList className="w-full justify-center bg-transparent border-b rounded-none h-auto p-0 mb-8">
            <TabsTrigger value="podcasts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3 text-sm">
                Publicaciones
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3 text-sm">
                Testimonios ({testimonials.length})
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

        {/* [NUEVO] TAB DE TESTIMONIOS */}
        <TabsContent value="testimonials" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Lo que dice la comunidad</h3>
                {user && user.id !== profile.id && (
                     <LeaveTestimonialDialog 
                        profileId={profile.id} 
                        onTestimonialAdded={handleTestimonialAdded} 
                     />
                )}
            </div>

            <div className="grid gap-4">
                {testimonials.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                        Aún no hay testimonios. ¡Sé el primero en dejar uno!
                    </div>
                ) : (
                    testimonials.map((t) => (
                        <div key={t.id} className="p-4 rounded-xl bg-card border flex gap-4">
                            <Avatar>
                                <AvatarImage src={t.author?.avatar_url || ''} />
                                <AvatarFallback>{t.author?.full_name?.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-sm">{t.author?.full_name}</p>
                                    <span className="text-xs text-muted-foreground">• {new Date(t.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-foreground/90 leading-relaxed">{t.comment_text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}