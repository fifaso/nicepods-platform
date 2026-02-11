// app/(auth)/login/page.tsx
// VERSIÓN: 5.1 (Sovereign Entry - Type Integrity Fixed)
// Misión: Terminal de acceso a la workstation. Optimizada para gestores de contraseñas.
// [FIX]: Eliminación de atributo 'name' en componentes Label para cumplir con tipos TS.

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

// --- COMPONENTES DE UI (Shadcn UI Standard) ---
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

/**
 * LoginPage: Orquestador del túnel de acceso para usuarios registrados.
 */
export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { supabase } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  /**
   * handleEmailLogin
   * Ejecuta la autenticación y fuerza el refresco del router para sincronizar Server Components.
   */
  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Fallo de Autenticación",
          description: error.message,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Sincronía Exitosa",
        description: "Accediendo a tu estación de mando..."
      });

      // Sincronización de cookies y navegación
      router.refresh();
      router.push("/dashboard");

    } catch (err: any) {
      console.error("🔥 [Login-Fatal-Error]:", err.message);
      setIsSubmitting(false);
    }
  };

  /**
   * handleGoogleSignIn
   * Inicia el flujo de identidad federada con Google.
   */
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      },
    });
  };

  return (
    <Card className="w-full backdrop-blur-2xl bg-card/60 dark:bg-card/40 border-muted/30 shadow-2xl rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in-95 duration-700">
      <CardHeader className="space-y-2 text-center pt-10 pb-6">
        <CardTitle className="text-4xl font-black tracking-tighter uppercase italic">
          Ingresar
        </CardTitle>
        <CardDescription className="text-base font-medium text-muted-foreground/80">
          Terminal de Inteligencia Personal
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8 space-y-6">
        <form onSubmit={handleEmailLogin} className="space-y-5">

          {/* CAMPO: EMAIL (Optimizado para Autocompletado) */}
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">
              Dirección de Red
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
              <Input
                id="email"
                type="email"
                name="email" // Mantenemos name aquí (donde es válido)
                placeholder="nombre@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-background/50 border-white/5 focus:ring-primary/20 text-base font-medium transition-all"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* CAMPO: CONTRASEÑA (Optimizado para Seguridad) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Llave de Acceso
              </Label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                ¿Olvidaste la clave?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password" // Mantenemos name aquí
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 h-14 rounded-2xl bg-background/50 border-white/5 focus:ring-primary/20 text-base font-medium transition-all"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-16 rounded-[1.5rem] font-black text-lg uppercase tracking-tighter shadow-2xl transition-all active:scale-[0.98] group"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <span className="flex items-center gap-3">
                <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                CONECTAR FRECUENCIA
              </span>
            )}
          </Button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><Separator className="opacity-10" /></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
            <span className="bg-card px-4 text-muted-foreground/40">O continúa con</span>
          </div>
        </div>

        {/* GOOGLE SIGN-IN */}
        <Button
          variant="outline"
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl bg-white/5 border-white/10 font-bold hover:bg-white/10 transition-all group"
          onClick={handleGoogleSignIn}
        >
          <svg className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google Cloud Identity
        </Button>
      </CardContent>

      <CardFooter className="justify-center border-t border-white/5 py-8 bg-black/20">
        <p className="text-sm text-muted-foreground font-medium">
          ¿No tienes una cuenta?{" "}
          <Link href="/signup" className="text-primary font-black hover:underline uppercase tracking-widest text-[11px]">
            Registrar mi ADN
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}