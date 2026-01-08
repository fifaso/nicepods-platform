// components/create-flow/steps/script-editor-step.tsx
// VERSIÓN: 6.2 (UX Final - Async Content Force & Badge Fix)

"use client";

import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Heading2, List, Undo, Redo,
    ExternalLink, Globe, Pencil as PencilIcon, BookOpen
} from "lucide-react";

import DOMPurify from "isomorphic-dompurify";

const SourceItem = ({ source }: { source: any }) => (
    <li className="text-[10px] text-muted-foreground flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
        <div className="flex items-start justify-between gap-2">
            <span className="font-bold text-foreground line-clamp-2 leading-tight uppercase tracking-tighter">
                {source.title || "Fuente Verificada"}
            </span>
            {source.url && (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary">
                    <ExternalLink className="h-3 w-3" />
                </a>
            )}
        </div>
        {source.snippet && <p className="text-[9px] italic opacity-60 line-clamp-3 mt-1">"{source.snippet}"</p>}
    </li>
);

export function ScriptEditorStep() {
    const { control, setValue, getValues, watch } = useFormContext<PodcastCreationData>();

    // Observamos el script en tiempo real
    const finalScript = watch('final_script');
    const sources = watch('sources') || [];
    const lastInjectedScript = useRef("");

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Redactando guion...' }),
        ],
        content: getValues('final_script') || "",
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none h-full text-foreground leading-relaxed p-8',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            lastInjectedScript.current = html;
            setValue('final_script', DOMPurify.sanitize(html), { shouldValidate: true });
        },
    });

    // [CORRECCIÓN CRÍTICA]: Sincronización Forzada
    // Si final_script cambia (porque la IA terminó), y es distinto a lo que tiene el editor, actualizamos.
    useEffect(() => {
        if (editor && finalScript && finalScript !== lastInjectedScript.current) {
            lastInjectedScript.current = finalScript;
            editor.commands.setContent(finalScript);
        }
    }, [finalScript, editor]);

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-700">
            <div className="flex-shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-white/5 bg-zinc-900/20">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
                        <PencilIcon className="h-5 w-5 text-primary" /> Estación de Guion
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ajuste de narrativa</p>
                </div>
                <div className="w-full md:w-1/2">
                    <FormField control={control} name="final_title" render={({ field }) => (
                        <FormItem className="space-y-0">
                            <FormControl>
                                <Input {...field} placeholder="Título" className="h-12 bg-black/40 border-white/10 font-bold text-white rounded-xl" />
                            </FormControl>
                        </FormItem>
                    )} />
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
                    <EditorContent editor={editor} />
                </div>
                <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/5 bg-black/40 flex flex-col">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                            <Globe size={14} /> Grounding
                        </span>
                        <Badge variant="outline" className="text-[9px] border-white/10">{sources.length}</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <ul className="space-y-3">
                            {sources.map((s, i) => <SourceItem key={i} source={s} />)}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}