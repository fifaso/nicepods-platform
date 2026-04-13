// components/profile/private/identity-settings-form.tsx
//VERSIÓN: 3.0 (NicePod Identity Forge - Industrial Integrity Standard) 

"use client";

import {
  AlertCircle,
  AtSign,
  FileText,
  Globe,
  Loader2,
  Lock as LockIcon,
  Save,
  User,
  Zap
} from "lucide-react";
import { useCallback, useState, useTransition } from "react";

// --- INFRAESTRUCTURA UI (NicePod Industrial Design System) ---
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// --- LÓGICA DE NEGOCIO Y CONTRATOS DE BÓVEDA ---
import { updateProfile } from "@/actions/profile-actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: IdentitySettingsFormProps
 * Recibe el perfil inicial desde el orquestador SSR para poblar la memoria local del formulario.
 */
interface IdentitySettingsFormProps {
  profile: ProfileData;
}

/**
 * COMPONENTE: IdentitySettingsForm
 * El motor de sintonía de la identidad digital del curador.
 * 
 * Responsabilidades:
 * 1. Gestionar el estado local de los metadatos del perfil (Aislamiento de Estado).
 * 2. Validar las reglas de integridad antes de la persistencia.
 * 3. Orquestar la sincronización con PostgreSQL mediante Server Actions concurrentes.
 */
export function IdentitySettingsForm({ profile }: IdentitySettingsFormProps) {
  const { toast } = useToast();

  /**
   * useTransition: Protocolo de Concurrencia NicePod.
   * Mantiene la UI reactiva mientras el proceso de persistencia viaja por el túnel SSR.
   */
  const [isPending, startTransition] = useTransition();

  // --- ESTADO LOCAL: Memoria de Identidad ---
  // Aislamos el estado para prevenir re-renderizados costosos en el Dashboard global.
  const [formData, setFormData] = useState({
    fullName: profile.full_name || "",
    username: profile.username || "",
    bio: profile.bio || "",
    bioShort: profile.bio_short || "",
    websiteUniformResourceLocator: profile.website_url || ""
  });

  /**
   * handleUpdate: Protocolo de Sincronización de ADN Digital.
   * Ejecuta la validación y el despacho hacia la base de datos.
   */
  const handleUpdate = useCallback(() => {
    // VALIDACIÓN DE RIGOR: El Nombre Completo es el ancla de autoridad.
    if (formData.fullName.trim().length < 2) {
      toast({
        title: "Integridad de Identidad",
        description: "El nombre del curador debe contener al menos 2 caracteres.",
        variant: "destructive"
      });
      return;
    }

    startTransition(async () => {
      try {
        // [AUDITORÍA]: Sincronización exacta con el esquema de base de datos V2.5.
        const result = await updateProfile({
          username: formData.username, // Se envía para validación aunque sea de lectura.
          fullName: formData.fullName,
          bio: formData.bio,
          bioShort: formData.bioShort,
          websiteUniformResourceLocator: formData.websiteUniformResourceLocator,
          avatarUniformResourceLocator: profile.avatar_url // Mantenemos el actual en este flujo.
        });

        if (result.success) {
          toast({
            title: "ADN Digital Sincronizado",
            description: "Tu identidad ha sido actualizada con éxito en la Bóveda.",
          });
        } else {
          throw new Error(result.message || "Error en la validación de datos.");
        }
      } catch (error: any) {
        console.error("🔥 [NicePod-Identity-Fatal]:", error.message);
        toast({
          title: "Fallo de Sincronía",
          description: error.message || "No se pudo establecer conexión con la base de datos.",
          variant: "destructive"
        });
      }
    });
  }, [formData, profile.avatar_url, toast]);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-3 duration-700">

      <CardContent className="p-6 md:p-12 space-y-12">

        {/* 
            BLOQUE I: IDENTIFICADORES DE RED (IDENTIDAD PRIMARIA)
            Gestiona el nombre público y el handle único del sistema.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* CAMPO: NOMBRE COMPLETO (FULL NAME) */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
              <User size={12} className="text-primary/60" />
              Autoridad Nominal
            </Label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ej: Fran Fuenzalida"
              className="bg-zinc-900/50 border-white/10 h-16 rounded-2xl font-bold text-lg focus:ring-primary shadow-inner text-white transition-all"
              disabled={isPending}
            />
          </div>

          {/* CAMPO: HANDLE DE BÓVEDA (USERNAME)
              El 'username' es el ancla única y no se puede alterar para proteger
              la integridad de las URLs públicas y los hilos de sabiduría.
          */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
              <AtSign size={12} className="opacity-40" />
              Handle de Bóveda
            </Label>
            <div className="relative group">
              <Input
                value={formData.username}
                readOnly
                className="bg-black/30 border-white/5 h-16 rounded-2xl font-mono text-zinc-600 text-base cursor-not-allowed opacity-80"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
                <LockIcon size={16} />
              </div>
            </div>
            <p className="text-[8px] font-bold text-zinc-700 flex items-center gap-2 px-1 uppercase tracking-widest">
              <AlertCircle size={10} /> Identificador inmutable del curador.
            </p>
          </div>

        </div>

        {/* 
            BLOQUE II: NARRATIVA TÉCNICA (BIOGRAFÍA Y ESLOGAN)
            Permite al curador definir su propósito y áreas de conocimiento.
        */}
        <div className="grid grid-cols-1 gap-10">

          {/* CAMPO: BIO CORTA (ESLOGAN) */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
              <Zap size={12} className="text-primary/60" />
              Eslogan de Sabiduría
            </Label>
            <Input
              value={formData.bioShort}
              onChange={(e) => setFormData({ ...formData, bioShort: e.target.value })}
              placeholder="Ej: Especialista en Ingeniería de Audio Neuronal..."
              maxLength={60}
              className="bg-zinc-900/50 border-white/10 h-14 rounded-xl font-medium text-sm focus:ring-primary shadow-inner text-white"
              disabled={isPending}
            />
          </div>

          {/* CAMPO: BIOGRAFÍA EXTENSA */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
              <FileText size={12} className="text-primary/60" />
              Archivo Biográfico
            </Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={6}
              placeholder="Describe tu enfoque intelectual y qué buscas aportar a la memoria colectiva de la ciudad..."
              disabled={isPending}
              className={cn(
                "w-full bg-zinc-900/50 border border-white/10 rounded-[2.5rem] p-8",
                "text-base font-medium text-white leading-relaxed outline-none",
                "focus:ring-2 focus:ring-primary/20 transition-all shadow-inner resize-none",
                "placeholder:text-zinc-700"
              )}
            />
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-2">
                <Globe size={10} className="text-zinc-600" />
                <Input
                  value={formData.websiteUniformResourceLocator}
                  onChange={(e) => setFormData({ ...formData, websiteUniformResourceLocator: e.target.value })}
                  placeholder="https://tu-portal-de-sabiduria.com"
                  className="bg-transparent border-none p-0 h-auto text-[10px] text-zinc-500 focus-visible:ring-0 w-64"
                />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.2em] transition-colors",
                formData.bio.length > 450 ? "text-amber-500" : "text-zinc-600"
              )}>
                {formData.bio.length} / 500
              </span>
            </div>
          </div>
        </div>

      </CardContent>

      {/* 
          FOOTER: ACCIÓN DE SINCRONIZACIÓN (BOTÓN AURORA)
          Implementa el estado de carga industrial con animación de pulso.
      */}
      <CardFooter className="p-6 md:p-12 pt-0 bg-white/[0.01]">
        <Button
          onClick={handleUpdate}
          disabled={isPending}
          className="w-full h-20 md:h-24 font-black text-xl md:text-2xl tracking-tighter uppercase rounded-[2.5rem] shadow-2xl group overflow-hidden relative"
        >
          {/* Capa Aurora de Animación Cinematográfica */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-primary via-indigo-600 to-primary transition-opacity duration-700",
            isPending ? "opacity-30" : "opacity-90 group-hover:opacity-100 animate-aurora"
          )} />

          <span className="relative z-10 flex items-center justify-center gap-5">
            {isPending ? (
              <>
                <Loader2 className="animate-spin h-7 w-7 text-white/80" />
                <span className="animate-pulse tracking-widest text-white/90">Sincronizando Bóveda...</span>
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
 * 1. Integridad de Atributos: Se ha sustituido 'display_name' por 'fullName' para
 *    garantizar que el Server Action no encuentre discrepancias de esquema.
 * 2. Inmutabilidad de Handle: El campo 'username' está bloqueado (readOnly) para 
 *    proteger las relaciones semánticas en la base de datos PostgreSQL.
 * 3. Experiencia Industrial: El uso de 'useTransition' asegura que el botón
 *    proporcione feedback instantáneo (Sincronizando...) sin bloquear el hilo
 *    principal de la Workstation.
 */