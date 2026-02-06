// components/profile-client-component.tsx
// VERSIÓN: 12.0 (Identity & Performance Master - Zero Warning Edition)
// Misión: Gestionar el ciclo de vida completo del perfil (Privado/Público) con LCP optimizado.

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn, getSafeAsset } from "@/lib/utils";
import {
    AlertCircle,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Crown,
    ExternalLink,
    Globe,
    Layers,
    Loader2,
    Lock,
    MessageSquare,
    Save,
    Settings,
    ShieldCheck,
    WifiOff
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState, useTransition } from "react";

// Lógica de Negocio y Componentes del Ecosistema
import { updateProfile } from "@/actions/profile-actions";
import { DownloadsManager } from "@/components/downloads-manager";
import { LeaveTestimonialDialog } from "@/components/leave-testimonial-dialog";
import { CreateCollectionModal } from "@/components/social/create-collection-modal";
import { ReputationExplainer } from "@/components/social/reputation-explainer";

// --- UTILIDADES TÉCNICAS ---

/**
 * formatDuration: Convierte segundos en formato MM:SS para visualización de podcasts.
 */
const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// --- DEFINICIÓN DE TIPOS ESTRICTOS ---

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
            features?: string[];
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

// --- SUB-COMPONENTE: CollectionCard (Optimizado con Next Image) ---

const CollectionCard = ({ collection, isOwner = false }: { collection: Collection; isOwner?: boolean }) => {
    const coverImage = getSafeAsset(collection.cover_image_url, 'cover');

    return (
        <Link href={`/collection/${collection.id}`} className="block group">
            <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden border border-white/5 group-hover:border-primary/50 transition-all shadow-lg">
                {collection.cover_image_url ? (
                    <Image
                        src={coverImage}
                        alt={collection.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                        <Layers className="w-12 h-12 text-white/10" />
                    </div>
                )}

                {isOwner && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black text-white flex items-center gap-2 border border-white/10">
                        {collection.is_public ? (
                            <Globe size={12} className="text-violet-400" />
                        ) : (
                            <Lock size={12} className="text-amber-400" />
                        )}
                        {collection.is_public ? "PÚBLICA" : "PRIVADA"}
                    </div>
                )}
            </div>
            <div className="mt-4 px-1">
                <h4 className="font-black text-sm truncate group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">
                    {collection.title}
                </h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                    {collection.collection_items?.[0]?.count || 0} AUDIOS EN HILO
                </p>
            </div>
        </Link>
    );
};

// =====================================================================
// COMPONENTE A: PrivateProfileDashboard (Gestión Interna)
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
    const [isPending, startTransition] = useTransition();
    const [testimonials, setTestimonials] = useState<TestimonialWithAuthor[]>(initialTestimonials);

    // Estados de Formulario de Identidad
    const [formData, setFormData] = useState({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        username: profile.username || ""
    });

    /**
     * handleUpdateProfile
     * Persiste los cambios de identidad usando Server Actions y transiciones optimizadas.
     */
    const handleUpdateProfile = useCallback(() => {
        startTransition(async () => {
            const result = await updateProfile({
                display_name: formData.full_name,
                bio: formData.bio
            });

            if (result.success) {
                toast({
                    title: "Transformación Completada",
                    description: "Tu identidad en NicePod ha sido actualizada."
                });
            } else {
                toast({
                    title: "Error de Sincronía",
                    description: result.message,
                    variant: "destructive"
                });
            }
        });
    }, [formData, toast]);

    /**
     * handleStatusChange
     * Gestiona la moderación de testimonios sociales.
     */
    const handleStatusChange = useCallback(async (id: number, newStatus: 'approved' | 'rejected') => {
        if (!supabase) return;

        const { error } = await supabase
            .from('profile_testimonials')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            setTestimonials((prev) =>
                prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
            );
            toast({
                title: "Moderación Aplicada",
                description: `La reseña ha sido marcada como ${newStatus}.`
            });
        }
    }, [supabase, toast]);

    const monthlyLimit = profile?.subscriptions?.plans?.monthly_creation_limit ?? 3;
    const usagePercentage = Math.min(100, (podcastsCreatedThisMonth / monthlyLimit) * 100);

    return (
        <div className="container mx-auto max-w-7xl py-12 px-4 md:px-6 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row gap-12 items-start">

                {/* SIDEBAR TÁCTICA (Configuración y Plan) */}
                <div className="w-full lg:w-85 flex flex-col gap-8 lg:sticky lg:top-24">

                    {/* TARJETA DE IDENTIDAD AURORA */}
                    <Card className="text-center overflow-hidden border-white/10 bg-card/30 backdrop-blur-3xl shadow-2xl rounded-[2.5rem]">
                        <div className="h-32 bg-gradient-to-br from-primary/30 via-violet-600/20 to-transparent"></div>
                        <div className="px-8 pb-10 -mt-16 relative">
                            <div className="relative h-32 w-32 mx-auto mb-6">
                                <Avatar className="h-full w-full border-4 border-zinc-950 shadow-2xl">
                                    <AvatarImage
                                        src={getSafeAsset(profile?.avatar_url, 'avatar')}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="text-4xl font-black bg-zinc-900 text-primary">
                                        {profile?.full_name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-black tracking-tighter uppercase flex items-center justify-center gap-2">
                                    {profile?.full_name}
                                    {profile?.is_verified && (
                                        <ShieldCheck size={24} className="text-primary fill-primary/10" />
                                    )}
                                </h2>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                                        {profile.reputation_score || 0} REPUTACIÓN
                                    </span>
                                    <ReputationExplainer />
                                </div>
                            </div>

                            <div className="mt-10 flex flex-col gap-3">
                                <Link href={`/profile/${profile.username}?view=public`} className="w-full">
                                    <Button variant="outline" className="w-full h-12 font-black rounded-2xl border-white/10 hover:bg-white/5 uppercase tracking-widest text-[10px]">
                                        VER PERFIL PÚBLICO <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                                <Button
                                    onClick={signOut}
                                    variant="ghost"
                                    className="w-full text-red-500/60 hover:text-red-500 hover:bg-red-500/5 font-black text-[10px] tracking-widest uppercase"
                                >
                                    CERRAR SESIÓN
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* INDICADOR DE SOBERANÍA (Plan y Cuotas) */}
                    <Card className="bg-primary text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                        <CardHeader className="pb-4 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Nivel de Sabiduría</CardTitle>
                                <Crown className="h-5 w-5 text-yellow-300 animate-pulse" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8 relative">
                            <div>
                                <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">
                                    {profile?.subscriptions?.plans?.name || 'Explorador'}
                                </h3>
                                <Badge className="mt-3 bg-black/20 text-white border-none text-[9px] font-black tracking-widest uppercase px-3 py-1">
                                    Estado: {profile?.subscriptions?.status || 'Inactivo'}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span>Forja Mensual</span>
                                    <span>{podcastsCreatedThisMonth} / {monthlyLimit}</span>
                                </div>
                                <Progress value={usagePercentage} className="h-2 bg-black/20" />
                            </div>

                            <div className="space-y-3 border-t border-white/10 pt-6">
                                {['IA Multimodal Pro', 'Geolocalización Activa', 'Bóveda Prioritaria'].map((feature) => (
                                    <div key={feature} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter">
                                        <CheckCircle2 size={14} className="text-white/40" /> {feature}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="relative p-8 pt-0">
                            <Button className="w-full bg-white text-primary hover:bg-zinc-100 font-black rounded-2xl h-14 shadow-2xl text-xs" asChild>
                                <Link href="/pricing">MEJORAR CAPACIDAD</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* WORKSTATION DE PERFIL (DERECHA) */}
                <div className="flex-1 w-full space-y-8">
                    <Tabs defaultValue="library" className="w-full">
                        <TabsList className="w-full mb-12 grid grid-cols-4 bg-zinc-900/40 border border-white/5 p-1.5 rounded-[2rem] h-18 shadow-2xl backdrop-blur-md">
                            <TabsTrigger value="library" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[10px] tracking-widest"><BookOpen size={16} className="mr-2 hidden md:block" /> MI BÓVEDA</TabsTrigger>
                            <TabsTrigger value="offline" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[10px] tracking-widest"><WifiOff size={16} className="mr-2 hidden md:block" /> OFFLINE</TabsTrigger>
                            <TabsTrigger value="testimonials" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[10px] tracking-widest"><MessageSquare size={16} className="mr-2 hidden md:block" /> RESEÑAS</TabsTrigger>
                            <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[10px] tracking-widest"><Settings size={16} className="mr-2 hidden md:block" /> AJUSTES</TabsTrigger>
                        </TabsList>

                        {/* TAB: BIBLIOTECA (Mis Hilos de Conocimiento) */}
                        <TabsContent value="library" className="animate-in fade-in slide-in-from-bottom-8 duration-700 outline-none">
                            <Card className="bg-card/20 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                                <CardHeader className="flex flex-row items-center justify-between p-12">
                                    <div>
                                        <CardTitle className="text-4xl font-black uppercase tracking-tighter leading-none mb-3">Mis Hilos</CardTitle>
                                        <CardDescription className="text-muted-foreground font-medium text-base">Colecciones curadas para la inteligencia colectiva.</CardDescription>
                                    </div>
                                    <CreateCollectionModal finishedPodcasts={finishedPodcasts} />
                                </CardHeader>
                                <CardContent className="px-12 pb-12">
                                    {initialCollections.length === 0 ? (
                                        <div className="text-center py-28 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                                            <Layers className="h-20 w-20 mx-auto text-white/5 mb-8" />
                                            <p className="font-black text-muted-foreground uppercase tracking-[0.4em] text-xs mb-3">Frecuencia Vacía</p>
                                            <p className="text-sm text-muted-foreground/40 max-w-[280px] mx-auto leading-relaxed">
                                                Completa investigaciones para desbloquear la creación de hilos.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                            {initialCollections.map((col) => (
                                                <CollectionCard key={col.id} collection={col} isOwner={true} />
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB: OFFLINE (Gestión Local) */}
                        <TabsContent value="offline" className="mt-0 outline-none">
                            <DownloadsManager />
                        </TabsContent>

                        {/* TAB: RESEÑAS (Moderación de Identidad) */}
                        <TabsContent value="testimonials" className="outline-none">
                            <Card className="bg-card/20 border-white/5 rounded-[3rem] shadow-2xl">
                                <CardHeader className="p-12 pb-6">
                                    <CardTitle className="text-4xl font-black uppercase tracking-tighter">Moderación Social</CardTitle>
                                    <CardDescription className="text-base">Gestiona los testimonios de otros testigos urbanos.</CardDescription>
                                </CardHeader>
                                <CardContent className="px-12 pb-12 space-y-6">
                                    {testimonials.filter(t => t.status === 'pending').length === 0 ? (
                                        <div className="text-center py-20 text-xs font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
                                            Sin pendientes de revisión
                                        </div>
                                    ) : (
                                        testimonials.filter(t => t.status === 'pending').map((t) => (
                                            <div key={t.id} className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col md:flex-row gap-8 items-start md:items-center animate-in zoom-in-95 duration-500">
                                                <div className="flex items-center gap-5 flex-1">
                                                    <Avatar className="h-14 w-14 border border-white/10 shadow-lg">
                                                        <AvatarImage src={getSafeAsset(t.author?.avatar_url, 'avatar')} />
                                                        <AvatarFallback className="font-black text-xs">U</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-black text-md uppercase tracking-tight text-white">{t.author?.full_name || 'Anónimo'}</p>
                                                        <p className="text-base text-muted-foreground mt-1 leading-relaxed italic">"{t.comment_text}"</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 w-full md:w-auto">
                                                    <Button
                                                        onClick={() => handleStatusChange(t.id, 'approved')}
                                                        className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 font-black rounded-xl h-12 px-6 text-[10px] tracking-widest"
                                                    >
                                                        APROBAR
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleStatusChange(t.id, 'rejected')}
                                                        className="flex-1 md:flex-none text-red-400 hover:text-red-500 hover:bg-red-500/5 font-black rounded-xl h-12 px-6 text-[10px] tracking-widest"
                                                    >
                                                        RECHAZAR
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB: AJUSTES (Soberanía de Datos) */}
                        <TabsContent value="settings" className="outline-none">
                            <Card className="bg-card/20 border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
                                <CardHeader className="p-12 bg-white/[0.02]">
                                    <CardTitle className="text-4xl font-black uppercase tracking-tighter">Sintonía de Identidad</CardTitle>
                                    <CardDescription className="text-base">Define cómo resuena tu voz en la red de NicePod.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-12 space-y-10">
                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Nombre de Curador</Label>
                                            <Input
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                className="bg-zinc-900/50 border-white/10 h-16 rounded-2xl font-bold text-lg focus:ring-primary shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Identificador Único (@handle)</Label>
                                            <Input
                                                value={formData.username || ""}
                                                disabled
                                                className="bg-black/30 border-white/5 h-16 rounded-2xl font-mono text-zinc-600 text-sm"
                                            />
                                            <p className="text-[9px] font-bold text-muted-foreground/40 flex items-center gap-2 px-2">
                                                <AlertCircle size={10} /> El identificador está anclado a tu semilla de registro.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Biografía de Sabiduría</Label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            rows={5}
                                            placeholder="Describe tu enfoque, tus obsesiones intelectuales y qué buscas aportar a la ciudad..."
                                            className="w-full bg-zinc-900/50 border-white/10 rounded-[2rem] p-8 text-base font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner resize-none text-white"
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="p-12 pt-0 bg-white/[0.01]">
                                    <Button
                                        onClick={handleUpdateProfile}
                                        disabled={isPending}
                                        className="w-full h-20 font-black text-xl tracking-tighter uppercase rounded-[2rem] shadow-2xl group overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-violet-600 to-primary animate-aurora opacity-90 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 flex items-center justify-center gap-4">
                                            {isPending ? (
                                                <Loader2 className="animate-spin h-6 w-6" />
                                            ) : (
                                                <><Save className="h-6 w-6 group-hover:scale-110 transition-transform" /> ACTUALIZAR ADN DIGITAL</>
                                            )}
                                        </span>
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
// COMPONENTE B: PublicProfilePage (Escaparate Social)
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
        <div className="container mx-auto max-w-5xl py-24 px-4 md:px-8 animate-in fade-in slide-in-from-top-4 duration-1000">

            {/* SECCIÓN HERO (Identidad Visual) */}
            <div className="flex flex-col items-center text-center mb-24">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-primary via-violet-600 to-fuchsia-600 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>
                    <div className="relative h-44 w-44 rounded-full p-1.5 bg-gradient-to-tr from-white/10 to-transparent border border-white/5">
                        <Avatar className="h-full w-full border-4 border-zinc-950 shadow-2xl">
                            <AvatarImage
                                src={getSafeAsset(profile?.avatar_url, 'avatar')}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-6xl font-black bg-zinc-900 text-primary">
                                {userInitial}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    {profile.is_verified && (
                        <div className="absolute bottom-4 right-4 bg-blue-500 text-white rounded-full p-2.5 border-4 border-zinc-950 shadow-2xl" title="Curador Verificado">
                            <ShieldCheck size={24} fill="currentColor" />
                        </div>
                    )}
                </div>

                <div className="mt-12 space-y-4">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none text-white drop-shadow-2xl">
                        {profile?.full_name}
                    </h1>
                    <p className="text-primary font-black uppercase tracking-[0.5em] text-[11px] opacity-90">
                        @{profile?.username}
                    </p>
                </div>

                {profile?.bio && (
                    <p className="max-w-2xl mt-10 text-xl text-zinc-400 font-medium leading-relaxed italic">
                        "{profile.bio}"
                    </p>
                )}

                {/* MÉTRICAS DE IMPACTO */}
                <div className="flex flex-wrap gap-12 md:gap-24 mt-16 justify-center">
                    <div className="text-center group">
                        <span className="block font-black text-4xl md:text-5xl text-white transition-transform group-hover:scale-110 duration-500">{podcasts.length}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-50 mt-2">Crónicas</span>
                    </div>
                    <div className="text-center group">
                        <span className="block font-black text-4xl md:text-5xl text-white transition-transform group-hover:scale-110 duration-500">{totalLikes}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-50 mt-2">Resonancia</span>
                    </div>
                    <div className="text-center group">
                        <div className="flex items-center gap-3 justify-center">
                            <span className="block font-black text-4xl md:text-5xl text-primary transition-transform group-hover:scale-110 duration-500">{profile.reputation_score || 0}</span>
                            <ReputationExplainer />
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-50 mt-2">Prestigio</span>
                    </div>
                </div>
            </div>

            {/* NAVEGACIÓN DE CONTENIDO PÚBLICO */}
            <Tabs defaultValue="podcasts" className="w-full">
                <TabsList className="w-full justify-center bg-transparent border-b border-white/5 rounded-none h-auto p-0 mb-20 flex-wrap gap-6 md:gap-16">
                    <TabsTrigger value="podcasts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-6 text-xs font-black uppercase tracking-[0.3em] transition-all">Publicaciones</TabsTrigger>
                    <TabsTrigger value="collections" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-6 text-xs font-black uppercase tracking-[0.3em] transition-all">Hilos Curados ({publicCollections.length})</TabsTrigger>
                    <TabsTrigger value="testimonials" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-6 text-xs font-black uppercase tracking-[0.3em] transition-all">Resonancia Social</TabsTrigger>
                </TabsList>

                {/* FEED DE CRÓNICAS PÚBLICAS */}
                <TabsContent value="podcasts" className="animate-in fade-in duration-700 outline-none">
                    <div className="grid gap-10 md:grid-cols-2">
                        {podcasts.map((pod) => (
                            <Link key={pod.id} href={`/podcast/${pod.id}`} className="block group h-full">
                                <Card className="h-full bg-zinc-900/40 border-white/5 hover:border-primary/40 hover:bg-zinc-900/60 transition-all rounded-[3rem] overflow-hidden shadow-2xl">
                                    <CardContent className="p-10 flex flex-col h-full">
                                        <h3 className="font-black text-2xl leading-tight line-clamp-2 group-hover:text-primary transition-colors uppercase mb-5 tracking-tight">
                                            {pod.title}
                                        </h3>
                                        <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-8">
                                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl"><Calendar size={14} /> {new Date(pod.created_at).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl"><Clock size={14} /> {formatDuration(pod.duration_seconds)}</span>
                                        </div>
                                        <p className="text-zinc-400 font-medium line-clamp-3 mb-10 text-lg leading-relaxed">
                                            {pod.description || "Esta crónica aún no tiene metadatos descriptivos."}
                                        </p>
                                        <div className="flex justify-end pt-8 border-t border-white/5 mt-auto">
                                            <div className={cn(buttonVariants({ size: 'lg', variant: 'secondary' }), "rounded-full font-black text-[11px] uppercase tracking-[0.2em] px-10 h-12 shadow-xl")}>
                                                INICIAR ESCUCHA
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                    {podcasts.length === 0 && (
                        <div className="text-center py-32 opacity-20 font-black uppercase tracking-[0.6em] text-sm italic">
                            Cero registros en la frecuencia pública
                        </div>
                    )}
                </TabsContent>

                {/* FEED DE COLECCIONES PÚBLICAS */}
                <TabsContent value="collections" className="animate-in fade-in duration-700 outline-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {publicCollections.map((col) => (
                            <CollectionCard key={col.id} collection={col} />
                        ))}
                    </div>
                    {publicCollections.length === 0 && (
                        <div className="text-center py-32 opacity-20 font-black uppercase tracking-[0.6em] text-sm italic">
                            Sin bibliotecas curadas actualmente
                        </div>
                    )}
                </TabsContent>

                {/* FEED DE TESTIMONIOS PÚBLICOS */}
                <TabsContent value="testimonials" className="animate-in fade-in duration-700 outline-none">
                    <div className="max-w-4xl mx-auto space-y-10 pb-20">
                        {initialTestimonials.filter(t => t.status === 'approved').map((t) => (
                            <div key={t.id} className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row gap-8 shadow-2xl backdrop-blur-sm">
                                <Avatar className="h-20 w-20 border-2 border-white/10 shadow-xl shrink-0">
                                    <AvatarImage src={getSafeAsset(t.author?.avatar_url, 'avatar')} className="object-cover" />
                                    <AvatarFallback className="font-black bg-zinc-900">U</AvatarFallback>
                                </Avatar>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <p className="font-black text-lg uppercase tracking-tighter text-white">
                                            {t.author?.full_name || 'Anónimo'}
                                        </p>
                                        <div className="h-1 w-1 rounded-full bg-zinc-700" />
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            {new Date(t.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xl text-zinc-300 leading-relaxed italic font-medium">
                                        "{t.comment_text}"
                                    </p>
                                </div>
                            </div>
                        ))}

                        {initialTestimonials.filter(t => t.status === 'approved').length === 0 && (
                            <div className="text-center py-20 opacity-20 font-black uppercase tracking-[0.4em] text-xs">
                                El eco de la comunidad aún no se ha manifestado
                            </div>
                        )}

                        {/* ACCIÓN: DEJAR TESTIMONIO (Solo si no es tu propio perfil) */}
                        {user && user.id !== profile.id && (
                            <div className="pt-24 flex flex-col items-center gap-6 border-t border-white/5">
                                <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">
                                    ¿Ha resonado tu curiosidad con este perfil?
                                </p>
                                <LeaveTestimonialDialog
                                    profileId={profile.id}
                                    onTestimonialAdded={() => window.location.reload()}
                                />
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}