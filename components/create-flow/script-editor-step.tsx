// components/create-flow/script-editor-step.tsx
// VERSIÓN FINAL: Editor Rico (TipTap) integrado con estilo Premium y Cero Scroll global.

"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// TipTap Imports
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading2, List, ListOrdered, Undo, Redo } from "lucide-react";

// --- SUB-COMPONENTE: BARRA DE HERRAMIENTAS ---
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-black/20 backdrop-blur-md overflow-x-auto scrollbar-hide">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn("h-8 w-8 p-0", editor.isActive('bold') ? 'bg-primary/20 text-primary' : 'text-muted-foreground')}
        title="Negrita (Énfasis)"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn("h-8 w-8 p-0", editor.isActive('italic') ? 'bg-primary/20 text-primary' : 'text-muted-foreground')}
        title="Itálica (Tono)"
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-4 bg-white/10 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn("h-8 w-8 p-0", editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : 'text-muted-foreground')}
        title="Título de Sección"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn("h-8 w-8 p-0", editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : 'text-muted-foreground')}
      >
        <List className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-4 bg-white/10 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-white"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-white"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export function ScriptEditorStep() {
  const { control, setValue, watch, getValues } = useFormContext<PodcastCreationData>();
  
  // Obtenemos los valores iniciales (generados por la IA en el paso anterior)
  const initialTitle = getValues('final_title') || '';
  const initialScript = getValues('final_script') || '';

  // Configuración del Editor TipTap
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Escribe o edita tu guion aquí...',
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground/50 before:float-left before:pointer-events-none',
      }),
    ],
    // Contenido inicial: Puede ser HTML o Texto plano. TipTap lo parsea.
    content: initialScript, 
    editorProps: {
      attributes: {
        // Clases de Tailwind para el área de escritura (Prose Mirror)
        class: 'prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none min-h-[300px] text-white/90 leading-relaxed p-6',
      },
    },
    onUpdate: ({ editor }) => {
      // Sincronización en tiempo real: TipTap -> React Hook Form
      // Guardamos como HTML para preservar la estructura (párrafos, negritas)
      const html = editor.getHTML();
      setValue('final_script', html, { shouldValidate: true, shouldDirty: true });
    },
  });

  // Asegurarnos de que si el usuario navega y vuelve, el contenido no se pierda
  useEffect(() => {
    if (editor && initialScript && editor.getText() === '') {
       // Solo si el editor está vacío y tenemos un script guardado, lo restauramos
       // (Evita sobreescribir si el usuario ya estaba editando)
       editor.commands.setContent(initialScript);
    }
  }, [editor, initialScript]);

  return (
    <div className="flex flex-col h-full w-full animate-fade-in">
      
      {/* 1. CABECERA CONTEXTUAL */}
      <div className="flex-shrink-0 pt-4 pb-2 px-4 text-center">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          Revisa tu Guion
        </h2>
        <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">
          Edita el título y el contenido antes de grabar
        </p>
      </div>

      <div className="flex-grow flex flex-col min-h-0 px-2 md:px-6 pb-2 gap-4">
        
        {/* 2. EDITOR DE TÍTULO (Input Heroico Superior) */}
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
                    className="h-14 text-xl md:text-2xl font-bold bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl px-4 focus-visible:ring-primary/50 text-center md:text-left"
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        {/* 3. EDITOR DE GUION (TipTap) */}
        <div className="flex-1 flex flex-col min-h-0 bg-secondary/10 dark:bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-inner relative">
            
            {/* Toolbar fija arriba */}
            <div className="flex-shrink-0 z-10">
                <MenuBar editor={editor} />
            </div>

            {/* Área Scrolleable */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <EditorContent editor={editor} />
            </div>
            
            {/* Campo oculto para validación de formulario (Zod necesita ver que el campo existe) */}
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