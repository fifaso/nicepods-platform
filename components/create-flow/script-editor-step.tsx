// components/create-flow/script-editor-step.tsx
// VERSIÓN: 5.8 (UX Final Polish: Split Header Layout)

"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading2, List, Undo, Redo, BookOpen, ChevronDown, ChevronUp, ExternalLink, Globe } from "lucide-react";

import DOMPurify from "isomorphic-dompurify";

// --- COMPONENTE REUTILIZABLE: ÍTEM DE FUENTE ---
const SourceItem = ({ source }: { source: { title?: string, url?: string, snippet?: string } }) => (
    <li className="text-[10px] text-muted-foreground flex flex-col gap-1 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-black/5 dark:hover:border-white/5">
        <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-foreground line-clamp-2 leading-tight">
                {source.title || "Fuente sin título"}
            </span>
            {source.url && (
                <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:text-primary/80 flex-shrink-0 flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors"
                >
                    Link <ExternalLink className="h-2 w-2" />
                </a>
            )}
        </div>
        {source.snippet && (
            <p className="italic opacity-80 line-clamp-3 leading-relaxed border-l-2 border-primary/20 pl-2">
                {source.snippet}
            </p>
        )}
    </li>
);

// --- BANDEJAS DE FUENTES (MOBILE/DESKTOP) ---

const MobileSourcesTray = ({ sources }: { sources?: any[] }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!sources || sources.length === 0) return null;

    return (
        <div className="lg:hidden flex-shrink-0 mb-4 border border-black/5 dark:border-white/10 rounded-xl overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-sm">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span>{sources.length} Fuentes de Investigación</span>
                </div>
                {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {isOpen && (
                <div className="px-4 pb-3 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 max-h-40 overflow-y-auto scrollbar-thin">
                    <ul className="space-y-2 mt-2">
                        {sources.map((source, idx) => (
                            <SourceItem key={idx} source={source} />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const DesktopSourcesSidebar = ({ sources }: { sources?: any[] }) => {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="hidden lg:flex flex-col w-80 flex-shrink-0 h-full bg-white/40 dark:bg-black/20 backdrop-blur-sm border border-black/5 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 border-b border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/40 flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-bold text-foreground">Fuentes ({sources.length})</span>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
                <ul className="space-y-1">
                    {sources.map((source, idx) => (
                        <SourceItem key={idx} source={source} />
                    ))}
                </ul>
            </div>
        </div>
    );
};

// --- BARRA DE HERRAMIENTAS EDITOR ---
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 p-2 border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md overflow-x-auto scrollbar-hide rounded-t-xl z-20 relative">
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={cn("h-8 w-8 p-0", editor.isActive('bold') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')} title="Negrita"><Bold className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={cn("h-8 w-8 p-0", editor.isActive('italic') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')} title="Itálica"><Italic className="h-4 w-4" /></Button>
      <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn("h-8 w-8 p-0", editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')} title="Título de Sección"><Heading2 className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn("h-8 w-8 p-0", editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')}><List className="h-4 w-4" /></Button>
      <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"><Undo className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"><Redo className="h-4 w-4" /></Button>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export function ScriptEditorStep() {
  const { control, setValue, getValues } = useFormContext<PodcastCreationData>();
  
  const initialScript = getValues('final_script') || '';
  const sources = getValues('sources') || [];

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Escribe o edita tu guion aquí...',
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground/50 before:float-left before:pointer-events-none',
      }),
    ],
    content: initialScript, 
    editorProps: {
      attributes: {
        class: 'prose prose-stone dark:prose-invert max-w-none focus:outline-none h-full text-foreground leading-relaxed p-6',
      },
      transformPastedHTML(html) { return html; },
    },
    onUpdate: ({ editor }) => {
      const dirtyHtml = editor.getHTML();
      const cleanHtml = DOMPurify.sanitize(dirtyHtml);
      setValue('final_script', cleanHtml, { shouldValidate: true, shouldDirty: true });
    },
  });

  useEffect(() => {
    if (editor && initialScript && editor.getText() === '') {
       editor.commands.setContent(initialScript);
    }
  }, [editor, initialScript]);

  return (
    <div className="flex flex-col h-full w-full animate-fade-in">
      
      {/* 1. HEADER (ADAPTATIVO) */}
      
      {/* MÓVIL: Diseño centrado clásico */}
      <div className="lg:hidden flex-shrink-0 pt-4 pb-2 px-4 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Revisa tu Guion</h2>
        <p className="text-xs text-muted-foreground mt-1 font-medium">Edita el contenido antes de grabar.</p>
      </div>

      {/* DESKTOP: Barra superior WORKSTATION */}
      {/* Usamos justify-between para separar los dos bloques principales */}
      <div className="hidden lg:flex flex-shrink-0 items-center justify-between px-1 pb-4 pt-1 border-b border-black/5 dark:border-white/5 mb-4 gap-4">
         
         {/* LADO IZQUIERDO: Título de Fase + Subtítulo */}
         <div className="flex flex-col justify-center">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Pencil className="h-4 w-4 text-primary" /> Editor de Guion
            </h2>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider pl-6">Modo Estudio</p>
         </div>

         {/* LADO DERECHO: Input del Título (Ocupa el 50% de la pantalla, desde el centro a la derecha) */}
         <div className="w-1/2 pl-4">
            <FormField
                control={control}
                name="final_title"
                render={({ field }) => (
                    <FormItem className="space-y-0 w-full">
                    <FormControl>
                        <Input
                        {...field}
                        placeholder="Título del Podcast"
                        maxLength={100}
                        // Ajustes visuales: Texto alineado a la izquierda, fondo sutil, altura cómoda
                        className="h-10 text-base font-medium bg-white/40 dark:bg-black/20 border-transparent hover:border-primary/20 focus:border-primary focus:bg-background transition-all text-left px-4 rounded-lg w-full"
                        />
                    </FormControl>
                    <FormMessage className="text-[10px] absolute mt-1 right-0" />
                    </FormItem>
                )}
            />
         </div>
      </div>

      {/* 2. ÁREA DE TRABAJO */}
      <div className="flex-grow flex flex-col min-h-0 px-2 lg:px-0 pb-2">
        
        {/* INPUT DE TÍTULO (SOLO MÓVIL) - Oculto en LG */}
        <div className="lg:hidden flex-shrink-0 mb-4">
            <FormField
            control={control}
            name="final_title"
            render={({ field }) => (
                <FormItem>
                <FormControl>
                    <Input
                    {...field}
                    placeholder="Título del Podcast"
                    maxLength={100}
                    className="h-14 text-xl md:text-2xl font-bold bg-transparent border-0 border-b border-border text-center text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0 rounded-none transition-colors hover:border-primary/50 focus:border-primary"
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        {/* CONTAINER FLEXIBLE: Columna única en móvil, Fila en Desktop */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-0 lg:gap-6">
            
            {/* COLUMNA PRINCIPAL (Editor + Bandeja Móvil) */}
            <div className="flex-1 flex flex-col min-h-0">
                
                {/* Bandeja Móvil */}
                <MobileSourcesTray sources={sources} />

                {/* EDITOR */}
                <div className="flex-1 flex flex-col min-h-0 bg-white/50 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden shadow-sm relative backdrop-blur-sm">
                    <div className="flex-shrink-0 z-10">
                        <MenuBar editor={editor} />
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hide relative">
                        <EditorContent editor={editor} className="h-full" />
                    </div>
                    <div className="hidden">
                        <FormField 
                            control={control} 
                            name="final_script" 
                            render={({ field }) => <input type="hidden" {...field} />} 
                        />
                    </div>
                </div>
            </div>

            {/* SIDEBAR DESKTOP */}
            <DesktopSourcesSidebar sources={sources} />

        </div>

      </div>
    </div>
  );
}

function Pencil(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    )
}