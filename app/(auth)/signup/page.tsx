/**
 * ARCHIVO: app/(auth)/signup/page.tsx
 * VERSIÓN: 10.1 (Madrid Resonance)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Terminal de registro para la incorporación de nuevos Voyagers a la Malla, garantizando la integridad de identidad.
 * NIVEL DE INTEGRIDAD: 100%
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import React, { useState } from "react";
import { nicepodLog } from "@/lib/utils";

/**
 * SignUpPage: El orquestador del túnel de registro soberano de NicePod.
 */
export default function SignUpPage() {

  // --- I. ESTADOS DE GESTIÓN DE IDENTIDAD (NOMENCLATURA ZAP) ---
  const [fullUserDisplayNameTextContent, setFullUserDisplayNameTextContent] = useState<string>("");
  const [emailAddressTextContent, setEmailAddressTextContent] = useState<string>("");
  const [accessPasswordSecretKeyContent, setAccessPasswordSecretKeyContent] = useState<string>("");
  const [isAuthenticationProcessActiveStatus, setIsAuthenticationProcessActiveStatus] = useState<boolean>(false);

  const { supabase: supabaseSovereignClient } = useAuth();
  const navigationRouter = useRouter();
  const { toast } = useToast();

  /**
   * handleRegistrationAction:
   * Misión: Ejecutar la creación de identidad en el metal de Supabase Auth con registro de telemetría industrial.
   */
  const handleRegistrationAction = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    setIsAuthenticationProcessActiveStatus(true);

    // TELEMETRÍA SOBERANA: Inicio de protocolo de registro.
    posthog.capture('voyager_registration_initiated', {
      registrationMethodDescriptor: 'email'
    });

    try {
      nicepodLog("🛡️ [SignUp] Iniciando secuencia de registro de identidad.");

      const { error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.signUp({
        email: emailAddressTextContent,
        password: accessPasswordSecretKeyContent,
        options: {
          data: {
            full_name: fullUserDisplayNameTextContent
          }
        }
      });

      if (authenticationHardwareExceptionInformation) {
        throw authenticationHardwareExceptionInformation;
      }

      // TELEMETRÍA SOBERANA: Consolidación de nueva identidad.
      posthog.capture('voyager_registration_success');

      toast({
        title: "Cuenta Creada con Éxito",
        description: "¡Bienvenido a NicePod! Redirigiendo a la terminal de forja industrial..."
      });

      navigationRouter.push("/create");

    } catch (authenticationCriticalException: unknown) {
      const exceptionMessageText = authenticationCriticalException instanceof Error ? authenticationCriticalException.message : "Excepción desconocida";

      nicepodLog("🔥 [SignUp-Fatal]:", exceptionMessageText, 'error');

      toast({
        title: "Fallo de Registro",
        description: exceptionMessageText,
        variant: "destructive"
      });

      // TELEMETRÍA SOBERANA: Registro de anomalía en el proceso de alta.
      posthog.capture('voyager_registration_failed', {
        exceptionMessageInformationText: exceptionMessageText
      });

    } finally {
      setIsAuthenticationProcessActiveStatus(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#010101] isolate">

      {/* EFECTO ATMOSFÉRICO DE FONDO */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md backdrop-blur-3xl bg-[#050505]/80 border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in-95 duration-1000">

        <CardHeader className="text-center pt-10 pb-4 space-y-2">
          <CardTitle className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
            Crear <span className="text-primary not-italic">Cuenta</span>
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-2">
            El plan gratuito se asignará automáticamente tras la sincronización.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-10 space-y-6">
          <form onSubmit={handleRegistrationAction} className="space-y-4">

            {/* CAMPO: IDENTIDAD NOMINAL (FULL NAME) */}
            <div className="space-y-2">
              <Label htmlFor="full-name" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Nombre Completo</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Tu Identidad Nominal"
                  value={fullUserDisplayNameTextContent}
                  onChange={(event) => setFullUserDisplayNameTextContent(event.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-zinc-900/50 border-white/5 focus:ring-primary/20 text-sm font-medium"
                  required
                  disabled={isAuthenticationProcessActiveStatus}
                />
              </div>
            </div>

            {/* CAMPO: IDENTIFICACIÓN DE RED (EMAIL) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Correo electrónico</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="perito@nicepod.intelligence"
                  value={emailAddressTextContent}
                  onChange={(event) => setEmailAddressTextContent(event.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-zinc-900/50 border-white/5 focus:ring-primary/20 text-sm font-medium"
                  required
                  disabled={isAuthenticationProcessActiveStatus}
                />
              </div>
            </div>

            {/* CAMPO: LLAVE DE ACCESO (PASSWORD) */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Llave de Acceso</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={accessPasswordSecretKeyContent}
                  onChange={(event) => setAccessPasswordSecretKeyContent(event.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-zinc-900/50 border-white/5 focus:ring-primary/20 text-sm font-medium"
                  required
                  minLength={6}
                  disabled={isAuthenticationProcessActiveStatus}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all active:scale-[0.98] bg-white text-black hover:bg-zinc-200 mt-4"
              disabled={isAuthenticationProcessActiveStatus}
            >
              {isAuthenticationProcessActiveStatus ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Sincronizando Identidad...
                </div>
              ) : "Registrar Frecuencia"}
            </Button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              ¿Identidad ya registrada?{" "}
              <Link href="/login" className="text-primary font-black hover:text-white transition-colors ml-1">
                Ingresar
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V10.1):
 * 1. ZAP Nominal Sovereignty: Purificación absoluta de variables ('name' -> 'fullUserDisplayNameTextContent',
 *    'isPending' -> 'isAuthenticationProcessActiveStatus').
 * 2. Visual Harmony: Alineación de radios de borde (2.5rem) y paleta de colores con el estándar Madrid Resonance V5.1.
 * 3. Traceability: Integración de 'nicepodLog' para el monitoreo en tiempo real de Handshakes de identidad.
 */
