// components/leave-testimonial-dialog.tsx
// VERSIÓN FINAL COMPLETA DEL MODAL DE CREACIÓN DE TESTIMONIOS

"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface LeaveTestimonialDialogProps {
  profileId: string;
  onTestimonialAdded: () => void;
}

export function LeaveTestimonialDialog({ profileId, onTestimonialAdded }: LeaveTestimonialDialogProps) {
  const { user, supabase } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !supabase) {
      toast({ title: "Debes iniciar sesión para dejar un testimonio.", variant: "destructive" });
      return;
    }
    if (comment.trim().length < 10) {
      toast({ title: "Tu testimonio es muy corto.", description: "Por favor, escribe al menos 10 caracteres.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from('profile_testimonials')
      .insert({
        profile_user_id: profileId,
        author_user_id: user.id,
        comment_text: comment,
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "¡Gracias!", description: "Tu testimonio ha sido enviado para su aprobación." });
      onTestimonialAdded();
      setComment("");
      setIsOpen(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Dejar un Testimonio</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dejar un Testimonio</DialogTitle>
          <DialogDescription>
            Comparte tu experiencia o valida las habilidades de este creador. Tu comentario será visible una vez que sea aprobado.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe tu testimonio aquí..."
          maxLength={500}
          className="min-h-[140px]"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar para Aprobación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}