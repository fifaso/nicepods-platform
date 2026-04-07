/**
 * ARCHIVO: components/profile/public-profile-page.tsx
 * VERSIÓN: 4.0 (NicePod Public Profile Orchestrator - Sovereign Stability Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la visualización externa del curador, proyectando la identidad
 * y el capital intelectual mediante un flujo de hidratación protegida.
 * [REFORMA V4.0]: Sincronización nominal total con PublicContentTabs V3.0, 
 * unificación de tipos industriales y cumplimiento estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";

// --- INFRAESTRUCTURA DE DATOS Y CONTRATOS SOBERANOS ---
import {
  Collection,
  ProfileData,
  TestimonialWithAuthor
} from "@/types/profile";
import { PodcastWithProfile } from "@/types/podcast";

// --- COMPONENTES DE ESTABILIDAD DE MALLA ---
import { ProfileHydrationGuard } from "./profile-hydration-guard";

// --- COMPONENTES SATÉLITES ESPECIALIZADOS ---
import { PublicContentTabs } from "./public/public-content-tabs";
import { PublicHeroSection } from "./public/public-hero-section";

/**
 * INTERFAZ: PublicProfilePageProperties
 * Misión: Definir el contrato de activos inyectados desde el orquestador de servidor.
 */
interface PublicProfilePageProperties {
  administratorProfile: ProfileData;
  publishedPodcastsCollection: PodcastWithProfile[];
  accumulatedResonanceCount: number;
  initialTestimonialsCollection: TestimonialWithAuthor[];
  publicCollectionsCollection: Collection[];
}

/**
 * PublicProfilePage: El director de escena para la identidad pública de la Workstation.
 */
export default function PublicProfilePage({
  administratorProfile,
  publishedPodcastsCollection,
  accumulatedResonanceCount,
  initialTestimonialsCollection,
  publicCollectionsCollection
}: PublicProfilePageProperties) {

  const userIdentification = administratorProfile.id;

  return (
    <ProfileHydrationGuard>

      <main className="w-full flex flex-col items-center selection:bg-primary/20">

        {/* 
            CAPA I: IDENTIDAD MONUMENTAL (HERO SECTION)
            Misión: Proyectar el estatus pericial y las métricas de reputación industrial.
        */}
        <div className="w-full animate-in fade-in slide-in-from-top-4 duration-1000 ease-out">
          <PublicHeroSection
            administratorProfile={administratorProfile}
            publishedPodcastTotalCount={publishedPodcastsCollection.length}
            accumulatedResonanceCount={accumulatedResonanceCount}
          />
        </div>

        {/* 
            CAPA II: MALLA DE CONTENIDO DINÁMICO (CONTENT TABS)
            Misión: Organizar el acceso a la biblioteca, colecciones y validaciones.
            [FIX V4.0]: Sincronización nominal absoluta con PublicContentTabsProperties V3.0.
        */}
        <section className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 pb-32">

          <AnimatePresence mode="wait">
            <motion.div
              key={`profile-content-anchor-${userIdentification}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <PublicContentTabs
                administratorProfile={administratorProfile}
                podcastsCollection={publishedPodcastsCollection}
                testimonialsCollection={initialTestimonialsCollection}
                collectionsCollection={publicCollectionsCollection}
              />
            </motion.div>
          </AnimatePresence>

        </section>

        {/* 
            CAPA III: TELEMETRÍA DE CIERRE (INDUSTRIAL FOOTER)
            Misión: Branding técnico que certifica la integridad del nodo de inteligencia.
        */}
        <div className="w-full max-w-2xl mx-auto py-24 flex flex-col items-center gap-6 opacity-20 select-none">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="flex items-center gap-4">
            <Zap size={14} className="text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.7em] text-white">
              Sovereign Intelligence Node
            </span>
            <Sparkles size={14} className="text-primary animate-pulse" />
          </div>

          <div className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.4em]">
            NicePod Platform V4.0 • Atomic Synchronization Verified
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>

      </main>

    </ProfileHydrationGuard>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Build Shield Compliance: Se corrigieron las propiedades inyectadas a PublicContentTabs 
 *    y PublicHeroSection, eliminando el error TS2322 detectado en Vercel.
 * 2. Zero Abbreviations Policy: Se purificó el 100% de la nomenclatura interna, sustituyendo 
 *    términos como 'Props', 'id', 'totalLikes' y 'podcasts'.
 * 3. Type Integrity: Se migró de 'PublicPodcast' a 'PodcastWithProfile' para garantizar que 
 *    el orquestador cliente maneje objetos con la densidad técnica que exige la V4.0.
 */