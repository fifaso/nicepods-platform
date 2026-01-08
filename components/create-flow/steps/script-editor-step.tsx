// components/create-flow/steps/script-editor-step.tsx
// VERSIÓN: 6.4 (Master UX - Reactive Content Sync & Grounding Sidebar)

"use client";

import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Globe, Pencil as PencilIcon, ExternalLink, BookOpen, Clock, FileText } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

const SourceItem = ({ source }: { source: any }) => (
    <li className="text-[10px] text-muted-foreground flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
        <div className="flex items-start justify-between gap-2">
            <span className="font-bold text-foreground line-clamp-2 leading-tight uppercase tracking-tighter">
                {source.title || "Fuente Verificada"}
            </span>
            {source.url && (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80">
                    <ExternalLink className="h-3 w-3" />
                </a>
            )}
        </div>
        {source.snippet && <p className="text-[9px] italic opacity-60 line-clamp-3 mt-1 leading-relaxed">"{source.snippet}"</p>}
    </li>
);

export function ScriptEditorStep() {
    const { control, setValue, getValues, watch } = useFormContext<PodcastCreationData>();

    const finalScript = watch('final_script');
    const sources = watch('sources') || [];
    const lastContentRef = useRef("");

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'El Agente IA está redactando tu conocimiento...' }),
        ],
        content: getValues('final_script') || "",
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none h-full text-foreground leading-relaxed p-8 md:p-12',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            lastContentRef.current = html;
            setValue('final_script', DOMPurify.sanitize(html), { shouldValidate: true, shouldDirty: true });
        },
    });

    // [SINCRONIZACIÓN ATÓMICA]: Forzar contenido al recibir respuesta de la IA
    useEffect(() => {
        if (editor && finalScript && finalScript !== lastContentRef.current) {
            lastContentRef.current = finalScript;
            editor.commands.setContent(finalScript);
        }
    }, [finalScript, editor]);

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-700">

            {/* HEADER ESTUDIO */}
            <div className="flex-shrink-0 flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8 border-b border-white/5 bg-zinc-900/40 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                        <PencilIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Estación de Guion</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Revisión de Inteligencia</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2">
                    <FormField control={control} name="final_title" render={({ field }) => (
                        <FormItem className="space-y-0">
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Título del Podcast..."
                                    className="h-14 bg-black/40 border-white/10 font-bold text-lg text-white rounded-2xl focus:border-primary shadow-inner"
                                />
                            </FormControl>
                        </FormItem>
                    )} />
                </div>
            </div>

            {/* ÁREA DE TRABAJO DUAL */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

                {/* PANEL DE EDICIÓN */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
                    <EditorContent editor={editor} />
                </div>

                {/* BARRA LATERAL DE GROUNDING (FUENTES) */}
                <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/5 bg-zinc-900/60 backdrop-blur-2xl flex flex-col shadow-2xl">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Globe size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Grounding de Datos</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-white/10 font-mono bg-white/5">
                            {sources.length}
                        </Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                        <ul className="space-y-4">
                            {sources.length > 0 ? (
                                sources.map((s, i) => <SourceItem key={i} source={s} />)
                            ) : (
                                <div className="py-20 px-6 text-center opacity-30">
                                    <BookOpen className="h-12 w-12 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-loose">
                                        Escaneando corpus de conocimiento...
                                    </p>
                                </div>
                            )}
                        </ul>
                    </div>

                    <div className="p-5 bg-primary/5 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                            <FileText size={10} /> Custodia de Proveniencia v5.0
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}