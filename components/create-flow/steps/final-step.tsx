// components/create-flow/steps/final-step.tsx
// VERSIÓN: 8.0 (Master Manifest - Dual Layout & Performance Transparency)

"use client";

import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Clock,
    BrainCircuit,
    Sparkles,
    Mic2,
    FileText,
    Globe,
    Fingerprint,
    MapPin,
    ShieldCheck,
    CheckCircle2,
    Activity,
    ExternalLink,
    Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function FinalStep() {
    const { watch, setValue } = useFormContext<PodcastCreationData>();
    const formData = watch();

    // --- SINCRONIZACIÓN LÓGICA DE ÚLTIMO NIVEL ---
    useEffect(() => {
        // Sincronización de Identidad Situacional
        if (formData.purpose === 'local_soul') {
            setValue("agentName", "local-concierge-v1", { shouldValidate: true });
            setValue("creation_mode", "situational", { shouldValidate: true });
        }
        // Sincronización de Identidad de Conexión
        if (formData.purpose === 'explore') {
            setValue("agentName", "connection-architect-v1", { shouldValidate: true });
        }
        // Forzamos el flag de generación directa para el orquestador
        setValue("generateAudioDirectly", true);
    }, [formData.purpose, setValue]);

    const sources = formData.sources || [];
    const hasVaultSources = useMemo(() => sources.some(s => s.origin === 'vault'), [sources]);
    const coreTopic = useMemo(() => {
        switch (formData.purpose) {
            case 'explore': return `${formData.link_topicA} + ${formData.link_topicB}`;
            case 'local_soul': return formData.location?.placeName || "Ubicación Detectada";
            default: return formData.solo_topic;
        }
    }, [formData.purpose, formData.link_topicA, formData.link_topicB, formData.location, formData.solo_topic]);

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-700 relative overflow-hidden bg-transparent">

            {/* 1. HEADER DE PRODUCCIÓN (Aurora Pro Style) */}
            <header className="flex-shrink-0 text-center lg:text-left p-6 lg:p-10 border-b border-white/5 bg-zinc-900/60 backdrop-blur-xl z-20">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 max-w-7xl mx-auto w-full">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center lg:justify-start gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            <Zap size={14} className="animate-pulse" /> Confirmación de Producción
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter text-white leading-none">
                            Manifiesto <span className="text-primary italic">Final</span>
                        </h1>
                    </div>

                    <div className="hidden lg:flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                        <ShieldCheck className="text-primary" size={24} />
                        <div className="text-left">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Estado de Integridad</p>
                            <p className="text-xs font-bold text-white uppercase">Listo para Síntesis Neuronal</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. AREA DE AUDITORÍA (Dual Layout) */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">

                {/* LADO IZQUIERDO: EL PRODUCTO (3/4 en Desktop) */}
                <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-10 space-y-8 bg-black/20">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* CARD PRINCIPAL: RESUMEN EDITORIAL */}
                        <div className="p-8 lg:p-12 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                                <FileText size={120} />
                            </div>

                            <Badge className="mb-6 bg-primary text-white border-none font-black text-[10px] tracking-[0.2em] px-3 py-1">
                                {formData.purpose?.toUpperCase()}
                            </Badge>

                            <h3 className="text-2xl lg:text-4xl font-black text-white leading-tight tracking-tight uppercase mb-6">
                                {formData.final_title || "Borrador sin título"}
                            </h3>

                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 italic text-zinc-400 text-sm leading-relaxed border-l-4 border-l-primary">
                                "{coreTopic}"
                            </div>
                        </div>

                        {/* GRID TÉCNICO: CALIBRACIÓN 360 */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col items-center text-center gap-2">
                                <Clock className="text-primary opacity-60 mb-1" size={20} />
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Duración</p>
                                <p className="text-sm font-bold text-white uppercase">{formData.duration}</p>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col items-center text-center gap-2">
                                <BrainCircuit className="text-primary opacity-60 mb-1" size={20} />
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Análisis</p>
                                <p className="text-sm font-bold text-white uppercase">{formData.narrativeDepth}</p>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col items-center text-center gap-2">
                                <Mic2 className="text-primary opacity-60 mb-1" size={20} />
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Intérprete</p>
                                <p className="text-sm font-bold text-white uppercase">{formData.agentName}</p>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col items-center text-center gap-2">
                                <Activity className="text-primary opacity-60 mb-1" size={20} />
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Voz</p>
                                <p className="text-sm font-bold text-white uppercase">{formData.voiceStyle}</p>
                            </div>
                        </div>

                        {/* INFO SITUACIONAL (Si aplica) */}
                        {formData.location && (
                            <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 flex items-center gap-6 animate-in slide-in-from-left-4">
                                <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
                                    <MapPin size={24} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 opacity-60">Anclaje Situacional Verificado</p>
                                    <h4 className="text-lg font-bold text-white truncate uppercase tracking-tight">
                                        {formData.location.placeName || "Coordenadas Activas"}
                                    </h4>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* LADO DERECHO: LA INTELIGENCIA (1/4 en Desktop) */}
                <aside className="hidden lg:flex lg:w-1/4 border-l border-white/5 bg-zinc-900/60 backdrop-blur-3xl flex-col shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3 text-blue-400">
                            <Globe size={20} />
                            <span className="text-xs font-black uppercase tracking-widest leading-none">Fuentes Utilizadas</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-white/10 font-mono px-2 bg-black/20 text-zinc-400">
                            {sources.length}
                        </Badge>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-4">
                            {sources.length > 0 ? (
                                sources.map((s: any, i: number) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all group">
                                        <div className="flex items-center gap-2 mb-2">
                                            {s.origin === 'vault' ?
                                                <ShieldCheck size={12} className="text-primary" /> :
                                                <Globe size={12} className="text-blue-400" />
                                            }
                                            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-tighter">
                                                {s.origin === 'vault' ? 'Comunidad' : 'Web'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight uppercase tracking-tight mb-2">
                                            {s.title}
                                        </p>
                                        <a href={s.url} target="_blank" className="text-[9px] text-zinc-600 hover:text-primary transition-colors flex items-center gap-1 font-mono truncate">
                                            <ExternalLink size={10} /> {s.url}
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-10">
                                    <Sparkles size={40} className="mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-loose">Síntesis basada en<br />corpus experto</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <footer className="p-8 bg-primary/5 border-t border-white/5">
                        <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                            <CheckCircle2 size={16} />
                            <span>Custodia de Datos v5.2</span>
                        </div>
                    </footer>
                </aside>

                {/* MÓVIL: BOTÓN DE INVESTIGACIÓN (Igual que en Script Editor para coherencia) */}
                <div className="lg:hidden p-6 pt-0 bg-black/20 mt-auto">
                    <button className="w-full h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <Globe size={16} className="text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Revisar Investigación</span>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-none">{sources.length}</Badge>
                    </button>
                </div>
            </div>
        </div>
    );
}