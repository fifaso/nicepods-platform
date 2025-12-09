// components/profile-client-component.tsx
// VERSIÓN: 2.0 (Fix: Renamed to ProfileView for Consistency)

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

// --- TIPOS DE DATOS AMPLIADOS ---
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

// Interfaz de Props renombrada para consistencia
export interface ProfileViewProps {
  profile: ProfileData | null;
  podcastsCreatedThisMonth: number;
  totalPodcasts: number;
  totalLikes: number;
  initialTestimonials: TestimonialWithAuthor[];
  isOwner: boolean;     // Añadido para completitud
  initialIsFollowing: boolean; // Añadido para completitud
}

// --- SUB-COMPONENTE PARA LOS TESTIMONIOS ---
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

// [CAMBIO CRÍTICO]: Renombrado de ProfileClientComponent a ProfileView
export function ProfileView({ 
  profile, 
  podcastsCreatedThisMonth,
  totalPodcasts,
  totalLikes,
  initialTestimonials
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

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
    }
    setTestimonials(initialTestimonials);
  }, [profile, initialTestimonials]);
  
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

  const handleSaveBio = async () => {
    if (!user) return;
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
    const { error } = await supabase
      .from('profile_testimonials')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "No se pudo moderar el testimonio.", variant: "destructive" });
    } else {
      toast({ title: "¡Éxito!", description: `El testimonio ha sido ${status === 'approved' ? 'aprobado' : 'rechazado'}.` });
      setTestimonials(current => current.map(t => t.id === id ? { ...t, status } : t));
    }
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
  
  const pendingTestimonials = testimonials.filter(t => t.status === 'pending');
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Columna Izquierda --- */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border-border/20 bg-card/50 flex flex-col items-center text-center shadow-lg">
              <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
                <AvatarFallback className="text-3xl bg-muted">{profile.full_name ? profile.full_name.charAt(0) : <UserIcon />}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              
              <div className="mt-4 text-sm text-muted-foreground w-full relative">
                <p className="italic">{profile.bio || "Este usuario aún no ha añadido una biografía."}</p>
                {user?.id === profile.id && (
                  <Dialog open={isBioModalOpen} onOpenChange={setIsBioModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-7 w-7">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edita tu Biografía</DialogTitle>
                        <DialogDescription>Comparte algo sobre ti con la comunidad.</DialogDescription>
                      </DialogHeader>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Soy un creador apasionado por..."
                        maxLength={280}
                        className="min-h-[120px]"
                      />
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBioModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveBio} disabled={isSavingBio}>
                          {isSavingBio && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Guardar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="mt-6 w-full">
                <Button onClick={signOut} variant="destructive" className="w-full">Cerrar Sesión</Button>
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
        
        {/* --- Columna Derecha --- */}
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
              <CardTitle className="text-xl">Testimonios de la Comunidad</CardTitle>
              <CardDescription>Lo que otros dicen de este creador.</CardDescription>
            </CardHeader>
            <CardContent>
              {user?.id === profile.id ? (
                <Tabs defaultValue="approved">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="approved">Públicos ({approvedTestimonials.length})</TabsTrigger>
                    <TabsTrigger value="pending">Pendientes ({pendingTestimonials.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="approved" className="mt-4 space-y-4">
                    {approvedTestimonials.length > 0 ? (
                      approvedTestimonials.map(t => <TestimonialCard key={t.id} testimonial={t} isOwner={true} onModerate={handleModerateTestimonial} />)
                    ) : <p className="text-sm text-center text-muted-foreground py-8">Aún no tienes testimonios públicos.</p>}
                  </TabsContent>
                  <TabsContent value="pending" className="mt-4 space-y-4">
                    {pendingTestimonials.length > 0 ? (
                      pendingTestimonials.map(t => <TestimonialCard key={t.id} testimonial={t} isOwner={true} onModerate={handleModerateTestimonial} />)
                    ) : <p className="text-sm text-center text-muted-foreground py-8">No tienes testimonios pendientes de revisión.</p>}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
                  {approvedTestimonials.length > 0 ? (
                    approvedTestimonials.map(t => <TestimonialCard key={t.id} testimonial={t} isOwner={false} onModerate={() => {}} />)
                  ) : <p className="text-sm text-center text-muted-foreground py-8">Sé el primero en dejar un testimonio para este creador.</p>}
                  {/* Aquí iría la lógica para que un visitante deje un testimonio */}
                </div>
              )}
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