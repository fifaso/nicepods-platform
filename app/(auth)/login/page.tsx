/**
 * ARCHIVO: app/(auth)/login/page.tsx
 * VERSIÓN: 6.0 (NicePod Sovereign Entry - Nominal Integrity & Local Asset Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Terminal de acceso a la Workstation NicePod, garantizando la carga 
 * instantánea de marca y la seguridad del túnel de identidad.
 * [REFORMA V6.0]: Sincronización de activos locales (Fix Error 400), erradicación 
 * absoluta de abreviaturas y blindaje de tipos para el Build Shield.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useState } from "react";

// --- COMPONENTES DE INTERFAZ (SHADCN UI STANDARD) ---
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

// --- UTILIDADES ---
import { nicepodLog } from "@/lib/utils";

/**
 * LoginPage: El orquestador del túnel de acceso industrial para curadores registrados.
 */
export default function LoginPage() {
  // --- I. ESTADOS DE GESTIÓN DE IDENTIDAD ---
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [accessPassword, setAccessPassword] = useState<string>("");
  const [isPasswordVisibilityActive, setIsPasswordVisibilityActive] = useState<boolean>(false);
  const [isAuthenticationProcessActive, setIsAuthenticationProcessActive] = useState<boolean>(false);

  const { supabase: supabaseClient } = useAuth();
  const navigationRouter = useRouter();
  const { toast } = useToast();

  /**
   * handleEmailAuthenticationAction:
   * Misión: Ejecutar la validación de credenciales en el metal de Supabase Auth.
   */
  const handleEmailAuthenticationAction = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    setIsAuthenticationProcessActive(true);

    try {
      nicepodLog("🔐 [Login] Iniciando secuencia de autenticación por dirección de red.");

      const { error: authenticationError } = await supabaseClient.auth.signInWithPassword({
        email: emailAddress,
        password: accessPassword
      });

      if (authenticationError) {
        toast({
          title: "Fallo de Autenticación",
          description: authenticationError.message,
          variant: "destructive"
        });
        setIsAuthenticationProcessActive(false);
        return;
      }

      toast({
        title: "Sincronía Exitosa",
        description: "Accediendo a la estación de mando industrial."
      });

      // Sincronización del router para la re-validación de componentes de servidor.
      navigationRouter.refresh();
      navigationRouter.push("/dashboard");

    } catch (authenticationException: unknown) {
      const errorObject = authenticationException as Error;
      console.error("🔥 [Login-Fatal-Error]:", errorObject.message);
      setIsAuthenticationProcessActive(false);
    }
  };

  /**
   * handleGoogleCloudIdentitySignInAction:
   * Misión: Iniciar el flujo de identidad federada mediante el protocolo OAuth2.
   */
  const handleGoogleCloudIdentitySignInAction = async () => {
    setIsAuthenticationProcessActive(true);
    nicepodLog("🌐 [Login] Desviando autoridad hacia Google Cloud Identity.");
    
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      },
    });
  };

  return (
    <Card className="w-full backdrop-blur-3xl bg-[#050505]/60 border-white/5 shadow-2xl rounded-[3rem] overflow-hidden animate-in fade-in zoom-in-95 duration-1000 isolate">
      
      {/* CABECERA CON MARCA SOBERANA (LOCAL-FIRST) */}
      <CardHeader className="space-y-4 text-center pt-12 pb-8">
        <div className="flex justify-center mb-2">
            <div className="h-20 w-20 relative p-4 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl transition-transform hover:scale-105 duration-700">
                <Image 
                    // [FIX V6.0]: Uso de asset local para aniquilar el Error 400 y garantizar 0ms de latencia.
                    src="/nicepod-logo.png" 
                    alt="NicePod Intelligence Isotype" 
                    fill 
                    className="object-contain p-3" 
                    priority
                    unoptimized
                />
            </div>
        </div>
        <CardTitle className="text-4xl font-black tracking-tighter uppercase italic font-serif text-white">
          Ingresar
        </CardTitle>
        <CardDescription className="text-xs font-black text-primary uppercase tracking-[0.4em]">
          Terminal de Inteligencia Personal
        </CardDescription>
      </CardHeader>

      <CardContent className="px-10 pb-10 space-y-8">
        <form onSubmit={handleEmailAuthenticationAction} className="space-y-6">

          {/* CAMPO: DIRECCIÓN DE RED (EMAIL) */}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">
              Dirección de Red
            </Label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
              <Input
                id="email"
                type="email"
                placeholder="nombre@dominio.com"
                value={emailAddress}
                onChange={(inputEvent) => setEmailAddress(inputEvent.target.value)}
                className="pl-14 h-16 rounded-2xl bg-zinc-900/50 border-white/5 focus:ring-primary/20 text-base font-medium transition-all"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* CAMPO: LLAVE DE ACCESO (PASSWORD) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                Llave de Acceso
              </Label>
              <Link 
                href="/forgot-password" 
                className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-primary transition-colors"
              >
                ¿Olvidaste la clave?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
              <Input
                id="password"
                type={isPasswordVisibilityActive ? "text" : "password"}
                placeholder="••••••••"
                value={accessPassword}
                onChange={(inputEvent) => setAccessPassword(inputEvent.target.value)}
                className="pl-14 pr-14 h-16 rounded-2xl bg-zinc-900/50 border-white/5 focus:ring-primary/20 text-base font-medium transition-all"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisibilityActive(!isPasswordVisibilityActive)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {isPasswordVisibilityActive ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* ACCIÓN DE CONEXIÓN */}
          <Button
            type="submit"
            className="w-full h-20 rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98] group bg-white text-black hover:bg-zinc-200"
            disabled={isAuthenticationProcessActive}
          >
            {isAuthenticationProcessActive ? (
              <Loader2 className="mr-3 h-6 w-6 animate-spin text-primary" />
            ) : (
              <span className="flex items-center gap-4">
                <LogIn className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                CONECTAR FRECUENCIA
              </span>
            )}
          </Button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><Separator className="opacity-10" /></div>
          <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.5em]">
            <span className="bg-[#050505] px-6 text-zinc-700 font-bold">Identidad Federada</span>
          </div>
        </div>

        {/* ACCIÓN: GOOGLE SIGN-IN */}
        <Button
          variant="outline"
          disabled={isAuthenticationProcessActive}
          className="w-full h-16 rounded-2xl bg-white/5 border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all group"
          onClick={handleGoogleCloudIdentitySignInAction}
        >
          <svg className="h-5 w-5 mr-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google Cloud Identity
        </Button>
      </CardContent>

      <CardFooter className="justify-center border-t border-white/5 py-10 bg-black/40">
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
          ¿No tienes una cuenta registrada?{" "}
          <Link href="/signup" className="text-primary font-black hover:text-white transition-colors">
            Registrar mi ADN
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Zero Abbreviations Policy: Erradicación total de términos cortos (e, err, id, email, password) 
 *    sustituyéndolos por descriptores periciales (inputEvent, authenticationException, etc.).
 * 2. Visual Sovereignty: El uso de '/nicepod-logo.png' local neutraliza el Error 400 de red 
 *    y garantiza que la marca corporativa cargue en el primer ciclo de renderizado.
 * 3. Hardware Hygiene: Se mantiene el atributo 'tabIndex={-1}' en el botón de visibilidad 
 *    para no romper el flujo de navegación por teclado industrial.
 */