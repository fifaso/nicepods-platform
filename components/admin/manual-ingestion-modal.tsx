// components/admin/manual-ingestion-modal.tsx
// VERSIÓN: 1.0 (NKV Ingestor - Direct Neural Feeding)

"use client";

import { useState, useTransition } from "react";
import { injectManualKnowledge } from "@/actions/vault-actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BrainCircuit, Loader2, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

export function ManualIngestionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({ title: "", text: "", url: "" });

    const handleSubmit = () => {
        if (!form.title || !form.text) return;

        startTransition(async () => {
            try {
                const res = await injectManualKnowledge(form);
                if (res.success) {
                    toast.success("Conocimiento inyectado exitosamente.");
                    setForm({ title: "", text: "", url: "" });
                    onClose();
                }
            } catch (e) {
                toast.error("Fallo en la refinería neuronal.");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-black/90 backdrop-blur-2xl border-white/10 text-white sm:max-w-2xl rounded-[2.5rem] shadow-2xl p-0 overflow-hidden">
                <div className="p-8 md:p-12 space-y-8">
                    <DialogHeader>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                                <BrainCircuit size={24} />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Inyectar Sabiduría</DialogTitle>
                                <DialogDescription className="text-zinc-500 font-medium">Alimenta el Knowledge Vault de NicePod directamente.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Título de la Fuente</Label>
                            <Input
                                placeholder="Ej: Principios de la Entropía Social"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className="bg-white/5 border-white/10 h-14 rounded-2xl font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Cuerpo del Conocimiento (Texto plano)</Label>
                            <Textarea
                                placeholder="Pega aquí el contenido extenso..."
                                value={form.text}
                                onChange={e => setForm({ ...form, text: e.target.value })}
                                className="bg-white/5 border-white/10 min-h-[250px] rounded-3xl p-6 text-sm leading-relaxed custom-scrollbar resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">URL de Referencia (Opcional)</Label>
                            <Input
                                placeholder="https://..."
                                value={form.url}
                                onChange={e => setForm({ ...form, url: e.target.value })}
                                className="bg-white/5 border-white/10 h-12 rounded-xl text-zinc-400 font-mono"
                            />
                        </div>
                    </div>

                    <footer className="pt-4 flex flex-col gap-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending || !form.title || form.text.length < 50}
                            className="h-16 w-full bg-primary text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/20 group"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                            INICIAR REFINERÍA NEURONAL
                        </Button>
                        <p className="text-[9px] text-center text-zinc-600 font-bold uppercase tracking-widest">
                            Nota: El proceso de vectorización asíncrona puede tomar hasta 30 segundos.
                        </p>
                    </footer>
                </div>
            </DialogContent>
        </Dialog>
    );
}