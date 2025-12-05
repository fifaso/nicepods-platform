// components/create-flow/script-editor-step.tsx
// VERSIÓN MAESTRA: Editor Rico + Bandeja de Fuentes (Grounding) + Seguridad XSS.

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
import { Bold, Italic, Heading2, List, Undo, Redo, BookOpen, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

import DOMPurify from "isomorphic-dompurify";

// --- BANDEJA DE FUENTES (NUEVO COMPONENTE) ---
const SourcesTray = ({ sources }: { sources?: { title?: string, url?: string, snippet?: string }[] }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!sources || sources.length === 0) return null;

    return (
        <div className="flex-shrink-0 mb-4 border border-black/5 dark:border-white/10 rounded-xl overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-sm">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span>{sources.length} Fuentes de Investigación Utilizadas</span>
                </div>
                {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {isOpen && (
                <div className="px-4 pb-3 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 max-h-40 overflow-y-auto scrollbar-thin">
                    <ul className="space-y-2 mt-2">
                        {sources.map((source, idx) => (
                            <li key={idx} className="text-[10px] text-muted-foreground flex flex-col gap-0.5">
                                <div className="flex items-start justify-between gap-2">
                                    <span className="font-semibold text-foreground line-clamp-1">{source.title || "Fuente sin título"}</span>
                                    {source.url && (
                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex-shrink-0 flex items-center gap-1">
                                            Ver <ExternalLink className="h-2.5 w-2.5" />
                                        </a>
                                    )}
                                </div>
                                {source.snippet && <p className="italic opacity-80 line-clamp-2">{source.snippet}</p>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- BARRA DE HERRAMIENTAS ---
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 p-2 border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md overflow-x-auto scrollbar-hide rounded-t-2xl z-20 relative">
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
  const { control, setValue, watch, getValues } = useFormContext<PodcastCreationData>();
  
  const initialTitle = getValues('final_title') || '';
  const initialScript = getValues('final_script') || '';
  // Recuperamos las fuentes del estado global
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
      
      <div className="flex-shrink-0 pt-4 pb-2 px-4 text-center">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground drop-shadow-sm md:drop-shadow-none">
          Revisa tu Guion
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Edita el contenido antes de grabar.
        </p>
      </div>

      <div className="flex-grow flex flex-col min-h-0 px-2 md:px-6 pb-2">
        
        {/* 1. TÍTULO */}
        <div className="flex-shrink-0 mb-4">
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
                    className="h-14 text-xl md:text-2xl font-bold bg-transparent border-0 border-b border-border text-center md:text-left text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0 rounded-none transition-colors hover:border-primary/50 focus:border-primary"
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        {/* 2. BANDEJA DE FUENTES (Si existen) */}
        <SourcesTray sources={sources} />

        {/* 3. EDITOR (Ocupa el resto) */}
        <div className="flex-1 flex flex-col min-h-0 bg-white/50 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden shadow-sm relative backdrop-blur-sm">
            
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
    </div>
  );
}