/**
 * ARCHIVO: components/create-flow/steps/script-editor-step.tsx
 * VERSIÓN: 9.0 (NicePod Script Editor - Structural Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Renderizar la narrativa con legibilidad industrial y sincronía absoluta 
 * con el hardware de síntesis neuronal, permitiendo la edición de alto nivel.
 * [REFORMA V9.0]: Suture of missing UI imports (Badge, Input, Form) and AnimatePresence.
 * Nominal alignment with ResearchSource V13.0 descriptors.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  ExternalLink,
  BookOpen,
  X,
  Sparkles,
  Globe
} from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

// --- INFRAESTRUCTURA Y CONTRATOS ---
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { ResearchSource } from "@/types/podcast";
import { classNamesUtility } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormControl
} from "@/components/ui/form";

/**
 * INTERFAZ: SourceItemProperties
 * Misión: Definir el contrato de visualización para una fuente de evidencia.
 */
interface SourceItemProperties {
  sourceItem: ResearchSource;
}

/**
 * SourceItem: Componente de visualización de alta densidad para evidencias bibliográficas.
 */
const SourceItem = ({ sourceItem }: SourceItemProperties) => (
  <li className="text-[11px] text-zinc-500 flex flex-col gap-2 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all duration-500 group isolate">
    <div className="flex items-start justify-between gap-3">
        <span className="font-black text-white line-clamp-2 uppercase tracking-tighter leading-none group-hover:text-primary transition-colors italic font-serif">
            {sourceItem.title}
        </span>
        <a
            href={sourceItem.uniformResourceLocator}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white/5 rounded-xl text-zinc-500 hover:bg-primary hover:text-white transition-all duration-300 shrink-0"
        >
            <ExternalLink size={12} />
        </a>
    </div>
    {sourceItem.snippetContentText && (
        <p className="text-[10px] italic text-zinc-600 leading-relaxed line-clamp-4">
            "{sourceItem.snippetContentText}"
        </p>
    )}
  </li>
);

/**
 * ScriptEditorStep: El terminal editorial de la forja.
 */
export function ScriptEditorStep() {
  const { control, setValue, getValues, watch } = useFormContext<PodcastCreationData>();

  // [RESOLUCIÓN TS2769]: Sincronía con descriptores industriales V12.0
  const finalScriptContentFromForm = watch('finalScriptContent');
  const sourcesCollection = watch('sourcesCollection') || [];
  
  const [isMobileSourcesInterfaceOpenStatus, setIsMobileSourcesInterfaceOpenStatus] = useState<boolean>(false);
  const lastContentReference = useRef<string>("");

  const editorInstance = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'La IA está sintetizando el conocimiento en este lienzo...',
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-zinc-700 before:float-left before:pointer-events-none'
      }),
    ],
    content: getValues('finalScriptContent') || "",
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none h-full text-zinc-300 leading-relaxed p-8 md:p-12 text-base md:text-lg custom-scrollbar',
      },
    },
    onUpdate: ({ editor }) => {
      const sanitizedHtmlContentText = DOMPurify.sanitize(editor.getHTML());
      lastContentReference.current = sanitizedHtmlContentText;
      setValue('finalScriptContent', sanitizedHtmlContentText, { shouldValidate: true, shouldDirty: true });
    },
  });

  useEffect(() => {
    if (editorInstance && finalScriptContentFromForm && finalScriptContentFromForm !== lastContentReference.current) {
      lastContentReference.current = finalScriptContentFromForm;
      editorInstance.commands.setContent(finalScriptContentFromForm);
    }
  }, [finalScriptContentFromForm, editorInstance]);

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-700 relative overflow-hidden bg-transparent isolate">

      {/* I. HEADER: CONFIGURACIÓN EDITORIAL */}
      <header className="flex-shrink-0 flex flex-col lg:flex-row items-center justify-between gap-6 p-6 lg:p-10 border-b border-white/5 bg-[#050505]/60 backdrop-blur-3xl z-20 isolate">
        <div className="flex items-center gap-5 w-full lg:w-auto">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-inner">
                <Pencil size={24} className="text-primary" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter text-white leading-none italic font-serif">
                Edición de Guión
            </h2>
        </div>

        <div className="w-full lg:flex-1 lg:max-w-2xl">
           <FormField control={control} name="finalTitle" render={({ field }) => (
            <FormItem className="space-y-0">
                <FormControl>
                    <Input
                        {...field}
                        placeholder="Título definitivo del podcast..."
                        className="h-14 bg-white/[0.02] border-white/5 font-black text-base lg:text-lg text-white rounded-2xl focus:border-primary shadow-2xl transition-all"
                    />
                </FormControl>
            </FormItem>
           )} />
        </div>
      </header>

      {/* II. ÁREA DE TRABAJO DUAL */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative isolate">
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 lg:bg-transparent isolate">
            <div className="w-full h-full">
                <EditorContent editor={editorInstance} />
                
                {/* Trigger de fuentes móvil */}
                <div className="lg:hidden p-8 pt-0 flex justify-center">
                    <button
                        onClick={() => setIsMobileSourcesInterfaceOpenStatus(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-zinc-900/90 border border-white/10 rounded-full text-white shadow-2xl backdrop-blur-md active:scale-95 transition-all w-full justify-center"
                    >
                        <Globe size={16} className="text-primary" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Investigación</span>
                        <Badge className="bg-primary/20 text-primary border-none h-5 px-1.5 text-[10px]">{sourcesCollection.length}</Badge>
                    </button>
                </div>
            </div>
        </main>

        {/* SIDEBAR DE FUENTES INDUSTRIAL */}
        <aside className="hidden lg:flex lg:w-1/4 border-l border-white/5 bg-[#050505]/60 backdrop-blur-3xl flex-col shadow-2xl isolate">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3 text-primary">
                    <Globe size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Fuentes Verificadas</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-white/10 font-mono px-3 bg-black/40 text-primary rounded-lg">
                    {sourcesCollection.length}
                </Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar isolate">
                <ul className="space-y-4">
                    {sourcesCollection.map((sourceItem, sourceIndexMagnitude) => (
                        <SourceItem key={sourceIndexMagnitude} sourceItem={sourceItem} />
                    ))}
                    {sourcesCollection.length === 0 && (
                        <div className="py-20 text-center opacity-10">
                            <BookOpen className="h-12 w-12 mx-auto mb-6" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sin fuentes asociadas</p>
                        </div>
                    )}
                </ul>
            </div>
        </aside>
      </div>

      {/* DRAWER DE FUENTES MOBILE */}
      <AnimatePresence>
        {isMobileSourcesInterfaceOpenStatus && (
            <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                className="fixed bottom-0 left-0 right-0 h-[75vh] bg-[#050505] border-t border-white/10 z-[70] rounded-t-[3rem] flex flex-col shadow-2xl lg:hidden isolate"
            >
                <div className="p-8 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">Fuentes</h3>
                    <button onClick={() => setIsMobileSourcesInterfaceOpenStatus(false)} className="p-3 bg-white/5 rounded-full text-white/50"><X size={24}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 pb-20 custom-scrollbar">
                    <ul className="space-y-4">
                        {sourcesCollection.map((sourceItem, sourceIndexMagnitude) => (
                            <SourceItem key={sourceIndexMagnitude} sourceItem={sourceItem} />
                        ))}
                    </ul>
                </div>
                <div className="p-6 bg-primary/10 border-t border-white/5 flex items-center justify-center gap-3">
                    <Sparkles size={16} className="text-primary" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Inteligencia Validada</span>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.0):
 * 1. Build Shield Absolute: Resolución definitiva de TS2769 y TS2339. Sincronización 
 *    con el esquema V12.0 (finalScriptContent, sourcesCollection).
 * 2. ZAP Enforcement: Purificación total. Se eliminaron abreviaturas como 'cn', 
 *    's', 'i', 'html', 'raw'.
 * 3. Memory Hygiene: El motor TipTap está encapsulado y el lastContentReference 
 *    previene actualizaciones redundantes en el DOM, protegiendo los 60 FPS.
 */