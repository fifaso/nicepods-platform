/**
 * ARCHIVE: app/(auth)/signup/page.tsx
 * VERSION: 10.0 (NicePod Sovereign Registration - Industrial Refinement)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISSION: Registration terminal for onboarding new Voyagers into the Mesh,
 * ensuring identity integrity and event traceability.
 * INTEGRITY LEVEL: 100% (Sovereign / Zero Abbreviations / Production-Ready)
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

/**
 * SignUpPage: El orquestador del túnel de registro industrial.
 */
export default function SignUpPage() {
  // --- I. ESTADOS DE GESTIÓN DE IDENTIDAD ---
  const [fullUserDisplayName, setFullUserDisplayName] = useState<string>("");
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [accessPassword, setAccessPassword] = useState<string>("");
  const [isAuthenticationProcessActive, setIsAuthenticationProcessActive] = useState<boolean>(false);

  const { supabase: supabaseClient } = useAuth();
  const navigationRouter = useRouter();
  const { toast } = useToast();

  /**
   * handleRegistrationAction:
   * Misión: Ejecutar la creación de cuenta en el metal de Supabase Auth y registrar el evento.
   */
  const handleRegistrationAction = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    setIsAuthenticationProcessActive(true);

    // TELEMETRÍA: Inicio de registro
    posthog.capture('voyager_registration_initiated', {
      method: 'email'
    });

    try {
      const { error: authenticationError } = await supabaseClient.auth.signUp({
        email: emailAddress,
        password: accessPassword,
        options: {
          data: {
            full_name: fullUserDisplayName
          }
        }
      });

      if (authenticationError) {
        throw authenticationError;
      }

      // TELEMETRÍA: Registro exitoso
      posthog.capture('voyager_registration_success');

      toast({
        title: "Cuenta Creada",
        description: "¡Bienvenido a NicePod! Redirigiendo a la terminal de forja..."
      });

      navigationRouter.push("/create");

    } catch (authenticationException: unknown) {
      const errorObject = authenticationException as Error;

      toast({
        title: "Fallo de Registro",
        description: errorObject.message,
        variant: "destructive"
      });

      // TELEMETRÍA: Error de registro
      posthog.capture('voyager_registration_failed', {
        exceptionMessageInformation: errorObject.message
      });

    } finally {
      setIsAuthenticationProcessActive(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-purple-500/10 via-background to-blue-500/10 dark:from-purple-900/20 dark:via-background dark:to-blue-900/20">
      <Card className="w-full max-w-md backdrop-blur-lg bg-card/60 dark:bg-card/40 border-muted/30 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-3xl font-black tracking-tighter uppercase italic">Crear <span className="text-primary">Cuenta</span></CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">El plan gratuito se asignará automáticamente.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <form onSubmit={handleRegistrationAction} className="space-y-4">

            {/* CAMPO: IDENTIDAD NOMINAL */}
            <div className="space-y-2">
              <Label htmlFor="full-name" className="text-[9px] font-black uppercase tracking-[0.2em] ml-1 opacity-70">Nombre Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Tu Nombre"
                  value={fullUserDisplayName}
                  onChange={(event) => setFullUserDisplayName(event.target.value)}
                  className="pl-10 h-14 rounded-2xl bg-zinc-900/50 border-white/5 focus:ring-primary/20"
                  required
                  disabled={isAuthenticationProcessActive}
                />
              </div>
            </div>

            {/* CAMPO: IDENTIFICACIÓN DE RED */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.2em] ml-1 opacity-70">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={emailAddress}
                  onChange={(event) => setEmailAddress(event.target.value)}
                  className="pl-10 h-14 rounded-2xl bg-zinc-900/50 border-white/5 focus:ring-primary/20"
                  required
                  disabled={isAuthenticationProcessActive}
                />
              </div>
            </div>

            {/* CAMPO: LLAVE DE ACCESO */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-[0.2em] ml-1 opacity-70">Llave de Acceso</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={accessPassword}
                  onChange={(event) => setAccessPassword(event.target.value)}
                  className="pl-10 h-14 rounded-2xl bg-zinc-900/50 border-white/5 focus:ring-primary/20"
                  required
                  minLength={6}
                  disabled={isAuthenticationProcessActive}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98]"
              disabled={isAuthenticationProcessActive}
            >
              {isAuthenticationProcessActive ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sincronizando...
                </div>
              ) : "Sincronizar Identidad"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary font-black hover:underline underline-offset-4">
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
 * NOTA TÉCNICA DEL ARCHITECT (V10.0):
 * 1. Zero Abbreviations Policy (ZAP): Se han purificado los estados de formulario
 *    y los manejadores de eventos para cumplir con el dogma industrial.
 * 2. Observability Integration: La inyección de PostHog permite el peritaje de
 *    conversión de nuevos Voyagers en tiempo real.
 * 3. Build Shield Sovereignty: Se utiliza 'unknown' en el catch block con tipado
 *    seguro para cumplir con el protocolo de robustez.
 */
