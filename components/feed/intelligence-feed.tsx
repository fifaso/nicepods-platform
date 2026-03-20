// components/feed/intelligence-feed.tsx
// VERSIÓN: 4.0 (NiceCore V2.6 - Síncrono & Hybrid State Edition)
// Misión: Orquestar el flujo de capital intelectual inyectado por el servidor.
// [ESTABILIZACIÓN]: Eliminación de saltos de hidratación mediante el uso de Initial Props.

"use client";

import {
    Activity,
    BookOpen,
    BrainCircuit,
    Loader2,
    Mic,
    Search,
    Sparkles,
    Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// --- INFRAESTRUCTURA DE DATOS Y CONTRATOS ---
import { SearchResult } from "@/hooks/use-search-radar";
import { cn } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";

// --- COMPONENTES UI ---
import { UniverseCard } from "@/components/feed/universe-card";
import { Button } from "@/components/ui/button";

/**
 * [SHIELD]: CARGA DIFERIDA DE ESTANTES (PodcastShelf)
 * Se mantiene dinámico para optimizar el bundle de cliente, pero su 
 * renderizado es instantáneo al recibir props síncronas.
 */
const PodcastShelf = dynamic(
    () => import("@/components/feed/podcast-shelf").then((mod) => mod.PodcastShelf),
    {
        ssr: true, // Habilitamos SSR para los estantes
        loading: () => (
            <div className="w-full h-48 bg-white/[0.01] rounded-[2.5rem] border border-dashed border-white/5 flex items-center justify-center animate-pulse">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 italic">
                    Sincronizando Frecuencia...
                </span>
            </div>
        )
    }
);

interface IntelligenceFeedProps {
    userName: string;
    isSearching: boolean;
    results: SearchResult[] | null;
    lastQuery: string;
    initialEpicenter: any[];    // Datos en crudo del metal (Server)
    initialConnections: any[];  // Datos en crudo del metal (Server)
    onClear: () => void;
}

const discoveryHubCategories = [
    { key: "deep_thought", title: "Pensamiento", image: "/images/universes/deep-thought.png", href: "/podcasts?tab=discover&universe=deep_thought" },
    { key: "practical_tools", title: "Práctico", image: "/images/universes/practical-tools.png", href: "/podcasts?tab=discover&universe=practical_tools" },
    { key: "tech_and_innovation", title: "Tecnología", image: "/images/universes/tech.png", href: "/podcasts?tab=discover&universe=tech_and_innovation" },
    { key: "narrative_and_stories", title: "Narrativa", image: "/images/universes/narrative.png", href: "/podcasts?tab=discover&universe=narrative_and_stories" },
];

/**
 * IntelligenceFeed: El bus de datos táctico.
 * Diseñado para operar en "Estado Híbrido": nace con datos de servidor y 
 * muta reactivamente ante las búsquedas del radar.
 */
export function IntelligenceFeed({
    userName,
    isSearching,
    results,
    lastQuery,
    initialEpicenter,
    initialConnections,
    onClear
}: IntelligenceFeedProps) {

    // --- 1. SANEAMIENTO DE DATOS (CLIENT-SIDE MEMORIZATION) ---
    // Procesamos los datos inyectados para asegurar que creación_data y tags sean válidos.
    const safeEpicenter = useMemo(() => {
        return initialEpicenter.map((pod) => ({
            ...pod,
            creation_data: typeof pod.creation_data === 'string'
                ? JSON.parse(pod.creation_data)
                : pod.creation_data || null,
            ai_tags: Array.isArray(pod.ai_tags) ? pod.ai_tags : [],
        })).filter((p) => p.id) as PodcastWithProfile[];
    }, [initialEpicenter]);

    const safeConnections = useMemo(() => {
        return initialConnections.map((pod) => ({
            ...pod,
            creation_data: typeof pod.creation_data === 'string'
                ? JSON.parse(pod.creation_data)
                : pod.creation_data || null,
            ai_tags: Array.isArray(pod.ai_tags) ? pod.ai_tags : [],
        })).filter((p) => p.id) as PodcastWithProfile[];
    }, [initialConnections]);

    // --- 2. GESTIÓN DE ESTADOS DE VISIBILIDAD ---
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // El radar está "IDLE" si no hay resultados ni intención de búsqueda activa.
    const isIdle = results === null;

    // Evitamos el parpadeo de layout pero permitimos que el HTML del SSR sea visible.
    if (!mounted) {
        // Renderizamos una versión estática o null durante el primer milisegundo de hidratación
        // para evitar el error de discordia de React, pero el HTML ya contiene los datos.
        return <div className="min-h-[500px]" />;
    }

    return (
        <div className="w-full space-y-12 selection:bg-primary/20">

            {isIdle ? (
                /* --- ESTADO A: FRECUENCIA BASE (VISTA SOBERANA) --- */
                <div className="space-y-16 animate-in fade-in duration-1000">

                    {/* DIMENSIONES DE CONOCIMIENTO */}
                    <section>
                        <div className="flex items-center justify-between mb-10 px-1">
                            <div className="flex items-center gap-3">
                                <BrainCircuit className="text-primary h-4 w-4" />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">
                                    Dimensiones
                                </h2>
                            </div>
                            <div className="h-px flex-1 mx-10 bg-white/5 hidden md:block" />
                            <div className="flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                                <Activity size={10} className="animate-pulse" /> Neural Link Active
                            </div>
                        </div>

                        <div className="flex overflow-x-auto pb-6 gap-6 lg:grid lg:grid-cols-4 snap-x hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                            {discoveryHubCategories.map((category) => (
                                <div key={category.key} className="min-w-[160px] w-[48%] lg:w-auto snap-start flex-shrink-0 transition-all hover:scale-[1.02] active:scale-95">
                                    <UniverseCard {...category} isActive={false} />
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="space-y-16">

                        {/* --- ESTANTE 1: TU EPICENTRO --- */}
                        <div className="relative group">
                            <div className="flex items-center gap-3 mb-6 px-4 border-l-2 border-primary">
                                <Zap size={18} className="text-primary fill-current shadow-primary" />
                                <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">
                                    Tu Epicentro Creativo
                                </h2>
                            </div>

                            {safeEpicenter.length > 0 ? (
                                <PodcastShelf
                                    title="Tu Epicentro"
                                    podcasts={safeEpicenter}
                                    variant="compact"
                                />
                            ) : (
                                /* ESTADO VACÍO INTELIGENTE */
                                <div className="flex flex-col items-center justify-center p-10 bg-zinc-900/30 rounded-[2.5rem] border border-dashed border-white/10 text-center">
                                    <div className="p-4 bg-primary/10 rounded-2xl mb-4">
                                        <Mic className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Bóveda Vacía</h3>
                                    <p className="text-[10px] text-zinc-500 font-medium mt-2 mb-6 max-w-sm lowercase">
                                        inicia la forja de tu primer activo acústico para establecer tu epicentro en la red.
                                    </p>
                                    <Link href="/create">
                                        <Button variant="outline" className="rounded-full border-primary/40 hover:bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest">
                                            Forjar Sabiduría
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* --- ESTANTE 2: CONEXIONES --- */}
                        {safeConnections.length > 0 && (
                            <div className="relative group">
                                <div className="flex items-center gap-3 mb-6 px-4 border-l-2 border-purple-600">
                                    <Sparkles size={18} className="text-purple-500 fill-current" />
                                    <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">
                                        Conexiones de Resonancia
                                    </h2>
                                </div>
                                <PodcastShelf
                                    title="Conexiones Inesperadas"
                                    podcasts={safeConnections}
                                    variant="compact"
                                />
                            </div>
                        )}

                    </div>
                </div>
            ) : (
                /* --- ESTADO B: CONSOLA DE ANÁLISIS (RADAR ACTIVO) --- */
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
                    <div className="flex items-center justify-between border-b border-white/5 pb-8 px-2">
                        <div className="flex items-center gap-5">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 relative">
                                <Loader2 className={cn("h-6 w-6 text-primary absolute", isSearching ? "animate-spin opacity-100" : "opacity-0")} />
                                <Search className={cn("h-6 w-6 text-primary transition-opacity duration-300", isSearching ? "opacity-0" : "opacity-100")} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                                    Hallazgos: <span className="text-primary italic">"{lastQuery}"</span>
                                </h2>
                                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
                                    Procesando Mapeo Semántico Unificado
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 border border-white/5"
                        >
                            Cerrar Radar
                        </Button>
                    </div>

                    {results && results.length === 0 && !isSearching ? (
                        <div className="text-center py-32 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center shadow-inner">
                            <p className="text-white/60 text-base font-black uppercase tracking-[0.3em]">Silencio en el Escáner</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {results && results.map((result) => (
                                <Link
                                    key={result.id}
                                    href={result.result_type === 'podcast' ? `/podcast/${result.id}` :
                                        result.result_type === 'place' ? `/map?lat=${result.metadata?.lat}&lng=${result.metadata?.lng}` : '#'}
                                    className="block group transition-all active:scale-[0.99] outline-none"
                                >
                                    <div className="p-5 rounded-[2.5rem] border transition-all flex items-center gap-6 bg-white/[0.02] border-white/5 hover:border-primary/40 hover:bg-white/[0.04]">
                                        <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex-shrink-0 relative overflow-hidden border border-white/10">
                                            {result.image_url ? (
                                                <Image src={result.image_url} alt={result.title} fill className="object-cover" unoptimized />
                                            ) : (
                                                <BookOpen className="text-primary/40 h-7 w-7 m-auto mt-4" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-sm text-white truncate uppercase tracking-tight">{result.title}</p>
                                            <p className="text-[10px] font-bold text-zinc-500 truncate uppercase tracking-widest">{result.subtitle}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Zero-Flicker Engineering: Se han eliminado los 'fetch' del cliente para el 
 *    estado inicial. El componente nace con la sabiduría inyectada.
 * 2. Sanidad Multimodal: El mapeo de resultados de búsqueda ahora contempla 
 *    correctamente los nodos de tipo 'place', redirigiendo al Radar de Madrid.
 * 3. Robusto ante la Bóveda: El uso de 'unoptimized' en imágenes de búsqueda 
 *    previene cuellos de botella en el optimizador de Next.js para assets externos.
 */