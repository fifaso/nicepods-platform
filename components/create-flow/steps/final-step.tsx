// components/create-flow/steps/final-step.tsx
// VERSIÓN: 8.1 (Master Manifest - Professional Aesthetics & Humanized Data)

"use client";

import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Clock, 
    BrainCircuit, 
    Sparkles, 
    Mic2, 
    FileText, 
    Globe, 
    ShieldCheck, 
    CheckCircle2, 
    Activity, 
    ExternalLink, 
    Zap,
    Quote
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function FinalStep() {
    const { watch, setValue } = useFormContext<PodcastCreationData>();
    const formData = watch();

    // Sincronización final de metadatos de producción
    useEffect(() => {
        if (formData.purpose === 'local_soul') {
            setValue("agentName", "local-concierge-v1", { shouldValidate: true });
            setValue("creation_mode", "situational", { shouldValidate: true });
        }
        if (formData.purpose === 'explore') {
            setValue("agentName", "connection-architect-v1", { shouldValidate: true });
        }
        setValue("generateAudioDirectly", true);
    }, [formData.purpose, setValue]);

    // Mapeo de nombres técnicos a nombres artísticos para el usuario
    const friendlyAgentName = useMemo(() => {
        const names: Record<string, string> = {
            'narrador': 'El Narrador',
            'esceptico': 'El Escéptico',
            'mentor': 'El Mentor',
            'amigo': 'Tu Amigo',
            'rebelde': 'El Rebelde',
            'minimalista': 'El Minimalista',
            'local-concierge-v1': 'Guía Local',
            'connection-architect-v1': 'Arquitecto de Ideas'
        };
        return names[formData.agentName] || formData.agentName;
    }, [formData.agentName]);

    const sources = formData.sources || [];
    
    const coreTopic = useMemo(() => {
        switch (formData.purpose) {
            case 'explore': return `${formData.link_topicA} & ${formData.link_topicB}`;
            case 'local_soul': return formData.location?.placeName || "Ubicación Georeferenciada";
            default: return formData.solo_topic;
        }
    }, [formData.purpose, formData.link_topicA, formData.link_topicB, formData.location, formData.solo_topic]);

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-700 relative overflow-hidden bg-transparent">

            {/* 1. HEADER: Identidad de Producción */}
            <header className="flex-shrink-0 text-center lg:text-left p-5 lg:p-10 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-zinc-900/60 backdrop-blur-2xl z-20">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 max-w-7xl mx-auto w-full">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center lg:justify-start gap-2 text-primary font-black uppercase tracking-[0.3em] text-[9px]">
                            <Zap size={12} className="animate-pulse" /> Confirmación de Producción
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
                            Manifiesto <span className="text-primary italic">Final</span>
                        </h1>
                    </div>

                    <div className="hidden lg:flex items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/20">
                        <ShieldCheck className="text-primary" size={24} />
                        <div className="text-left">
                            <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest leading-none mb-1">Estatus</p>
                            <p className="text-xs font-bold text-zinc-800 dark:text-white uppercase">Integridad Verificada</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. ÁREA DE AUDITORÍA */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">

                {/* LADO IZQUIERDO: RESUMEN DE CREACIÓN */}
                <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-10 space-y-6">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* CARD HERO: TÍTULO Y TEMA */}
                        <div className="p-6 lg:p-10 rounded-[2.5rem] bg-white/60 dark:bg-zinc-900/40 border border-white/20 dark:border-white/10 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                                <FileText size={100} />
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <Badge className="bg-primary text-white border-none font-black text-[9px] tracking-widest px-2.5 py-0.5">
                                    {formData.purpose?.toUpperCase()}
                                </Badge>
                                <div className="h-[1px] w-8 bg-primary/20" />
                            </div>

                            <h3 className="text-2xl lg:text-4xl font-black text-zinc-900 dark:text-white leading-tight tracking-tight uppercase mb-6">
                                {formData.final_title || "Borrador de Conocimiento"}
                            </h3>

                            <div className="relative p-5 rounded-2xl bg-primary/5 dark:bg-black/40 border border-primary/10 dark:border-white/5">
                                <Quote className="absolute -top-2 -left-2 h-6 w-6 text-primary/20" />
                                <p className="text-sm lg:text-base font-medium text-zinc-600 dark:text-zinc-400 italic leading-relaxed">
                                    {coreTopic || "Definiendo el núcleo de la idea..."}
                                </p>
                            </div>
                        </div>

                        {/* GRID DE CALIBRACIÓN: Formato 2x2 en Móvil */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                            {[
                                { label: 'Duración', val: formData.duration, icon: Clock },
                                { label: 'Análisis', val: formData.narrativeDepth, icon: BrainCircuit },
                                { label: 'Intérprete', val: friendlyAgentName, icon: Mic2 },
                                { label: 'Tono', val: formData.voiceStyle, icon: Activity }
                            ].map((item, i) => (
                                <div key={i} className="p-4 md:p-6 rounded-[1.8rem] bg-white/40 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex flex-col items-center text-center gap-1.5 shadow-sm">
                                    <item.icon className="text-primary opacity-60 mb-1" size={18} />
                                    <p className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-[11px] md:text-xs font-bold text-zinc-800 dark:text-white uppercase truncate w-full">{item.val}</p>
                                </div>
                            ))}
                        </div>

                        {/* ANCLAJE SITUACIONAL (Si aplica) */}
                        {formData.location && (
                            <div className="p-5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4 animate-in slide-in-from-bottom-2">
                                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <MapPin size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-widest mb-0.5">Dato Situacional</p>
                                    <h4 className="text-sm font-bold text-zinc-800 dark:text-white truncate uppercase">
                                        {formData.location.placeName || "Ubicación Activa"}
                                    </h4>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* LADO DERECHO: INVESTIGACIÓN (Solo Desktop) */}
                <aside className="hidden lg:flex lg:w-80 border-l border-black/5 dark:border-white/5 bg-white/20 dark:bg-zinc-900/60 backdrop-blur-3xl flex-col shadow-2xl">
                    <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/[0.02]">
                        <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                            <Globe size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Fuentes de Verdad</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-black/10 dark:border-white/10 font-mono px-2 bg-black/5 dark:bg-black/20 text-zinc-500 dark:text-zinc-400">
                            {sources.length}
                        </Badge>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-5 space-y-3">
                            {sources.length > 0 ? (
                                sources.map((s: any, i: number) => (
                                    <div key={i} className="p-3 rounded-xl bg-white/40 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-primary/30 transition-all group">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {s.origin === 'vault' ?
                                                <ShieldCheck size={10} className="text-primary" /> :
                                                <Globe size={10} className="text-blue-500" />
                                            }
                                            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-tighter">
                                                {s.origin === 'vault' ? 'NKV Bóveda' : 'Investigación Web'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-tight uppercase mb-1.5">
                                            {s.title}
                                        </p>
                                        <a href={s.url} target="_blank" className="text-[8px] text-zinc-400 hover:text-primary transition-colors flex items-center gap-1 font-mono truncate">
                                            <ExternalLink size={8} /> {s.url}
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-20">
                                    <Sparkles size={32} className="mx-auto mb-3" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Síntesis generativa<br />sin fuentes externas</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <footer className="p-6 bg-primary/5 border-t border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-2.5 text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                            <CheckCircle2 size={14} />
                            <span>NicePod Guard v5.2</span>
                        </div>
                    </footer>
                </aside>

                {/* MÓVIL: ACCESO A INVESTIGACIÓN */}
                <div className="lg:hidden p-4 bg-white/20 dark:bg-black/20 border-t border-black/5 dark:border-white/5">
                    <button className="w-full h-12 bg-white/60 dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-xl flex items-center justify-between px-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Globe size={14} className="text-blue-500 dark:text-blue-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700 dark:text-white">Dossier de Investigación</span>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-none text-[10px]">{sources.length}</Badge>
                    </button>
                </div>
            </div>
        </div>
    );
}