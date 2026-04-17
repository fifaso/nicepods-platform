/**
 * ARCHIVO: components/profile/profile-podcast-orchestrator.tsx
 * VERSIÓN: 12.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 * 
 * Misión: Gestionar el renderizado y filtrado de la biblioteca de crónicas.
 * [REFORMA V12.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
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
 */
interface ProfilePodcastOrchestratorProperties {
  initialPodcastCollection: PodcastWithProfile[];
  administratorProfile: ProfileData;
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
   */
  const filteredPodcastCollection = useMemo(() => {
    return initialPodcastCollection.filter((podcastItem) => {
      const matchesSearchCriteria =
        podcastItem.titleTextContent.toLowerCase().includes(searchIntelligenceQuery.toLowerCase()) ||
        (podcastItem.descriptionTextContent?.toLowerCase().includes(searchIntelligenceQuery.toLowerCase()) ?? false);

      const matchesCategoryFilter = activeCategoryFilter === "all" || podcastItem.creationMetadataDossier?.creationMode === activeCategoryFilter;

      return matchesSearchCriteria && matchesCategoryFilter;
    });
  }, [initialPodcastCollection, searchIntelligenceQuery, activeCategoryFilter]);

  /**
   * renderEmptyLibraryState:
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
          <input
            placeholder="BUSCAR EN EL ARCHIVO DE VOZ..."
            value={searchIntelligenceQuery}
            onChange={(inputChangeEvent) => setSearchIntelligenceQuery(inputChangeEvent.target.value)}
            className="flex h-14 w-full border-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-14 bg-white/[0.03] rounded-2xl text-[10px] font-black tracking-[0.2em] focus:ring-primary/20 placeholder:text-zinc-800 uppercase"
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

      <AnimatePresence mode="popLayout">
        {filteredPodcastCollection.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPodcastCollection.map((podcastItem) => (
              <motion.div
                key={podcastItem.identification}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <PodcastCard initialPodcastData={podcastItem} />
              </motion.div>
            ))}
          </motion.div>
        ) : renderEmptyLibraryState()}
      </AnimatePresence>

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
