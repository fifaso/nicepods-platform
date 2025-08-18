// app/profile/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
// --- CORRECCIÓN: Usamos una ruta relativa para asegurar que encuentre el componente ---
import { ProfileClientComponent } from "../../components/profile-client-component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/types/supabase"; // Importamos Tables

// Definimos el tipo aquí para mayor claridad
export type ProfileWithSubscription = Tables<'profiles'> & {
  subscriptions: (Tables<'subscriptions'> & {
    plans: Tables<'plans'> | null;
  }) | null;
};

export default async function ProfilePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  
  const { data: profileWithSubscription, error } = await supabase
    .from("profiles")
    .select(`*, subscriptions(*, plans(*))`)
    .eq("id", user.id)
    .single();
  
  // Si hay un error (que no sea "no rows found"), o si el perfil es nulo,
  // podría significar que el trigger aún no ha terminado.
  // En lugar de mostrar un error, podemos manejarlo de forma más elegante.
  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching profile:", error.message);
  }

  return (
    <div className="container py-12">
       <Card className="max-w-4xl mx-auto backdrop-blur-lg bg-card/80 border-muted/30">
          <CardHeader>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
            <CardDescription>Manage your account settings and subscription preferences</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Pasamos los datos al componente cliente. Le decimos que puede ser nulo. */}
            <ProfileClientComponent profileData={profileWithSubscription as ProfileWithSubscription | null} />
          </CardContent>
       </Card>
    </div>
  );
}