import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByHandle } from "@/actions/profile-actions";
import { ProfileHeader } from "@/components/social/profile-header";
import { CollectionCard } from "@/components/social/collection-card";
import { AuroraCard } from "@/components/ui/aurora-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Shadcn Tabs
import { Metadata } from "next";

interface PageProps {
  params: { handle: string };
}

// 1. SEO Dinámico
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await getProfileByHandle(params.handle);
  if (!profile) return { title: "Perfil no encontrado" };
  
  return {
    title: `${profile.display_name} (@${profile.handle}) | NicePod`,
    description: profile.bio || `Escucha las colecciones de ${profile.display_name}`,
    openGraph: {
      images: [profile.avatar_url || "/default-og.png"],
    }
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const supabase = createClient();
  
  // 1. Fetching Paralelo (Waterfall Prevention)
  const profileDataPromise = getProfileByHandle(params.handle);
  const authUserPromise = supabase.auth.getUser();

  const [profile, authResult] = await Promise.all([profileDataPromise, authUserPromise]);

  if (!profile) return notFound(); // Manejo 404

  const currentUser = authResult.data.user;
  const isOwnProfile = currentUser?.id === profile.id;

  // 2. Fetching Relacional (Collections & Podcasts)
  // Nota: Esto podría optimizarse moviéndolo a componentes Suspense
  const { data: collections } = await supabase
    .from("collections")
    .select("*, collection_items(count)")
    .eq("owner_id", profile.id)
    .eq("is_public", true) // Solo públicas por defecto
    .order("created_at", { ascending: false });

  // Check si ya le sigo (para el botón)
  let isFollowing = false;
  if (currentUser && !isOwnProfile) {
    const { data } = await supabase
      .from("followers")
      .select("follower_id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", profile.id)
      .single();
    isFollowing = !!data;
  }

  return (
    <div className="min-h-screen pb-20 pt-24 px-4 max-w-5xl mx-auto space-y-8">
      {/* Sección Identidad */}
      <AuroraCard className="p-2">
        <ProfileHeader 
          profile={profile} 
          isOwnProfile={isOwnProfile}
          isFollowingInicial={isFollowing}
        />
      </AuroraCard>

      {/* Sección Contenido (Tabs) */}
      <Tabs defaultValue="collections" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b border-white/10 rounded-none p-0 h-auto gap-8">
          <TabsTrigger 
            value="collections" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent px-0 py-3 text-muted-foreground data-[state=active]:text-white transition-all text-base"
          >
            Colecciones
          </TabsTrigger>
          <TabsTrigger 
            value="podcasts" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent px-0 py-3 text-muted-foreground data-[state=active]:text-white transition-all text-base"
          >
            Podcasts
          </TabsTrigger>
        </TabsList>

        {/* Grid de Colecciones */}
        <TabsContent value="collections" className="mt-8">
          {collections && collections.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {collections.map((col) => (
                <CollectionCard
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  itemCount={col.collection_items?.[0]?.count || 0}
                  isPublic={col.is_public}
                  coverImage={col.cover_image_url}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-muted-foreground">
              <p>Este usuario aún no ha curado colecciones.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="podcasts">
          <div className="py-20 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
            <p>Listado de podcasts (Componente reutilizable existente)</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}