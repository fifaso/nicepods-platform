// app/create/page.tsx
// VERSIÓN FINAL: Implementa un layout flexible para centrar el formulario y eliminar el scroll.

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
    // [CAMBIO QUIRÚRGICO]: Se reemplaza el padding por clases de Flexbox para centrado vertical.
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <PodcastCreationForm />
      </div>
    </div>
  );
}