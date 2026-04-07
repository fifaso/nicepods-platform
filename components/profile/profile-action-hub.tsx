/**
 * ARCHIVO: components/profile/profile-action-hub.tsx
 * VERSIÓN: 2.0 (NicePod Profile Action Hub - Sovereign Interaction Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar los accesos de autoridad a la Bóveda Global y orquestar 
 * el inicio del protocolo de Remix para la expansión del capital intelectual.
 * [REFORMA V2.0]: Sincronización nominal total con ProfileView V11.0, erradicación 
 * absoluta de abreviaturas y blindaje de contratos para el Build Shield.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  CornerUpRight,
  Globe,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// --- INFRAESTRUCTURA UI ---
import { RemixDialog } from "@/components/remix-dialog";
import { Button } from "@/components/ui/button";

/**
 * INTERFAZ: ProfileActionHubProperties
 * Misión: Definir el contrato de visibilidad para las acciones de salida pericial.
 * [FIX V2.0]: Alineación con el despacho del orquestador superior.
 */
interface ProfileActionHubProperties {
  podcastIdentification: number;
  publicationStatus: string;           
  isAdministratorOwner: boolean;         
  isIntelligenceConstructing: boolean;  
  isUserAuthenticated: boolean; 
  podcastTitle?: string;
  authorDisplayName?: string;
  authorAvatarUniformResourceLocator?: string | null;
  narrativeScriptPlain?: string;
}

/**
 * ProfileActionHub: La terminal de saltos y contribuciones de la Workstation.
 */
export function ProfileActionHub({
  podcastIdentification,
  publicationStatus,
  isAdministratorOwner,
  isIntelligenceConstructing,
  isUserAuthenticated,
  podcastTitle = "Podcast",
  authorDisplayName = "Curador Anónimo",
  authorAvatarUniformResourceLocator = null,
  narrativeScriptPlain = ""
}: ProfileActionHubProperties) {

  const navigationRouter = useRouter();
  const [isRemixInterfaceOpen, setIsRemixInterfaceOpen] = useState<boolean>(false);

  // No renderizamos comandos de acción si la inteligencia aún se está materializando.
  if (isIntelligenceConstructing) {
    return null;
  }

  return (
    <div className="w-full space-y-4">

      <AnimatePresence mode="wait">
        
        {/* ACCIÓN I: ACCESO A BÓVEDA GLOBAL (Navegación Inmersiva) */}
        {isAdministratorOwner && publicationStatus === 'published' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              onClick={() => navigationRouter.push(`/podcast/${podcastIdentification}`)}
              variant="outline"
              className="w-full h-14 rounded-2xl border-white/5 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all group"
            >
              <Globe className="mr-3 h-4 w-4 opacity-50 group-hover:text-primary transition-colors" />
              Ver en Bóveda Global
              <ChevronRight className="ml-auto h-4 w-4 opacity-30 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}

        {/* ACCIÓN II: PROTOCOLO REMIX (Expansión de Frecuencia) */}
        {publicationStatus === 'published' && isUserAuthenticated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Button
              onClick={() => setIsRemixInterfaceOpen(true)}
              className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_15px_30px_rgba(79,70,229,0.2)] hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
                <Sparkles size={24} />
              </div>
              <CornerUpRight className="mr-3 h-5 w-5" />
              Aportar a esta frecuencia
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIÁLOGO DE REMIX: Inyección de contexto de inteligencia */}
      {isRemixInterfaceOpen && (
        <RemixDialog
          isOpen={isRemixInterfaceOpen}
          onOpenChange={setIsRemixInterfaceOpen}
          parentPodcast={{
            id: podcastIdentification,
            title: podcastTitle,
            author: {
              full_name: authorDisplayName,
              avatar_url: authorAvatarUniformResourceLocator
            }
          }}
          quoteContext={narrativeScriptPlain.substring(0, 500)}
          timestamp={0}
        />
      )}

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Build Shield Compliance: Se sustituyó 'podcastId' por 'podcastIdentification', 
 *    resolviendo el error TS2322 detectado en el orquestador de perfil.
 * 2. Zero Abbreviations Policy: Purificación absoluta de términos (navigationRouter, 
 *    isRemixInterfaceOpen, authorAvatarUniformResourceLocator).
 * 3. Atomic State Management: El componente centraliza el disparo del RemixDialog 
 *    utilizando el contexto purificado de la narrativa (narrativeScriptPlain).
 */