// components/profile-client-component.tsx
// VERSIÓN: 9.1 (Mobile UX Fix: Full Clickable Cards & Data Formatting)

"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button"; // Importamos variantes para simular botones
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, PlayCircle, Calendar, Mic, MessageSquare, ThumbsUp, ThumbsDown, 
  ExternalLink, WifiOff, Settings, BookOpen, Layers, Lock, Globe, Plus, Clock 
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // Necesario para combinar clases

// Importamos el diálogo de creación de testimonios
import { LeaveTestimonialDialog } from "@/components/leave-testimonial-dialog";

// Importamos el Gestor de Descargas
import { DownloadsManager } from "@/components/downloads-manager";

// --- UTILIDAD DE PRIVACIDAD ---
const isUUID = (str: string | null | undefined) => {
    if (!str) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};

// --- UTILIDAD DE FORMATO DE TIEMPO (NUEVO) ---
const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    // Si dura menos de 1 min, muestra "0:XX", si no "M min" o formato extendido si prefieres
    return `${m}:${s.toString().padStart(2, '0')}`;
};

// --- TIPOS ---
export type ProfileData = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  reputation_score?: number;
  is_verified?: boolean;
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

export type Collection = {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  cover_image_url: string | null;
  updated_at: string;
  collection_items: { count: number }[];
};

// =====================================================================
// COMPONENTE AUXILIAR: TARJETA DE COLECCIÓN
// =====================================================================
const CompactCollectionCard = ({ col, isOwner = false }: { col: Collection, isOwner?: boolean }) => (
  <Link href={`/collection/${col.id}`} className="block group">
    <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden border border-white/5 group-hover:border-primary/50 transition-all">
       <div className="absolute top-0 inset-x-4 h-1 bg-white/10 rounded-t-lg mx-2 -mt-1" />
       
       {col.cover_image_url ? (
         <img src={col.cover_image_url} alt={col.title} className="w-full h-full object-cover" />
       ) : (
         <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
           <Layers className="w-10 h-10 text-muted-foreground/30" />
         </div>
       )}
       
       {isOwner && (
         <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white flex items-center gap-1">
           {col.is_public ? <Globe size={10} className="text-green-400"/> : <Lock size={10} className="text-amber-400"/>}
           {col.is_public ? "Pública" : "Privada"}
         </div>
       )}
    </div>
    <div className="mt-3">
      <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{col.title}</h4>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {col.collection_items?.[0]?.count || 0} audios
      </p>
    </div>
  </Link>
);

// =====================================================================
// COMPONENTE A: PERFIL PRIVADO (DASHBOARD)
// =====================================================================
interface PrivateProps {
  profile: ProfileData;
  podcastsCreatedThisMonth: number;
  initialTestimonials?: TestimonialWithAuthor[];
  initialCollections?: Collection[];
}

export function PrivateProfileDashboard({ 
  profile, 
  podcastsCreatedThisMonth, 
  initialTestimonials = [],
  initialCollections = []
}: PrivateProps) {
  const { signOut, user, supabase } = useAuth();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState(initialTestimonials);

  const handleStatusChange = async (id: number, newStatus: 'approved' | 'rejected') => {
    if (!supabase) return;
    const { error } = await supabase
        .from('profile_testimonials')
        .update({ status: newStatus })
        .eq('id', id);

    if (error) {
        toast({ title: "Error", description: "No se pudo actualizar.", variant: "destructive" });
    } else {
        setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        toast({ title: "Actualizado", description: `Testimonio ${newStatus === 'approved' ? 'aprobado' : 'rechazado'}.` });
    }
  };

  const monthlyLimit = profile?.subscriptions?.plans?.monthly_creation_limit ?? 3;
  const podcastsRemaining = Math.max(0, monthlyLimit - podcastsCreatedThisMonth);
  const usagePercentage = Math.min(100, (podcastsCreatedThisMonth / monthlyLimit) * 100);
  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U';

  const pendingTestimonials = testimonials.filter(t => t.status === 'pending');
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');
  const showUsername = profile?.username && !isUUID(profile.username);

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
                <div className="mt-4">
                  <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                    {profile?.full_name}
                    {profile?.is_verified && <Badge variant="secondary" className="h-5 px-1 text-[10px]">Verified</Badge>}
                  </h2>
                  <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>{profile.reputation_score || 0} Rep</span>
                  </div>
                </div>
                
                {showUsername && (
                    <p className="text-sm text-muted-foreground mt-1">@{profile?.username}</p>
                )}
                
                <div className="mt-6 space-y-2">
                    {profile?.username && (
                      <Link href={`/profile/${profile.username}?view=public`} className="w-full block">
                          <Button variant="outline" className="w-full">
                            Ver mi Perfil Público <ExternalLink className="ml-2 h-3 w-3" />
                          </Button>
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

        {/* CONTENIDO PRINCIPAL (TABS) */}
        <div className="w-full md:w-2/3">
            <Tabs defaultValue="offline" className="w-full">
                <TabsList className="w-full mb-6 grid grid-cols-4 bg-muted/20">
                    <TabsTrigger value="offline">
                        <WifiOff className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Offline</span>
                    </TabsTrigger>
                    <TabsTrigger value="library">
                        <BookOpen className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Biblioteca</span>
                    </TabsTrigger>
                    <TabsTrigger value="testimonials">
                        <MessageSquare className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Reseñas</span>
                        {pendingTestimonials.length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendingTestimonials.length}</span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Settings className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Cuenta</span>
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: DESCARGAS */}
                <TabsContent value="offline" className="mt-0 animate-in fade-in slide-in-from-bottom-2">
                    <DownloadsManager />
                </TabsContent>

                {/* TAB 2: BIBLIOTECA */}
                <TabsContent value="library" className="mt-0 animate-in fade-in slide-in-from-bottom-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                           <div>
                               <CardTitle>Mis Colecciones</CardTitle>
                               <CardDescription>Gestiona tus listas de curaduría.</CardDescription>
                           </div>
                           <Button size="sm" variant="outline" className="gap-2">
                               <Plus size={16} /> Nueva
                           </Button>
                        </CardHeader>
                        <CardContent>
                           {initialCollections.length === 0 ? (
                               <div className="text-center py-10 border-2 border-dashed rounded-xl">
                                   <Layers className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                                   <p className="text-sm text-muted-foreground">No has creado colecciones aún.</p>
                                   <p className="text-xs text-muted-foreground mt-1">Guarda podcasts mientras escuchas para empezar.</p>
                               </div>
                           ) : (
                               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                   {initialCollections.map(col => (
                                       <CompactCollectionCard key={col.id} col={col} isOwner={true} />
                                   ))}
                               </div>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 3: TESTIMONIOS */}
                <TabsContent value="testimonials" className="mt-0 animate-in fade-in slide-in-from-bottom-2">
                     <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Testimonios</CardTitle>
                                {pendingTestimonials.length > 0 && <Badge variant="destructive">{pendingTestimonials.length} Pendientes</Badge>}
                            </div>
                            <CardDescription>Lo que dicen de ti.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="pending" className="w-full">
                                <TabsList className="w-full mb-4">
                                    <TabsTrigger value="pending" className="flex-1 text-xs">Pendientes ({pendingTestimonials.length})</TabsTrigger>
                                    <TabsTrigger value="approved" className="flex-1 text-xs">Aprobados ({approvedTestimonials.length})</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="pending" className="space-y-4">
                                    {pendingTestimonials.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                            <p className="text-sm">Estás al día. No hay testimonios pendientes.</p>
                                        </div>
                                    ) : (
                                        pendingTestimonials.map(t => (
                                            <div key={t.id} className="p-4 rounded-lg bg-muted/40 border flex gap-4">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={t.author?.avatar_url || ''} />
                                                    <AvatarFallback>{t.author?.full_name?.substring(0,1) || '?'}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm">{t.author?.full_name || 'Anónimo'}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">{t.comment_text}</p>
                                                    <div className="flex gap-2 mt-3">
                                                        <Button size="sm" onClick={() => handleStatusChange(t.id, 'approved')} className="h-8 bg-green-600 hover:bg-green-700">
                                                            <ThumbsUp className="h-3 w-3 mr-1" /> Aprobar
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(t.id, 'rejected')} className="h-8 text-red-500 hover:text-red-600">
                                                            <ThumbsDown className="h-3 w-3 mr-1" /> Rechazar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </TabsContent>
                                
                                <TabsContent value="approved" className="space-y-4">
                                    {approvedTestimonials.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-6">Aún no has aprobado ningún testimonio.</p>
                                    ) : (
                                        approvedTestimonials.map(t => (
                                            <div key={t.id} className="p-3 rounded-lg bg-card border flex gap-3 items-center">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={t.author?.avatar_url || ''} />
                                                    <AvatarFallback>{t.author?.full_name?.substring(0,1)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="text-sm italic">"{t.comment_text}"</p>
                                                    <p className="text-xs text-muted-foreground mt-1">- {t.author?.full_name}</p>
                                                </div>
                                                <Badge variant="outline" className="text-green-500 bg-green-500/10 border-green-500/20">Visible</Badge>
                                            </div>
                                        ))
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                     </Card>
                </TabsContent>

                {/* TAB 4: CONFIGURACIÓN */}
                <TabsContent value="settings" className="mt-0 animate-in fade-in slide-in-from-bottom-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración</CardTitle>
                            <CardDescription>Datos personales.</CardDescription>
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
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// COMPONENTE B: PERFIL PÚBLICO (SOCIAL - FIXED)
// =====================================================================
interface PublicProps {
  profile: ProfileData;
  podcasts: PublicPodcast[];
  totalLikes: number;
  initialTestimonials?: TestimonialWithAuthor[];
  publicCollections?: Collection[];
}

export function PublicProfilePage({ 
  profile, 
  podcasts, 
  totalLikes, 
  initialTestimonials = [],
  publicCollections = []
}: PublicProps) {
  const { user } = useAuth();
  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U';
  const [testimonials] = useState(initialTestimonials);

  const showUsername = profile?.username && !isUUID(profile.username);

  const handleTestimonialAdded = () => {
    window.location.reload(); 
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 animate-fade-in">
      {/* HEADER PÚBLICO */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="relative">
             <Avatar className="h-32 w-32 border-4 border-background shadow-xl mb-4">
                 <AvatarImage src={profile?.avatar_url || ''} />
                 <AvatarFallback className="text-4xl bg-primary/10 text-primary">{userInitial}</AvatarFallback>
             </Avatar>
             {profile.is_verified && (
                 <div className="absolute bottom-6 right-2 bg-blue-500 text-white rounded-full p-1 border-2 border-background" title="Verificado">
                     <Crown size={16} fill="currentColor" />
                 </div>
             )}
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight">{profile?.full_name}</h1>
        
        {showUsername && (
            <p className="text-muted-foreground mt-1 text-lg">@{profile?.username}</p>
        )}
        
        {profile?.bio && (
            <p className="max-w-lg mt-4 text-sm text-muted-foreground/80 leading-relaxed">
                {profile.bio}
            </p>
        )}

        <div className="flex gap-6 mt-6 justify-center">
            <div className="text-center">
                <span className="block font-bold text-xl">{podcasts.length}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Podcasts</span>
            </div>
            <div className="text-center">
                <span className="block font-bold text-xl">{totalLikes}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Likes</span>
            </div>
            <div className="text-center">
                <span className="block font-bold text-xl">{profile.reputation_score || 0}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Reputación</span>
            </div>
        </div>
      </div>

      {/* LISTA DE CONTENIDO */}
      <Tabs defaultValue="podcasts" className="w-full">
        <TabsList className="w-full justify-center bg-transparent border-b rounded-none h-auto p-0 mb-8 flex-wrap">
            <TabsTrigger value="podcasts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm">
                Publicaciones
            </TabsTrigger>
            <TabsTrigger value="collections" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm">
                Colecciones
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm">
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
                        /* CORRECCIÓN UX MÓVIL: Envolvemos toda la card en el Link */
                        <Link key={pod.id} href={`/podcast/${pod.id}`} className="block group">
                            <Card className="h-full hover:border-primary/50 transition-all cursor-pointer bg-card/50">
                                <CardContent className="p-5 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{pod.title}</h3>
                                    </div>
                                    
                                    <div className="text-xs text-muted-foreground flex items-center gap-2 mb-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {pod.created_at ? new Date(pod.created_at).toLocaleDateString() : ''}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDuration(pod.duration_seconds)}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                                        {pod.description || ""} 
                                    </p>
                                    
                                    <div className="pt-4 border-t flex justify-end items-center mt-auto">
                                        {/* Usamos un div simulando botón para evitar nesting ilegal de <a><button> */}
                                        <div className={cn(buttonVariants({ size: 'sm', variant: 'secondary' }), "gap-2 rounded-full h-8 pointer-events-none")}>
                                            <PlayCircle className="h-3.5 w-3.5" /> Escuchar
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
            {publicCollections.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed">
                    <Layers className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No hay colecciones públicas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {publicCollections.map(col => (
                        <CompactCollectionCard key={col.id} col={col} isOwner={false} />
                    ))}
                </div>
            )}
        </TabsContent>
        
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