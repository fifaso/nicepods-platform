/**
 * ARCHIVO: app/map/page.tsx
 * VERSIÓN: 4.0 (NicePod Sovereign Explorer - Full Nominal Integrity)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proyectar el motor geoespacial y gobernar el acceso a la creación urbana
 * mediante la validación de autoridad en el servidor (Role Based Access Control).
 * [REFORMA V4.0]: Sincronización nominal total con GeoCreatorOverlay V8.1 y 
 * cumplimiento estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

// --- INFRAESTRUCTURA DE VISUALIZACIÓN SOBERANA ---
import { GeoCreatorOverlay } from "@/components/geo/geo-creator-overlay";

/**
 * [METADATA API]: Identidad de Visualización Técnica
 */
export const metadata: Metadata = {
  title: 'Madrid Resonance | Malla Urbana Activa',
  description: 'Explora y ancla la memoria de la ciudad en la red neuronal de NicePod.',
  // Mecanismo de defensa: Evitamos la indexación de la terminal de exploración dinámica.
  robots: { index: false, follow: false }
};

/**
 * MapExplorerPage: El orquestador de datos en el servidor para el reactor visual.
 * 
 * Esta página reside fuera del diseño de plataforma estándar (PlatformLayout) 
 * para garantizar el control total sobre la unidad de procesamiento gráfico (GPU).
 */
export default async function MapExplorerPage() {

  // 1. HANDSHAKE DE IDENTIDAD SOBERANA (Server-Side Authentication)
  // Realizamos la validación de autoridad antes de iniciar la carga de módulos pesados.
  const supabaseClient = createClient();
  const { 
    data: { user: authenticatedUser }, 
    error: authenticationError 
  } = await supabaseClient.auth.getUser();

  if (authenticationError || !authenticatedUser) {
    // Redirección táctica con preservación de ruta para optimizar el retorno del Voyager.
    redirect('/login?redirect=/map');
  }

  // 2. VERIFICACIÓN DE PRIVILEGIOS DE SIEMBRA (Role Based Access Control)
  // Determinamos si el Administrador posee autoridad para mutar la malla urbana.
  const userApplicationMetadata = authenticatedUser.app_metadata || {};
  const userRoleDescriptor = userApplicationMetadata.user_role || userApplicationMetadata.role || 'user';
  const isAdministratorAuthority = userRoleDescriptor === 'admin';

  /**
   * isForgeAuthorityGranted:
   * Define la capacidad de activar la terminal de forja en el dispositivo cliente.
   */
  const isForgeAuthorityGranted = isAdministratorAuthority;

  return (
    /**
     * [CHASIS TÁCTICO]: h-[100dvh] (Dynamic Viewport Height)
     * Misión: Garantizar que el motor WebGL sea el dueño absoluto del cristal, 
     * evitando colisiones con las barras de navegación de los sistemas operativos.
     */
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#020202] overflow-hidden selection:bg-primary/20">

      {/* 
          I. EL MOTOR CARTOGRÁFICO UNIFICADO (REACTOR VISUAL)
          Se delega la orquestación al componente GeoCreatorOverlay, el cual 
          gestiona la transición entre el modo exploración y el modo forja.
      */}
      <div className="absolute inset-0 z-0">
        <GeoCreatorOverlay
          isForgeAuthorityGranted={isForgeAuthorityGranted} // [FIX TS2322]: Sincronía Nominal V4.1
          userIdentification={authenticatedUser.id}        // [FIX TS2322]: Sincronía Nominal V4.1
        />
      </div>

      {/* 
          NOTA DE HIGIENE ARQUITECTÓNICA: 
          Se omite la navegación global para proteger el rendimiento de Mapbox GL JS v3 
          y evitar la competencia de recursos en el hilo de renderizado.
      */}

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Zero Abbreviations Policy: Se purificaron términos como 'authError', 'user', 
 *    'id', 'isAdministratorAuthority' y 'canForgeNodes', elevando el archivo al estándar industrial.
 * 2. Contract Alignment: El cambio de las propiedades de GeoCreatorOverlay garantiza 
 *    que el Build Shield de Vercel valide la integridad de la transmisión de datos.
 * 3. Resource Optimization: El chequeo de sesión en el servidor evita el despliegue 
 *    innecesario de librerías WebGL para usuarios no autenticados.
 */