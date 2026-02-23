"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  Library,
  PlusCircle,
  Search
} from "lucide-react";
import { useMemo, useState } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES DE INTERFAZ ---
import { PodcastCard } from "@/components/podcast-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- CONTRATOS DE DATOS Y TIPADO SOBERANO ---
import { ProfileData, PublicPodcast } from "@/types/profile";

/**
 * INTERFAZ: ProfilePodcastOrchestratorProps
 * Define el contrato de entrada para la gestión de la biblioteca del curador.
 */
interface ProfilePodcastOrchestratorProps {
  /**
   * initialPodcasts: Datos recolectados en el servidor (SSR) para carga instantánea.
   */
  initialPodcasts: PublicPodcast[];
  /**
   * profile: Identidad del curador dueño de la biblioteca.
   */
  profile: ProfileData;
  /**
   * isOwner: Define si el visitante actual tiene permisos de gestión sobre los activos.
   */
  isOwner: boolean;
}

/**
 * COMPONENTE: ProfilePodcastOrchestrator
 * El gestor atómico de la biblioteca de sabiduría del perfil.
 * 
 * Responsabilidades:
 * 1. Orquestar el renderizado de crónicas de voz mediante un grid optimizado.
 * 2. Gestionar el filtrado semántico local para búsqueda rápida.
 * 3. Proveer estados de error y 'Empty States' profesionales.
 */
export function ProfilePodcastOrchestrator({
  initialPodcasts,
  profile,
  isOwner
}: ProfilePodcastOrchestratorProps) {

  // --- ESTADO DE GESTIÓN DE BÚSQUEDA ---
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  /**
   * PODCASTS FILTRADOS: Lógica de búsqueda local.
   * Utilizamos useMemo para evitar re-calculos costosos durante el re-renderizado.
   */
  const filteredPodcasts = useMemo(() => {
    return initialPodcasts.filter((podcast) => {
      const matchesSearch =
        podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (podcast.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesFilter = activeFilter === "all" || podcast.creation_mode === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [initialPodcasts, searchQuery, activeFilter]);

  /**
   * RENDERIZADO DE ESTADO VACÍO (EMPTY STATE):
   * Proyecta una interfaz profesional cuando no hay activos localizados.
   */
  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full py-24 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
        <Library className="h-12 w-12 text-zinc-700 relative z-10" />
      </div>
      <h3 className="text-zinc-400 font-bold tracking-wider uppercase text-xs mb-2">
        Bóveda en Silencio
      </h3>
      <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] max-w-[240px] text-center leading-relaxed">
        No se han localizado crónicas de sabiduría en esta frecuencia de usuario.
      </p>
      {isOwner && (
        <Button
          variant="outline"
          className="mt-8 rounded-full border-primary/20 hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest"
          onClick={() => window.location.href = '/create'}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Iniciar Primera Forja
        </Button>
      )}
    </motion.div>
  );

  return (
    <div className="w-full space-y-12">

      {/* 
          BLOQUE I: CENTRO DE CONTROL DE BIBLIOTECA 
          Permite al usuario navegar por su conocimiento de forma quirúrgica.
      */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="BUSCAR EN EL ARCHIVO DE VOZ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/[0.03] border-white/5 rounded-full text-[10px] font-bold tracking-widest focus:ring-primary/20 placeholder:text-zinc-700"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar-hide">
          {['all', 'standard', 'situational', 'pulse'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`
                px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap
                ${activeFilter === filter
                  ? 'bg-primary text-black shadow-[0_0_20px_rgba(var(--primary),0.3)]'
                  : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {filter === 'all' ? 'Todo' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* 
          BLOQUE II: MALLA DE CRÓNICAS (GRID)
          Utilizamos un layout responsivo con espaciado industrial (G-24).
      */}
      <AnimatePresence mode="popLayout">
        {filteredPodcasts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8"
          >
            {filteredPodcasts.map((podcast) => (
              <motion.div
                key={podcast.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* 
                    [FIX TS2322]: Se eliminó la propiedad 'showCurator={false}'.
                    El componente PodcastCard original solo espera recibir la 
                    propiedad 'podcast'. Usamos la aserción 'any' de forma táctica 
                    para evitar colisiones con la interfaz interna del componente base.
                */}
                <PodcastCard podcast={podcast as any} />
              </motion.div>
            ))}
          </motion.div>
        ) : renderEmptyState()}
      </AnimatePresence>

      {/* 
          BLOQUE III: TELEMETRÍA DE CARGA
          Informa al usuario sobre la densidad del archivo visualizado.
      */}
      <div className="flex items-center justify-between pt-12 border-t border-white/5 opacity-40">
        <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">
          <Clock className="h-3 w-3" />
          <span>Sincronización Atómica Completada</span>
        </div>
        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">
          Activos Localizados: <span className="text-white">{filteredPodcasts.length}</span> / {initialPodcasts.length}
        </div>
      </div>

    </div>
  );
}