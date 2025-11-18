// components/tag-curation-canvas.tsx
// El "Lienzo de Curación": una interfaz interactiva y animada para gestionar etiquetas.

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Check, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

interface TagCurationCanvasProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialSuggestedTags: string[];
  initialPublishedTags: string[];
  onSave: (finalTags: string[]) => Promise<void>;
}

export function TagCurationCanvas({ isOpen, onOpenChange, initialSuggestedTags, initialPublishedTags, onSave }: TagCurationCanvasProps) {
  const [suggested, setSuggested] = useState<string[]>([]);
  const [published, setPublished] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Inicializamos el estado solo cuando se abre el modal.
      // Mostramos como sugerencias solo aquellas que no han sido publicadas previamente por el usuario.
      const publishedSet = new Set(initialPublishedTags);
      setSuggested(initialSuggestedTags.filter(tag => !publishedSet.has(tag)));
      setPublished(initialPublishedTags);
    }
  }, [isOpen, initialSuggestedTags, initialPublishedTags]);

  const handleAccept = (tag: string) => {
    setSuggested(prev => prev.filter(t => t !== tag));
    setPublished(prev => [...prev, tag]);
  };

  const handleReject = (tag: string) => {
    setSuggested(prev => prev.filter(t => t !== tag));
  };

  const handleRemovePublished = (tag: string) => {
    setPublished(prev => prev.filter(t => t !== tag));
    // Si la etiqueta eliminada era una sugerencia original de la IA, la devolvemos a la bandeja de sugerencias.
    if (initialSuggestedTags.includes(tag)) {
      setSuggested(prev => [tag, ...prev]);
    }
  };

  const handleAddNewTag = () => {
    const trimmedTag = newTag.trim().toLowerCase(); // Normalizamos a minúsculas
    if (trimmedTag && !published.includes(trimmedTag)) {
      setPublished(prev => [...prev, trimmedTag]);
      setNewTag("");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Usamos un Set para asegurar que no haya duplicados en el guardado final.
    const finalTags = [...new Set(published)];
    await onSave(finalTags);
    setIsSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Revisa y Publica las Etiquetas de tu Podcast</DialogTitle>
          <DialogDescription>
            Acepta las sugerencias de la IA, rechaza las que no apliquen y añade tu propia perspectiva.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* ZONA 1: BANDEJA DE SUGERENCIAS */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Sugerencias de la IA</h3>
            <div className="p-4 border border-dashed rounded-lg min-h-[80px] flex flex-wrap gap-2">
              <AnimatePresence>
                {suggested.map(tag => (
                  <motion.div key={tag} layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                    <Badge variant="outline" className="flex items-center gap-2 p-2 text-base cursor-default">
                      {tag}
                      <button onClick={() => handleAccept(tag)} className="rounded-full hover:bg-green-500/20 p-0.5" aria-label={`Aceptar tag ${tag}`}><Check className="h-4 w-4 text-green-500" /></button>
                      <button onClick={() => handleReject(tag)} className="rounded-full hover:bg-red-500/20 p-0.5" aria-label={`Rechazar tag ${tag}`}><X className="h-4 w-4 text-red-500" /></button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
              {suggested.length === 0 && <p className="text-sm text-muted-foreground self-center mx-auto">¡Todas las sugerencias han sido revisadas!</p>}
            </div>
          </div>

          {/* ZONA 2: ETIQUETAS PUBLICADAS */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Tus Etiquetas Publicadas</h3>
            <div className="p-4 border rounded-lg min-h-[80px] flex flex-wrap gap-2 bg-muted/30">
              <AnimatePresence>
                {published.map(tag => (
                  <motion.div key={tag} layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                    <Badge className="flex items-center gap-2 p-2 text-base">
                      {tag}
                      <button onClick={() => handleRemovePublished(tag)} className="rounded-full hover:bg-destructive/20 p-0.5" aria-label={`Quitar tag ${tag}`}><X className="h-4 w-4" /></button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
              {published.length === 0 && <p className="text-sm text-muted-foreground self-center mx-auto">Añade etiquetas para mejorar el descubrimiento.</p>}
            </div>
          </div>

          {/* ZONA 3: AÑADIR NUEVA ETIQUETA */}
          <div className="flex gap-2">
            <Input 
              placeholder="Escribe una nueva etiqueta y presiona Enter..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewTag(); }}}
            />
            <Button type="button" onClick={handleAddNewTag}><Plus className="h-4 w-4 mr-2" /> Añadir</Button>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}