// components/create-flow/script-editor-step.tsx
// VERSIÓN FINAL ADAPTATIVA: Editor con contraste perfecto en Light/Dark Mode.

"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading2, List, ListOrdered, Undo, Redo } from "lucide-react";

// --- BARRA DE HERRAMIENTAS ADAPTATIVA ---
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 p-2 border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md overflow-x-auto scrollbar-hide rounded-t-2xl">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn("h-8 w-8 p-0", editor.isActive('bold') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')}
        title="Negrita"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn("h-8 w-8 p-0", editor.isActive('italic') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')}
        title="Itálica"
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn("h-8 w-8 p-0", editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')}
        title="Título de Sección"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn("h-8 w-8 p-0", editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')}
      >
        <List className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export function ScriptEditorStep() {
  const { control, setValue, watch, getValues } = useFormContext<PodcastCreationData>();
  
  const initialTitle = getValues('final_title') || '';
  const initialScript = getValues('final_script') || '';

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
        // CLASES DE TEXTO ADAPTATIVAS:
        // text-foreground: Negro en Light, Blanco en Dark.
        // prose-stone / prose-invert: Maneja estilos de Markdown automáticos.
        class: 'prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[300px] text-foreground leading-relaxed p-6',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setValue('final_script', html, { shouldValidate: true, shouldDirty: true });
    },
  });

  useEffect(() => {
    if (editor && initialScript && editor.getText() === '') {
       editor.commands.setContent(initialScript);
    }
  }, [editor, initialScript]);

  return (
    <div className="flex flex-col h-full w-full animate-fade-in">
      
      {/* CABECERA */}
      <div className="flex-shrink-0 pt-4 pb-2 px-4 text-center">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground drop-shadow-sm md:drop-shadow-none">
          Revisa tu Guion
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Edita el título y el contenido antes de grabar.
        </p>
      </div>

      <div className="flex-grow flex flex-col min-h-0 px-2 md:px-6 pb-2 gap-4">
        
        {/* EDITOR DE TÍTULO (Input Transparente) */}
        <div className="flex-shrink-0">
            <FormField
            control={control}
            name="final_title"
            render={({ field }) => (
                <FormItem>
                <FormControl>
                    <Input
                    {...field}
                    placeholder="Título del Podcast"
                    // Input Adaptativo
                    className="h-14 text-xl md:text-2xl font-bold bg-transparent border-0 border-b border-border text-center md:text-left text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0 rounded-none"
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        {/* EDITOR DE GUION (Contenedor Glass) */}
        <div className="flex-1 flex flex-col min-h-0 bg-white/50 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden shadow-sm relative backdrop-blur-sm">
            
            {/* Toolbar */}
            <div className="flex-shrink-0 z-10">
                <MenuBar editor={editor} />
            </div>

            {/* Área Scrolleable */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <EditorContent editor={editor} />
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