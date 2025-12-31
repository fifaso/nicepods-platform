// app/create/page.tsx
// VERSIÓN: 9.0 (Direct Mount - Eliminates Layout Conflicts)

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Importamos el Orquestador desde el índice del módulo
// Usamos el nombre semántico correcto para mantener coherencia
import PodcastCreationOrchestrator from "@/components/create-flow";

export const metadata = {
  title: "Nuevo Podcast | NicePod Studio",
  description: "Crea contenido de audio con inteligencia artificial situacional.",
};

export default async function CreatePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Verificación de Seguridad (SSR)
  // Protegemos la ruta en el servidor antes de enviar cualquier JS al cliente
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login?redirect=/create');
  }

  /**
   * INTERVENCIÓN ESTRATÉGICA:
   * Hemos eliminado los contenedores <div> con clases 'flex', 'min-h', etc.
   * El componente PodcastCreationOrchestrator (y su LayoutShell) está diseñado 
   * con 'fixed inset-0', por lo que necesita ser montado directamente en el fragmento 
   * para tomar control del viewport sin restricciones heredadas.
   */
  return (
    <>
      <PodcastCreationOrchestrator />
    </>
  );
}