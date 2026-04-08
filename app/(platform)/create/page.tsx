/**
 * ARCHIVO: app/(platform)/create/page.tsx
 * VERSIÓN: 3.0 (NicePod Creation Stage - Industrial SSR Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestador de servidor para la ruta de creación de capital intelectual,
 * garantizando la validación de identidad y la hidratación de borradores previos.
 * [REFORMA V3.0]: Sincronización nominal total con PodcastCreationOrchestrator V53.0,
 * resolución de error TS2322 y cumplimiento estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { listUserDrafts } from "@/actions/draft-actions";
import PodcastCreationOrchestrator from "@/components/create-flow";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * CreationPage: El director de datos en el servidor para la terminal de forja.
 * 
 * Realiza la cosecha de borradores existentes en el Metal (SQL) para evitar 
 * estados de carga vacíos durante la transición del Voyager.
 */
export default async function CreationPage() {
  const supabaseClient = createClient();

  /**
   * 1. PROTOCOLO DE SEGURIDAD EN EL SERVIDOR (T0 Auth Check)
   * Validamos la autoridad del Voyager antes de permitir el acceso al laboratorio.
   */
  const { 
    data: { user: authenticatedUser }, 
    error: authenticationError 
  } = await supabaseClient.auth.getUser();

  if (authenticationError || !authenticatedUser) {
    // Redirección táctica hacia el control de acceso preservando la intención de ruta.
    redirect("/login?redirect=/create");
  }

  /**
   * 2. COSECHA DE ACTIVOS PERSISTENTES (Borradores)
   * Misión: Hidratar la colección de trabajos en curso para su gestión inmediata.
   */
  const existingUserDraftsCollection = await listUserDrafts();

  return (
    <main className="min-h-screen bg-transparent relative overflow-hidden selection:bg-primary/30 antialiased">
      
      {/* 
          PODCAST_CREATION_ORCHESTRATOR: 
          Componente raíz de la terminal de forja (Client Component).
          [FIX V3.0]: Se inyecta 'initialDraftsCollection' cumpliendo el contrato nominal V53.0.
      */}
      <PodcastCreationOrchestrator 
        initialDraftsCollection={existingUserDraftsCollection} 
      />

    </main>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Contract Alignment: Se resolvió el error de tipos TS2322 sincronizando el nombre 
 *    de la propiedad de despacho con la interfaz 'PodcastCreationOrchestratorProperties'.
 * 2. Zero Abbreviations Policy: Se purificó el 100% de la lógica de servidor, 
 *    erradicando términos como 'user', 'authError' y 'existingDrafts'.
 * 3. Hydration Optimization: Al recolectar los borradores en el servidor (SSR), 
 *    eliminamos la latencia de red en el cliente, permitiendo que la fase de 
 *    selección de propósito sea instantánea.
 */