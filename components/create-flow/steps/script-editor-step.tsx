// components/create-flow/script-editor-step.tsx
// VERSIÓN: 6.1 (Master UX - Reference Fix & Stability)

"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// [FIJO]: Importaciones de UI faltantes que causaban el crash
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Heading2, List, Undo, Redo, BookOpen,
    ChevronDown, ChevronUp, ExternalLink, Globe, Pencil as PencilIcon
} from "lucide-react";

import DOMPurify from "isomorphic-dompurify";

// --- ÍTEM DE FUENTE BIBLIOGRÁFICA ---
const SourceItem = ({ source }: { source: { title?: string, url?: string, snippet?: string } }) => (
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
        {source.snippet && (
            <p className="text-[9px] italic opacity-60 line-clamp-3 leading-relaxed mt-1">
                "{source.snippet}"
            </p>
        )}
    </li>
);

export function ScriptEditorStep() {
    const { control, setValue, getValues, watch } = useFormContext<PodcastCreationData>();

    // Suscripción reactiva a las fuentes inyectadas por el orquestador
    const sources = watch('sources') || [];
    const initialScript = getValues('final_script') || '';

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'La IA está redactando tu conocimiento...',
            }),
        ],
        content: initialScript,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none h-full text-foreground leading-relaxed p-8',
            },
        },
        onUpdate: ({ editor }) => {
            const cleanHtml = DOMPurify.sanitize(editor.getHTML());
            setValue('final_script', cleanHtml, { shouldValidate: true, shouldDirty: true });
        },
    });

    // Sincronización asíncrona: asegura que el contenido se cargue cuando la promesa de IA termine
    useEffect(() => {
        if (editor && initialScript && editor.isEmpty) {
            editor.commands.setContent(initialScript);
        }
    }, [editor, initialScript]);

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-700">

            {/* HEADER TÉCNICO */}
            <div className="flex-shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-white/5 bg-zinc-900/20">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
                        <PencilIcon className="h-5 w-5 text-primary" /> Estación de Guion
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ajuste de narrativa y fuentes</p>
                </div>

                <div className="w-full md:w-1/2">
                    <FormField
                        control={control}
                        name="final_title"
                        render={({ field }) => (
                            <FormItem className="space-y-0">
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Título del Podcast"
                                        className="h-12 bg-black/40 border-white/10 font-bold text-white rounded-xl focus:border-primary transition-all"
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] mt-1" />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* ÁREA DE TRABAJO DUAL */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

                {/* COLUMNA EDITOR (PRINCIPAL) */}
                <div className="flex-1 flex flex-col min-h-0 bg-black/10">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <EditorContent editor={editor} />
                    </div>
                </div>

                {/* SIDEBAR FUENTES (CUSTODIA) */}
                <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/5 bg-black/40 flex flex-col">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                            <Globe size={14} /> Grounding de Datos
                        </span>
                        <Badge variant="outline" className="text-[9px] border-white/10 font-mono">
                            {sources.length}
                        </Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <ul className="space-y-3">
                            {sources.length > 0 ? (
                                sources.map((s, i) => <SourceItem key={i} source={s} />)
                            ) : (
                                <div className="py-20 px-6 text-center opacity-20">
                                    <BookOpen className="h-10 w-10 mx-auto mb-4" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                        Analizando corpus de conocimiento experto...
                                    </p>
                                </div>
                            )}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}