// app/create/page.tsx
// VERSIÓN: 2.3 (Production Ready - Named Import & SSR Sync)

import { listUserDrafts } from "@/actions/draft-actions";
import PodcastCreationOrchestrator from "@/components/create-flow";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * PAGE: CreatePage
 * Orquestador de servidor para la ruta de creación.
 * Garantiza la hidratación de borradores antes de que el cliente tome el control.
 */
export default async function CreatePage() {
  const supabase = createClient();

  // 1. Verificación de Seguridad en el Servidor
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?redirect=/create");
  }

  // 2. Hidratación de Datos de Borradores (Status: 'draft')
  // [CORRECCIÓN]: Sincronización del nombre de la función exportada en actions
  const existingDrafts = await listUserDrafts();

  return (
    <main className="min-h-screen bg-transparent relative overflow-hidden">
      {/* 
        Componente Raíz del Formulario.
        Recibe los borradores pre-cargados para evitar estados de carga vacíos.
      */}
      <PodcastCreationOrchestrator initialDrafts={existingDrafts} />
    </main>
  );
}