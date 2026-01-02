// components/social/create-collection-modal.tsx
// VERSIÓN: 1.1 (Production Ready: Smart Filtered Selector)

"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Check, Sparkles, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { createCollectionAction } from "@/actions/collection-actions";
import { cn } from "@/lib/utils";

interface PodcastSummary {
    id: number;
    title: string;
    cover_image_url: string | null;
}

export function CreateCollectionModal({ finishedPodcasts }: { finishedPodcasts: PodcastSummary[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", selectedIds: [] as number[] });

  const handleCreate = async () => {
    setIsSubmitting(true);
    const res = await createCollectionAction(form);
    setIsSubmitting(false);
    if (res.success) {
      setIsOpen(false);
      setStep(1);
      setForm({ title: "", description: "", selectedIds: [] });
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const togglePod = (id: number) => {
    setForm(p => ({ ...p, selectedIds: p.selectedIds.includes(id) ? p.selectedIds.filter(i => i !== id) : [...p.selectedIds, id] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all rounded-xl">
          <Plus size={16} /> Nueva
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-black/90 backdrop-blur-2xl border-white/10 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black uppercase tracking-tighter">
            <Sparkles className="text-violet-400 h-6 w-6" /> {step === 1 ? "Concepto" : "Tu Bóveda"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Título</label>
              <Input placeholder="Ej: Mente Estoica" className="bg-white/5 border-white/10 h-14 font-bold" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Descripción de Valor</label>
              <textarea placeholder="¿Cómo ayuda este hilo a otros?" className="w-full min-h-[120px] bg-white/5 border-white/10 rounded-2xl p-4 text-sm resize-none focus:ring-1 focus:ring-primary" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <Button disabled={form.title.length < 3} className="w-full h-14 font-black text-lg" onClick={() => setStep(2)}>ELEGIR AUDIOS</Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <ScrollArea className="h-[350px] pr-4">
              <div className="grid grid-cols-1 gap-2">
                {finishedPodcasts.map((pod) => (
                  <button key={pod.id} onClick={() => togglePod(pod.id)} className={cn("flex items-center gap-4 p-3 rounded-2xl border transition-all text-left", form.selectedIds.includes(pod.id) ? "bg-primary/20 border-primary shadow-lg shadow-primary/10" : "bg-white/5 border-white/5 hover:bg-white/10")}>
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      {pod.cover_image_url && <img src={pod.cover_image_url} className="object-cover w-full h-full" alt="" />}
                      {form.selectedIds.includes(pod.id) && <div className="absolute inset-0 bg-primary/60 flex items-center justify-center"><Check size={24} className="text-white" /></div>}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-sm truncate">{pod.title}</p>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Escuchado 100%</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-4 pt-4">
                <Button variant="ghost" className="flex-1 h-12" onClick={() => setStep(1)}>ATRÁS</Button>
                <Button disabled={form.selectedIds.length === 0 || isSubmitting} className="flex-[2] h-12 font-black" onClick={handleCreate}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "CREAR HILO PÚBLICO"}
                </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}