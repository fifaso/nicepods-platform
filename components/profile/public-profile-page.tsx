/**
 * ARCHIVO: components/profile/public/public-profile-page.tsx
 * VERSIÓN: 4.2 (NicePod Public Profile Orchestrator - Absolute Path Integrity)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la visualización externa del curador.
 * [REFORMA V4.2]: Implementación de importaciones absolutas (@/) para resolver 
 * error TS2307 y garantizar la resolución de módulos en el Build Shield.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";

// --- INFRAESTRUCTURA DE DATOS Y CONTRATOS SOBERANOS ---
import { PodcastWithProfile } from "@/types/podcast";
import {
  Collection,
  ProfileData,
  TestimonialWithAuthor
} from "@/types/profile";

// --- COMPONENTES DE ESTABILIDAD DE MALLA (ABSORCIÓN MEDIANTE PATH ALIAS) ---
// [FIX V4.2]: Se sustituyen rutas relativas por alias absolutos para neutralizar TS2307.
import { ProfileHydrationGuard } from "@/components/profile/profile-hydration-guard";
import { PublicContentTabs } from "@/components/profile/public/public-content-tabs";
import { PublicHeroSection } from "@/components/profile/public/public-hero-section";

/**
 * INTERFAZ: PublicProfilePageProperties
 */
interface PublicProfilePageProperties {
  administratorProfile: ProfileData;
  publishedPodcastsCollection: PodcastWithProfile[];
  accumulatedResonanceCount: number;
  initialTestimonialsCollection: TestimonialWithAuthor[];
  publicCollectionsCollection: Collection[];
}

/**
 * PublicProfilePage: El director de escena para la identidad pública.
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

        {/* CAPA I: IDENTIDAD MONUMENTAL (HERO SECTION) */}
        <div className="w-full animate-in fade-in slide-in-from-top-4 duration-1000 ease-out">
          <PublicHeroSection
            administratorProfile={administratorProfile}
            publishedPodcastTotalCount={publishedPodcastsCollection.length}
            accumulatedResonanceCount={accumulatedResonanceCount}
          />
        </div>

        {/* CAPA II: MALLA DE CONTENIDO DINÁMICO (CONTENT TABS) */}
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
                publishedPodcastsCollection={publishedPodcastsCollection}
                initialTestimonialsCollection={initialTestimonialsCollection}
                publicCollectionsCollection={publicCollectionsCollection}
              />
            </motion.div>
          </AnimatePresence>

        </section>

        {/* CAPA III: TELEMETRÍA DE CIERRE */}
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