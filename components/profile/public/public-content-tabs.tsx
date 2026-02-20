// components/profile/public/public-content-tabs.tsx
// VERSIÓN: 1.2 (Public Content Engine - Zero-Crash & DOM Persistence Edition)
// Misión: Gestionar la navegación del inventario público eliminando errores de reconciliación.
// [ESTABILIZACIÓN]: Implementación de 'forceMount' y aliasing de iconos para integridad total.

"use client";

import { motion } from "framer-motion";
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

// --- NÚCLEO DE DATOS Y CONTRATOS ---
import { LeaveTestimonialDialog } from "@/components/leave-testimonial-dialog";
import { useAuth } from "@/hooks/use-auth";
import { cn, getSafeAsset } from "@/lib/utils";
import { Collection, ProfileData, PublicPodcast, TestimonialWithAuthor } from "@/types/profile";
import { CollectionCard } from "../shared/collection-card";

/**
 * INTERFAZ: PublicContentTabsProps
 */
interface PublicContentTabsProps {
  profile: ProfileData;
  podcasts: PublicPodcast[];
  testimonials: TestimonialWithAuthor[];
  collections: Collection[];
}

/**
 * formatDuration: Convierte segundos a formato MM:SS.
 */
const formatDuration = (seconds: number | null): string => {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * PublicContentTabs: El motor de visualización de hilos y crónicas.
 */
export function PublicContentTabs({
  profile,
  podcasts,
  testimonials,
  collections
}: PublicContentTabsProps) {

  // Consumimos identidad para habilitar interacciones sociales.
  // [RIGOR]: Al estar dentro de un HydrationGuard en el padre, este hook es seguro.
  const { user } = useAuth();
  const canLeaveTestimonial = user && user.id !== profile.id;

  return (
    <Tabs defaultValue="podcasts" className="w-full">

      {/* 1. SELECTOR DE FRECUENCIAS (TABS LIST) */}
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

      {/* 2. CONTENIDO: CRÓNICAS (PODCASTS)
          [FIX]: 'forceMount' mantiene el nodo vivo para evitar el crash 'removeChild'.
      */}
      <TabsContent value="podcasts" className="outline-none" forceMount>
        <div className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid gap-8 md:grid-cols-2">
              {podcasts.map((pod) => (
                <Link key={`pod-${pod.id}`} href={`/podcast/${pod.id}`} className="block group">
                  <Card className="h-full bg-zinc-900/40 border-white/5 hover:border-primary/40 transition-all duration-500 rounded-[2.5rem] overflow-hidden shadow-2xl relative">

                    {pod.creation_mode === 'situational' && (
                      <div className="absolute top-6 right-6 text-primary/40 group-hover:text-primary transition-colors">
                        <MapPin size={20} />
                      </div>
                    )}

                    <CardContent className="p-8 md:p-10 flex flex-col h-full">
                      <h3 className="font-black text-2xl group-hover:text-primary transition-colors uppercase mb-4 tracking-tighter italic">
                        {pod.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-6">
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                          <Calendar size={12} /> {new Date(pod.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                          <Clock size={12} /> {formatDuration(pod.duration_seconds)}
                        </span>
                      </div>

                      <p className="text-zinc-400 text-sm md:text-base line-clamp-3 mb-8 leading-relaxed font-medium">
                        {pod.description || "Analizando el ADN de este nodo de conocimiento..."}
                      </p>

                      <div className="flex justify-end pt-6 border-t border-white/5 mt-auto">
                        <div className={cn(
                          buttonVariants({ size: 'sm', variant: 'secondary' }),
                          "rounded-full font-black text-[10px] uppercase tracking-widest px-8 h-12 shadow-lg group-hover:bg-primary group-hover:text-white transition-all"
                        )}>
                          <Mic className="mr-2 h-4 w-4" /> Iniciar Escucha
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {podcasts.length === 0 && (
              <div className="text-center py-24 opacity-20 font-black uppercase tracking-[0.5em] text-xs">
                Cero registros públicos
              </div>
            )}
          </motion.div>
        </div>
      </TabsContent>

      {/* 3. CONTENIDO: HILOS CURADOS (COLLECTIONS) */}
      <TabsContent value="collections" className="outline-none" forceMount>
        <div className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {collections.map((col) => (
              <CollectionCard key={`col-${col.id}`} collection={col} />
            ))}

            {collections.length === 0 && (
              <div className="col-span-full text-center py-24 opacity-20 flex flex-col items-center gap-4">
                <Layers size={40} />
                <span className="font-black uppercase tracking-[0.4em] text-[10px]">
                  Sin bibliotecas temáticas
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </TabsContent>

      {/* 4. CONTENIDO: RESONANCIA (TESTIMONIALS) */}
      <TabsContent value="testimonials" className="outline-none" forceMount>
        <div className="data-[state=inactive]:hidden max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 pb-20"
          >
            {testimonials.map((t) => (
              <div
                key={`test-${t.id}`}
                className="p-6 md:p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row gap-6 shadow-xl backdrop-blur-sm"
              >
                <Avatar className="h-14 w-14 border border-white/10 shadow-inner">
                  <AvatarImage
                    src={getSafeAsset(t.author?.avatar_url, 'avatar')}
                    className="object-cover"
                  />
                  <AvatarFallback className="font-black bg-zinc-900 text-primary">
                    {t.author?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-3 flex-grow min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-black text-xs md:text-sm uppercase tracking-tight text-white">
                      {t.author?.full_name || 'Curador Anónimo'}
                    </p>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-base md:text-lg text-zinc-300 leading-relaxed italic font-medium">
                    "{t.comment_text}"
                  </p>
                </div>
              </div>
            ))}

            {testimonials.length === 0 && (
              <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                <MessageSquare size={40} />
                <span className="font-black uppercase tracking-[0.4em] text-[10px]">
                  Silencio social
                </span>
              </div>
            )}

            {/* ACCIÓN: DEJAR TESTIMONIO */}
            {canLeaveTestimonial && (
              <div className="pt-16 mt-10 border-t border-white/5 text-center space-y-6">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">
                  ¿Ha resonado tu curiosidad con este perfil?
                </p>
                <LeaveTestimonialDialog
                  profileId={profile.id}
                  onTestimonialAdded={() => window.location.reload()}
                />
              </div>
            )}
          </motion.div>
        </div>
      </TabsContent>

    </Tabs>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * La implementación de 'forceMount' junto con un div envoltorio que reacciona
 * al estado 'inactive' de Radix es la única forma de garantizar que Framer Motion
 * no intente animar un nodo que ya no existe en el árbol de React. 
 * Con esto, el error #310 y el crash de 'removeChild' quedan sepultados.
 */