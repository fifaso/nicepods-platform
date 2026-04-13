/**
 * ARCHIVO: components/profile/public/public-content-tabs.tsx
 * VERSIÓN: 4.0 (NicePod Content Navigation - Sovereign Industrial Standard)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la navegación segmentada del perfil público, permitiendo 
 * la transición fluida entre la biblioteca, colecciones y testimonios.
 * [REFORMA V4.0]: Unificación de tipos industriales (PodcastWithProfile), 
 * resolución de error TS2322 y cumplimiento estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

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
import Image from "next/image";

// --- INFRAESTRUCTURA DE COMPONENTES DE INTERFAZ (UI) ---
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- COMPONENTES SATÉLITES ESPECIALIZADOS ---
import { ProfilePodcastOrchestrator } from "../profile-podcast-orchestrator";
import { CollectionCard } from "../shared/collection-card";

// --- CONTRATOS DE DATOS Y TIPADO SOBERANO (V11.0) ---
import {
  Collection,
  ProfileData,
  ProfileTabValue,
  TestimonialWithAuthor
} from "@/types/profile";
import { PodcastWithProfile } from "@/types/podcast";
import { getSafeAsset } from "@/lib/utils";

/**
 * INTERFAZ: PublicContentTabsProperties
 * [FIX V4.0]: Se utiliza PodcastWithProfile para garantizar la integridad técnica.
 */
interface PublicContentTabsProperties {
  administratorProfile: ProfileData;
  publishedPodcastsCollection: PodcastWithProfile[];
  initialTestimonialsCollection: TestimonialWithAuthor[];
  publicCollectionsCollection: Collection[];
}

/**
 * PublicContentTabs: El motor de pestañas interactivo de la identidad pública.
 */
export function PublicContentTabs({
  administratorProfile,
  publishedPodcastsCollection,
  initialTestimonialsCollection,
  publicCollectionsCollection
}: PublicContentTabsProperties) {

  // --- GESTIÓN DE ESTADO DE NAVEGACIÓN DESCRIPTIVA ---
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTabValue>("podcasts");

  /**
   * renderActiveTabContent: 
   * Misión: Desacoplar el renderizado de cada faceta para garantizar escalabilidad.
   */
  const renderActiveTabContent = () => {
    switch (activeProfileTab) {
      case "podcasts":
        return (
          /* [FIX V4.0]: Sincronía nominal absoluta con ProfilePodcastOrchestratorProperties V11.0 */
          <ProfilePodcastOrchestrator
            initialPodcastCollection={publishedPodcastsCollection}
            administratorProfile={administratorProfile}
            isAdministratorOwner={false} 
          />
        );

      case "collections":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publicCollectionsCollection.length > 0 ? (
              publicCollectionsCollection.map((collectionItem) => (
                <CollectionCard
                  key={collectionItem.id}
                  collection={collectionItem}
                />
              ))
            ) : (
              <EmptySectionState
                IconComponent={Layers}
                title="Bóvedas sin catalogar"
                description="Este curador aún no ha organizado sus crónicas en hilos de conocimiento."
              />
            )}
          </div>
        );

      case "testimonials":
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            {initialTestimonialsCollection.length > 0 ? (
              initialTestimonialsCollection.map((testimonialItem) => (
                <TestimonialCard
                  key={testimonialItem.id}
                  testimonialData={testimonialItem}
                />
              ))
            ) : (
              <EmptySectionState
                IconComponent={MessageSquare}
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

  const handleTabChangeAction = (tabValue: string) => {
    setActiveProfileTab(tabValue as ProfileTabValue);
  };

  return (
    <div className="w-full space-y-12">

      {/* BLOQUE I: SELECTOR DE FRECUENCIAS (TABS LIST) */}
      <div className="flex justify-center w-full">
        <Tabs
          defaultValue="podcasts"
          value={activeProfileTab}
          onValueChange={handleTabChangeAction}
          className="w-full max-w-2xl"
        >
          <TabsList className="grid grid-cols-3 h-16 bg-white/[0.02] border border-white/5 p-1.5 rounded-full backdrop-blur-3xl shadow-2xl">

            <TabsTrigger
              value="podcasts"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-700 group"
            >
              <div className="flex items-center gap-2">
                <Mic2 size={14} className="opacity-60 group-data-[state=active]:opacity-100" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Biblioteca</span>
                <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[8px] border-white/10 group-data-[state=active]:border-black/20 group-data-[state=active]:text-black">
                  {publishedPodcastsCollection.length}
                </Badge>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="collections"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-700 group"
            >
              <div className="flex items-center gap-2">
                <Library size={14} className="opacity-60 group-data-[state=active]:opacity-100" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Colecciones</span>
                <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[8px] border-white/10 group-data-[state=active]:border-black/20 group-data-[state=active]:text-black">
                  {publicCollectionsCollection.length}
                </Badge>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="testimonials"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-700 group"
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="opacity-60 group-data-[state=active]:opacity-100" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Resonancia</span>
                <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[8px] border-white/10 group-data-[state=active]:border-black/20 group-data-[state=active]:text-black">
                  {initialTestimonialsCollection.length}
                </Badge>
              </div>
            </TabsTrigger>

          </TabsList>
        </Tabs>
      </div>

      {/* BLOQUE II: ESCENARIO DE CONTENIDO DINÁMICO (STAGING) */}
      <div className="min-h-[450px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`profile-tab-panel-${activeProfileTab}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderActiveTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}

/**
 * SUB-COMPONENTE: EmptySectionState
 */
interface EmptySectionStateProperties {
  IconComponent: React.ElementType;
  title: string;
  description: string;
}

function EmptySectionState({ IconComponent, title, description }: EmptySectionStateProperties) {
  return (
    <div className="col-span-full py-32 flex flex-col items-center text-center gap-5 bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
      <div className="text-zinc-800">
        <IconComponent size={48} />
      </div>
      <div className="space-y-2">
        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">{title}</h4>
        <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest max-w-[300px] leading-relaxed italic">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * SUB-COMPONENTE: TestimonialCard
 */
interface TestimonialCardProperties {
  testimonialData: TestimonialWithAuthor;
}

function TestimonialCard({ testimonialData }: TestimonialCardProperties) {
  return (
    <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] hover:border-primary/20 transition-all duration-700 group shadow-2xl isolate">
      <div className="flex items-start gap-6 mb-8">
        <div className="h-14 w-14 rounded-full bg-zinc-800 border border-white/10 overflow-hidden relative shadow-inner">
          <Image 
            src={getSafeAsset(testimonialData.author?.avatarUniformResourceLocator, 'avatar')}
            alt={testimonialData.author?.fullName || "Identidad del Curador"}
            fill 
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="text-[12px] font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors truncate font-serif">
            {testimonialData.author?.fullName || "Curador Anónimo"}
          </h5>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
            @{testimonialData.author?.username || "unnamed_voyager"}
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm">
          <Sparkles size={16} />
        </div>
      </div>
      <p className="text-base leading-relaxed text-zinc-400 font-medium italic">
        "{testimonialData.comment_text}"
      </p>
      <div className="mt-8 pt-8 border-t border-white/5 text-[8px] font-black text-zinc-800 uppercase tracking-[0.5em]">
        Validación de Autoridad: {new Date(testimonialData.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}