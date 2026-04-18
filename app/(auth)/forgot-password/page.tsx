/**
 * ARCHIVO: app/(auth)/forgot-password/page.tsx
 * VERSIÓN: 10.1 (Madrid Resonance)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Proveer una ruta de recuperación de acceso segura y sin fricciones, garantizando la trazabilidad de la solicitud.
 * NIVEL DE INTEGRIDAD: 100%
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
import { nicepodLog } from "@/lib/utils";

/**
 * ForgotPasswordPage: El orquestador del túnel de recuperación de acceso soberano.
 */
export default function ForgotPasswordPage() {

  // --- I. ESTADOS DE GESTIÓN DE IDENTIDAD (NOMENCLATURA ZAP) ---
  const [emailAddressTextContent, setEmailAddressTextContent] = useState<string>("");
  const [isAuthenticationProcessActiveStatus, setIsAuthenticationProcessActiveStatus] = useState<boolean>(false);
  const [isSubmissionSuccessfulStatus, setIsSubmissionSuccessfulStatus] = useState<boolean>(false);

  const { supabase: supabaseSovereignClient } = useAuth();
  const { toast } = useToast();

  /**
   * handleResetRequestAction:
   * Misión: Ejecutar el envío del enlace de recuperación y registrar la intención en el peritaje industrial.
   */
  const handleResetRequestAction = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    if (!emailAddressTextContent) return;

    setIsAuthenticationProcessActiveStatus(true);

    try {
      nicepodLog(`🛡️ [Auth-Recovery] Solicitud de resonancia para: ${emailAddressTextContent}`);

      // TELEMETRÍA SOBERANA: Inicio de protocolo de recuperación.
      posthog.capture('voyager_recovery_requested', {
        isEmailProvidedStatus: true
      });

      const { error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.resetPasswordForEmail(emailAddressTextContent, {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      });

      if (authenticationHardwareExceptionInformation) {
        throw authenticationHardwareExceptionInformation;
      }

      setIsSubmissionSuccessfulStatus(true);

      // TELEMETRÍA SOBERANA: Éxito en el envío del portal de recuperación.
      posthog.capture('voyager_recovery_success');

      toast({
        title: "Enlace Enviado con Éxito",
        description: "Revisa tu bandeja de entrada para continuar con la sincronización de acceso.",
      });
    } catch (authenticationCriticalException: unknown) {
      const exceptionMessageText = authenticationCriticalException instanceof Error ? authenticationCriticalException.message : "Excepción desconocida";

      nicepodLog("🔥 [Auth-Recovery-Fatal]:", exceptionMessageText, 'error');

      toast({
        title: "Fallo en la Solicitud",
        description: exceptionMessageText || "No pudimos procesar la recuperación en este ciclo.",
        variant: "destructive",
      });

      // TELEMETRÍA SOBERANA: Registro de anomalía en la recuperación.
      posthog.capture('voyager_recovery_failed', {
        exceptionMessageInformationText: exceptionMessageText
      });

    } finally {
      setIsAuthenticationProcessActiveStatus(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-[#010101] isolate">

      {/* EFECTO ATMOSFÉRICO SUTIL (BRAND GLOW) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="backdrop-blur-3xl bg-[#050505]/80 border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
          <CardHeader className="space-y-4 pt-10 pb-6 text-center">
            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Sparkles className="text-primary h-7 w-7" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
                Recuperar <span className="text-primary not-italic">Acceso</span>
              </CardTitle>
              <CardDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2 leading-relaxed">
                {!isSubmissionSuccessfulStatus
                  ? "Introduce tu email y te enviaremos el portal de entrada soberano."
                  : "Hemos enviado el vínculo de resonancia a tu correo electrónico."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <AnimatePresence mode="wait">
              {!isSubmissionSuccessfulStatus ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleResetRequestAction}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                      Correo Electrónico
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="perito@nicepod.intelligence"
                        value={emailAddressTextContent}
                        onChange={(event) => setEmailAddressTextContent(event.target.value)}
                        className="pl-12 h-14 bg-zinc-900/50 border-white/5 rounded-2xl focus:ring-primary/20 transition-all text-sm font-medium"
                        required
                        disabled={isAuthenticationProcessActiveStatus}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all active:scale-[0.98] bg-white text-black hover:bg-zinc-200"
                    disabled={isAuthenticationProcessActiveStatus}
                  >
                    {isAuthenticationProcessActiveStatus ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        Sincronizando...
                      </div>
                    ) : "Enviar Portal de Recuperación"}
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 p-8 text-center shadow-inner">
                    <p className="text-[11px] font-black text-emerald-500 leading-relaxed uppercase tracking-widest">
                      El portal ha sido enviado a: <br />
                      <span className="text-white underline decoration-emerald-500/50 underline-offset-8 mt-2 inline-block lowercase tracking-normal">{emailAddressTextContent}</span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <p className="text-[9px] text-center text-zinc-500 uppercase font-black tracking-widest">
                      ¿Sin recepción sensorial? Revisa Spam o:
                    </p>
                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-2xl bg-transparent border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400"
                      onClick={() => setIsSubmissionSuccessfulStatus(false)}
                    >
                      Intentar con otra identidad
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-center bg-black/40 py-6 border-t border-white/5">
            <Link
              href="/login"
              className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-primary transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Volver a la terminal de ingreso
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V10.1):
 * 1. ZAP Nominal Sovereignty: Purificación de estados de UI ('email' -> 'emailAddressTextContent',
 *    'isSubmitted' -> 'isSubmissionSuccessfulStatus').
 * 2. Visual Hardening: Alineación con el estándar estético Madrid Resonance (bg-black, radius-2.5rem).
 * 3. Observability: Integración de 'nicepodLog' para el monitoreo de peritajes de recuperación en tiempo real.
 */
