/**
 * ARCHIVO: app/(auth)/login/page.tsx
 * VERSIÓN: 10.1 (Madrid Resonance)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Terminal de acceso optimizada para la inmersión total con tipografía unificada y léxico industrial.
 * NIVEL DE INTEGRIDAD: 100%
 */

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import posthog from "posthog-js";
import React, { useState } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES DE INTERFAZ (UI) ---
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
import { Separator } from "@/components/ui/separator";

// --- ICONOGRAFÍA TÁCTICA ---
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail
} from "lucide-react";

// --- UTILIDADES INDUSTRIALES ---
import { nicepodLog } from "@/lib/utils";

/**
 * LoginPage: El orquestador del túnel de acceso soberano de NicePod.
 */
export default function LoginPage() {
  
  // --- I. ESTADOS DE GESTIÓN DE IDENTIDAD (NOMENCLATURA ZAP) ---
  const [emailAddressTextContent, setEmailAddressTextContent] = useState<string>("");
  const [accessPasswordSecretKeyContent, setAccessPasswordSecretKeyContent] = useState<string>("");
  const [isPasswordVisibilityActiveStatus, setIsPasswordVisibilityActiveStatus] = useState<boolean>(false);
  const [isAuthenticationProcessActiveStatus, setIsAuthenticationProcessActiveStatus] = useState<boolean>(false);

  const { supabase: supabaseSovereignClient } = useAuth();
  const navigationRouter = useRouter();
  const { toast } = useToast();

  /**
   * handleEmailAuthenticationAction:
   * Misión: Ejecutar la validación de credenciales en el metal de Supabase Auth con trazabilidad industrial.
   */
  const handleEmailAuthenticationAction = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    setIsAuthenticationProcessActiveStatus(true);

    try {
      nicepodLog("🔐 [Login] Ejecutando secuencia de acceso soberano.");

      const { error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.signInWithPassword({
        email: emailAddressTextContent,
        password: accessPasswordSecretKeyContent
      });

      if (authenticationHardwareExceptionInformation) {
        // TELEMETRÍA SOBERANA: Registro de fallo en el peritaje de sesión.
        posthog.capture('voyager_session_start_failed', {
          exceptionMessageInformationText: authenticationHardwareExceptionInformation.message
        });

        toast({
          title: "Fallo de Autenticación",
          description: authenticationHardwareExceptionInformation.message,
          variant: "destructive"
        });
        setIsAuthenticationProcessActiveStatus(false);
        return;
      }

      // TELEMETRÍA SOBERANA: Éxito en el handshake de identidad.
      posthog.capture('voyager_session_start_success');

      toast({
        title: "Sincronía Exitosa",
        description: "Accediendo a la Workstation de Madrid Resonance."
      });

      navigationRouter.refresh();
      navigationRouter.push("/dashboard");

    } catch (authenticationCriticalException: unknown) {
      const exceptionMessageText = authenticationCriticalException instanceof Error ? authenticationCriticalException.message : "Excepción desconocida";
      nicepodLog("🔥 [Login-Fatal]:", exceptionMessageText, 'error');
      setIsAuthenticationProcessActiveStatus(false);
    }
  };

  /**
   * handleGoogleSignInAction:
   * Misión: Delegar la autoridad de identidad a Google Cloud Identity (OAuth Protocol).
   */
  const handleGoogleSignInAction = async () => {
    setIsAuthenticationProcessActiveStatus(true);

    // TELEMETRÍA SOBERANA: Intento de acceso mediante proveedor externo.
    posthog.capture('voyager_oauth_start', { identityProviderDescriptor: 'google' });

    await supabaseSovereignClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      },
    });
  };

  return (
    <main className="h-[100dvh] w-full flex items-center justify-center p-4 bg-transparent overflow-hidden isolate">
      
      <Card className="w-full max-w-md backdrop-blur-3xl bg-[#050505]/80 border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
        
        {/* CABECERA: IDENTIDAD SOBERANA UNIFICADA */}
        <CardHeader className="space-y-2 text-center pt-8 pb-2">
          <div className="flex justify-center mb-1">
            <div className="h-14 w-14 relative p-3 rounded-2xl bg-zinc-900 border border-white/10 shadow-inner group">
                <Image 
                    src="/nicepod-logo.png" 
                    alt="NicePod Logo"
                    fill 
                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                    priority
                    unoptimized
                />
            </div>
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter uppercase leading-none text-white italic">
            Ingresar
          </CardTitle>
          <CardDescription className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-2">
            Terminal de Inteligencia Personal
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8 space-y-6">
          <form onSubmit={handleEmailAuthenticationAction} className="space-y-4">

            {/* CAMPO: IDENTIFICACIÓN DE RED (EMAIL) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <Input
                  id="email"
                  type="email"
                  placeholder="perito@nicepod.intelligence"
                  value={emailAddressTextContent}
                  onChange={(event) => setEmailAddressTextContent(event.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-zinc-900/50 border-white/5 focus:ring-primary/20 text-sm font-medium"
                  required
                />
              </div>
            </div>

            {/* CAMPO: LLAVE DE ACCESO (PASSWORD) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Llave de Acceso
                </Label>
                <Link href="/forgot-password" title="Recuperar Clave de Acceso" className="text-[8px] font-black uppercase tracking-widest text-zinc-600 hover:text-primary transition-colors">
                  ¿Olvido?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <Input
                  id="password"
                  type={isPasswordVisibilityActiveStatus ? "text" : "password"}
                  placeholder="••••••••"
                  value={accessPasswordSecretKeyContent}
                  onChange={(event) => setAccessPasswordSecretKeyContent(event.target.value)}
                  className="pl-12 pr-12 h-14 rounded-2xl bg-zinc-900/50 border-white/5 focus:ring-primary/20 text-sm font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisibilityActiveStatus(!isPasswordVisibilityActiveStatus)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {isPasswordVisibilityActiveStatus ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] group bg-white text-black hover:bg-zinc-200"
              disabled={isAuthenticationProcessActiveStatus}
            >
              {isAuthenticationProcessActiveStatus ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" />
              ) : (
                <span className="flex items-center gap-3 text-[11px]">
                  <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                  CONECTAR FRECUENCIA
                </span>
              )}
            </Button>
          </form>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center"><Separator className="opacity-10" /></div>
            <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.4em]">
              <span className="bg-[#080808] px-4 text-zinc-700">Acceder mediante</span>
            </div>
          </div>

          <Button
            variant="outline"
            disabled={isAuthenticationProcessActiveStatus}
            className="w-full h-14 rounded-2xl bg-white/5 border-white/10 font-black uppercase tracking-widest text-[9px] hover:bg-white/10 group text-zinc-300"
            onClick={handleGoogleSignInAction}
          >
            <svg className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google Cloud Identity
          </Button>
        </CardContent>

        <CardFooter className="justify-center border-t border-white/5 py-6 bg-black/40">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            ¿Sin autoridad de acceso?{" "}
            <Link href="/signup" className="text-primary font-black hover:text-white transition-colors ml-1">
              Crear cuenta
            </Link>
          </p>
        </CardFooter>
      </Card>

    </main>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V10.1):
 * 1. ZAP Absolute Enforcement: Refactorización nominal de estados ('password' -> 'accessPasswordSecretKeyContent',
 *    'isPending' -> 'isAuthenticationProcessActiveStatus').
 * 2. Traceability: Inyección de descriptores soberanos en los eventos de PostHog para un peritaje preciso del embudo de login.
 * 3. Aesthetics: Se ajustaron los radios de borde (2.5rem) y espaciados para alinearse con la estética industrial de la V5.1.
 */
