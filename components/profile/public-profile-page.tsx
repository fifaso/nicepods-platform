// components/profile/public-profile-page.tsx
//version:3.0 (NicePod Public Profile Orchestrator - Atomic Stability Standard)
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";

// --- INFRAESTRUCTURA DE DATOS Y CONTRATOS SOBERANOS ---
import {
  Collection,
  ProfileData,
  PublicPodcast,
  TestimonialWithAuthor
} from "@/types/profile";

// --- COMPONENTES DE ESTABILIDAD DE MALLA ---
import { ProfileHydrationGuard } from "./profile-hydration-guard";

// --- COMPONENTES SATÉLITES ESPECIALIZADOS ---
// Estos componentes gestionan la visualización atómica de cada sección.
import { PublicContentTabs } from "./public/public-content-tabs";
import { PublicHeroSection } from "./public/public-hero-section";

/**
 * INTERFAZ: PublicProfilePageProps
 * Define el contrato de datos inyectados desde el Server Component (SSR).
 * Se alinea estrictamente con los tipos definidos en 'types/profile.ts'.
 */
interface PublicProfilePageProps {
  profile: ProfileData;
  podcasts: PublicPodcast[];
  totalLikes: number;
  initialTestimonials: TestimonialWithAuthor[];
  publicCollections: Collection[];
}

/**
 * COMPONENTE: PublicProfilePage
 * El orquestador central de la visualización externa del curador.
 * 
 * Este componente asume la responsabilidad de la "Última Milla" en la visualización.
 * No realiza peticiones de datos; consume la 'Verdad' recolectada por el servidor
 * y la proyecta en la interfaz Aurora mediante un flujo de hidratación protegida.
 */
export default function PublicProfilePage({
  profile,
  podcasts,
  totalLikes,
  initialTestimonials,
  publicCollections
}: PublicProfilePageProps) {

  /**
   * [PROTOCOLO DE INTEGRIDAD DE MONTAJE]:
   * El uso de ProfileHydrationGuard envuelve toda la experiencia del perfil.
   * Esto asegura que los componentes que dependen de Hooks de cliente o 
   * animaciones de Framer Motion no intenten renderizarse hasta que el DOM
   * sea estable, erradicando los fallos de reconciliación de Next.js.
   */
  return (
    <ProfileHydrationGuard>

      <main className="w-full flex flex-col items-center selection:bg-primary/20">

        {/* 
            CAPA I: IDENTIDAD MONUMENTAL (HERO SECTION)
            Proyecta el estatus, biografía y métricas de reputación del curador.
            Se inyectan las propiedades 'full_name' y 'username' alineadas con la DB.
        */}
        <div className="w-full animate-in fade-in slide-in-from-top-4 duration-1000 ease-out">
          <PublicHeroSection
            profile={profile}
            podcastCount={podcasts.length}
            totalLikes={totalLikes}
          />
        </div>

        {/* 
            CAPA II: MALLA DE CONTENIDO DINÁMICO (CONTENT TABS)
            Organiza las crónicas de voz, las colecciones de sabiduría y los testimonios.
            Limitamos el ancho al estándar de la Workstation (max-w-screen-xl).
        */}
        <section className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 pb-32">

          <AnimatePresence mode="wait">
            <motion.div
              key={`profile-content-anchor-${profile.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <PublicContentTabs
                profile={profile}
                podcasts={podcasts}
                testimonials={initialTestimonials}
                collections={publicCollections}
              />
            </motion.div>
          </AnimatePresence>

        </section>

        {/* 
            CAPA III: TELEMETRÍA DE CIERRE (VISUAL FOOTER)
            Branding técnico que confirma la integridad de la conexión neural.
        */}
        <div className="w-full max-w-2xl mx-auto py-16 flex flex-col items-center gap-6 opacity-20 select-none">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="flex items-center gap-4">
            <Zap size={14} className="text-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.7em] text-white">
              Sovereign Intelligence Node
            </span>
            <Sparkles size={14} className="text-primary animate-pulse" />
          </div>

          <div className="text-[7px] font-medium text-zinc-500 uppercase tracking-[0.3em]">
            NicePod Platform V2.5 • Atomic Sync Verified
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>

      </main>

    </ProfileHydrationGuard>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Estabilidad Atómica: Se ha delegado la lógica pesada a los hijos (Tabs/Hero),
 *    manteniendo este archivo como una "Función Pura de Orquestación".
 * 2. Rendimiento SSR: El componente es ultra-ligero. Al no tener useEffects 
 *    propios (excepto el guard), el Time to Interactive (TTI) es óptimo.
 * 3. Diseño Industrial: Los espacios y gradientes están calculados para
 *    evitar el Cumulative Layout Shift (CLS) durante la carga de las pestañas.
 */