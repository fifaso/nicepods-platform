// app/create/page.tsx

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PodcastCreationForm } from "@/components/podcast-creation-form";
import { Sparkles } from "lucide-react";

export default async function CreatePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // --- LÓGICA DE GUARDIÁN EN EL SERVIDOR ---
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/create');
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold">AI-Powered Creation</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mt-4">Crea tu Micro-Podcast</h1>
        <p className="text-md text-muted-foreground mt-2">
          Sigue nuestro proceso guiado para generar guiones personalizados.
        </p>
      </div>
      <PodcastCreationForm />
    </div>
  );
}