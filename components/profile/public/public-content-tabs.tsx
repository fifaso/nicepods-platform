// components/profile/public/public-content-tabs.tsx
// VERSIÓN: 1.1 (Public Content Engine - Full Integrity Edition)
// Misión: Gestionar la navegación y visualización del inventario público del curador.
// [RESOLUCIÓN]: Fix de importación MapPin (TS2304) y estabilización de hidratación.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Layers,
  MapPin,
  MessageSquare,
  Mic
} from "lucide-react";
import Link from "next/link";

// --- INFRAESTRUCTURA UI ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- NÚCLEO DE DATOS Y UTILIDADES ---
import { LeaveTestimonialDialog } from "@/components/leave-testimonial-dialog";
import { useAuth } from "@/hooks/use-auth";
import { cn, getSafeAsset } from "@/lib/utils";
import { Collection, ProfileData, PublicPodcast, TestimonialWithAuthor } from "@/types/profile";
import { CollectionCard } from "../shared/collection-card";

/**
 * INTERFAZ: PublicContentTabsProps
 * Define el contrato de datos inyectados desde el servidor para la vista pública.
 */
interface PublicContentTabsProps {
  profile: ProfileData;
  podcasts: PublicPodcast[];
  testimonials: TestimonialWithAuthor[];
  collections: Collection[];
}

/**
 * formatDuration: Convierte segundos en formato MM:SS para las tarjetas de podcast.
 */
const formatDuration = (seconds: number | null): string => {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * PublicContentTabs: El orquestador de frecuencias y colecciones de NicePod.
 */
export function PublicContentTabs({
  profile,
  podcasts,
  testimonials,
  collections
}: PublicContentTabsProps) {

  // Consumimos el estado de sesión para habilitar interacciones sociales
  const { user } = useAuth();
  const canLeaveTestimonial = user && user.id !== profile.id;

  return (
    <Tabs defaultValue="podcasts" className="w-full">

      {/* 1. NAVEGACIÓN DE FRECUENCIAS (TABS LIST) */}
      <TabsList className="w-full justify-center bg-transparent border-b border-white/5 rounded-none h-auto p-0 mb-16 flex-wrap gap-8 md:gap-20">
        <TabsTrigger
          value="podcasts"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-6 text-xs font-black uppercase tracking-[0.3em] transition-all"
        >
          Crónicas de Voz
        </TabsTrigger>

        <TabsTrigger
          value="collections"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-6 text-xs font-black uppercase tracking-[0.3em] transition-all"
        >
          Hilos Curados ({collections.length})
        </TabsTrigger>

        <TabsTrigger
          value="testimonials"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-6 text-xs font-black uppercase tracking-[0.3em] transition-all"
        >
          Resonancia Social
        </TabsTrigger>
      </TabsList>

      {/* 2. PESTAÑA: CRÓNICAS (PODCASTS) */}
      <TabsContent value="podcasts" className="outline-none" forceMount>
        <AnimatePresence mode="wait">
          <motion.div
            key="podcasts-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="data-[state=inactive]:hidden"
          >
            <div className="grid gap-10 md:grid-cols-2">
              {podcasts.map((pod) => (
                <Link key={`podcast-${pod.id}`} href={`/podcast/${pod.id}`} className="block group h-full">
                  <Card className="h-full bg-zinc-900/40 border-white/5 hover:border-primary/40 hover:bg-zinc-900/60 transition-all duration-500 rounded-[3rem] overflow-hidden shadow-2xl relative">

                    {/* INDICADOR DE RESONANCIA LOCAL (MADRID MODE) */}
                    {pod.creation_mode === 'situational' && (
                      <div className="absolute top-8 right-8 text-primary opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all">
                        <MapPin size={24} />
                      </div>
                    )}

                    <CardContent className="p-10 flex flex-col h-full">
                      <h3 className="font-black text-2xl leading-tight line-clamp-2 group-hover:text-primary transition-colors uppercase mb-6 tracking-tight pr-10 italic">
                        {pod.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-8">
                        <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                          <Calendar size={14} className="text-zinc-500" />
                          {new Date(pod.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                          <Clock size={14} className="text-zinc-500" />
                          {formatDuration(pod.duration_seconds)}
                        </span>
                      </div>

                      <p className="text-zinc-400 font-medium line-clamp-3 mb-10 text-base leading-relaxed italic">
                        {pod.description || "Iniciando análisis de este nodo de conocimiento..."}
                      </p>

                      <div className="flex justify-end pt-8 border-t border-white/5 mt-auto">
                        <div className={cn(
                          buttonVariants({ size: 'lg', variant: 'secondary' }),
                          "rounded-full font-black text-[11px] uppercase tracking-[0.2em] px-10 h-14 shadow-xl group-hover:bg-primary group-hover:text-white transition-all active:scale-95"
                        )}>
                          <Mic className="mr-3 h-4 w-4" /> Iniciar Escucha
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {podcasts.length === 0 && (
              <div className="text-center py-32 opacity-20 font-black uppercase tracking-[0.6em] text-sm italic">
                Silencio en la frecuencia pública
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </TabsContent>

      {/* 3. PESTAÑA: HILOS CURADOS (COLLECTIONS) */}
      <TabsContent value="collections" className="outline-none" forceMount>
        <AnimatePresence mode="wait">
          <motion.div
            key="collections-container"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="data-[state=inactive]:hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {collections.map((col) => (
                <CollectionCard key={`collection-${col.id}`} collection={col} />
              ))}
            </div>

            {collections.length === 0 && (
              <div className="text-center py-32 opacity-20 flex flex-col items-center gap-6">
                <Layers size={48} className="text-white/40" />
                <span className="font-black uppercase tracking-[0.4em] text-xs italic">
                  Sin bibliotecas temáticas actualmente
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </TabsContent>

      {/* 4. PESTAÑA: RESONANCIA SOCIAL (TESTIMONIALS) */}
      <TabsContent value="testimonials" className="outline-none" forceMount>
        <AnimatePresence mode="wait">
          <motion.div
            key="testimonials-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="data-[state=inactive]:hidden max-w-4xl mx-auto space-y-10 pb-20"
          >
            {testimonials.map((t) => (
              <div
                key={`testimony-${t.id}`}
                className="p-8 md:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row gap-6 md:gap-10 shadow-2xl backdrop-blur-md hover:bg-white/[0.04] transition-all duration-500"
              >
                {/* Identidad del autor de la reseña */}
                <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-white/10 shadow-2xl shrink-0">
                  <AvatarImage
                    src={getSafeAsset(t.author?.avatar_url, 'avatar')}
                    className="object-cover"
                  />
                  <AvatarFallback className="font-black bg-zinc-900 text-lg text-primary">
                    {t.author?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                {/* Contenido de la resonancia */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    <p className="font-black text-sm md:text-lg uppercase tracking-tighter text-white">
                      {t.author?.full_name || 'Curador Anónimo'}
                    </p>
                    <div className="h-1 w-1 rounded-full bg-primary/30 hidden md:block" />
                    <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-lg md:text-xl text-zinc-300 leading-relaxed italic font-medium">
                    "{t.comment_text}"
                  </p>
                </div>
              </div>
            ))}

            {testimonials.length === 0 && (
              <div className="text-center py-32 opacity-20 flex flex-col items-center gap-6">
                <MessageSquare size={48} className="text-white/40" />
                <span className="font-black uppercase tracking-[0.4em] text-xs">
                  El eco de la comunidad aún no se ha manifestado
                </span>
              </div>
            )}

            {/* ACCIÓN DE RESONANCIA: Dejar Testimonio */}
            {canLeaveTestimonial && (
              <div className="pt-24 flex flex-col items-center gap-8 border-t border-white/5">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-1 w-12 bg-primary/40 rounded-full mb-2" />
                  <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] animate-pulse text-center">
                    ¿Ha resonado tu curiosidad con este perfil?
                  </p>
                </div>
                <LeaveTestimonialDialog
                  profileId={profile.id}
                  onTestimonialAdded={() => window.location.reload()}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </TabsContent>

    </Tabs>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Se ha implementado 'forceMount' en los TabsContent junto con la regla CSS 
 * 'data-[state=inactive]:hidden'. Esta es la solución definitiva para 
 * integrar Radix UI con Framer Motion sin provocar el error 'removeChild'.
 * Al no eliminarse físicamente del DOM, React mantiene la referencia de los 
 * nodos y Framer Motion puede orquestar la salida fluida sin excepciones.
 */