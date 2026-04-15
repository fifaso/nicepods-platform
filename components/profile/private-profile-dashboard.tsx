/**
 * ARCHIVO: components/profile/private-profile-dashboard.tsx
 * VERSIÓN: 6.1 (NicePod Private Dashboard - Import Restoration & Contract Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Ensamblar la central de mandos del curador con integridad atómica, 
 * utilizando descriptores industriales unívocos y tipado estricto.
 * [REFORMA V6.1]: Resolución del error TS2304 mediante la restauración de la 
 * importación del 'DownloadsManager'. Consolidación de la interfaz de propiedades 
 * bajo la nomenclatura ZAP para sincronización directa con el servidor.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useAuth } from "@/hooks/use-auth";
import { getSafeAsset } from "@/lib/utils";
import {
  Collection,
  ProfileData,
  PublicPodcast,
  TestimonialWithAuthor
} from "@/types/profile";
import {
  BookOpen,
  ExternalLink,
  Layers,
  MessageSquare,
  Settings,
  ShieldCheck,
  WifiOff
} from "lucide-react";
import Link from "next/link";

// --- COMPONENTES DE INFRAESTRUCTURA UI ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- COMPONENTES DE LA MALLA DE PERFIL ---
import { CreateCollectionModal } from "@/components/social/create-collection-modal";
import { ReputationExplainer } from "@/components/social/reputation-explainer";
import { IdentitySettingsForm } from "./private/identity-settings-form";
import { SubscriptionStatusCard } from "./private/subscription-status-card";
import { TestimonialModerator } from "./private/testimonial-moderator";
import { ProfileHydrationGuard } from "./profile-hydration-guard";
import { CollectionCard } from "./shared/collection-card";
// [FIX V6.1]: Restauración de la importación crítica (TS2304)
import { DownloadsManager } from "@/components/player/downloads-manager";

/**
 * INTERFAZ: PrivateProfileDashboardComponentProperties
 * Misión: Definir el contrato de datos esperado desde el orquestador SSR.
 */
interface PrivateProfileDashboardComponentProperties {
  profile: ProfileData;
  podcastsCreatedThisMonth: number;
  // Descriptores Industriales (ZAP)
  initialTestimonialsCollection: TestimonialWithAuthor[];
  initialCollectionsCollection: Collection[];
  finishedPodcastsCollection: PublicPodcast[];
}

/**
 * PrivateProfileDashboard: El centro de mando soberano.
 */
export function PrivateProfileDashboard({
  profile,
  podcastsCreatedThisMonth,
  initialTestimonialsCollection,
  initialCollectionsCollection,
  finishedPodcastsCollection
}: PrivateProfileDashboardComponentProperties) {

  const { onAuthenticationSignOutAction: signOutAction } = useAuth();
  const userDisplayNameInitials = (profile.fullName || profile.username || "C").charAt(0).toUpperCase();

  return (
    <ProfileHydrationGuard>
      <div className="container mx-auto max-w-7xl py-10 px-4 md:px-6 animate-in fade-in duration-1000">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* --- BLOQUE I: COLUMNA TÁCTICA (SIDEBAR) --- */}
          <aside className="w-full lg:w-[380px] flex flex-col gap-6 lg:sticky lg:top-24">
            <Card className="text-center overflow-hidden border-white/5 bg-zinc-900/20 backdrop-blur-3xl shadow-2xl rounded-[3rem]">
              <div className="h-32 bg-gradient-to-br from-primary/30 via-indigo-600/10 to-transparent"></div>
              <div className="px-8 pb-10 -mt-16 relative z-10">

                <div className="relative h-32 w-32 mx-auto mb-6 group">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Avatar className="h-full w-full border-4 border-background shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10">
                    <AvatarImage src={getSafeAsset(profile.avatarUniformResourceLocator, 'avatar')} className="object-cover" />
                    <AvatarFallback className="text-4xl font-black bg-[#020202] text-primary">{userDisplayNameInitials}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black tracking-tighter uppercase flex items-center justify-center gap-3 text-white leading-none">
                    {profile.fullName || profile.username}
                    {!!profile.isVerifiedAccountStatus && (
                      <ShieldCheck size={22} className="text-primary fill-primary/10 drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                    )}
                  </h2>
                  <div className="flex items-center justify-center gap-3">
                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-3">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] tabular-nums">
                        {profile.reputationScoreValue}
                      </span>
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Prestigio</span>
                    </div>
                    <ReputationExplainer />
                  </div>
                </div>

                <div className="mt-12 flex flex-col gap-3">
                  <Link href={`/profile/${profile.username}`} className="w-full">
                    <Button variant="outline" className="w-full h-14 font-black rounded-2xl border-white/10 hover:bg-white/5 hover:border-primary/40 uppercase tracking-widest text-[10px] gap-3 transition-all duration-500 group">
                      EXPLORAR VISTA PÚBLICA
                      <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button onClick={signOutAction} variant="ghost" className="w-full text-red-500/40 hover:text-red-500 hover:bg-red-500/5 font-black text-[9px] tracking-widest uppercase h-10 transition-colors">
                    Cerrar Sesión Soberana
                  </Button>
                </div>
              </div>
            </Card>

            <SubscriptionStatusCard
              planName={profile.subscriptionDetails?.associatedPlan?.planName || "Voyager"}
              status={profile.subscriptionDetails?.subscriptionStatus || "active"}
              podcastsCreated={podcastsCreatedThisMonth}
              monthlyLimit={profile.subscriptionDetails?.associatedPlan?.monthlyCreationLimit ?? 3}
              maxConcurrentDrafts={profile.subscriptionDetails?.associatedPlan?.maximumConcurrentDrafts ?? 3}
              features={profile.subscriptionDetails?.associatedPlan?.featureList || []}
            />
          </aside>

          {/* --- BLOQUE II: WORKSTATION OPERATIVA (CONTENT) --- */}
          <div className="flex-1 w-full min-h-[700px]">
            <Tabs defaultValue="library" className="w-full space-y-10">
              <TabsList className="w-full grid grid-cols-4 bg-[#050505]/60 border border-white/5 p-2 rounded-[2.5rem] h-20 shadow-2xl backdrop-blur-xl">
                <TabsTrigger value="library" className="rounded-3xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[10px] tracking-widest uppercase transition-all">
                  <BookOpen size={16} className="mb-1 hidden md:block mx-auto" /> Bóveda
                </TabsTrigger>
                <TabsTrigger value="offline" className="rounded-3xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[10px] tracking-widest uppercase transition-all">
                  <WifiOff size={16} className="mb-1 hidden md:block mx-auto" /> Offline
                </TabsTrigger>
                <TabsTrigger value="testimonials" className="rounded-3xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[10px] tracking-widest uppercase transition-all">
                  <MessageSquare size={16} className="mb-1 hidden md:block mx-auto" /> Social
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-3xl data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-black text-[10px] tracking-widest uppercase transition-all">
                  <Settings size={16} className="mb-1 hidden md:block mx-auto" /> Ajustes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="library" className="outline-none animate-in fade-in zoom-in-95 duration-500">
                <Card className="bg-card/10 border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between p-10 md:p-14">
                    <div className="space-y-2">
                      <CardTitle className="text-4xl font-black uppercase tracking-tighter italic">Mis Hilos</CardTitle>
                      <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                        Colecciones curadas de sabiduría sónica.
                      </CardDescription>
                    </div>
                    <CreateCollectionModal finishedPodcasts={finishedPodcastsCollection.map(podcastItem => ({
                      identification: podcastItem.identification,
                      title: podcastItem.title,
                      coverImageUniformResourceLocator: podcastItem.coverImageUniformResourceLocator
                    }))} />
                  </CardHeader>
                  <CardContent className="px-10 md:px-14 pb-14">
                    {initialCollectionsCollection.length === 0 ? (
                      <div className="text-center py-28 border-2 border-dashed border-white/5 rounded-[3.5rem] bg-white/[0.01]">
                        <Layers className="h-16 w-16 mx-auto text-white/5 mb-6 animate-pulse" />
                        <p className="font-black text-muted-foreground uppercase tracking-[0.4em] text-[11px]">No hay hilos materializados</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        {initialCollectionsCollection.map((collectionItem) => (
                          <CollectionCard key={collectionItem.identification} collection={collectionItem} isOwnerSovereignty={true} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="offline" className="outline-none animate-in fade-in duration-700">
                {/* Consumo del componente restaurado */}
                <DownloadsManager />
              </TabsContent>

              <TabsContent value="testimonials" className="outline-none animate-in fade-in duration-700">
                <TestimonialModerator initialTestimonialsCollection={initialTestimonialsCollection} />
              </TabsContent>

              <TabsContent value="settings" className="outline-none animate-in fade-in duration-700">
                <Card className="bg-card/10 border-white/5 rounded-[3.5rem] shadow-2xl overflow-hidden border-t-primary/10">
                  <CardHeader className="p-10 md:p-14 bg-white/[0.01] border-b border-white/5">
                    <CardTitle className="text-4xl font-black uppercase tracking-tighter italic">ADN Digital</CardTitle>
                    <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] mt-2">
                      Personaliza tu presencia y biografía en la red.
                    </CardDescription>
                  </CardHeader>
                  <IdentitySettingsForm profile={profile} />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProfileHydrationGuard>
  );
}