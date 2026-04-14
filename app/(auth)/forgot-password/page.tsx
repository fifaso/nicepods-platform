/**
 * ARCHIVE: app/(auth)/forgot-password/page.tsx
 * VERSION: 10.0 (NicePod Access Recovery - Industrial Refinement)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISSION: Provide a secure and frictionless account recovery path,
 * ensuring traceability of the resonance request.
 * INTEGRITY LEVEL: 100% (Sovereign / Zero Abbreviations / Production-Ready)
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";
import React, { useState } from "react";

/**
 * ForgotPasswordPage: El orquestador del túnel de recuperación de acceso.
 */
export default function ForgotPasswordPage() {
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [isAuthenticationProcessActive, setIsAuthenticationProcessActive] = useState<boolean>(false);
  const [isSubmissionSuccessful, setIsSubmissionSuccessful] = useState<boolean>(false);

  const { supabase: supabaseClient } = useAuth();
  const { toast } = useToast();

  /**
   * handleResetRequestAction:
   * Misión: Ejecutar el envío del enlace de recuperación y registrar la intención.
   */
  const handleResetRequestAction = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    if (!emailAddress) return;

    setIsAuthenticationProcessActive(true);

    try {
      // TELEMETRÍA: Inicio de recuperación
      posthog.capture('voyager_recovery_requested', {
        email_provided: true
      });

      const { error: authenticationError } = await supabaseClient.auth.resetPasswordForEmail(emailAddress, {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      });

      if (authenticationError) {
        throw authenticationError;
      }

      setIsSubmissionSuccessful(true);

      // TELEMETRÍA: Recuperación exitosa
      posthog.capture('voyager_recovery_success');

      toast({
        title: "Enlace Enviado",
        description: "Revisa tu bandeja de entrada para continuar con la sincronización.",
      });
    } catch (authenticationException: unknown) {
      const errorObject = authenticationException as Error;

      console.error("🔥 [NicePod-Auth] Reset Password Error:", errorObject.message);

      toast({
        title: "Fallo en la solicitud",
        description: errorObject.message || "No pudimos procesar la recuperación en este momento.",
        variant: "destructive",
      });

      // TELEMETRÍA: Error de recuperación
      posthog.capture('voyager_recovery_failed', {
        exceptionMessageInformation: errorObject.message
      });

    } finally {
      setIsAuthenticationProcessActive(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      {/* DECORACIÓN AMBIENTAL (Glow sutil de marca) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="backdrop-blur-2xl bg-white/5 dark:bg-black/40 border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <CardHeader className="space-y-4 pt-10 pb-6 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Sparkles className="text-primary h-6 w-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-black tracking-tighter uppercase italic">
                Recuperar <span className="text-primary">Acceso</span>
              </CardTitle>
              <CardDescription className="text-zinc-500 dark:text-zinc-400 font-medium">
                {!isSubmissionSuccessful
                  ? "Introduce tu email y te enviaremos el portal de entrada."
                  : "Hemos enviado el vínculo de resonancia a tu correo."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <AnimatePresence mode="wait">
              {!isSubmissionSuccessful ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleResetRequestAction}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-50">
                      Correo Electrónico
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@ejemplo.com"
                        value={emailAddress}
                        onChange={(event) => setEmailAddress(event.target.value)}
                        className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 transition-all text-base"
                        required
                        disabled={isAuthenticationProcessActive}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                    disabled={isAuthenticationProcessActive}
                  >
                    {isAuthenticationProcessActive ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sincronizando...
                      </div>
                    ) : "Enviar enlace de recuperación"}
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 p-6 text-center">
                    <p className="text-sm font-bold text-emerald-500 leading-relaxed">
                      El enlace ha sido enviado a: <br />
                      <span className="text-white underline decoration-emerald-500/50 underline-offset-4">{emailAddress}</span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] text-center text-zinc-500 uppercase font-black tracking-widest">
                      ¿No recibiste nada? Revisa Spam o:
                    </p>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl bg-transparent border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest"
                      onClick={() => setIsSubmissionSuccessful(false)}
                    >
                      Intentar con otro correo
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-center bg-zinc-950/50 py-6 border-t border-white/5">
            <Link
              href="/login"
              className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-primary transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Volver al ingreso
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V10.0):
 * 1. Zero Abbreviations Policy (ZAP): Se purificaron términos como 'email', 'isLoading',
 *    'isSubmitted' y 'err', sustituyéndolos por sus equivalentes semánticos completos.
 * 2. Observability Integration: Se inyectó PostHog para monitorear el flujo de
 *    recuperación de acceso, permitiendo identificar fricciones en el embudo de login.
 * 3. Build Shield Sovereignty: Se implementó 'unknown' en el bloque catch para
 *    cumplir con el estándar de robustez industrial.
 */
