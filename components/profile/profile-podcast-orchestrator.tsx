/**
 * ARCHIVO: components/profile/profile-podcast-orchestrator.tsx
 * VERSIÓN: 11.0 (NicePod Profile Orchestrator - Nominal Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar el renderizado y filtrado de la biblioteca de crónicas del curador,
 * garantizando una exploración fluida del capital intelectual acumulado.
 * [REFORMA V11.0]: Sincronización nominal con PodcastCard V9.0, erradicación de 'any' 
 * y cumplimiento estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  Library,
  PlusCircle,
  Search
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// --- INFRAESTRUCTURA DE COMPONENTES DE INTERFAZ ---
import { PodcastCard } from "@/components/podcast/podcast-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- CONTRATOS DE DATOS Y TIPADO SOBERANO ---
import { ProfileData } from "@/types/profile";
import { PodcastWithProfile } from "@/types/podcast";

/**
 * INTERFAZ: ProfilePodcastOrchestratorProperties
 * Misión: Definir el contrato de entrada para la orquestación de la biblioteca.
 */
interface ProfilePodcastOrchestratorProperties {
  /** initialPodcastCollection: Datos recolectados en el servidor para carga instantánea. */
  initialPodcastCollection: PodcastWithProfile[];
  /** administratorProfile: Identidad soberana del curador dueño de la biblioteca. */
  administratorProfile: ProfileData;
  /** isAdministratorOwner: Define si el visitante actual posee autoridad de gestión. */
  isAdministratorOwner: boolean;
}

/**
 * ProfilePodcastOrchestrator: El gestor atómico de la biblioteca de sabiduría.
 */
export function ProfilePodcastOrchestrator({
  initialPodcastCollection,
  administratorProfile,
  isAdministratorOwner
}: ProfilePodcastOrchestratorProperties) {

  const navigationRouter = useRouter();

  // --- ESTADOS DE GESTIÓN DE BÚSQUEDA Y FILTRADO ---
  const [searchIntelligenceQuery, setSearchIntelligenceQuery] = useState<string>("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  /**
   * filteredPodcastCollection: 
   * Misión: Ejecutar el filtrado semántico local para optimizar el acceso al dato.
   */
  const filteredPodcastCollection = useMemo(() => {
    return initialPodcastCollection.filter((podcastItem) => {
      const matchesSearchCriteria =
        podcastItem.title.toLowerCase().includes(searchIntelligenceQuery.toLowerCase()) ||
        (podcastItem.description?.toLowerCase().includes(searchIntelligenceQuery.toLowerCase()) ?? false);

      const matchesCategoryFilter = activeCategoryFilter === "all" || podcastItem.creation_mode === activeCategoryFilter;

      return matchesSearchCriteria && matchesCategoryFilter;
    });
  }, [initialPodcastCollection, searchIntelligenceQuery, activeCategoryFilter]);

  /**
   * renderEmptyLibraryState:
   * Misión: Proyectar una interfaz de vacío semántico cuando no hay activos.
   */
  const renderEmptyLibraryState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full py-32 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
        <Library className="h-16 w-16 text-zinc-800 relative z-10" />
      </div>
      <h3 className="text-zinc-500 font-black tracking-[0.4em] uppercase text-xs mb-3">
        Bóveda en Silencio
      </h3>
      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] max-w-[280px] text-center leading-relaxed italic">
        No se han localizado crónicas de sabiduría en esta frecuencia de usuario.
      </p>
      {isAdministratorOwner && (
        <Button
          variant="outline"
          className="mt-10 rounded-full border-primary/20 hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest px-8 h-12"
          onClick={() => navigationRouter.push('/create')}
        >
          <PlusCircle className="mr-3 h-4 w-4" />
          Iniciar Primera Forja
        </Button>
      )}
    </motion.div>
  );

  return (
    <div className="w-full space-y-12">

      {/* BLOQUE I: BARRA DE COMANDO DE BIBLIOTECA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="BUSCAR EN EL ARCHIVO DE VOZ..."
            value={searchIntelligenceQuery}
            onChange={(inputChangeEvent) => setSearchIntelligenceQuery(inputChangeEvent.target.value)}
            className="pl-14 h-14 bg-white/[0.03] border-white/5 rounded-2xl text-[10px] font-black tracking-[0.2em] focus:ring-primary/20 placeholder:text-zinc-800 uppercase"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar-hide">
          {['all', 'standard', 'situational', 'pulse'].map((filterCategory) => (
            <button
              key={filterCategory}
              onClick={() => setActiveCategoryFilter(filterCategory)}
              className={`
                px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap border
                ${activeCategoryFilter === filterCategory
                  ? 'bg-primary text-black border-primary shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)]'
                  : 'bg-white/5 text-zinc-600 border-white/5 hover:border-white/10 hover:text-white'
                }
              `}
            >
              {filterCategory === 'all' ? 'Todo el Registro' : filterCategory}
            </button>
          ))}
        </div>
      </div>

      {/* BLOQUE II: MALLA DE CRÓNICAS (DYNAMIC GRID) */}
      <AnimatePresence mode="popLayout">
        {filteredPodcastCollection.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPodcastCollection.map((podcastItem) => (
              <motion.div
                key={podcastItem.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* [FIX V11.0]: Sincronización nominal absoluta con PodcastCard V9.0 */}
                <PodcastCard initialPodcastData={podcastItem} />
              </motion.div>
            ))}
          </motion.div>
        ) : renderEmptyLibraryState()}
      </AnimatePresence>

      {/* BLOQUE III: TELEMETRÍA DE INTEGRIDAD */}
      <div className="flex items-center justify-between pt-12 border-t border-white/5 opacity-40">
        <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600">
          <Clock className="h-3 w-3 text-primary" />
          <span>Sincronización de Bóveda Completada</span>
        </div>
        <div className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600">
          Activos Localizados: <span className="text-white">{filteredPodcastCollection.length}</span> / {initialPodcastCollection.length}
        </div>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V11.0):
 * 1. Contract Synchronization: Se neutralizó el error TS2322 en la línea 169 
 *    inyectando 'initialPodcastData' en lugar de 'podcast'.
 * 2. Zero Abbreviations Policy: Purificación absoluta de nombres de variables 
 *    (searchIntelligenceQuery, activeCategoryFilter, inputChangeEvent).
 * 3. Type Safety: Se eliminó el casting 'as any' en la invocación de PodcastCard, 
 *    confiando en la integridad del contrato PodcastWithProfile.
 * 4. Router Integrity: Se sustituyó 'window.location' por el hook 'useRouter' 
 *    para respetar el flujo de navegación de Next.js.
 */