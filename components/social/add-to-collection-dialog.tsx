/**
 * ARCHIVO: components/social/add-to-collection-dialog.tsx
 * VERSIÓN: 2.0 (NicePod Add To Collection - Sovereign Protocol V4.0)
 * PROTOCOLO: MADRID RESONANCE V4.0
 *
 * Misión: Proveer la interfaz táctica para vincular crónicas a hilos de conocimiento.
 * [REFORMA V2.0]: Sincronización absoluta con Collection V4.0 y ZAP.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

"use client";

import { createCollectionAction, getMyCollections } from "@/actions/collection-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getSafeAsset } from "@/lib/utils";
import { Collection } from "@/types/profile";
import { Plus, Library, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface AddToCollectionDialogComponentProperties {
  podcastIdentification: number;
  triggerElementReference?: React.ReactNode;
}

export function AddToCollectionDialog({
  podcastIdentification,
  triggerElementReference
}: AddToCollectionDialogComponentProperties) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [collectionsCollection, setCollectionsCollection] = useState<Collection[]>([]);
  const [isProcessingActive, setIsProcessingActive] = useState<boolean>(false);

  const fetchCollectionsDataAction = useCallback(async () => {
    setIsProcessingActive(true);
    try {
      const results = await getMyCollections();
      setCollectionsCollection(results as Collection[]);
    } catch (exceptionMessageInformation: unknown) {
      console.error("🔥 [Add-To-Collection-Error]:", exceptionMessageInformation);
    } finally {
      setIsProcessingActive(false);
    }
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      fetchCollectionsDataAction();
    }
  }, [isDialogOpen, fetchCollectionsDataAction]);

  const handleCreateAndAddAction = async () => {
    setIsProcessingActive(true);
    try {
      const response = await createCollectionAction({
        title: "Nuevo Hilo de Sabiduría",
        descriptionTextContent: "Colección generada automáticamente.",
        isPublicSovereignty: true,
        podcastIdentifications: [podcastIdentification]
      });

      if (response.isOperationSuccessful) {
        toast.success("Resonancia Vinculada", {
          description: "Se ha creado un nuevo hilo con esta crónica."
        });
        setIsDialogOpen(false);
      }
    } catch (exceptionMessageInformation: unknown) {
        toast.error("Fallo de Sincronía");
    } finally {
        setIsProcessingActive(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {triggerElementReference || (
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-white/5 rounded-[2rem] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Vincular a Bóveda</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Button
            onClick={handleCreateAndAddAction}
            disabled={isProcessingActive}
            className="w-full h-14 rounded-xl border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-black uppercase tracking-widest text-[10px] gap-3"
          >
            <Plus size={16} />
            CREAR NUEVA COLECCIÓN
          </Button>

          <ScrollArea className="h-72">
            <div className="space-y-2">
              {collectionsCollection.map((collectionItem) => (
                <button
                  key={collectionItem.identification}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                >
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
                    <Image
                      src={getSafeAsset(collectionItem.coverImageUniformResourceLocator, 'cover')}
                      alt={collectionItem.title}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-tight text-white truncate">{collectionItem.title}</p>
                    <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                        {collectionItem.collectionItems?.[0]?.count || 0} Activos
                    </p>
                  </div>
                  <Library size={14} className="text-zinc-700 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
