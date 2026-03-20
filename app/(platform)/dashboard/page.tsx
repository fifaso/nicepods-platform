// app/(platform)/dashboard/page.tsx
// VERSIÓN: 21.0 (NiceCore V2.6 - Sovereign SSR Harvester)
// Misión: Extraer la inteligencia del metal en paralelo y delegarla al chasis interactivo.
// [ESTABILIZACIÓN]: Corrección de ts(2739) mediante el patrón Server-Component/Client-Shell.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  // 1. INSTANCIACIÓN DEL PUENTE DE RED
  const supabase = createClient();

  // 2. PROTOCOLO DE IDENTIDAD T0
  const { data: { user } } = await supabase.auth.getUser();

  // Si el usuario no existe, forzamos la salida. 
  // (El middleware ya hace esto, pero TypeScript exige seguridad de tipos).
  if (!user) {
    redirect("/login");
  }

  // 3. COSECHA PARALELA DE DATOS (EL MOTOR ZERO-WAIT)
  // Lanzamos las peticiones simultáneamente para reducir el Time To First Byte (TTFB).
  const [feedRes, profileRes, resonanceRes] = await Promise.all([
    supabase.rpc('get_user_discovery_feed', { p_user_id: user.id }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_resonance_profiles').select('*').eq('user_id', user.id).maybeSingle()
  ]);

  // 4. SANITIZACIÓN DEFENSIVA DE PAYLOADS
  const feedData = feedRes.data || { epicenter: [], semantic_connections: [] };
  const profileData = profileRes.data;
  const resonanceData = resonanceRes.data;

  const isAdmin = profileData?.role === 'admin' || user.app_metadata?.user_role === 'admin';

  // 5. INYECCIÓN TÁCTICA EN EL CHASIS CLIENTE
  // Delegamos el renderizado y la gestión del radar al Client Component.
  return (
    <DashboardClient
      initialFeed={{
        epicenter: feedData.epicenter || [],
        semantic_connections: feedData.semantic_connections || []
      }}
      initialProfile={profileData}
      initialResonance={resonanceData}
      isAdmin={isAdmin}
    />
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V21.0):
 * 1. Resolución Arquitectónica: Al delegar el estado a 'DashboardClient', permitimos
 *    que 'IntelligenceFeed' reciba sus props de búsqueda (isSearching, results),
 *    eliminando el error ts(2739) de raíz sin perder la hidratación SSR.
 * 2. Cero Pestañeo: Dado que 'DashboardClient' nace con los datos ya resueltos en 
 *    el servidor, el usuario nunca verá un 'loader' en el Dashboard principal.
 */