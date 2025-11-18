// components/tag-curation-canvas.tsx
// VERSIÓN ROBUSTA: Se sincroniza con las props cada vez que se abre, evitando el estado obsoleto.

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
  // [CAMBIO QUIRÚRGICO #1]: Renombramos las props para reflejar que son dinámicas.
  suggestedTags: string[];
  publishedTags: string[];
  onSave: (finalTags: string[]) => Promise<void>;
}

export function TagCurationCanvas({ isOpen, onOpenChange, suggestedTags, publishedTags, onSave }: TagCurationCanvasProps) {
  const [internalSuggested, setInternalSuggested] = useState<string[]>([]);
  const [internalPublished, setInternalPublished] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // [CAMBIO QUIRÚRGICO #2]: Este useEffect ahora se ejecuta cada vez que el modal se abre.
  // Garantiza que siempre partimos del estado más actualizado que nos pasa el componente padre.
  useEffect(() => {
    if (isOpen) {
      const publishedSet = new Set(publishedTags);
      setInternalSuggested(suggestedTags.filter(tag => !publishedSet.has(tag)));
      setInternalPublished(publishedTags);
    }
  }, [isOpen, suggestedTags, publishedTags]);

  const handleAccept = (tag: string) => {
    setInternalSuggested(prev => prev.filter(t => t !== tag));
    setInternalPublished(prev => [...prev, tag]);
  };

  const handleRemovePublished = (tag: string) => {
    setInternalPublished(prev => prev.filter(t => t !== tag));
    if (suggestedTags.includes(tag)) {
      setInternalSuggested(prev => [tag, ...prev]);
    }
  };
  
  const handleAddNewTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !internalPublished.includes(trimmedTag)) {
      setInternalPublished(prev => [...prev, trimmedTag]);
      setNewTag("");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const finalTags = [...new Set(internalPublished)];
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
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Sugerencias de la IA</h3>
            <div className="p-4 border border-dashed rounded-lg min-h-[80px] flex flex-wrap gap-2">
              <AnimatePresence>
                {internalSuggested.map(tag => (
                  <motion.div key={tag} layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                    <Badge variant="outline" className="flex items-center gap-2 p-2 text-base cursor-default">
                      {tag}
                      <button onClick={() => handleAccept(tag)} className="rounded-full hover:bg-green-500/20 p-0.5"><Check className="h-4 w-4 text-green-500" /></button>
                      <button onClick={() => setInternalSuggested(s => s.filter(t => t !== tag))} className="rounded-full hover:bg-red-500/20 p-0.5"><X className="h-4 w-4 text-red-500" /></button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
              {internalSuggested.length === 0 && <p className="text-sm text-muted-foreground self-center mx-auto">¡Todas las sugerencias han sido revisadas!</p>}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Tus Etiquetas Publicadas</h3>
            <div className="p-4 border rounded-lg min-h-[80px] flex flex-wrap gap-2 bg-muted/30">
              <AnimatePresence>
                {internalPublished.map(tag => (
                  <motion.div key={tag} layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                    <Badge className="flex items-center gap-2 p-2 text-base">
                      {tag}
                      <button onClick={() => handleRemovePublished(tag)} className="rounded-full hover:bg-destructive/20 p-0.5"><X className="h-4 w-4" /></button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
              {internalPublished.length === 0 && <p className="text-sm text-muted-foreground self-center mx-auto">Añade etiquetas para mejorar el descubrimiento.</p>}
            </div>
          </div>

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
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}