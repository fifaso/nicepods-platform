// components/profile/private/identity-settings-form.tsx
// VERSIÓN: 1.2 (NicePod Identity Forge - Shadowing Resolution Standard)
// Misión: Gestionar la actualización de los metadatos del curador con aislamiento de estado.
// [RESOLUCIÓN]: Fix definitivo de colisión de nombres (LockIcon) para éxito del Build Shield.

"use client";

import {
  AlertCircle,
  AtSign,
  FileText,
  Loader2,
  Lock as LockIcon // [FIX]: Renombrado para evitar conflicto con la interfaz global del navegador.
  ,
  Save,
  User
} from "lucide-react";
import { useCallback, useState, useTransition } from "react";

// --- INFRAESTRUCTURA UI (NicePod Design System) ---
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- LÓGICA DE NEGOCIO Y CONTRATOS ---
import { updateProfile } from "@/actions/profile-actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: IdentitySettingsFormProps
 * Recibe el perfil inicial del orquestador para poblar la memoria local del formulario.
 */
interface IdentitySettingsFormProps {
  profile: ProfileData;
}

/**
 * IdentitySettingsForm: El motor de sintonía de la identidad digital del curador.
 */
export function IdentitySettingsForm({ profile }: IdentitySettingsFormProps) {
  const { toast } = useToast();

  /**
   * useTransition: Protocolo de concurrencia de React.
   * Permite que la UI siga siendo interactiva mientras el Server Action se procesa en el servidor.
   */
  const [isPending, startTransition] = useTransition();

  // --- ESTADO LOCAL DEL FORMULARIO ---
  // Aislamos los cambios de texto para evitar re-renderizados innecesarios en el Dashboard.
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    bio: profile.bio || "",
    username: profile.username || ""
  });

  /**
   * handleUpdate: Persistencia soberana mediante Server Actions.
   */
  const handleUpdate = useCallback(() => {
    // Validación de Rigor: El nombre es la semilla de la identidad.
    if (formData.full_name.trim().length < 3) {
      toast({
        title: "Integridad de Identidad",
        description: "El nombre del curador debe contener al menos 3 caracteres.",
        variant: "destructive"
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateProfile({
          display_name: formData.full_name,
          bio: formData.bio
        });

        if (result.success) {
          toast({
            title: "ADN Digital Sincronizado",
            description: "Tu perfil ha sido actualizado con éxito en la red.",
          });
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        console.error("🔥 [Profile-Update-Error]:", error.message);
        toast({
          title: "Fallo de Sincronía",
          description: error.message || "No se pudo establecer conexión con la base de datos.",
          variant: "destructive"
        });
      }
    });
  }, [formData, toast]);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">

      <CardContent className="p-6 md:p-12 space-y-12">

        {/* BLOQUE I: IDENTIFICADORES DE RED */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* CAMPO: NOMBRE DE CURADOR */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
              <User size={12} className="text-primary/60" />
              Nombre de Curador
            </Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Ej: Fran Fuenzalida"
              className="bg-zinc-900/50 border-white/10 h-16 rounded-2xl font-bold text-lg focus:ring-primary shadow-inner text-white"
              disabled={isPending}
            />
          </div>

          {/* CAMPO: IDENTIFICADOR SOBERANO (Bloqueado)
              El 'username' es el ancla del Knowledge Vault y no se puede alterar.
          */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
              <AtSign size={12} className="opacity-40" />
              Handle de Bóveda
            </Label>
            <div className="relative">
              <Input
                value={formData.username || ""}
                disabled
                className="bg-black/30 border-white/5 h-16 rounded-2xl font-mono text-zinc-600 text-base cursor-not-allowed opacity-80"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20">
                <LockIcon size={16} />
              </div>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground/30 flex items-center gap-2 px-1">
              <AlertCircle size={10} /> El handle está anclado a tu semilla de registro.
            </p>
          </div>

        </div>

        {/* BLOQUE II: BIOGRAFÍA DE SABIDURÍA (Narrativa Técnica) */}
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
            <FileText size={12} className="text-primary/60" />
            Biografía de Sabiduría
          </Label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={6}
            placeholder="Describe tu enfoque intelectual, tus áreas de investigación y qué buscas aportar a la memoria colectiva de la ciudad..."
            disabled={isPending}
            className={cn(
              "w-full bg-zinc-900/50 border border-white/10 rounded-[2.5rem] p-8",
              "text-base font-medium text-white leading-relaxed outline-none",
              "focus:ring-2 focus:ring-primary/20 transition-all shadow-inner resize-none",
              "custom-scrollbar placeholder:text-zinc-700"
            )}
          />
          <div className="flex justify-end px-3">
            <span className={cn(
              "text-[9px] font-black uppercase tracking-[0.2em] transition-colors",
              formData.bio.length > 450 ? "text-amber-500" : "text-zinc-600"
            )}>
              {formData.bio.length} / 500 Caracteres
            </span>
          </div>
        </div>

      </CardContent>

      {/* FOOTER: GESTIÓN DE PERSISTENCIA ATÓMICA */}
      <CardFooter className="p-6 md:p-12 pt-0 bg-white/[0.01]">
        <Button
          onClick={handleUpdate}
          disabled={isPending}
          className="w-full h-18 md:h-24 font-black text-xl md:text-2xl tracking-tighter uppercase rounded-[2.5rem] shadow-2xl group overflow-hidden relative"
        >
          {/* Capa Aurora de Animación */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-primary via-indigo-600 to-primary transition-opacity duration-700",
            isPending ? "opacity-40" : "opacity-90 group-hover:opacity-100 animate-aurora"
          )} />

          <span className="relative z-10 flex items-center justify-center gap-5">
            {isPending ? (
              <>
                <Loader2 className="animate-spin h-7 w-7 text-white/80" />
                <span className="animate-pulse tracking-widest text-white/90">Sincronizando...</span>
              </>
            ) : (
              <>
                <Save className="h-6 w-6 group-hover:scale-110 transition-transform" />
                Actualizar ADN Digital
              </>
            )}
          </span>
        </Button>
      </CardFooter>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este componente es el responsable de la 'Higiene de Datos' del perfil. 
 * El uso del alias 'LockIcon' es la solución quirúrgica para evitar 
 * que TypeScript confunda el icono con la API nativa de WebLocks. 
 * He optimizado el textarea para usar una configuración de radio de borde 
 * de [2.5rem], manteniendo la coherencia con los contenedores maestros 
 * del sistema Aurora.
 */