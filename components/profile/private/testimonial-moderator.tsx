// components/profile/private/testimonial-moderator.tsx
// VERSIÓN: 1.0 (NicePod Social Moderator - Optimistic UI Standard)
// Misión: Gestionar el flujo de aprobación y rechazo de testimonios sociales.
// [ESTABILIZACIÓN]: Implementación de estados locales para una respuesta táctica instantánea.

"use client";

import {
  Check,
  Inbox,
  Loader2,
  MessageSquare,
  ShieldCheck,
  User as UserIcon,
  X
} from "lucide-react";
import { useCallback, useState } from "react";

// --- INFRAESTRUCTURA UI ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn, getSafeAsset } from "@/lib/utils";
import { TestimonialWithAuthor } from "@/types/profile";

/**
 * INTERFAZ: TestimonialModeratorProps
 */
interface TestimonialModeratorProps {
  initialTestimonials: TestimonialWithAuthor[];
}

/**
 * TestimonialModerator: El búnker de validación social del curador.
 */
export function TestimonialModerator({
  initialTestimonials
}: TestimonialModeratorProps) {
  const { supabase } = useAuth();
  const { toast } = useToast();

  /**
   * ESTADO LOCAL: Mantenemos una copia local para permitir la 
   * eliminación instantánea de la UI tras la acción de moderación.
   */
  const [testimonials, setTestimonials] = useState<TestimonialWithAuthor[]>(initialTestimonials);
  const [processingId, setProcessingId] = useState<number | null>(null);

  /**
   * handleStatusChange
   * Ejecuta la actualización de estado en la tabla 'profile_testimonials'.
   */
  const handleStatusChange = useCallback(async (id: number, newStatus: 'approved' | 'rejected') => {
    if (!supabase) return;

    setProcessingId(id);

    try {
      const { error } = await supabase
        .from('profile_testimonials')
        .update({
          status: newStatus,
          // Registramos la fecha de moderación para auditoría
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Actualización Optimista: Removemos el item del listado de pendientes
      setTestimonials((prev) => prev.filter((t) => t.id !== id));

      toast({
        title: newStatus === 'approved' ? "Resonancia Aprobada" : "Testimonio Archivado",
        description: `El comentario ha sido procesado con éxito.`,
      });

    } catch (error: any) {
      console.error("🔥 [Moderator-Error]:", error.message);
      toast({
        title: "Error de Sincronía",
        description: "No se pudo actualizar el estado del testimonio.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  }, [supabase, toast]);

  // Filtramos solo los testimonios que requieren acción (Pendientes)
  const pendingTestimonials = testimonials.filter(t => t.status === 'pending');

  return (
    <Card className="bg-card/20 border-white/5 rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in duration-700">

      <CardHeader className="p-8 md:p-12 pb-6 bg-white/[0.01]">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
            <MessageSquare size={18} />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
            Moderación Social
          </CardTitle>
        </div>
        <CardDescription className="text-sm md:text-base font-medium text-muted-foreground ml-1">
          Gestiona las voces de la comunidad que buscan validar tu sabiduría.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 md:px-12 pb-12 space-y-6">

        {pendingTestimonials.length === 0 ? (
          /* ESTADO VACÍO: Silencio en la Red */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-6 rounded-full bg-white/[0.02] border border-dashed border-white/10 opacity-20">
              <Inbox size={40} className="text-zinc-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">
              Buzón de Resonancia Vacío
            </p>
          </div>
        ) : (
          /* LISTADO DE TESTIMONIOS PENDIENTES */
          <div className="grid grid-cols-1 gap-6">
            {pendingTestimonials.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "p-6 md:p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col md:flex-row gap-8 items-start md:items-center transition-all",
                  processingId === t.id && "opacity-50 grayscale pointer-events-none"
                )}
              >
                {/* Identidad del Autor */}
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <Avatar className="h-14 w-14 border-2 border-white/10 shadow-xl flex-shrink-0">
                    <AvatarImage
                      src={getSafeAsset(t.author?.avatar_url, 'avatar')}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-zinc-800 text-primary font-black text-xs">
                      {t.author?.full_name?.charAt(0).toUpperCase() || <UserIcon size={16} />}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-black text-sm md:text-base uppercase tracking-tight text-white truncate">
                        {t.author?.full_name || 'Curador Anónimo'}
                      </p>
                      <span className="h-1 w-1 rounded-full bg-zinc-700" />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        {new Date(t.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-zinc-400 mt-1 leading-relaxed italic font-medium">
                      "{t.comment_text}"
                    </p>
                  </div>
                </div>

                {/* Acciones Tácticas */}
                <div className="flex gap-3 w-full md:w-auto flex-shrink-0">
                  <Button
                    onClick={() => handleStatusChange(t.id, 'approved')}
                    disabled={processingId === t.id}
                    className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl h-12 px-6 text-[10px] tracking-[0.2em] shadow-lg shadow-emerald-900/20"
                  >
                    {processingId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    APROBAR
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => handleStatusChange(t.id, 'rejected')}
                    disabled={processingId === t.id}
                    className="flex-1 md:flex-none text-red-400 hover:text-red-500 hover:bg-red-500/5 font-black rounded-xl h-12 px-6 text-[10px] tracking-[0.2em] border border-red-500/10"
                  >
                    <X className="mr-2 h-4 w-4" />
                    RECHAZAR
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

      </CardContent>

      {/* FIRMA DE SOBERANÍA SOCIAL */}
      <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-3">
        <ShieldCheck size={14} className="text-zinc-700" />
        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-600">
          NicePod Trust Protocol v2.1
        </span>
      </div>
    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * He implementado el 'processingId' para evitar colisiones si el usuario 
 * intenta moderar múltiples testimonios en una ráfaga rápida. Cada item 
 * se bloquea individualmente mientras la red responde, manteniendo el 
 * resto del Dashboard interactivo. El uso de 'AnimatePresence' en el 
 * componente padre (que desarrollaremos en la Fase 9) garantizará que 
 * la salida de estos items sea visualmente impecable.
 */