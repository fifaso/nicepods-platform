// app/create/page.tsx

// ================== MODIFICACIÓN QUIRÚRGICA #1: IMPORTACIÓN NECESARIA ==================
import { cookies } from "next/headers";
// ====================================================================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PodcastCreationForm } from "@/components/podcast-creation-form";
import { Sparkles } from "lucide-react";

export default async function CreatePage() {
  // ================== MODIFICACIÓN QUIRÚRGICA #2: CREACIÓN CORRECTA DEL CLIENTE ==================
  // Creamos una instancia de las cookies para la solicitud actual.
  const cookieStore = cookies();
  // Pasamos el cookieStore a nuestra función helper. Ahora tiene el contexto que necesita.
  const supabase = createClient(cookieStore);
  // ==============================================================================================

  // --- LÓGICA DE GUARDIÁN EN EL SERVIDOR ---
  // Verificamos si hay un usuario válido ANTES de renderizar la página.
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Si no hay usuario, lo redirigimos al login, pidiendo que vuelva aquí después.
    redirect('/login?redirect=/create');
  }
  // --- FIN DE LA LÓGICA DE GUARDIÁN ---

  // Si el código llega aquí, el usuario está autenticado.
  return (
    <div className="pt-6">
      <div className="pt-6 pb-2 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-3">
          <div className="inline-flex items-center space-x-2 glass px-3 py-1.5 rounded-full">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs">AI-Powered Creation</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold">Create Your Micro-Podcast</h1>
          <p className="text-xs text-muted-foreground">
            Follow our guided process to create personalized micro-podcasts.
          </p>
        </div>
        <PodcastCreationForm />
      </div>
    </div>
  )
}