// app/create/page.tsx
// VERSIÓN: 8.0 (Modular Orchestration Integration - Zero Scroll Layout)

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
// [CAMBIO QUIRÚRGICO]: Ahora importamos el Orquestador Modular desde su nueva ubicación
import PodcastCreationForm from "@/components/create-flow";

/**
 * CreatePage
 * Punto de entrada para el flujo de creación.
 * Maneja la validación de sesión en el servidor (SSR) para máxima seguridad.
 */
export default async function CreatePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Verificación de Seguridad en el Servidor
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Redirección con callback para mejorar la UX post-login
    redirect('/login?redirect=/create');
  }

  return (
    /**
     * ESTRATEGIA DE LAYOUT:
     * min-h-[calc(100vh-8rem)]: Reserva espacio para el header y footer global.
     * flex items-center justify-center: Centrado perfecto del formulario.
     */
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Renderizado del nuevo motor modular v23.0 */}
        <PodcastCreationForm />
      </div>
    </div>
  );
}