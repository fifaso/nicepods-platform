// components/profile-client-component.tsx
// VERSIÓN: 10.0 (Final Integration: Reputation & Massive Curatela)

"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, PlayCircle, Calendar, Mic, MessageSquare, ThumbsUp, ThumbsDown, 
  ExternalLink, WifiOff, Settings, BookOpen, Layers, Lock, Globe, Clock 
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { LeaveTestimonialDialog } from "@/components/leave-testimonial-dialog";
import { DownloadsManager } from "@/components/downloads-manager";
import { CreateCollectionModal } from "@/components/social/create-collection-modal";
import { ReputationExplainer } from "@/components/social/reputation-explainer";

// --- UTILS ---
const formatDuration = (s: number | null) => {
    if (!s) return "0:00";
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// --- TYPES ---
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
  author: { full_name: string | null; avatar_url: string | null } | null;
};

export type Collection = {
  id: string;
  title: string;
  is_public: boolean;
  cover_image_url: string | null;
  collection_items: { count: number }[];
};

// --- COMPONENTES AUXILIARES ---
const CollectionCard = ({ col, isOwner = false }: { col: Collection, isOwner?: boolean }) => (
    <Link href={`/collection/${col.id}`} className="block group">
      <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden border border-white/5 group-hover:border-primary/50 transition-all shadow-lg">
         {col.cover_image_url ? (
           <img src={col.cover_image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
         ) : (
           <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
             <Layers className="w-12 h-12 text-white/10" />
           </div>
         )}
         {isOwner && (
           <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white flex items-center gap-1.5 border border-white/10">
             {col.is_public ? <Globe size={10} className="text-violet-400"/> : <Lock size={10} className="text-amber-400"/>}
             {col.is_public ? "PÚBLICA" : "PRIVADA"}
           </div>
         )}
      </div>
      <div className="mt-3 px-1">
        <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors uppercase tracking-tight">{col.title}</h4>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{col.collection_items?.[0]?.count || 0} AUDIOS EN HILO</p>
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
  finishedPodcasts: any[];
}

export function PrivateProfileDashboard({ 
    profile, 
    podcastsCreatedThisMonth, 
    initialTestimonials = [],
    initialCollections = [],
    finishedPodcasts = []
}: PrivateProps) {
  const { signOut, supabase } = useAuth();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState(initialTestimonials);

  const handleStatusChange = async (id: number, newStatus: 'approved' | 'rejected') => {
    if (!supabase) return;
    const { error } = await supabase.from('profile_testimonials').update({ status: newStatus }).eq('id', id);
    if (!error) {
        setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        toast({ title: "Actualizado", description: "Testimonio procesado." });
    }
  };

  const monthlyLimit = profile?.subscriptions?.plans?.monthly_creation_limit ?? 3;
  const usagePercentage = Math.min(100, (podcastsCreatedThisMonth / monthlyLimit) * 100);

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        
        {/* SIDEBAR */}
        <div className="w-full lg:w-80 flex flex-col gap-6 lg:sticky lg:top-24">
          <Card className="text-center overflow-hidden border-white/5 bg-card/50 backdrop-blur-xl">
            <div className="h-24 bg-gradient-to-br from-primary/20 to-violet-500/10"></div>
            <div className="px-6 pb-6 -mt-12">
                <Avatar className="h-24 w-24 mx-auto border-4 border-background shadow-2xl">
                    <AvatarImage src={profile?.avatar_url || ''} className="object-cover" />
                    <AvatarFallback className="text-2xl font-black">{profile?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="mt-4">
                    <h2 className="text-xl font-black tracking-tight">{profile?.full_name}</h2>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{profile.reputation_score || 0} Reputación</span>
                        <ReputationExplainer />
                    </div>
                </div>
                <div className="mt-8 space-y-2">
                    <Link href={`/profile/${profile.username}?view=public`} className="w-full block">
                        <Button variant="outline" className="w-full h-11 font-bold rounded-xl border-white/10 hover:bg-white/5">PERFIL PÚBLICO</Button>
                    </Link>
                    <Button onClick={signOut} variant="ghost" className="w-full text-red-500 hover:bg-red-500/5 font-bold h-11">CERRAR SESIÓN</Button>
                </div>
            </div>
          </Card>

          <Card className="bg-primary text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Suscripción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-300" />
                        <span className="font-black text-lg">{profile?.subscriptions?.plans?.name || 'Free'}</span>
                    </div>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">{profile?.subscriptions?.status}</Badge>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span>Uso del ciclo</span>
                        <span>{podcastsCreatedThisMonth} / {monthlyLimit}</span>
                    </div>
                    <Progress value={usagePercentage} className="h-1.5 bg-black/20" />
                </div>
                <Button className="w-full bg-white text-primary hover:bg-white/90 font-black rounded-xl" asChild>
                    <Link href="/pricing">MEJORAR PLAN</Link>
                </Button>
            </CardContent>
          </Card>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 w-full">
            <Tabs defaultValue="library" className="w-full">
                <TabsList className="w-full mb-8 grid grid-cols-4 bg-white/5 border border-white/5 p-1 rounded-2xl h-14">
                    <TabsTrigger value="library" className="rounded-xl data-[state=active]:bg-white/10 font-bold"><BookOpen size={16} className="mr-2 hidden sm:block" /> BIBLIOTECA</TabsTrigger>
                    <TabsTrigger value="offline" className="rounded-xl data-[state=active]:bg-white/10 font-bold"><WifiOff size={16} className="mr-2 hidden sm:block" /> OFFLINE</TabsTrigger>
                    <TabsTrigger value="testimonials" className="rounded-xl data-[state=active]:bg-white/10 font-bold"><MessageSquare size={16} className="mr-2 hidden sm:block" /> RESEÑAS</TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-white/10 font-bold"><Settings size={16} className="mr-2 hidden sm:block" /> CUENTA</TabsTrigger>
                </TabsList>

                <TabsContent value="library" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="bg-card/50 border-white/5 rounded-[2rem]">
                        <CardHeader className="flex flex-row items-center justify-between p-8">
                           <div>
                               <CardTitle className="text-2xl font-black uppercase tracking-tighter">Mis Hilos</CardTitle>
                               <CardDescription>Colecciones de valor curadas por ti.</CardDescription>
                           </div>
                           <CreateCollectionModal finishedPodcasts={finishedPodcasts} />
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                           {initialCollections.length === 0 ? (
                               <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                                   <Layers className="h-12 w-12 mx-auto text-white/5 mb-4" />
                                   <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Sin colecciones activas</p>
                               </div>
                           ) : (
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                   {initialCollections.map(col => <CollectionCard key={col.id} col={col} isOwner={true} />)}
                               </div>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="offline" className="mt-0"><DownloadsManager /></TabsContent>

                <TabsContent value="testimonials">
                    <Card className="bg-card/50 border-white/5 rounded-[2rem]">
                        <CardHeader className="p-8">
                            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Moderación</CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-4">
                            {testimonials.filter(t => t.status === 'pending').map(t => (
                                <div key={t.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex gap-4 items-start">
                                    <Avatar><AvatarImage src={t.author?.avatar_url || ''}/></Avatar>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">{t.author?.full_name}</p>
                                        <p className="text-sm text-zinc-400 mt-1">{t.comment_text}</p>
                                        <div className="flex gap-2 mt-4">
                                            <Button size="sm" onClick={() => handleStatusChange(t.id, 'approved')} className="bg-green-600">Aprobar</Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleStatusChange(t.id, 'rejected')} className="text-red-400">Rechazar</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card className="bg-card/50 border-white/5 rounded-[2rem]">
                        <CardHeader className="p-8"><CardTitle className="text-2xl font-black uppercase tracking-tighter">Ajustes</CardTitle></CardHeader>
                        <CardContent className="px-8 pb-8 space-y-6">
                            <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Nombre Público</Label><Input defaultValue={profile?.full_name || ''} className="bg-white/5 border-white/10 h-12 rounded-xl" /></div>
                            <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Biografía</Label><Input defaultValue={profile?.bio || ''} className="bg-white/5 border-white/10 h-12 rounded-xl" /></div>
                            <Button className="w-full h-12 font-black">GUARDAR CAMBIOS</Button>
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
// COMPONENTE B: PERFIL PÚBLICO (SOCIAL)
// =====================================================================
interface PublicProps {
  profile: ProfileData;
  podcasts: PublicPodcast[];
  totalLikes: number;
  initialTestimonials?: TestimonialWithAuthor[];
  publicCollections?: Collection[];
}

export function PublicProfilePage({ profile, podcasts, totalLikes, initialTestimonials = [], publicCollections = [] }: PublicProps) {
  const { user } = useAuth();
  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <div className="container mx-auto max-w-5xl py-20 px-4 animate-fade-in">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="relative group">
             <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary to-violet-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000"></div>
             <Avatar className="h-32 w-32 border-4 border-black relative shadow-2xl">
                 <AvatarImage src={profile?.avatar_url || ''} className="object-cover" />
                 <AvatarFallback className="text-4xl font-black bg-zinc-900">{userInitial}</AvatarFallback>
             </Avatar>
             {profile.is_verified && (
                 <div className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full p-1.5 border-4 border-black shadow-xl" title="Verificado">
                     <Crown size={18} fill="currentColor" />
                 </div>
             )}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mt-8 uppercase">{profile?.full_name}</h1>
        <p className="text-primary font-black uppercase tracking-[0.3em] text-xs mt-2">@{profile?.username}</p>
        
        {profile?.bio && <p className="max-w-2xl mt-6 text-base text-zinc-400 font-medium leading-relaxed">{profile.bio}</p>}

        <div className="flex gap-10 mt-10 justify-center">
            <div className="text-center"><span className="block font-black text-2xl">{podcasts.length}</span><span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Podcasts</span></div>
            <div className="text-center"><span className="block font-black text-2xl">{totalLikes}</span><span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Likes</span></div>
            <div className="text-center">
                <div className="flex items-center gap-1"><span className="block font-black text-2xl">{profile.reputation_score || 0}</span><ReputationExplainer /></div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Reputación</span>
            </div>
        </div>
      </div>

      <Tabs defaultValue="podcasts" className="w-full">
        <TabsList className="w-full justify-center bg-transparent border-b border-white/5 rounded-none h-auto p-0 mb-12 flex-wrap gap-8">
            <TabsTrigger value="podcasts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-4 text-xs font-black uppercase tracking-widest">Publicaciones</TabsTrigger>
            <TabsTrigger value="collections" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-4 text-xs font-black uppercase tracking-widest">Colecciones ({publicCollections.length})</TabsTrigger>
            <TabsTrigger value="testimonials" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-4 text-xs font-black uppercase tracking-widest">Testimonios</TabsTrigger>
        </TabsList>

        <TabsContent value="podcasts">
            <div className="grid gap-6 md:grid-cols-2">
                {podcasts.map((pod) => (
                    <Link key={pod.id} href={`/podcast/${pod.id}`} className="block group">
                        <Card className="h-full bg-white/5 border-white/5 hover:border-primary/40 transition-all rounded-3xl overflow-hidden">
                            <CardContent className="p-6 flex flex-col h-full">
                                <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors uppercase mb-3">{pod.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(pod.created_at).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Clock size={12}/> {formatDuration(pod.duration_seconds)}</span>
                                </div>
                                <p className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-grow">{pod.description || ""}</p>
                                <div className="flex justify-end pt-4 border-t border-white/5">
                                    <div className={cn(buttonVariants({ size: 'sm', variant: 'secondary' }), "rounded-full font-black text-[10px] tracking-widest px-6")}>ESCUCHAR</div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </TabsContent>

        <TabsContent value="collections">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {publicCollections.map(col => <CollectionCard key={col.id} col={col} />)}
            </div>
        </TabsContent>
        
        <TabsContent value="testimonials">
            <div className="max-w-2xl mx-auto space-y-6">
                {initialTestimonials.map((t) => (
                    <div key={t.id} className="p-6 rounded-3xl bg-white/5 border border-white/5 flex gap-5">
                        <Avatar className="h-12 w-12 border border-white/10"><AvatarImage src={t.author?.avatar_url || ''}/></Avatar>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-sm uppercase tracking-tight">{t.author?.full_name}</p>
                                <span className="text-[10px] font-black text-muted-foreground opacity-50 uppercase tracking-widest">• {new Date(t.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed italic">"{t.comment_text}"</p>
                        </div>
                    </div>
                ))}
                {user && user.id !== profile.id && (
                     <div className="pt-10 flex justify-center">
                        <LeaveTestimonialDialog profileId={profile.id} onTestimonialAdded={() => window.location.reload()} />
                     </div>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
