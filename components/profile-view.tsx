// components/profile-view.tsx
// VERSIÓN FINAL COMPLETA - CON TIPADO EXPLÍCITO Y ROBUSTO

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
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Crown, User as UserIcon, Bot, Heart, Pencil, Check, X } from "lucide-react";
import type { Tables } from "@/types/supabase";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { LeaveTestimonialDialog } from "@/components/leave-testimonial-dialog";

export type ProfileData = Tables<'profiles'> & {
  subscriptions: (Tables<'subscriptions'> & {
    plans: Tables<'plans'> | null;
  }) | null;
};

export type TestimonialWithAuthor = Tables<'profile_testimonials'> & {
  author: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export interface ProfileViewProps {
  isOwner: boolean;
  profile: ProfileData | null;
  podcastsCreatedThisMonth: number;
  totalPodcasts: number;
  totalLikes: number;
  initialTestimonials: TestimonialWithAuthor[];
  initialIsFollowing: boolean;
}

function TestimonialCard({ testimonial, isOwner, onModerate }: { testimonial: TestimonialWithAuthor, isOwner: boolean, onModerate: (id: number, status: 'approved' | 'rejected') => void }) {
  return (
    <Card className="bg-muted/30">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
        <Avatar>
          <AvatarImage src={testimonial.author?.avatar_url || ''} />
          <AvatarFallback>{testimonial.author?.full_name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <p className="font-semibold">{testimonial.author?.full_name || 'Usuario Anónimo'}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(testimonial.created_at), { addSuffix: true, locale: es })}
          </p>
        </div>
        {isOwner && testimonial.status === 'pending' && (
          <div className="flex gap-2">
            <Button size="icon" variant="outline" className="h-8 w-8 bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 hover:text-green-500" onClick={() => onModerate(testimonial.id, 'approved')}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:text-red-500" onClick={() => onModerate(testimonial.id, 'rejected')}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm italic">"{testimonial.comment_text}"</p>
      </CardContent>
    </Card>
  )
}

export function ProfileView({ 
  isOwner,
  profile, 
  podcastsCreatedThisMonth,
  totalPodcasts,
  totalLikes,
  initialTestimonials,
  initialIsFollowing
}: ProfileViewProps) {
  const { user, signOut, supabase } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [bio, setBio] = useState(profile?.bio || "");
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [testimonials, setTestimonials] = useState(initialTestimonials);

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(profile?.followers_count ?? 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setFollowersCount(profile.followers_count ?? 0);
    }
    setTestimonials(initialTestimonials);
    setIsFollowing(initialIsFollowing);
  }, [profile, initialTestimonials, initialIsFollowing]);
  
  const handleSaveProfile = async () => {
    if (!user || !supabase) return;
    setIsSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar tu perfil.", variant: "destructive" });
    } else {
      toast({ title: "¡Éxito!", description: "Tu perfil ha sido actualizado." });
      router.refresh(); 
    }
    setIsSaving(false);
  };

  const handleSaveBio = async () => {
    if (!user || !supabase) return;
    setIsSavingBio(true);
    const { error } = await supabase.from('profiles').update({ bio }).eq('id', user.id);
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar tu biografía.", variant: "destructive" });
    } else {
      toast({ title: "¡Éxito!", description: "Tu biografía ha sido actualizada." });
      setIsBioModalOpen(false);
      router.refresh();
    }
    setIsSavingBio(false);
  };
  
  const handleModerateTestimonial = async (id: number, status: 'approved' | 'rejected') => {
    if (!supabase) return;
    const { error } = await supabase.from('profile_testimonials').update({ status }).eq('id', id);
    if (error) {
      toast({ title: "Error", description: "No se pudo moderar el testimonio.", variant: "destructive" });
    } else {
      toast({ title: "¡Éxito!", description: `El testimonio ha sido ${status === 'approved' ? 'aprobado' : 'rechazado'}.` });
      setTestimonials(current => current.map(t => t.id === id ? { ...t, status } : t));
    }
  };
  
  const handleFollowToggle = async () => {
    if (!user || !supabase || !profile) {
      toast({ title: "Debes iniciar sesión para seguir a un usuario.", variant: "destructive" });
      return;
    }
    
    setIsFollowLoading(true);
    const currentlyFollowing = isFollowing;

    setIsFollowing(!currentlyFollowing);
    setFollowersCount((count: number) => !currentlyFollowing ? count + 1 : count - 1);
    
    if (currentlyFollowing) {
      const { error } = await supabase.from('followers').delete().match({ follower_id: user.id, following_id: profile.id });
      if (error) {
        toast({ title: "Error", description: "No se pudo dejar de seguir al usuario.", variant: "destructive" });
        setIsFollowing(true);
        setFollowersCount((count: number) => count + 1);
      }
    } else {
      const { error } = await supabase.from('followers').insert({ follower_id: user.id, following_id: profile.id });
      if (error) {
        toast({ title: "Error", description: "No se pudo seguir al usuario.", variant: "destructive" });
        setIsFollowing(false);
        setFollowersCount((count: number) => count - 1);
      }
    }
    
    setIsFollowLoading(false);
  };

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6"><Skeleton className="h-48 w-full" /><Skeleton className="h-32 w-full" /></div>
          <div className="lg:col-span-2 space-y-6"><Skeleton className="h-48 w-full" /><Skeleton className="h-64 w-full" /></div>
        </div>
      </div>
    );
  }
  
  const plan = profile.subscriptions?.plans;
  const creationsLimit = plan?.monthly_creation_limit ?? 0;
  const creationsRemaining = Math.max(0, podcastsCreatedThisMonth);
  
  const pendingTestimonials = testimonials.filter(t => t.status === 'pending');
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');
  const canLeaveTestimonial = user && !isOwner;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border-border/20 bg-card/50 flex flex-col items-center text-center shadow-lg">
              <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
                <AvatarFallback className="text-3xl bg-muted">{profile.full_name ? profile.full_name.charAt(0) : <UserIcon />}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              
              <div className="mt-4 text-sm text-muted-foreground w-full relative">
                <p className="italic">{profile.bio || "Este usuario aún no ha añadido una biografía."}</p>
                {isOwner && (
                  <Dialog open={isBioModalOpen} onOpenChange={setIsBioModalOpen}>
                    <DialogTrigger asChild><Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-7 w-7"><Pencil className="h-4 w-4" /></Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Edita tu Biografía</DialogTitle><DialogDescription>Comparte algo sobre ti con la comunidad.</DialogDescription></DialogHeader>
                      <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Soy un creador apasionado por..." maxLength={280} className="min-h-[120px]" />
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBioModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveBio} disabled={isSavingBio}>{isSavingBio && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {isOwner && (<div className="mt-6 w-full"><Button onClick={signOut} variant="destructive" className="w-full">Cerrar Sesión</Button></div>)}
              {!isOwner && (
                <div className="mt-6 w-full">
                  <Button className="w-full" variant={isFollowing ? "outline" : "default"} onClick={handleFollowToggle} disabled={isFollowLoading}>
                    {isFollowLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </Button>
                </div>
              )}
          </Card>

          <Card className="border-border/20 bg-card/50 shadow-lg">
            <CardHeader><CardTitle className="text-xl">Estadísticas Generales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Seguidores</span><span className="font-bold text-lg">{followersCount}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Siguiendo</span><span className="font-bold text-lg">{profile.following_count ?? 0}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><Bot className="h-4 w-4" /> Podcasts Creados</span><span className="font-bold text-lg">{totalPodcasts}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><Heart className="h-4 w-4" /> Likes Recibidos</span><span className="font-bold text-lg">{totalLikes}</span></div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          {isOwner && (
            <Card className="border-border/20 bg-card/50 shadow-lg">
              <CardHeader><CardTitle className="text-xl">Detalles de la Suscripción</CardTitle><CardDescription>Tu plan actual y el uso de este ciclo.</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-3">
                    <Crown className="h-6 w-6 text-primary" />
                    <div><p className="font-semibold text-lg capitalize">{plan?.name ?? 'N/A'} Plan</p><Badge variant={profile.subscriptions?.status === 'active' ? 'default' : 'destructive'} className="capitalize">{profile.subscriptions?.status ?? 'Inactivo'}</Badge></div>
                  </div>
                  <Button variant="outline" onClick={() => router.push('/pricing')}>Administrar Plan</Button>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Uso Mensual de Creaciones</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 text-center font-medium text-lg"><span>{podcastsCreatedThisMonth}</span><span className="text-muted-foreground">/{creationsLimit}</span></div>
                    <div className="w-full">
                      <progress value={podcastsCreatedThisMonth} max={creationsLimit} className="w-full h-2.5 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary" />
                      <p className="text-xs text-muted-foreground mt-1 text-right">Te quedan {creationsRemaining} creaciones este mes.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-border/20 bg-card/50 shadow-lg">
            <CardHeader className="flex flex-row justify-between items-center">
              <div><CardTitle className="text-xl">Testimonios de la Comunidad</CardTitle><CardDescription>Lo que otros dicen de este creador.</CardDescription></div>
              {canLeaveTestimonial && (<LeaveTestimonialDialog profileId={profile.id} onTestimonialAdded={() => router.refresh()} />)}
            </CardHeader>
            <CardContent>
              {isOwner ? (
                <Tabs defaultValue="approved">
                  <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="approved">Públicos ({approvedTestimonials.length})</TabsTrigger><TabsTrigger value="pending">Pendientes ({pendingTestimonials.length})</TabsTrigger></TabsList>
                  <TabsContent value="approved" className="mt-4 space-y-4">{approvedTestimonials.length > 0 ? (approvedTestimonials.map(t => <TestimonialCard key={t.id} testimonial={t} isOwner={true} onModerate={handleModerateTestimonial} />)) : <p className="text-sm text-center text-muted-foreground py-8">Aún no tienes testimonios públicos.</p>}</TabsContent>
                  <TabsContent value="pending" className="mt-4 space-y-4">{pendingTestimonials.length > 0 ? (pendingTestimonials.map(t => <TestimonialCard key={t.id} testimonial={t} isOwner={true} onModerate={handleModerateTestimonial} />)) : <p className="text-sm text-center text-muted-foreground py-8">No tienes testimonios pendientes de revisión.</p>}</TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
                  {approvedTestimonials.length > 0 ? (approvedTestimonials.map(t => <TestimonialCard key={t.id} testimonial={t} isOwner={false} onModerate={() => {}} />)) : <p className="text-sm text-center text-muted-foreground py-8">Sé el primero en dejar un testimonio para este creador.</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {isOwner && (
            <Card className="border-border/20 bg-card/50 shadow-lg">
              <CardHeader><CardTitle className="text-xl">Configuración de la Cuenta</CardTitle><CardDescription>Gestiona tu información personal.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="email">Dirección de Email</Label><Input id="email" type="email" value={user?.email || ""} disabled className="opacity-70" /></div>
                <div className="space-y-2"><Label htmlFor="full_name">Nombre Completo</Label><Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre completo" /></div>
                <div className="flex justify-end pt-2"><Button onClick={handleSaveProfile} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar Cambios</Button></div>
              </CardContent>
            </Card>
          )}
        </div>
        
      </div>
    </div>
  );
}