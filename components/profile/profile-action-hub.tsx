// components/profile/profile-action-hub.tsx
// VERSIÓN: 1.0 (NicePod Profile Action Hub - Social Interaction Standard)
// Misión: Gestionar los accesos a la Bóveda Global y el disparo del protocolo Remix.
// [ESTABILIZACIÓN]: Lógica de visibilidad condicional basada en el estado de publicación y seguridad.

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
 * INTERFAZ: ProfileActionHubProps
 * Define el contrato de visibilidad para las acciones de salida.
 */
interface ProfileActionHubProps {
  podcastId: number;
  status: string;           // 'published', 'pending_approval', etc.
  isOwner: boolean;         // Permisos de propietario
  isConstructing: boolean;  // Bloqueo de interactividad durante la forja
  isAuthenticated: boolean; // Estado de sesión del visitante
  podcastTitle?: string;
  authorName?: string;
  authorAvatar?: string | null;
  scriptPlain?: string;
}

/**
 * ProfileActionHub: La terminal de saltos y contribuciones.
 */
export function ProfileActionHub({
  podcastId,
  status,
  isOwner,
  isConstructing,
  isAuthenticated,
  podcastTitle = "Podcast",
  authorName = "Anónimo",
  authorAvatar = null,
  scriptPlain = ""
}: ProfileActionHubProps) {

  const router = useRouter();
  const [isRemixOpen, setIsRemixOpen] = useState<boolean>(false);

  // No renderizamos acciones si el contenido aún se está materializando en la Bóveda.
  if (isConstructing) return null;

  return (
    <div className="w-full space-y-3">

      <AnimatePresence mode="wait">
        {/* 
            ACCIÓN I: VER EN BÓVEDA GLOBAL
            Visible solo para el dueño cuando el podcast ya es público.
            Permite navegar a la visualización inmersiva completa.
        */}
        {isOwner && status === 'published' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              onClick={() => router.push(`/podcast/${podcastId}`)}
              variant="outline"
              className="w-full h-12 rounded-2xl border-white/5 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white font-black uppercase text-[9px] tracking-[0.2em] transition-all group"
            >
              <Globe className="mr-2 h-3.5 w-3.5 opacity-50 group-hover:text-primary transition-colors" />
              Ver en Bóveda Global
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-30 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}

        {/* 
            ACCIÓN II: APORTAR RESPUESTA (REMIX)
            Punto de entrada a la conversación asíncrona de NicePod.
            Visible si el podcast es público y el visitante está autenticado.
        */}
        {status === 'published' && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Button
              onClick={() => setIsRemixOpen(true)}
              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                <Sparkles size={20} />
              </div>
              <CornerUpRight className="mr-2.5 h-4 w-4" />
              Aportar a esta frecuencia
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIÁLOGO DE REMIX: Inyección de contexto atómico */}
      {isRemixOpen && (
        <RemixDialog
          isOpen={isRemixOpen}
          onOpenChange={setIsRemixOpen}
          parentPodcast={{
            id: podcastId,
            title: podcastTitle,
            author: {
              full_name: authorName,
              avatar_url: authorAvatar
            }
          }}
          quoteContext={scriptPlain.substring(0, 400)}
          timestamp={0}
        />
      )}

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este componente encapsula el diálogo RemixDialog para evitar que el Orchestrator 
 * tenga que gestionar estados de modales secundarios. Al utilizar AnimatePresence, 
 * garantizamos que los botones aparezcan de forma fluida en cuanto el estado 
 * 'status' cambie a 'published' vía Realtime, reforzando la sensación de 
 * una Workstation viva y reactiva.
 */