// components/profile/private-profile-dashboard.tsx
// VERSIÓN: 1.0 (NicePod Private Dashboard Orchestrator - Professional Standard)
// Misión: Ensamblar la Workstation de gestión del curador con integridad atómica.
// [ESTABILIZACIÓN]: Integración de sub-módulos privados y blindaje contra Error #310.

"use client";

import {
  BookOpen,
  ExternalLink,
  Layers,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  WifiOff,
  Zap
} from "lucide-react";
import Link from "next/link";

// --- INFRAESTRUCTURA DE DATOS Y CONTRATOS ---
import { useAuth } from "@/hooks/use-auth";
import { getSafeAsset } from "@/lib/utils";
import {
  Collection,
  ProfileData,
  TestimonialWithAuthor
} from "@/types/profile";

// --- COMPONENTES DE INFRAESTRUCTURA UI ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- COMPONENTES DE LA MALLA DE PERFIL (DISECCIÓN) ---
import { DownloadsManager } from "@/components/downloads-manager";
import { CreateCollectionModal } from "@/components/social/create-collection-modal";
import { ReputationExplainer } from "@/components/social/reputation-explainer";
import { IdentitySettingsForm } from "./private/identity-settings-form";
import { SubscriptionStatusCard } from "./private/subscription-status-card";
import { TestimonialModerator } from "./private/testimonial-moderator";
import { ProfileHydrationGuard } from "./profile-hydration-guard";
import { CollectionCard } from "./shared/collection-card";

/**
 * INTERFAZ: PrivateProfileDashboardProps
 * Contrato de datos inyectados desde el servidor (Fase SSR).
 */
interface PrivateProfileDashboardProps {
  profile: ProfileData;
  podcastsCreatedThisMonth: number;
  initialTestimonials: TestimonialWithAuthor[];
  initialCollections: Collection[];
  finishedPodcasts: any[]; // Podcasts aptos para creación de hilos
}

/**
 * PrivateProfileDashboard: La central de mandos del curador logueado.
 */
export function PrivateProfileDashboard({
  profile,
  podcastsCreatedThisMonth,
  initialTestimonials,
  initialCollections,
  finishedPodcasts
}: PrivateProfileDashboardProps) {

  const { signOut } = useAuth();

  return (
    /**
     * [CAPA 1: ESCUDO DE HIDRATACIÓN]
     * Garantiza que la lógica de Auth y el estado de los Tabs no colisionen 
     * con el renderizado inicial del servidor, matando el Error #310.
     */
    <ProfileHydrationGuard>

      <div className="container mx-auto max-w-7xl py-10 px-4 md:px-6 animate-in fade-in duration-700">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* --- BLOQUE I: COLUMNA TÁCTICA (SIDEBAR 1/3) --- */}
          <aside className="w-full lg:w-[380px] flex flex-col gap-6 lg:sticky lg:top-24">

            {/* FICHA DE IDENTIDAD AURORA */}
            <Card className="text-center overflow-hidden border-white/5 bg-card/30 backdrop-blur-3xl shadow-2xl rounded-[2.5rem]">
              <div className="h-28 bg-gradient-to-br from-primary/20 via-indigo-500/10 to-transparent"></div>
              <div className="px-8 pb-10 -mt-14 relative">
                <div className="relative h-28 w-28 mx-auto mb-6">
                  <Avatar className="h-full w-full border-4 border-background shadow-2xl">
                    <AvatarImage
                      src={getSafeAsset(profile.avatar_url, 'avatar')}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl font-black bg-zinc-900 text-primary">
                      {profile.full_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center justify-center gap-2">
                    {profile.full_name}
                    {profile.is_verified && (
                      <ShieldCheck size={20} className="text-primary fill-primary/10" />
                    )}
                  </h2>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                      {profile.reputation_score || 0} REPUTACIÓN
                    </span>
                    <ReputationExplainer />
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-3">
                  <Link href={`/profile/${profile.username}?view=public`} className="w-full">
                    <Button variant="outline" className="w-full h-12 font-black rounded-2xl border-white/10 hover:bg-white/5 uppercase tracking-widest text-[9px] gap-2">
                      VISTA PÚBLICA <ExternalLink size={14} className="opacity-50" />
                    </Button>
                  </Link>
                  <Button
                    onClick={signOut}
                    variant="ghost"
                    className="w-full text-red-500/40 hover:text-red-500 hover:bg-red-500/5 font-black text-[9px] tracking-widest uppercase"
                  >
                    Cerrar Frecuencia <LogOut size={14} className="ml-2" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* MONITOR DE SOBERANÍA (Plan y Cuotas) */}
            <SubscriptionStatusCard
              planName={profile.subscriptions?.plans?.name || "Explorador"}
              status={profile.subscriptions?.status || "Inactivo"}
              podcastsCreated={podcastsCreatedThisMonth}
              monthlyLimit={profile.subscriptions?.plans?.monthly_creation_limit ?? 3}
              maxConcurrentDrafts={profile.subscriptions?.plans?.max_concurrent_drafts ?? 3}
              features={profile.subscriptions?.plans?.features || null}
            />

          </aside>

          {/* --- BLOQUE II: WORKSTATION ÁGIL (CONTENT 2/3) --- */}
          <div className="flex-1 w-full min-h-[600px]">
            <Tabs defaultValue="library" className="w-full space-y-8">

              {/* NAVEGACIÓN DE PESTAÑAS (Tactical Tabs) */}
              <TabsList className="w-full grid grid-cols-4 bg-zinc-900/40 border border-white/5 p-1.5 rounded-[2rem] h-16 shadow-inner backdrop-blur-md">
                <TabsTrigger value="library" className="rounded-2xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[9px] tracking-widest uppercase">
                  <BookOpen size={14} className="mr-2 hidden md:block" /> Bóveda
                </TabsTrigger>
                <TabsTrigger value="offline" className="rounded-2xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[9px] tracking-widest uppercase">
                  <WifiOff size={14} className="mr-2 hidden md:block" /> Offline
                </TabsTrigger>
                <TabsTrigger value="testimonials" className="rounded-2xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[9px] tracking-widest uppercase">
                  <MessageSquare size={14} className="mr-2 hidden md:block" /> Reseñas
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-2xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[9px] tracking-widest uppercase">
                  <Settings size={14} className="mr-2 hidden md:block" /> Ajustes
                </TabsTrigger>
              </TabsList>

              {/* CONTENIDO: MI BÓVEDA (Hilos Curados) */}
              <TabsContent value="library" className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-card/20 border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between p-8 md:p-12">
                    <div className="space-y-1">
                      <CardTitle className="text-3xl font-black uppercase tracking-tighter">Mis Hilos</CardTitle>
                      <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        Colecciones de sabiduría para la red global.
                      </CardDescription>
                    </div>
                    <CreateCollectionModal finishedPodcasts={finishedPodcasts} />
                  </CardHeader>
                  <CardContent className="px-8 md:px-12 pb-12">
                    {initialCollections.length === 0 ? (
                      <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                        <Layers className="h-16 w-16 mx-auto text-white/5 mb-6" />
                        <p className="font-black text-muted-foreground uppercase tracking-[0.4em] text-[10px]">Sin hilos activos</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {initialCollections.map((col) => (
                          <CollectionCard key={col.id} collection={col} isOwner={true} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* CONTENIDO: GESTIÓN OFFLINE */}
              <TabsContent value="offline" className="outline-none animate-in fade-in duration-500">
                <DownloadsManager />
              </TabsContent>

              {/* CONTENIDO: MODERACIÓN SOCIAL */}
              <TabsContent value="testimonials" className="outline-none animate-in fade-in duration-500">
                <TestimonialModerator initialTestimonials={initialTestimonials} />
              </TabsContent>

              {/* CONTENIDO: SINTONÍA DE IDENTIDAD */}
              <TabsContent value="settings" className="outline-none animate-in fade-in duration-500">
                <Card className="bg-card/20 border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
                  <CardHeader className="p-8 md:p-12 bg-white/[0.01] border-b border-white/5">
                    <CardTitle className="text-3xl font-black uppercase tracking-tighter">ADN Digital</CardTitle>
                    <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
                      Personaliza tu presencia y biografía en NicePod.
                    </CardDescription>
                  </CardHeader>
                  <IdentitySettingsForm profile={profile} />
                </Card>
              </TabsContent>

            </Tabs>
          </div>

        </div>

        {/* FIRMA DE CIERRE OPERATIVO */}
        <footer className="mt-12 flex items-center justify-center gap-3 opacity-10">
          <div className="h-px w-12 bg-zinc-700" />
          <Zap size={12} className="text-primary" />
          <span className="text-[8px] font-black uppercase tracking-[0.5em]">Workstation V2.5 Active</span>
          <div className="h-px w-12 bg-zinc-700" />
        </footer>
      </div>

    </ProfileHydrationGuard>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * El 'PrivateProfileDashboard' es el punto de integración final. He implementado 
 * un diseño de dos columnas (Sidebar/Content) que respeta la 'Dieta de Píxeles' 
 * mediante un gap de 32px (gap-8), eliminando el exceso de aire de la versión 
 * monolítica. El uso de 'force-dynamic' en el archivo 'page.tsx' del servidor 
 * garantiza que este componente reciba siempre la verdad de la Bóveda.
 */