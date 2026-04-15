/**
 * ARCHIVO: components/social/create-collection-modal.tsx
 * VERSIÓN: 3.0 (NicePod Social Collection Architect - Sovereign Protocol V4.0)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISIÓN: Gestionar la creación de hilos de conocimiento con integridad nominal y ZAP.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

"use client";

import { createCollectionAction } from "@/actions/collection-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getSafeAsset } from "@/lib/utils";
import {
  BookOpen,
  Check,
  Info,
  Loader2,
  Plus,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from 'react';
import { toast } from "sonner";

/**
 * PodcastSummary: Contrato de datos para los audios disponibles para coleccionar.
 */
interface PodcastSummary {
  identification: number;
  title: string;
  coverImageUniformResourceLocator: string | null;
}

/**
 * CreateCollectionModal: Terminal de forja para nuevos hilos públicos/privados.
 */
interface CreateCollectionModalComponentProperties {
  finishedPodcasts: PodcastSummary[];
}

export function CreateCollectionModal({
  finishedPodcasts
}: CreateCollectionModalComponentProperties) {
  // --- ESTADOS DE CONTROL ---
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- ESTADO DEL FORMULARIO ---
  const [collectionCreationForm, setCollectionCreationForm] = useState({
    title: "",
    descriptionTextContent: "",
    selectedPodcastsIdentificationList: [] as number[]
  });

  /**
   * handleCollectionCreationAction
   * Ejecuta la Server Action para persistir la colección en la base de datos.
   */
  const handleCollectionCreationAction = useCallback(async () => {
    if (collectionCreationForm.selectedPodcastsIdentificationList.length === 0) {
      toast.error("Selecciona al menos un podcast para tu hilo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createCollectionAction({
        title: collectionCreationForm.title,
        descriptionTextContent: collectionCreationForm.descriptionTextContent,
        isPublicSovereignty: true, // Default sovereignty
        podcastIdentifications: collectionCreationForm.selectedPodcastsIdentificationList
      });

      if (response.isOperationSuccessful) {
        setIsOpen(false);
        setStep(1);
        setCollectionCreationForm({ title: "", descriptionTextContent: "", selectedPodcastsIdentificationList: [] });
        toast.success(response.responseStatusMessage);
      } else {
        toast.error(response.responseStatusMessage);
      }
    } catch (exceptionMessageInformation: unknown) {
      const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
      console.error("🔥 [Collection-Modal-Error]:", errorMessage);
      toast.error("Error crítico al crear la colección.");
    } finally {
      setIsSubmitting(false);
    }
  }, [collectionCreationForm]);

  /**
   * togglePodcastSelectionAction
   */
  const togglePodcastSelectionAction = useCallback((podcastIdentification: number) => {
    setCollectionCreationForm((previousForm) => {
      const isSelected = previousForm.selectedPodcastsIdentificationList.includes(podcastIdentification);
      const newSelectedPodcastsIdentificationList = isSelected
        ? previousForm.selectedPodcastsIdentificationList.filter((existingIdentification) => existingIdentification !== podcastIdentification)
        : [...previousForm.selectedPodcastsIdentificationList, podcastIdentification];

      return {
        ...previousForm,
        selectedPodcastsIdentificationList: newSelectedPodcastsIdentificationList
      };
    });
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => {
      setIsOpen(openStatus);
      if (!openStatus) {
        setStep(1);
      }
    }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all rounded-xl h-10 px-4">
          <Plus size={16} className="text-primary" />
          <span className="font-black text-[10px] uppercase tracking-widest">Nueva Colección</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-zinc-950/95 backdrop-blur-2xl border-white/10 text-white sm:max-w-xl p-0 overflow-hidden rounded-[2.5rem]">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="flex items-center gap-3 text-3xl font-black uppercase tracking-tighter italic">
            <Sparkles className="text-primary h-7 w-7 animate-pulse" />
            {step === 1 ? "Concepto del Hilo" : "Tu Bóveda"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="p-8 pt-2 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Título de la Colección</label>
              <Input
                placeholder="Ej: Crónicas de la Gran Vía"
                className="bg-white/5 border-white/10 h-14 font-bold text-lg rounded-2xl focus:ring-primary/20"
                value={collectionCreationForm.title}
                onChange={(event) => setCollectionCreationForm({ ...collectionCreationForm, title: event.target.value })}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Descripción de Valor</label>
                <span className="text-[9px] font-bold text-zinc-600 uppercase">Visible para la comunidad</span>
              </div>
              <textarea
                placeholder="¿Qué hilo conductor une estos audios? Explica por qué esta colección es valiosa..."
                className="w-full min-h-[140px] bg-white/5 border-white/10 rounded-2xl p-5 text-sm font-medium resize-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={collectionCreationForm.descriptionTextContent}
                onChange={(event) => setCollectionCreationForm({ ...collectionCreationForm, descriptionTextContent: event.target.value })}
              />
            </div>

            <Button
              disabled={collectionCreationForm.title.length < 3 || collectionCreationForm.descriptionTextContent.length < 10}
              className="w-full h-16 font-black text-lg uppercase tracking-tighter rounded-2xl shadow-xl shadow-primary/10 transition-transform active:scale-95"
              onClick={() => setStep(2)}
            >
              SIGUIENTE: ELEGIR CONTENIDO
            </Button>
          </div>
        ) : (
          <div className="p-8 pt-2 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-2 px-1 text-zinc-500">
              <Info size={14} />
              <p className="text-[10px] font-bold uppercase tracking-widest">Selecciona los podcasts que formarán este hilo</p>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 gap-3 pb-4">
                {finishedPodcasts.length === 0 ? (
                  <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                    <BookOpen className="h-10 w-10 mx-auto text-zinc-700 mb-4" />
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No hay podcasts listos aún</p>
                  </div>
                ) : (
                  finishedPodcasts.map((podcastItem) => {
                    const isSelected = collectionCreationForm.selectedPodcastsIdentificationList.includes(podcastItem.identification);
                    return (
                      <button
                        key={podcastItem.identification}
                        type="button"
                        onClick={() => togglePodcastSelectionAction(podcastItem.identification)}
                        className={cn(
                          "flex items-center gap-5 p-4 rounded-3xl border transition-all text-left group relative",
                          isSelected
                            ? "bg-primary/10 border-primary shadow-lg"
                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-zinc-800 flex-shrink-0 shadow-inner">
                          <Image
                            src={getSafeAsset(podcastItem.coverImageUniformResourceLocator, 'cover')}
                            alt={podcastItem.title}
                            fill
                            sizes="64px"
                            className={cn(
                              "object-cover transition-transform duration-700",
                              isSelected ? "scale-110 blur-[2px] opacity-40" : "group-hover:scale-110"
                            )}
                          />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-50">
                              <Check size={32} className="text-white drop-shadow-md" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm uppercase tracking-tight truncate leading-tight mb-1">{podcastItem.title}</p>
                          <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] opacity-60">Status: Verificado</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-4 pt-2">
              <Button
                variant="ghost"
                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5"
                onClick={() => setStep(1)}
              >
                ATRÁS
              </Button>
              <Button
                disabled={collectionCreationForm.selectedPodcastsIdentificationList.length === 0 || isSubmitting}
                className="flex-[2] h-14 rounded-2xl font-black text-lg uppercase tracking-tighter shadow-2xl shadow-primary/20 group"
                onClick={handleCollectionCreationAction}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                    <span>CREAR HILO PÚBLICO</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
