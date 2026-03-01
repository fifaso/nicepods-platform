// app/(platform)/(geo-mode)/geo/page.tsx
// VERSIÓN: 4.1

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShieldAlert, 
  Loader2, 
  Wifi, 
  Activity,
  Zap
} from "lucide-react";

// --- INFRAESTRUCTURA DE COMPONENTES SOBERANOS ---
import { GeoScannerUI } from "@/components/geo/scanner-ui";
import { Button } from "@/components/ui/button";

// --- HOOKS DE IDENTIDAD Y ESTILO ---
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/**
 * COMPONENTE: GeoCreationPage
 * La terminal de alta fidelidad para la creación de Puntos de Interés (POI).
 * 
 * [PROTOCOLO DE SOBERANÍA]:
 * 1. RBAC Check: Verifica el rol 'admin' antes de montar el escáner.
 * 2. Geo-Lock: Esta página está diseñada para ser operada físicamente en el lugar.
 * 3. Fluid Layout: h-[100dvh] garantiza que la UI ocupe la totalidad del visor móvil.
 */
export default function GeoCreationPage() {
  const { isAdmin, isInitialLoading, isAuthenticated, profile } = useAuth();
  const router = useRouter();

  /**
   * [GUARDA DE SEGURIDAD CLIENT-SIDE]:
   * Como medida de redundancia al Middleware, el componente monitoriza el 
   * rango del usuario. Si detecta un acceso no autorizado o una sesión 
   * expirada, ejecuta un reemplazo de ruta atómico hacia el Dashboard.
   */
  useEffect(() => {
    if (!isInitialLoading) {
      if (!isAuthenticated || !isAdmin) {
        console.warn("🛡️ [RBAC] Acceso no autorizado a la Terminal GEO. Redirigiendo...");
        router.replace("/dashboard");
      }
    }
  }, [isAdmin, isInitialLoading, isAuthenticated, router]);

  /**
   * ESTADO DE ESPERA: Sintonizando Rango
   * Mientras el sistema hidrata el token JWT y el perfil de la Bóveda, 
   * mostramos una interfaz de carga cinemática para evitar fugas visuales.
   */
  if (isInitialLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020202] selection:bg-primary/30">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 animate-pulse">
            Validando Autoridad
          </span>
          <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">
            Handshake de Soberanía V2.5
          </span>
        </div>
      </div>
    );
  }

  // Cláusula de seguridad: Si no es admin, bloqueamos el renderizado.
  if (!isAdmin) return null;

  return (
    <div className="h-[100dvh] w-full relative flex flex-col bg-[#020202] overflow-hidden selection:bg-primary/30">

      {/* 
          I. HUD DE TELEMETRÍA (STATUS BAR)
          Proyecta el estado de la conexión y el rango administrativo.
      */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 bg-black/40 backdrop-blur-md px-5 py-2 rounded-full border border-white/5 shadow-2xl">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[8px] font-black tracking-[0.2em] uppercase text-white/80">
            Modo Admin Activo
          </span>
        </div>
        <div className="h-3 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <Wifi className="h-3 w-3 text-emerald-500 opacity-60" />
          <span className="text-[8px] font-black tracking-[0.2em] uppercase text-emerald-500/60">
            Sincro Nominal
          </span>
        </div>
      </div>

      {/* 
          II. HEADER DE MANDO 
          Permite el retorno rápido al centro de mando operativo.
      */}
      <header className="flex-shrink-0 p-6 flex justify-between items-center z-50">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/40 hover:text-white hover:bg-primary/10 rounded-full h-12 w-12 transition-all border border-white/0 hover:border-white/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <Zap size={10} className="text-primary animate-pulse" />
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-primary/80">
              Nicepod <span className="text-white ml-1">Spatial Hub</span>
            </div>
          </div>
          <div className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-0.5">
            Admin Creation Terminal • {profile?.username || 'Curador'}
          </div>
        </div>
      </header>

      {/* 
          III. ÁREA DE TRABAJO (THE SCANNER)
          Inyectamos el componente GeoScannerUI que gestiona la lógica de 
          geolocalización, cámara y metadatos de los POIs.
      */}
      <main className="flex-1 relative z-10 contain-layout">
        <GeoScannerUI />
      </main>

      {/* 
          IV. ATMÓSFERA VISUAL (AURORA LIGHTS) 
          Blobs de baja intensidad para mantener la visibilidad técnica.
      */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[120%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-40" />
      <div className="absolute top-1/2 right-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Optimización del Hilo Principal: El uso de 'contain-layout' en el main 
 *    ayuda al navegador a aislar el renderizado del escáner, reduciendo 
 *    el costo de los recalculados de diseño (Forced Reflows).
 * 2. Seguridad Redundante: Al capturar el estado 'isAdmin' directamente del 
 *    contexto de autenticación, garantizamos que el componente se destruya 
 *    instantáneamente si el usuario pierde privilegios durante la sesión.
 * 3. Experiencia Inmersiva: El diseño h-[100dvh] (dynamic viewport height) 
 *    evita problemas de layout en navegadores móviles que ocultan la barra 
 *    de herramientas al hacer scroll.
 */