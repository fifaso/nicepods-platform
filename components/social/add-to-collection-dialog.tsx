"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Bookmark, Check, Loader2, Lock, Globe } from "lucide-react";
import { toast } from "sonner";
import { getMyCollections, createCollectionAction, togglePinToCollection } from "@/actions/collection-actions";
import { cn } from "@/lib/utils";

interface AddToCollectionDialogProps {
  podId: number;
  trigger?: React.ReactNode; // Botón personalizado opcional
}

export function AddToCollectionDialog({ podId, trigger }: AddToCollectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para crear nueva colección "Inline"
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // Cargar colecciones al abrir
  useEffect(() => {
    if (open) {
      setLoading(true);
      getMyCollections().then((data) => {
        setCollections(data);
        setLoading(false);
      });
    }
  }, [open]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const res = await createCollectionAction({ title: newTitle, is_public: true });
    
    if (res.success) {
      toast.success("Colección creada");
      setNewTitle("");
      setIsCreating(false);
      // Recargar lista
      const updated = await getMyCollections();
      setCollections(updated);
    } else {
      toast.error(res.message);
    }
  };

  const handleToggle = async (collectionId: string) => {
    // Optimistic UI: Feedback inmediato podría ir aquí, 
    // pero por simplicidad esperaremos la confirmación rápida del server action
    const res = await togglePinToCollection(collectionId, podId);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white/70 hover:text-white">
            <Bookmark size={20} />
          </Button>
        )}
      </DialogTrigger>
      
      {/* Aurora Glass Modal */}
      <DialogContent className="bg-black/80 backdrop-blur-xl border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Guardar en Colección</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleToggle(col.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-white/5", !col.is_public && "border-amber-500/20")}>
                      {col.is_public ? <Globe size={16} className="text-violet-400"/> : <Lock size={16} className="text-amber-400"/>}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{col.title}</p>
                      <p className="text-[10px] text-muted-foreground">{col.collection_items[0]?.count || 0} audios</p>
                    </div>
                  </div>
                  {/* Aquí podríamos checkear si ya está guardado si tuviéramos ese dato en la query inicial */}
                  <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              
              {collections.length === 0 && !isCreating && (
                <p className="text-center text-sm text-muted-foreground py-4">No tienes colecciones aún.</p>
              )}
            </div>
          )}

          {/* Inline Creation Form */}
          {isCreating ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <Input 
                placeholder="Nombre de nueva colección..." 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-white/5 border-white/10"
                autoFocus
              />
              <Button size="icon" onClick={handleCreate} disabled={!newTitle}>
                <Check size={16} />
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full border-dashed border-white/20 hover:bg-white/5 hover:border-violet-500/50"
              onClick={() => setIsCreating(true)}
            >
              <Plus size={16} className="mr-2" /> Nueva Colección
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}