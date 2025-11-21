// app/create/page.tsx (Versión Final Corregida)

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
    <div className="container mx-auto max-w-4xl py-12 md:py-16">
      {/* El header ha sido eliminado para evitar el scroll vertical. */}
      <PodcastCreationForm />
    </div>
  );
}