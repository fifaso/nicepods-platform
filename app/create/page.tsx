import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PodcastCreationForm } from "@/components/podcast-creation-form";

export default async function CreatePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/create');
  }

  return (
    // ================== INTERVENCIÓN QUIRÚRGICA #1: ESTANDARIZACIÓN DEL LAYOUT ==================
    // Se ajusta el padding vertical para coincidir con las otras páginas principales.
    <div className="container mx-auto max-w-4xl py-12 md:py-16">
      <header className="text-center mb-8">
        {/*
          El badge "AI-Powered Creation" ha sido eliminado para una apariencia más limpia.
          Los textos ya están correctamente en español.
        */}
        <h1 className="text-4xl font-bold tracking-tight">Crea tu Micro-Podcast</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Sigue nuestro proceso guiado para generar guiones personalizados.
        </p>
      </header>
      <PodcastCreationForm />
    </div>
  );
}