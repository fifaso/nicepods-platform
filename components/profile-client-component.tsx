// components/profile-client-component.tsx
// VERSIÓN: 11.0 (Master Integrity & Full Lifecycle Management)

"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, PlayCircle, Calendar, Mic, MessageSquare, ThumbsUp, ThumbsDown, 
  ExternalLink, WifiOff, Settings, BookOpen, Layers, Lock, Globe, Plus, 
  Clock, CheckCircle2, AlertCircle, ShieldCheck, UserCircle, Save, Loader2 
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Lógica de Servidor & Componentes Sociales
import { updateProfile } from "@/actions/profile-actions";
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

const isUUID = (str: string | null | undefined) => {
    if (!str) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
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
    plans: { 
        name: string | null; 
        monthly_creation_limit: number;
        features?: string[]; // Lista de beneficios del plan
    } | null;
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

// --- COMPONENTE: TARJETA DE COLECCIÓN ---
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
// COMPONENTE A: PERFIL PRIVADO (DASHBOARD COMPLETO)
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
  const { signOut, supabase, user: authUser } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [testimonials, setTestimonials] = useState(initialTestimonials);

  // Estados de Formulario
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    bio: profile.bio || "",
    username: profile.username || ""
  });

  const handleUpdateProfile = () => {
    startTransition(async () => {
        const result = await updateProfile({
            display_name: formData.full_name,
            bio: formData.bio,
            // Agregamos handle en la lógica de action si es necesario
        });

        if (result.success) {
            toast({ title: "Éxito", description: "Perfil actualizado correctamente." });
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
    });
  };

  const handleStatusChange = async (id: number, newStatus: 'approved' | 'rejected') => {
    if (!supabase) return;
    const { error } = await supabase.from('profile_testimonials').update({ status: newStatus }).eq('id', id);
    if (!error) {
        setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        toast({ title: "Moderación", description: `Reseña ${newStatus}.` });
    }
  };

  const monthlyLimit = profile?.subscriptions?.plans?.monthly_creation_limit ?? 3;
  const usagePercentage = Math.min(100, (podcastsCreatedThisMonth / monthlyLimit) * 100);

  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 md:px-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        
        {/* SIDEBAR DE GESTIÓN (IZQUIERDA) */}
        <div className="w-full lg:w-80 flex flex-col gap-6 lg:sticky lg:top-24">
          
          {/* CARD DE IDENTIDAD AURORA */}
          <Card className="text-center overflow-hidden border-white/10 bg-card/40 backdrop-blur-2xl shadow-2xl rounded-[2rem]">
            <div className="h-28 bg-gradient-to-br from-primary/30 via-violet-500/20 to-transparent"></div>
            <div className="px-6 pb-8 -mt-14 relative">
                <Avatar className="h-28 w-28 mx-auto border-4 border-zinc-950 shadow-2xl scale-110">
                    <AvatarImage src={profile?.avatar_url || ''} className="object-cover" />
                    <AvatarFallback className="text-3xl font-black bg-zinc-900">{profile?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="mt-6 space-y-1">
                    <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center justify-center gap-2">
                        {profile?.full_name}
                        {profile?.is_verified && <ShieldCheck size={20} className="text-primary fill-primary/10" />}
                    </h2>
                    <div className="flex items-center justify-center gap-2 group cursor-help">
                        <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">{profile.reputation_score || 0} Reputación</span>
                        <ReputationExplainer />
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-3">
                    <Link href={`/profile/${profile.username}?view=public`} className="w-full">
                        <Button variant="outline" className="w-full h-12 font-black rounded-2xl border-white/10 hover:bg-white/5 uppercase tracking-widest text-[10px]">
                            Vista Pública <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                    </Link>
                    <Button onClick={signOut} variant="ghost" className="w-full text-red-500/70 hover:text-red-500 hover:bg-red-500/5 font-black text-[10px] tracking-widest uppercase">
                        Cerrar Sesión
                    </Button>
                </div>
            </div>
          </Card>

          {/* STATUS DE SUSCRIPCIÓN PROFESIONAL */}
          <Card className="bg-primary text-white border-none shadow-2xl rounded-[2rem] overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            <CardHeader className="pb-4 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Tu Nivel NicePod</CardTitle>
                <Crown className="h-4 w-4 text-yellow-300 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6 relative">
                <div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">
                        {profile?.subscriptions?.plans?.name || 'Explorador'}
                    </h3>
                    <Badge className="mt-2 bg-black/20 hover:bg-black/30 text-white border-none text-[9px] font-black tracking-widest">
                        {profile?.subscriptions?.status?.toUpperCase()}
                    </Badge>
                </div>

                <div className="space-y-2.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span>Límite de Creación</span>
                        <span>{podcastsCreatedThisMonth} / {monthlyLimit}</span>
                    </div>
                    <Progress value={usagePercentage} className="h-2 bg-black/20" />
                </div>

                {/* Lista de beneficios activa */}
                <div className="space-y-2 border-t border-white/10 pt-4">
                    {['IA Multimodal Pro', 'Geolocalización Activa', 'Curaduría Ilimitada'].map(feat => (
                        <div key={feat} className="flex items-center gap-2 text-[10px] font-bold">
                            <CheckCircle2 size={12} className="text-white/50" /> {feat}
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="relative">
                <Button className="w-full bg-white text-primary hover:bg-white/90 font-black rounded-2xl h-12 shadow-xl" asChild>
                    <Link href="/pricing">GESTIONAR PLAN</Link>
                </Button>
            </CardFooter>
          </Card>
        </div>

        {/* CONTENIDO PRINCIPAL (DERECHA) */}
        <div className="flex-1 w-full space-y-6">
            <Tabs defaultValue="library" className="w-full">
                <TabsList className="w-full mb-10 grid grid-cols-4 bg-zinc-900/50 border border-white/5 p-1.5 rounded-[1.5rem] h-16 shadow-inner">
                    <TabsTrigger value="library" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[10px] tracking-widest"><BookOpen size={16} className="mr-2 hidden md:block" /> BIBLIOTECA</TabsTrigger>
                    <TabsTrigger value="offline" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[10px] tracking-widest"><WifiOff size={16} className="mr-2 hidden md:block" /> OFFLINE</TabsTrigger>
                    <TabsTrigger value="testimonials" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[10px] tracking-widest"><MessageSquare size={16} className="mr-2 hidden md:block" /> RESEÑAS</TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[10px] tracking-widest"><Settings size={16} className="mr-2 hidden md:block" /> AJUSTES</TabsTrigger>
                </TabsList>

                {/* TAB: BIBLIOTECA (Hilos de Curaduría) */}
                <TabsContent value="library" className="animate-in fade-in slide-in-from-bottom-6 duration-700 outline-none">
                    <Card className="bg-card/30 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <CardHeader className="flex flex-row items-center justify-between p-10">
                           <div>
                               <CardTitle className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">Mis Hilos</CardTitle>
                               <CardDescription className="text-zinc-500 font-medium">Colecciones de conocimiento curadas por tu criterio.</CardDescription>
                           </div>
                           <CreateCollectionModal finishedPodcasts={finishedPodcasts} />
                        </CardHeader>
                        <CardContent className="px-10 pb-10">
                           {initialCollections.length === 0 ? (
                               <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
                                   <Layers className="h-16 w-16 mx-auto text-white/5 mb-6" />
                                   <p className="font-black text-muted-foreground uppercase tracking-[0.3em] text-[10px] mb-2">Bóveda Vacía</p>
                                   <p className="text-xs text-zinc-600 max-w-[200px] mx-auto leading-relaxed">Escucha podcasts completos para desbloquear la curaduría.</p>
                               </div>
                           ) : (
                               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                   {initialCollections.map(col => <CollectionCard key={col.id} col={col} isOwner={true} />)}
                               </div>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: OFFLINE */}
                <TabsContent value="offline" className="mt-0 outline-none">
                    <DownloadsManager />
                </TabsContent>

                {/* TAB: RESEÑAS (Moderación) */}
                <TabsContent value="testimonials" className="outline-none">
                    <Card className="bg-card/30 border-white/5 rounded-[2.5rem] shadow-2xl">
                        <CardHeader className="p-10">
                            <CardTitle className="text-3xl font-black uppercase tracking-tighter">Moderación Social</CardTitle>
                            <CardDescription>Gestiona el testimonio de otros usuarios en tu perfil.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 pb-10 space-y-6">
                            {testimonials.length === 0 ? (
                                <p className="text-center py-10 text-xs font-bold text-zinc-600 uppercase tracking-widest">Sin actividad reciente</p>
                            ) : (
                                testimonials.filter(t => t.status === 'pending').map(t => (
                                    <div key={t.id} className="p-6 rounded-[1.5rem] bg-white/5 border border-white/5 flex flex-col md:flex-row gap-6 items-start md:items-center animate-in zoom-in-95">
                                        <div className="flex items-center gap-4 flex-1">
                                            <Avatar className="h-12 w-12 border border-white/10"><AvatarImage src={t.author?.avatar_url || ''}/></Avatar>
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-tight">{t.author?.full_name}</p>
                                                <p className="text-sm text-zinc-400 mt-1 leading-relaxed italic">"{t.comment_text}"</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <Button onClick={() => handleStatusChange(t.id, 'approved')} className="flex-1 md:flex-none bg-green-600 font-bold rounded-xl h-10">APROBAR</Button>
                                            <Button variant="ghost" onClick={() => handleStatusChange(t.id, 'rejected')} className="flex-1 md:flex-none text-red-400 font-bold hover:bg-red-500/10 h-10">RECHAZAR</Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: AJUSTES (Gestión de Identidad) */}
                <TabsContent value="settings" className="outline-none">
                    <Card className="bg-card/30 border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <CardHeader className="p-10 bg-white/[0.02]">
                            <CardTitle className="text-3xl font-black uppercase tracking-tighter">Identidad Digital</CardTitle>
                            <CardDescription>Configura cómo te percibe la comunidad de NicePod.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Nombre Público</Label>
                                    <Input 
                                        value={formData.full_name} 
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        className="bg-zinc-900/50 border-white/10 h-14 rounded-2xl font-bold focus:ring-primary shadow-inner" 
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Identificador (@handle)</Label>
                                    <Input 
                                        value={formData.username} 
                                        disabled 
                                        className="bg-black/40 border-white/5 h-14 rounded-2xl font-mono text-zinc-600" 
                                    />
                                    <p className="text-[9px] font-bold text-zinc-600 flex items-center gap-1.5 px-1">
                                        <AlertCircle size={10} /> El handle solo puede cambiarse vía soporte técnico.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Biografía de Sabiduría</Label>
                                <textarea 
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    rows={4}
                                    placeholder="Define tu enfoque creativo..."
                                    className="w-full bg-zinc-900/50 border-white/10 rounded-[1.5rem] p-5 text-sm font-medium focus:ring-primary focus:border-primary outline-none transition-all shadow-inner resize-none"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="p-10 pt-0 bg-white/[0.01]">
                            <Button 
                                onClick={handleUpdateProfile} 
                                disabled={isPending}
                                className="w-full h-16 font-black text-lg tracking-tighter uppercase rounded-[1.5rem] shadow-2xl group"
                            >
                                {isPending ? <Loader2 className="animate-spin" /> : <><Save className="mr-3 group-hover:scale-110 transition-transform" /> GUARDAR TRANSFORMACIÓN</>}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// COMPONENTE B: PERFIL PÚBLICO (SOCIAL & REPUTATION)
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

  return (
    <div className="container mx-auto max-w-5xl py-24 px-4 md:px-8 animate-fade-in">
      
      {/* HERO SECTION */}
      <div className="flex flex-col items-center text-center mb-20">
        <div className="relative group">
             <div className="absolute -inset-2 bg-gradient-to-tr from-primary via-violet-600 to-fuchsia-600 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition duration-1000 animate-pulse"></div>
             <Avatar className="h-36 w-36 border-4 border-zinc-950 relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                 <AvatarImage src={profile?.avatar_url || ''} className="object-cover" />
                 <AvatarFallback className="text-5xl font-black bg-zinc-900 text-zinc-700">{userInitial}</AvatarFallback>
             </Avatar>
             {profile.is_verified && (
                 <div className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-2 border-4 border-zinc-950 shadow-2xl" title="Curador Verificado">
                     <ShieldCheck size={20} fill="currentColor" />
                 </div>
             )}
        </div>
        
        <div className="mt-10 space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-white drop-shadow-2xl">
                {profile?.full_name}
            </h1>
            <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] opacity-80">
                @{profile?.username}
            </p>
        </div>
        
        {profile?.bio && (
            <p className="max-w-2xl mt-8 text-lg text-zinc-400 font-medium leading-relaxed italic">
                "{profile.bio}"
            </p>
        )}

        <div className="flex flex-wrap gap-8 md:gap-16 mt-12 justify-center">
            <div className="text-center group">
                <span className="block font-black text-3xl md:text-4xl text-white transition-transform group-hover:scale-110">{podcasts.length}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">Podcasts</span>
            </div>
            <div className="text-center group">
                <span className="block font-black text-3xl md:text-4xl text-white transition-transform group-hover:scale-110">{totalLikes}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">Likes Recibidos</span>
            </div>
            <div className="text-center group">
                <div className="flex items-center gap-2 justify-center">
                    <span className="block font-black text-3xl md:text-4xl text-primary transition-transform group-hover:scale-110">{profile.reputation_score || 0}</span>
                    <ReputationExplainer />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">Prestigio de Curador</span>
            </div>
        </div>
      </div>

      {/* FEED DE CONTENIDO CURADO */}
      <Tabs defaultValue="podcasts" className="w-full">
        <TabsList className="w-full justify-center bg-transparent border-b border-white/5 rounded-none h-auto p-0 mb-16 flex-wrap gap-4 md:gap-12">
            <TabsTrigger value="podcasts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all">Publicaciones</TabsTrigger>
            <TabsTrigger value="collections" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all">Colecciones ({publicCollections.length})</TabsTrigger>
            <TabsTrigger value="testimonials" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all">Resonancia Comunitaria</TabsTrigger>
        </TabsList>

        <TabsContent value="podcasts" className="animate-in fade-in duration-700 outline-none">
            <div className="grid gap-8 md:grid-cols-2">
                {podcasts.map((pod) => (
                    <Link key={pod.id} href={`/podcast/${pod.id}`} className="block group">
                        <Card className="h-full bg-zinc-900/40 border-white/5 hover:border-primary/40 hover:bg-zinc-900/60 transition-all rounded-[2.5rem] overflow-hidden shadow-xl">
                            <CardContent className="p-8 flex flex-col h-full">
                                <h3 className="font-black text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors uppercase mb-4 tracking-tight">{pod.title}</h3>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">
                                    <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg"><Calendar size={12}/> {new Date(pod.created_at).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg"><Clock size={12}/> {formatDuration(pod.duration_seconds)}</span>
                                </div>
                                <p className="text-zinc-400 font-medium line-clamp-2 mb-8 leading-relaxed">{pod.description || "Contenido sin descripción"}</p>
                                <div className="flex justify-end pt-6 border-t border-white/5 mt-auto">
                                    <div className={cn(buttonVariants({ size: 'sm', variant: 'secondary' }), "rounded-full font-black text-[10px] tracking-widest px-8 h-10")}>EXPLORAR</div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
            {podcasts.length === 0 && (
                <div className="text-center py-20 opacity-30 font-black uppercase tracking-[0.5em] text-xs">Sin registros públicos</div>
            )}
        </TabsContent>

        <TabsContent value="collections" className="animate-in fade-in duration-700 outline-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {publicCollections.map(col => <CollectionCard key={col.id} col={col} />)}
            </div>
            {publicCollections.length === 0 && (
                <div className="text-center py-20 opacity-30 font-black uppercase tracking-[0.5em] text-xs">Sin bibliotecas curadas</div>
            )}
        </TabsContent>
        
        <TabsContent value="testimonials" className="animate-in fade-in duration-700 outline-none">
            <div className="max-w-3xl mx-auto space-y-8">
                {initialTestimonials.map((t) => (
                    <div key={t.id} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col md:flex-row gap-6 shadow-2xl">
                        <Avatar className="h-16 w-16 border-2 border-white/10 shadow-lg"><AvatarImage src={t.author?.avatar_url || ''} className="object-cover"/></Avatar>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <p className="font-black text-md uppercase tracking-tighter text-white">{t.author?.full_name}</p>
                                <div className="h-1 w-1 rounded-full bg-zinc-700" />
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{new Date(t.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-base text-zinc-300 leading-relaxed italic font-medium">"{t.comment_text}"</p>
                        </div>
                    </div>
                ))}
                
                {initialTestimonials.length === 0 && (
                    <p className="text-center py-10 text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Silencio absoluto en la comunidad</p>
                )}

                {user && user.id !== profile.id && (
                     <div className="pt-16 flex flex-col items-center gap-4">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">¿Ha resonado contigo?</p>
                        <LeaveTestimonialDialog profileId={profile.id} onTestimonialAdded={() => window.location.reload()} />
                     </div>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}