// components/create-flow/steps/script-editor-step.tsx
// VERSIÓN: 7.0 (Aurora Master - Dual Layout Workspace & Mobile Tray)

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
    ChevronUp, 
    X,
    Sparkles
} from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

/**
 * COMPONENTE: SourceItem
 * Renderiza cada fuente bibliográfica con diseño de alta densidad.
 */
const SourceItem = ({ source }: { source: any }) => (
    <li className="text-[11px] text-muted-foreground flex flex-col gap-1.5 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all duration-300">
        <div className="flex items-start justify-between gap-3">
            <span className="font-black text-white line-clamp-2 uppercase tracking-tighter leading-none">
                {source.title || "Fuente Verificada"}
            </span>
            {source.url && (
                <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-1.5 bg-primary/10 rounded-lg text-primary hover:bg-primary hover:text-white transition-colors"
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
                placeholder: 'Sincronizando con la inteligencia de NicePod...',
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-zinc-600 before:float-left before:pointer-events-none'
            }),
        ],
        content: getValues('final_script') || "",
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none h-full text-foreground leading-relaxed p-6 md:p-12 text-sm md:text-base',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            lastContentRef.current = html;
            setValue('final_script', DOMPurify.sanitize(html), { shouldValidate: true, shouldDirty: true });
        },
    });

    // Sincronización atómica: inyecta el contenido de la IA cuando llega el borrador
    useEffect(() => {
        if (editor && finalScriptFromForm && finalScriptFromForm !== lastContentRef.current) {
            lastContentRef.current = finalScriptFromForm;
            editor.commands.setContent(finalScriptFromForm);
        }
    }, [finalScriptFromForm, editor]);

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-700 relative overflow-hidden">

            {/* 1. HEADER: ESTACIÓN DE TRABAJO */}
            <header className="flex-shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 p-5 md:p-8 border-b border-white/5 bg-zinc-900/40 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex p-3 bg-primary/10 rounded-2xl border border-primary/20">
                        <PencilIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">Estación de Guion</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Refinación de Inteligencia</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2">
                    <FormField control={control} name="final_title" render={({ field }) => (
                        <FormItem className="space-y-0">
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Título del Podcast..."
                                    className="h-12 md:h-14 bg-black/40 border-white/10 font-bold text-base md:text-lg text-white rounded-2xl focus:border-primary shadow-inner"
                                />
                            </FormControl>
                        </FormItem>
                    )} />
                </div>
            </header>

            {/* 2. LIENZO PRINCIPAL */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">

                {/* ÁREA DEL EDITOR (3/4 en Desktop, Full en Mobile) */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
                    <EditorContent editor={editor} />
                </main>

                {/* SIDEBAR DE FUENTES (Solo Desktop: 1/4) */}
                <aside className="hidden lg:flex lg:w-1/4 border-l border-white/5 bg-zinc-900/60 backdrop-blur-3xl flex-col shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Globe size={18} />
                            <span className="text-[11px] font-black uppercase tracking-widest">Grounding</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-white/10 font-mono bg-white/5">
                            {sources.length}
                        </Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <ul className="space-y-4">
                            {sources.map((s: any, i: number) => <SourceItem key={i} source={s} />)}
                            {sources.length === 0 && (
                                <div className="py-20 text-center opacity-20">
                                    <BookOpen className="h-12 w-12 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Escanendo fuentes...</p>
                                </div>
                            )}
                        </ul>
                    </div>

                    <footer className="p-6 bg-primary/5 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest">
                            <FileText size={12} /> Custodia de Datos v5.0
                        </div>
                    </footer>
                </aside>

                {/* TRIGGER DE FUENTES (Solo Mobile) */}
                <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                    <button 
                        onClick={() => setIsMobileSourcesOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900/90 border border-white/20 rounded-full text-white shadow-2xl backdrop-blur-md active:scale-95 transition-transform"
                    >
                        <Globe size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ver Fuentes</span>
                        <div className="h-4 w-4 bg-primary/20 rounded-full flex items-center justify-center text-primary text-[8px] font-black">
                            {sources.length}
                        </div>
                    </button>
                </div>
            </div>

            {/* DRAWER DE FUENTES (Solo Mobile - Upward Accordion) */}
            <AnimatePresence>
                {isMobileSourcesOpen && (
                    <>
                        {/* Overlay Oscuro */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileSourcesOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
                        />
                        {/* Panel de Fuentes */}
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 h-[70vh] bg-zinc-950 border-t border-white/10 z-50 rounded-t-[2.5rem] flex flex-col lg:hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="p-8 flex items-center justify-between border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <Globe className="text-blue-400" size={20} />
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">Investigación</h3>
                                </div>
                                <button 
                                    onClick={() => setIsMobileSourcesOpen(false)}
                                    className="p-2 bg-white/5 rounded-full text-white/50"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-12">
                                <ul className="space-y-4">
                                    {sources.map((s: any, i: number) => <SourceItem key={i} source={s} />)}
                                </ul>
                            </div>
                            
                            <div className="p-6 bg-primary/5 border-t border-white/5 text-center">
                                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                    <Sparkles size={12} /> IA Grounding Activo
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}