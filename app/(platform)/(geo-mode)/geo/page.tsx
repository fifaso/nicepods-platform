// app/(platform)/(geo-mode)/geo/page.tsx
// VERSIÓN: 5.0

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Wifi,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// --- NÚCLEO DE IDENTIDAD Y UI ---
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

// --- INFRAESTRUCTURA DE LA FORJA (STEPPER) ---
import { ForgeProvider, useForge } from "@/components/geo/forge-context";

// [IMPORTANTE]: Estos componentes se construirán en los siguientes pasos del Sprint.
import { StepAnchoring } from "@/components/geo/steps/step-1-anchoring";
import { StepEvidence } from "@/components/geo/steps/step-2-evidence";
import { StepIntention } from "@/components/geo/steps/step-3-intention";

/**
 * COMPONENTE: GeoForgeContent (Lógica Interna del Stepper)
 * Este componente vive dentro del ForgeProvider y reacciona al estado de avance.
 */
function GeoForgeContent() {
  const { state } = useForge();

  // Variantes de animación para simular el cambio de pantallas nativo (Slide)
  const variants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <div className="flex-1 relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">

        {/* FASE 1: ANCLAJE GPS Y CATEGORÍA */}
        {state.currentStep === 'ANCHORING' && (
          <motion.div
            key="step-1"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <StepAnchoring />
          </motion.div>
        )}

        {/* FASE 2: RECOLECCIÓN DE EVIDENCIA (FOTOS/AUDIO) */}
        {state.currentStep === 'EVIDENCE' && (
          <motion.div
            key="step-2"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <StepEvidence />
          </motion.div>
        )}

        {/* FASE 3: SEMILLA NARRATIVA (INTENCIÓN) */}
        {state.currentStep === 'INTENTION' && (
          <motion.div
            key="step-3"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <StepIntention />
          </motion.div>
        )}

        {/* ESTADO FINAL: FORJANDO (LOADING CRÍTICO) */}
        {state.currentStep === 'FORGING' && (
          <motion.div
            key="step-loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#020202] z-50"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
              <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-[0.4em] text-white animate-pulse">
              Sintetizando Nodo
            </h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2 text-center max-w-xs">
              La Bóveda está asimilando la evidencia y forjando la narrativa urbana.
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

/**
 * COMPONENTE MAESTRO: GeoCreationPage
 * El Orquestador de la Terminal Táctica.
 */
export default function GeoCreationPage() {
  const { isAdmin, isInitialLoading, isAuthenticated, profile } = useAuth();
  const router = useRouter();

  /**
   * [GUARDA DE SEGURIDAD CLIENT-SIDE REDUNDANTE]:
   * Expulsa a cualquier usuario que no posea rango de Administrador.
   */
  useEffect(() => {
    if (!isInitialLoading) {
      if (!isAuthenticated || !isAdmin) {
        console.warn("🛡️ [RBAC] Acceso no autorizado a la Terminal GEO. Expulsando nodo.");
        router.replace("/dashboard");
      }
    }
  }, [isAdmin, isInitialLoading, isAuthenticated, router]);

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020202] selection:bg-primary/30">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 animate-pulse">
          Validando Autoridad
        </span>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    // [ARQUITECTURA]: h-[100dvh] garantiza que la UI ocupe la pantalla móvil completa
    // sin que la barra de navegación del navegador empuje el contenido.
    <ForgeProvider>
      <div className="h-[100dvh] w-full relative flex flex-col bg-[#020202] overflow-hidden selection:bg-primary/30">

        {/* I. HUD DE TELEMETRÍA SUPERIOR (Status Bar) */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 bg-black/50 backdrop-blur-xl px-5 py-2 rounded-full border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[8px] font-black tracking-[0.2em] uppercase text-white/80">
              Modo Admin Activo
            </span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Wifi className="h-3 w-3 text-emerald-500 opacity-80" />
            <span className="text-[8px] font-black tracking-[0.2em] uppercase text-emerald-500">
              Uplink Nominal
            </span>
          </div>
        </div>

        {/* II. HEADER DE MANDO (Navegación e Identidad) */}
        <header className="flex-shrink-0 p-6 flex justify-between items-center z-50">
          <Link href="/dashboard" aria-label="Abortar forja y volver al centro de mando">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/40 hover:text-white hover:bg-primary/20 rounded-xl h-12 w-12 transition-all border border-white/5 hover:border-white/20 shadow-lg"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <Zap size={10} className="text-primary animate-pulse" />
              <div className="text-[10px] font-black tracking-[0.4em] uppercase text-primary/90 drop-shadow-md">
                Nicepod <span className="text-white ml-1">Spatial Hub</span>
              </div>
            </div>
            <div className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1">
              Admin Forging Terminal • {profile?.username || 'System'}
            </div>
          </div>
        </header>

        {/* III. EL CUERPO DEL STEPPER (Inyección de Pasos) */}
        <GeoForgeContent />

        {/* IV. ATMÓSFERA VISUAL (Glows Industriales) */}
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-primary/10 rounded-full blur-[140px] pointer-events-none opacity-40 z-0" />

      </div>
    </ForgeProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Arquitectura de Inyección: Al aislar 'GeoForgeContent' como un hijo del 
 *    'ForgeProvider', permitimos que el componente consuma el 'useForge' hook 
 *    sin violar las reglas de React Context (el consumidor debe estar anidado).
 * 2. Rendimiento Termodinámico: El fondo fijo '#020202' asegura que no haya 
 *    'Color Bleeding' desde capas inferiores, manteniendo la atención del 
 *    Admin 100% en la captura de evidencia.
 * 3. Escalabilidad Visual: Si en el futuro se añade una 'Fase 4: Resumen Final', 
 *    solo hay que añadir un nuevo case en la AnimatePresence.
 */