// components/create-flow/steps/script-editor-step.tsx
// VERSIÓN: 7.1 (Aurora Master - Ultra-Wide Desktop Workstation & Mobile Tray)

"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Globe,
    Pencil as PencilIcon,
    ExternalLink,
    BookOpen,
    FileText,
    X,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

/**
 * COMPONENTE: SourceItem
 * Renderiza cada fuente bibliográfica con diseño de alta densidad.
 */
const SourceItem = ({ source }: { source: any }) => (
    <li className="text-[11px] text-muted-foreground flex flex-col gap-1.5 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all duration-300 group">
        <div className="flex items-start justify-between gap-3">
            <span className="font-black text-white line-clamp-2 uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">
                {source.title || "Fuente Verificada"}
            </span>
            {source.url && (
                <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-primary/10 rounded-lg text-primary hover:bg-primary hover:text-white transition-colors flex-shrink-0"
                >
                    <ExternalLink size={12} />
                </a>
            )}
        </div>
        {source.snippet && (
            <p className="text-[10px] italic text-zinc-500 leading-relaxed line-clamp-4">
                "{source.snippet}"
            </p>
        )}
    </li>
);

export function ScriptEditorStep() {
    const { control, setValue, getValues, watch } = useFormContext<PodcastCreationData>();

    const finalScriptFromForm = watch('final_script');
    const sources = watch('sources') || [];
    const [isMobileSourcesOpen, setIsMobileSourcesOpen] = useState(false);
    const lastContentRef = useRef("");

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'La IA está sintetizando el conocimiento en este lienzo...',
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-zinc-700 before:float-left before:pointer-events-none'
            }),
        ],
        content: getValues('final_script') || "",
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none h-full text-foreground leading-relaxed p-6 md:p-16 text-base md:text-lg',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            lastContentRef.current = html;
            setValue('final_script', DOMPurify.sanitize(html), { shouldValidate: true, shouldDirty: true });
        },
    });

    useEffect(() => {
        if (editor && finalScriptFromForm && finalScriptFromForm !== lastContentRef.current) {
            lastContentRef.current = finalScriptFromForm;
            editor.commands.setContent(finalScriptFromForm);
        }
    }, [finalScriptFromForm, editor]);

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-700 relative overflow-hidden bg-transparent">

            {/* 1. HEADER: WORKSTATION FEEL (Ancho Completo) */}
            <header className="flex-shrink-0 flex flex-col lg:flex-row items-center justify-between gap-6 p-6 lg:p-10 border-b border-white/5 bg-zinc-900/60 backdrop-blur-xl z-20">
                <div className="flex items-center gap-5 w-full lg:w-auto">
                    <div className="p-3.5 bg-primary/10 rounded-[1.25rem] border border-primary/20 shadow-inner">
                        <PencilIcon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter text-white leading-none">Estación de Guion</h2>
                        <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="text-[9px] font-black tracking-[0.2em] border-primary/30 text-primary bg-primary/5">MODO EDICIÓN</Badge>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Refinación de Inteligencia</span>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:flex-1 lg:max-w-2xl">
                    <FormField control={control} name="final_title" render={({ field }) => (
                        <FormItem className="space-y-0">
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Título definitivo del podcast..."
                                    className="h-14 lg:h-16 bg-black/40 border-white/10 font-black text-lg lg:text-xl text-white rounded-2xl focus:border-primary shadow-2xl transition-all placeholder:text-zinc-700"
                                />
                            </FormControl>
                        </FormItem>
                    )} />
                </div>
            </header>

            {/* 2. ESPACIO DE TRABAJO DUAL */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">

                {/* ÁREA DEL EDITOR (Prioridad de lectura: 3/4) */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 lg:bg-transparent">
                    <div className="max-w-5xl mx-auto h-full">
                        <EditorContent editor={editor} />
                    </div>
                </main>

                {/* SIDEBAR DE FUENTES (Solo Desktop: 1/4 - Proporción Profesional) */}
                <aside className="hidden lg:flex lg:w-1/4 border-l border-white/5 bg-zinc-900/40 backdrop-blur-3xl flex-col shadow-[ -20px_0_50px_rgba(0,0,0,0.2)]">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3 text-blue-400">
                            <Globe size={20} className="animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest">Grounding de Datos</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-white/10 font-mono px-2 bg-black/20">
                            {sources.length}
                        </Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <ul className="space-y-4">
                            {sources.map((s: any, i: number) => <SourceItem key={i} source={s} />)}
                            {sources.length === 0 && (
                                <div className="py-32 text-center opacity-10">
                                    <BookOpen className="h-16 w-16 mx-auto mb-6" />
                                    <p className="text-xs font-black uppercase tracking-[0.3em]">Sincronizando fuentes...</p>
                                </div>
                            )}
                        </ul>
                    </div>

                    <footer className="p-8 bg-primary/5 border-t border-white/5">
                        <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                            <CheckCircle2 size={14} />
                            <span>Custodia de Proveniencia v5.0</span>
                        </div>
                    </footer>
                </aside>

                {/* TRIGGER DE FUENTES (Móvil) */}
                <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                    <button
                        onClick={() => setIsMobileSourcesOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-primary text-white border border-primary/50 rounded-full shadow-[0_0_30px_rgba(var(--primary),0.4)] backdrop-blur-md active:scale-95 transition-all"
                    >
                        <Globe size={16} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Investigación</span>
                        <div className="h-5 w-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-black">
                            {sources.length}
                        </div>
                    </button>
                </div>
            </div>

            {/* DRAWER DE FUENTES (Solo Mobile - Upward Expansion) */}
            <AnimatePresence>
                {isMobileSourcesOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileSourcesOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 h-[75vh] bg-zinc-950 border-t border-white/10 z-[70] rounded-t-[3rem] flex flex-col lg:hidden shadow-[0_-20px_100px_rgba(0,0,0,0.8)]"
                        >
                            <div className="p-8 flex items-center justify-between border-b border-white/5 bg-white/[0.02] rounded-t-[3rem]">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-500/20 rounded-xl">
                                        <Globe className="text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-white">Bóveda de Fuentes</h3>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest"> ग्राउंडिंग (Grounding)</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileSourcesOpen(false)}
                                    className="p-3 bg-white/5 rounded-full text-white/50 hover:bg-white/10"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-20">
                                <ul className="space-y-4">
                                    {sources.map((s: any, i: number) => <SourceItem key={i} source={s} />)}
                                </ul>
                            </div>

                            <div className="p-6 bg-primary/10 border-t border-white/5 text-center flex items-center justify-center gap-3">
                                <Sparkles size={16} className="text-primary" />
                                <span className="text-[11px] font-black text-white uppercase tracking-widest">
                                    Inteligencia Validada
                                </span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}