// components/profile/public-profile-page.tsx
// VERSIÓN: 1.0 (NicePod Public Profile Orchestrator - Stability & Impact Standard)
// Misión: Ensamblar la vista pública del curador garantizando una hidratación libre de errores.
// [ESTABILIZACIÓN]: Integración de ProfileHydrationGuard para eliminar el Error de React #310.

"use client";

import {
  Collection,
  ProfileData,
  PublicPodcast,
  TestimonialWithAuthor
} from "@/types/profile";

// --- INFRAESTRUCTURA DE ESTABILIDAD ---
import { ProfileHydrationGuard } from "./profile-hydration-guard";

// --- COMPONENTES DE LA MALLA (NIVEL 3) ---
import { PublicContentTabs } from "./public/public-content-tabs";
import { PublicHeroSection } from "./public/public-hero-section";

/**
 * INTERFAZ: PublicProfilePageProps
 * Define el contrato de datos inyectados desde el Server Component (app/profile/[username]/page.tsx).
 */
interface PublicProfilePageProps {
  profile: ProfileData;
  podcasts: PublicPodcast[];
  totalLikes: number;
  initialTestimonials: TestimonialWithAuthor[];
  publicCollections: Collection[];
}

/**
 * PublicProfilePage: El orquestador de la presencia social del curador.
 * 
 * Este componente no contiene lógica de negocio pesada; su responsabilidad 
 * es la distribución atómica de datos hacia los componentes especializados 
 * de Hero y Contenido.
 */
export default function PublicProfilePage({
  profile,
  podcasts,
  totalLikes,
  initialTestimonials,
  publicCollections
}: PublicProfilePageProps) {

  return (
    /**
     * [CAPA 1: ESCUDO DE HIDRATACIÓN]
     * El Guard asegura que el contenido de cliente no se intente montar 
     * hasta que el handshake SSR sea exitoso, eliminando el Error #310.
     */
    <ProfileHydrationGuard>

      <main className="w-full flex flex-col items-center">

        {/* [CAPA 2: SECCIÓN HERO]
            Proyecta la identidad, el avatar monumental y las métricas de autoridad.
            Implementa prioridad LCP para el renderizado de la imagen.
        */}
        <div className="w-full animate-in fade-in duration-1000">
          <PublicHeroSection
            profile={profile}
            podcastCount={podcasts.length}
            totalLikes={totalLikes}
          />
        </div>

        {/* [CAPA 3: SECCIÓN DE CONTENIDO DINÁMICO]
            El motor de pestañas gestiona la transición entre Crónicas, 
            Hilos Curados y Resonancia Social.
        */}
        <div className="w-full max-w-screen-xl mx-auto px-4 md:px-8 pb-20">
          <PublicContentTabs
            profile={profile}
            podcasts={podcasts}
            testimonials={initialTestimonials}
            collections={publicCollections}
          />
        </div>

        {/* 
            CAPA 4: ELEMENTO DE CIERRE ATMOSFÉRICO
            Malla decorativa sutil para integrar el pie de página con el sistema Aurora.
        */}
        <div className="w-full py-10 opacity-5 pointer-events-none">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent" />
        </div>

      </main>

    </ProfileHydrationGuard>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Al separar la 'PublicProfilePage' en este archivo especializado, hemos 
 * aislado su árbol de Hooks del 'PrivateProfileDashboard'. Esto previene 
 * colisiones de estado si un administrador navega entre su búnker privado 
 * y la vista pública, garantizando que el motor de React mantenga la 
 * integridad del DOM. La densidad visual ha sido ajustada a un máximo 
 * de 1280px (max-w-screen-xl) para optimizar la legibilidad del feed.
 */