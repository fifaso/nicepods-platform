/**
 * ARCHIVO: components/profile/private/identity-settings-form.tsx
 * VERSIÓN: 4.0 (NicePod Identity Settings - Sovereign Protocol V4.0)
 * PROTOCOLO: MADRID RESONANCE V4.0
 *
 * Misión: Proveer la terminal de sintonía fina para los metadatos del curador.
 * [REFORMA V4.0]: Sincronización absoluta con ProfileData V4.0 y ZAP.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

"use client";

import { updateProfile } from "@/actions/profile-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSafeAsset } from "@/lib/utils";
import { ProfileData } from "@/types/profile";
import { Loader2, Save, User as UserIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * INTERFAZ: IdentitySettingsFormComponentProperties
 */
interface IdentitySettingsFormComponentProperties {
  profile: ProfileData;
}

/**
 * IdentitySettingsForm: El panel de control para el ADN digital del curador.
 */
export function IdentitySettingsForm({
  profile
}: IdentitySettingsFormComponentProperties) {

  const [isProcessingActive, setIsProcessingActive] = useState<boolean>(false);

  // ESTADO DEL FORMULARIO SINCRONIZADO CON PROFILE_DATA V4.0
  const [formData, setFormData] = useState({
    username: profile.username || "",
    fullName: profile.fullName || "",
    biographyTextContent: profile.biographyTextContent || "",
    biographyShortSummary: profile.biographyShortSummary || "",
    websiteUniformResourceLocator: profile.websiteUniformResourceLocator || ""
  });

  /**
   * handleProfileUpdateAction
   * Misión: Persistir los cambios en la Bóveda de NicePod.
   */
  const handleProfileUpdateAction = useCallback(async () => {
    setIsProcessingActive(true);

    try {
      const response = await updateProfile({
          ...formData,
          avatarUniformResourceLocator: profile.avatarUniformResourceLocator
      });

      if (response.isOperationSuccessful) {
        toast.success("Sincronía Exitosa", {
          description: "Tu identidad ha sido actualizada en la red global."
        });
      } else {
        toast.error("Fallo de Integridad", {
          description: response.responseStatusMessage
        });
      }
    } catch (exceptionMessageInformation: unknown) {
      console.error("🔥 [Identity-Form-Error]:", exceptionMessageInformation);
      toast.error("Error de Hardware", {
        description: "No se pudo establecer conexión con el búnker de datos."
      });
    } finally {
      setIsProcessingActive(false);
    }
  }, [formData, profile.avatarUniformResourceLocator]);

  return (
    <>
      <CardContent className="p-10 md:p-14 space-y-12">

        {/* SECCIÓN I: AVATAR Y VISUAL */}
        <div className="flex flex-col md:flex-row items-center gap-10 border-b border-white/5 pb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Avatar className="h-28 w-28 border-2 border-white/10 relative z-10">
              <AvatarImage
                src={getSafeAsset(profile.avatarUniformResourceLocator, 'avatar')}
                className="object-cover"
              />
              <AvatarFallback className="bg-zinc-800 text-primary font-black">
                {profile.fullName?.charAt(0) || <UserIcon size={24} />}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-sm font-black uppercase tracking-widest text-white">Imagen de Autoridad</h4>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest max-w-[200px]">
              La visualización del avatar se gestiona actualmente vía el Oráculo de Soportes.
            </p>
          </div>
        </div>

        {/* SECCIÓN II: CAMPOS DE IDENTIDAD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Handle de Red</Label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="username"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Nombre de Curador</Label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Nombre Completo"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20"
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Registro Biográfico</Label>
            <Textarea
              value={formData.biographyTextContent}
              onChange={(e) => setFormData({ ...formData, biographyTextContent: e.target.value })}
              placeholder="Describe tu misión y áreas de sabiduría..."
              className="bg-white/5 border-white/10 min-h-[120px] rounded-2xl p-5 resize-none focus:ring-primary/20"
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Slogan de Resonancia (Bio Corta)</Label>
            <Input
              value={formData.biographyShortSummary}
              onChange={(e) => setFormData({ ...formData, biographyShortSummary: e.target.value })}
              placeholder="Una frase que capture tu esencia..."
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20"
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Portal Digital (URL)</Label>
            <Input
              value={formData.websiteUniformResourceLocator}
              onChange={(e) => setFormData({ ...formData, websiteUniformResourceLocator: e.target.value })}
              placeholder="https://tu-boveda-personal.com"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20"
            />
          </div>

        </div>

      </CardContent>

      <CardFooter className="px-10 md:px-14 pb-14 pt-0">
        <Button
          onClick={handleProfileUpdateAction}
          disabled={isProcessingActive}
          className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/10 group overflow-hidden relative"
        >
          {isProcessingActive ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <div className="flex items-center gap-3">
              <Save size={18} className="group-hover:rotate-12 transition-transform" />
              <span>Sincronizar ADN Digital</span>
            </div>
          )}
        </Button>
      </CardFooter>
    </>
  );
}
