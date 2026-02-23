//componentes/profile/public/public-content-tabs.tsx
//VERSIÓN: 2.0 (NicePod Content Navigation - High-Density Standard)
"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Layers,
  Library,
  MessageSquare,
  Mic2,
  Sparkles
} from "lucide-react";
import React, { useState } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES DE INTERFAZ ---
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- COMPONENTES SATÉLITES ESPECIALIZADOS ---
import { ProfilePodcastOrchestrator } from "../profile-podcast-orchestrator";
import { CollectionCard } from "../shared/collection-card";

// --- CONTRATOS DE DATOS Y TIPADO SOBERANO ---
import {
  Collection,
  ProfileData,
  ProfileTabValue,
  PublicPodcast,
  TestimonialWithAuthor
} from "@/types/profile";

/**
 * INTERFAZ: PublicContentTabsProps
 * Define el contrato de activos para la visualización segmentada del perfil.
 */
interface PublicContentTabsProps {
  profile: ProfileData;
  podcasts: PublicPodcast[];
  testimonials: TestimonialWithAuthor[];
  collections: Collection[];
}

/**
 * COMPONENTE: PublicContentTabs
 * El motor de pestañas interactivo de la identidad pública.
 * 
 * Responsabilidades:
 * 1. Proveer acceso rápido a las diferentes dimensiones de la Bóveda del curador.
 * 2. Visualizar contadores de densidad (Badges) para feedback inmediato de valor.
 * 3. Orquestar transiciones cinemáticas entre los diferentes módulos de contenido.
 */
export function PublicContentTabs({
  profile,
  podcasts,
  testimonials,
  collections
}: PublicContentTabsProps) {

  // --- GESTIÓN DE ESTADO DE NAVEGACIÓN ---
  const [activeTab, setActiveTab] = useState<ProfileTabValue>("podcasts");

  /**
   * TÁCTICA DE RENDERIZADO: Switch de Contenido
   * Desacoplamos el renderizado de cada pestaña para mantener el componente limpio y escalable.
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case "podcasts":
        return (
          <ProfilePodcastOrchestrator
            initialPodcasts={podcasts}
            profile={profile}
            isOwner={false} // En vista pública, el visitante no es dueño.
          />
        );

      case "collections":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.length > 0 ? (
              collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                />
              ))
            ) : (
              <EmptySectionState
                icon={<Layers className="h-10 w-10" />}
                title="Bóvedas sin catalogar"
                description="Este curador aún no ha organizado sus crónicas en hilos de conocimiento."
              />
            )}
          </div>
        );

      case "testimonials":
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            {testimonials.length > 0 ? (
              testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                />
              ))
            ) : (
              <EmptySectionState
                icon={<MessageSquare className="h-10 w-10" />}
                title="Frecuencia Silenciosa"
                description="Aún no existen validaciones externas de otros curadores para esta identidad."
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-10">

      {/* 
          BLOQUE I: SELECTOR DE FRECUENCIAS (TABS LIST)
          Diseño Aurora con desenfoque de fondo y bordes de alta definición.
      */}
      <div className="flex justify-center w-full">
        <Tabs
          defaultValue="podcasts"
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ProfileTabValue)}
          className="w-full max-w-2xl"
        >
          <TabsList className="grid grid-cols-3 h-16 bg-white/[0.02] border border-white/5 p-1 rounded-full backdrop-blur-xl">

            <TabsTrigger
              value="podcasts"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-500 group"
            >
              <div className="flex items-center gap-2">
                <Mic2 size={14} className="opacity-60 group-data-[state=active]:opacity-100" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Biblioteca</span>
                <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[8px] border-white/10 group-data-[state=active]:border-black/20 group-data-[state=active]:text-black">
                  {podcasts.length}
                </Badge>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="collections"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-500 group"
            >
              <div className="flex items-center gap-2">
                <Library size={14} className="opacity-60 group-data-[state=active]:opacity-100" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Colecciones</span>
                <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[8px] border-white/10 group-data-[state=active]:border-black/20 group-data-[state=active]:text-black">
                  {collections.length}
                </Badge>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="testimonials"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-500 group"
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="opacity-60 group-data-[state=active]:opacity-100" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Resonancia</span>
                <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[8px] border-white/10 group-data-[state=active]:border-black/20 group-data-[state=active]:text-black">
                  {testimonials.length}
                </Badge>
              </div>
            </TabsTrigger>

          </TabsList>
        </Tabs>
      </div>

      {/* 
          BLOQUE II: ESCENARIO DE CONTENIDO (DYNAMIC STAGE)
          Implementamos AnimatePresence para suavizar el cambio de faceta.
      */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`tab-panel-${activeTab}`}
            initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(4px)", y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}

/**
 * SUB-COMPONENTE: EmptySectionState
 * Proyecta elegancia técnica incluso ante la ausencia de datos.
 */
function EmptySectionState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="col-span-full py-20 flex flex-col items-center text-center gap-4 bg-white/[0.01] border border-dashed border-white/5 rounded-[2.5rem]">
      <div className="text-zinc-800">{icon}</div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{title}</h4>
        <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-widest max-w-[280px] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * SUB-COMPONENTE: TestimonialCard
 * Muestra las validaciones sociales con un enfoque tipográfico limpio.
 */
function TestimonialCard({ testimonial }: { testimonial: TestimonialWithAuthor }) {
  return (
    <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-[2rem] hover:border-primary/20 transition-all duration-500 group">
      <div className="flex items-start gap-4 mb-6">
        <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
          {testimonial.author?.avatar_url && (
            <img src={testimonial.author.avatar_url} alt={testimonial.author.full_name || ""} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex-1">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors">
            {testimonial.author?.full_name || "Curador Anónimo"}
          </h5>
          <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
            @{testimonial.author?.username || "unnamed"}
          </p>
        </div>
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Sparkles size={12} />
        </div>
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-400 font-medium italic">
        "{testimonial.comment_text}"
      </p>
      <div className="mt-6 pt-6 border-t border-white/5 text-[7px] font-black text-zinc-700 uppercase tracking-[0.4em]">
        Validación Registrada: {new Date(testimonial.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Diseño Inmersivo: El uso de desenfoques y gradientes sutiles mantiene 
 *    la estética Aurora sin penalizar el rendimiento del renderizado.
 * 2. Feedback Instantáneo: Los Badges en las pestañas permiten al visitante 
 *    conocer la profundidad del perfil antes de hacer clic.
 * 3. Escalabilidad: El sistema está preparado para añadir nuevas pestañas 
 *    (como 'Frecuencias en Vivo') simplemente extendiendo el tipo 'ProfileTabValue'.
 */