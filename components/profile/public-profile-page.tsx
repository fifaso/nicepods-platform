// components/profile/public-profile-page.tsx
// VERSIÓN: 2.0 (NicePod Public Profile Orchestrator - Zero-Crash & Atomic Sync Edition)
// Misión: Ensamblar la presencia pública del curador garantizando una hidratación inmaculada.
// [ESTABILIZACIÓN]: Eliminación del Error de React #310 mediante el Protocolo de Montaje Protegido.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";

// --- INFRAESTRUCTURA DE DATOS Y CONTRATOS ---
import {
  Collection,
  ProfileData,
  PublicPodcast,
  TestimonialWithAuthor
} from "@/types/profile";

// --- COMPONENTES DE ESTABILIDAD ---
import { ProfileHydrationGuard } from "./profile-hydration-guard";

// --- COMPONENTES DE LA MALLA SOBERANA (BLOQUE 3) ---
import { PublicContentTabs } from "./public/public-content-tabs";
import { PublicHeroSection } from "./public/public-hero-section";

/**
 * INTERFAZ: PublicProfilePageProps
 * Define el contrato de datos inyectados desde el Server Component (SSR).
 */
interface PublicProfilePageProps {
  profile: ProfileData;
  podcasts: PublicPodcast[];
  totalLikes: number;
  initialTestimonials: TestimonialWithAuthor[];
  publicCollections: Collection[];
}

/**
 * PublicProfilePage: El orquestador de la visualización externa del curador.
 * 
 * Este componente actúa como el punto de entrada de la 'Malla de Perfil'.
 * Su responsabilidad es distribuir la sabiduría recolectada en el servidor
 * hacia los componentes interactivos de la interfaz Aurora.
 */
export default function PublicProfilePage({
  profile,
  podcasts,
  totalLikes,
  initialTestimonials,
  publicCollections
}: PublicProfilePageProps) {

  /**
   * [PROTOCOLO DE INTEGRIDAD]:
   * El uso de ProfileHydrationGuard aquí es fundamental. 
   * Evita que los componentes hijos (que pueden contener lógica de Auth o Realtime)
   * se inicialicen antes de que el DOM sea seguro, matando el error #310.
   */
  return (
    <ProfileHydrationGuard>

      <main className="w-full flex flex-col items-center">

        {/* 
            CAPA I: IDENTIDAD MONUMENTAL
            Este bloque proyecta el estatus, prestigio y biografía del curador.
            La animación fade-in está sincronizada con la entrada del layout global.
        */}
        <div className="w-full animate-in fade-in duration-1000 ease-out">
          <PublicHeroSection
            profile={profile}
            podcastCount={podcasts.length}
            totalLikes={totalLikes}
          />
        </div>

        {/* 
            CAPA II: FLUJO DE CONOCIMIENTO DINÁMICO
            El motor de pestañas organiza las crónicas, hilos y testimonios.
            Usa el ancho máximo de la Workstation (max-w-screen-xl).
        */}
        <section className="w-full max-w-screen-xl mx-auto px-4 md:px-8 pb-24">

          <AnimatePresence mode="wait">
            <motion.div
              key={`profile-content-${profile.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
            CAPA III: CIERRE DE FRECUENCIA
            Elemento de branding técnico para suavizar la transición al footer.
        */}
        <div className="w-full max-w-md mx-auto py-12 flex flex-col items-center gap-4 opacity-10">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="flex items-center gap-3">
            <Zap size={14} className="text-primary" />
            <span className="text-[8px] font-black uppercase tracking-[0.6em] text-white">
              Neural Sync Established
            </span>
            <Sparkles size={14} className="text-primary" />
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

      </main>

    </ProfileHydrationGuard>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Se ha eliminado cualquier llamada a 'useAuth' en este nivel para mantener
 * el orquestador como un componente de presentación pura. La interactividad
 * social (como el botón de dejar testimonio) reside dentro de 'PublicContentTabs',
 * lo que permite que el 'PublicProfilePage' sea ultra-ligero y SSR-friendly.
 * La estabilidad del DOM está garantizada por la 'key' inyectada en el servidor.
 */