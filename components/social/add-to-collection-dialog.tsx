// components/social/add-to-collection-dialog.tsx
// VERSIÓN: 2.1 (Resonance Master - Direct DB Integration - Zero Errors)
// Misión: Gestionar colecciones con lógica autónoma para evitar fallos de importación.

"use client";

import {
  createCollectionAction,
  getMyCollections
} from "@/actions/collection-actions"; // [FIX]: Eliminada la función inexistente
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  Check,
  FolderPlus,
  Globe,
  Loader2,
  Lock,
  Plus,
  X // [FIX]: Importado icono X faltante
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Collection {
  id: string;
  title: string;
  is_public: boolean;
  collection_items: { count: number }[];
}

interface AddToCollectionDialogProps {
  podId: number;
  trigger?: React.ReactNode;
}

export function AddToCollectionDialog({ podId, trigger }: AddToCollectionDialogProps) {
  const { supabase, user } = useAuth(); // Usamos supabase para lógica directa
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingToggle, setIsProcessingToggle] = useState<string | null>(null);

  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState("");

  const loadCollections = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyCollections();
      setCollections(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadCollections();
    }
  }, [open, loadCollections]);

  const handleCreateCollection = async () => {
    if (!newCollectionTitle.trim()) return;
    try {
      const res = await createCollectionAction({
        title: newCollectionTitle,
        is_public: true
      });
      if (res.success) {
        toast.success("Bóveda creada.");
        setNewCollectionTitle("");
        setIsCreatingMode(false);
        await loadCollections();
      }
    } catch (error) {
      toast.error("Error al crear.");
    }
  };

  /**
   * handleTogglePodcast [LOGICA DIRECTA]
   * Como la acción no existe, implementamos la lógica directamente vía Supabase.
   * Verifica si existe el vínculo; si existe lo borra, si no lo crea.
   */
  const handleTogglePodcast = async (collectionId: string) => {
    if (!user || !supabase) return;
    setIsProcessingToggle(collectionId);

    try {
      // 1. Verificar si ya está en la colección
      const { data: existing } = await supabase
        .from('collection_items')
        .select('*')
        .match({ collection_id: collectionId, pod_id: podId })
        .single();

      if (existing) {
        // 2. Si existe, lo quitamos (Unpin)
        await supabase
          .from('collection_items')
          .delete()
          .match({ collection_id: collectionId, pod_id: podId });
        toast.success("Eliminado de la colección.");
      } else {
        // 3. Si no existe, lo añadimos (Pin)
        await supabase
          .from('collection_items')
          .insert({ collection_id: collectionId, pod_id: podId });
        toast.success("Guardado en colección.");
      }

      await loadCollections(); // Refrescar contadores
    } catch (error) {
      toast.error("Error de sincronización.");
    } finally {
      setIsProcessingToggle(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setIsCreatingMode(false);
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="hover:bg-primary/10 text-white/50 hover:text-primary rounded-full transition-all">
            <Bookmark size={20} />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-zinc-950/90 backdrop-blur-3xl border-white/10 text-white sm:max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

        <DialogHeader className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <FolderPlus size={18} className="text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Organizar</span>
          </div>
          <DialogTitle className="text-2xl font-black tracking-tighter uppercase italic">
            Tu Bóveda <span className="text-primary">Personal</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {collections.map((col) => (
                <button
                  key={col.id}
                  disabled={isProcessingToggle !== null}
                  onClick={() => handleTogglePodcast(col.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", col.is_public ? "bg-violet-500/10 border-violet-500/20" : "bg-amber-500/10 border-amber-500/20")}>
                      {col.is_public ? <Globe size={20} className="text-violet-400" /> : <Lock size={20} className="text-amber-400" />}
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight text-zinc-100">{col.title}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{col.collection_items[0]?.count || 0} Cápsulas</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8">
                    {isProcessingToggle === col.id ? <Loader2 className="h-4 w-4 text-primary animate-spin" /> : <Plus size={18} className="text-zinc-600 group-hover:text-primary transition-all opacity-0 group-hover:opacity-100" />}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-white/5">
            {isCreatingMode ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nombre de bóveda..."
                  value={newCollectionTitle}
                  onChange={(e) => setNewCollectionTitle(e.target.value)}
                  className="bg-white/5 border-white/10 h-12 rounded-xl"
                  autoFocus
                />
                <Button size="icon" onClick={handleCreateCollection} className="h-12 w-12 rounded-xl bg-primary"><Check size={18} /></Button>
                <Button variant="ghost" size="icon" onClick={() => setIsCreatingMode(false)} className="h-12 w-12 rounded-xl text-zinc-500"><X size={18} /></Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full h-14 rounded-2xl border border-dashed border-white/10 text-zinc-400 font-black uppercase text-[10px] tracking-widest hover:bg-white/5"
                onClick={() => setIsCreatingMode(true)}
              >
                <Plus size={16} className="mr-3 text-primary" /> Nueva Bóveda
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}