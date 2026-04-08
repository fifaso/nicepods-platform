/**
 * ARCHIVO: app/(auth)/login/page.tsx
 * VERSIÓN: 7.0 (NicePod Sovereign Entry - Compact Industrial Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Terminal de acceso a la Workstation NicePod, optimizada para 
 * visualización en una sola pantalla (Zero-Scroll) y carga instantánea de marca.
 * [REFORMA V7.0]: Eliminación de activos erráticos, compactación de layout para 
 * dispositivos móviles y cumplimiento estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useState, useCallback } from "react";

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
  Mail,
  ChevronLeft
} from "lucide-react";

// --- UTILIDADES ---
import { nicepodLog } from "@/lib/utils";

/**
 * LoginPage: El orquestador del túnel de acceso industrial.
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
   * Misión: Validar credenciales en el metal de Supabase Auth.
   */
  const handleEmailAuthenticationAction = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    setIsAuthenticationProcessActive(true);

    try {
      nicepodLog("🔐 [Login] Iniciando secuencia de autenticación.");

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
        description: "Accediendo a la estación de mando."
      });

      navigationRouter.refresh();
      navigationRouter.push("/dashboard");

    } catch (authenticationException: unknown) {
      const errorObject = authenticationException as Error;
      nicepodLog("🔥 [Login-Fatal]:", errorObject.message, 'error');
      setIsAuthenticationProcessActive(false);
    }
  };

  /**
   * handleGoogleSignInAction:
   * Misión: Delegar la autoridad a Google Cloud Identity.
   */
  const handleGoogleSignInAction = async () => {
    setIsAuthenticationProcessActive(true);
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      },
    });
  };

  return (
    <main className="h-[100dvh] w-full flex flex-col items-center justify-center p-4 md:p-6 bg-transparent overflow-hidden">
      
      {/* BOTÓN DE RETORNO (CERRAR TÚNEL) - Compactado */}
      <div className="w-full max-w-md mb-4 flex justify-start">
        <Link href="/">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full bg-white/5 border border-white/10 text-zinc-500 hover:text-white transition-all h-10 px-4"
          >
            <ChevronLeft size={16} className="mr-2" />
            <span className="text-[9px] font-black uppercase tracking-widest">Cerrar Túnel</span>
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-md backdrop-blur-3xl bg-[#050505]/80 border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 isolate">
        
        {/* CABECERA: Identidad Unificada (Local-First) */}
        <CardHeader className="space-y-3 text-center pt-8 pb-4">
          <div className="flex justify-center mb-1">
            <div className="h-14 w-14 relative p-3 rounded-2xl bg-zinc-900 border border-white/10 shadow-inner">
                <Image 
                    src="/nicepod-logo.png" 
                    alt="NicePod" 
                    fill 
                    className="object-contain p-2" 
                    priority
                    unoptimized
                />
            </div>
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter uppercase italic font-serif text-white leading-none">
            Ingresar
          </CardTitle>
          <CardDescription className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
            Terminal de Inteligencia Personal
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-5">
          <form onSubmit={handleEmailAuthenticationAction} className="space-y-4">

            {/* CAMPO: IDENTIFICACIÓN DE RED */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                Dirección de Red
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@dominio.com"
                  value={emailAddress}
                  onChange={(event) => setEmailAddress(event.target.value)}
                  className="pl-12 h-14 rounded-xl bg-zinc-900/50 border-white/5 focus:ring-primary/20 text-sm font-medium"
                  required
                />
              </div>
            </div>

            {/* CAMPO: LLAVE DE ACCESO */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Llave de Acceso
                </Label>
                <Link href="/forgot-password" title="Recuperar Clave" className="text-[8px] font-black uppercase tracking-widest text-zinc-600 hover:text-primary">
                  ¿Olvido?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <Input
                  id="password"
                  type={isPasswordVisibilityActive ? "text" : "password"}
                  placeholder="••••••••"
                  value={accessPassword}
                  onChange={(event) => setAccessPassword(event.target.value)}
                  className="pl-12 pr-12 h-14 rounded-xl bg-zinc-900/50 border-white/5 focus:ring-primary/20 text-sm font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisibilityActive(!isPasswordVisibilityActive)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
                  tabIndex={-1}
                >
                  {isPasswordVisibilityActive ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl font-black text-base uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98] group bg-white text-black hover:bg-zinc-200"
              disabled={isAuthenticationProcessActive}
            >
              {isAuthenticationProcessActive ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-3">
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                  CONECTAR FRECUENCIA
                </span>
              )}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><Separator className="opacity-10" /></div>
            <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.4em]">
              <span className="bg-[#080808] px-4 text-zinc-700">Identidad Federada</span>
            </div>
          </div>

          <Button
            variant="outline"
            disabled={isAuthenticationProcessActive}
            className="w-full h-14 rounded-xl bg-white/5 border-white/10 font-bold uppercase tracking-widest text-[9px] hover:bg-white/10 group"
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
            ¿Sin cuenta?{" "}
            <Link href="/signup" className="text-primary font-black hover:text-white transition-colors">
              Registrar ADN
            </Link>
          </p>
        </CardFooter>
      </Card>

      <footer className="mt-8 opacity-20">
         <p className="text-[7px] font-black text-white uppercase tracking-[0.6em]">
            Sovereign Identity Access V4.0
         </p>
      </footer>
    </main>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Zero-Scroll Architecture: El uso de 'h-[100dvh]' y la reducción proporcional de los 
 *    espaciados internos garantiza que la terminal de acceso sea visible íntegramente 
 *    en dispositivos móviles sin necesidad de desplazamiento.
 * 2. Artifact Eradication: Se eliminó el renderizado duplicado del logo fuera de la Card, 
 *    resolviendo la anomalía visual detectada en el peritaje de la Imagen 21.
 * 3. Local-First Assets: Se mantiene la carga del logo desde la raíz local para asegurar 
 *    latencia cero y eludir el Error 400 de red.
 */