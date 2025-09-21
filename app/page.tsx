// app/page.tsx

import Link from "next/link";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodcastCard } from "@/components/podcast-card";
import { Mic, Play, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: latestPodcasts, error } = await supabase
    .from('micro_pods')
    .select(`*, profiles (full_name, avatar_url)`)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) {
    console.error("Error al obtener los últimos podcasts para la página de inicio:", error.message);
  }
  
  // Se mantienen los datos de ejemplo, pero con contenido traducido y adaptado.
  const sampleFeaturesPodcasts = [
    { id: "1", title: "La Ciencia de Crear Hábitos", description: "Descubre los secretos para construir hábitos duraderos.", category: "Psicología", duration: "5:23", color: "from-purple-500 to-pink-500" },
    { id: "2", title: "Mindfulness en la Era Digital", description: "Aprende a mantenerte presente y enfocado.", category: "Bienestar", duration: "4:15", color: "from-blue-500 to-cyan-500" },
    { id: "3", title: "El Poder de la Filosofía Estoica", description: "Sabiduría milenaria para los desafíos modernos.", category: "Filosofía", duration: "6:42", color: "from-indigo-500 to-purple-500" },
    { id: "4", title: "Entendiendo Sesgos Cognitivos", description: "Explora los atajos mentales que nos influencian.", category: "Psicología", duration: "5:18", color: "from-pink-500 to-rose-500" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sección Principal (Hero) */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center text-center overflow-hidden">
        <div className="relative z-10 px-4 md:px-6 max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-50 drop-shadow-lg">Expande tu perspectiva diariamente</h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto drop-shadow-md">Crea y descubre Micro-Podcasts que se adaptan a tu ritmo de vida. Aprende, comparte y potencia tu creatividad.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/create" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-transform duration-300 transform hover:scale-105">
              <Mic className="mr-2 h-5 w-5" />
              Comienza a Crear
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de Búsqueda y Descubrimiento */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background/80 backdrop-blur-lg">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <h2 className="text-3xl font-bold text-primary-accessible">Encuentra tu Próxima Idea</h2>
            <p className="text-lg text-secondary-accessible max-w-2xl">Busca temas específicos o explora nuestras categorías seleccionadas.</p>
            <div className="w-full max-w-md relative">
              <Input type="search" placeholder="Buscar podcasts..." className="w-full pr-10" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-12">
            <Tabs defaultValue="featured" className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-2">
                <TabsTrigger value="featured">Destacados</TabsTrigger>
                <TabsTrigger value="technology">Tecnología</TabsTrigger>
                <TabsTrigger value="science">Ciencia</TabsTrigger>
                <TabsTrigger value="philosophy">Filosofía</TabsTrigger>
                <TabsTrigger value="business">Negocios</TabsTrigger>
                <TabsTrigger value="wellness">Bienestar</TabsTrigger>
              </TabsList>
              <TabsContent value="featured" className="mt-8">
                {(latestPodcasts && latestPodcasts.length > 0) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {latestPodcasts.map((podcast: any) => (
                      <PodcastCard key={podcast.id} podcast={podcast} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-lg bg-muted/50">
                    <h3 className="text-xl font-semibold">¡Aún no hay podcasts!</h3>
                    <p className="text-muted-foreground mt-2">Parece que todo está en silencio por aquí. ¡Sé el primero en crear y compartir un micro-podcast!</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Sección de Características */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-sm"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">¿Por Qué Elegir NicePod?</h2>
            <p className="text-lg text-secondary-accessible max-w-2xl mx-auto font-medium">Diseñado para educadores, estudiantes y mentes curiosas.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sampleFeaturesPodcasts.map((podcast) => (
              <Card key={podcast.id} className="text-center bg-card/50 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <Badge variant="secondary">{podcast.category}</Badge>
                  <CardTitle className="text-lg leading-tight">{podcast.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm mb-4">{podcast.description}</CardDescription>
                  <Button className={`w-full bg-gradient-to-r ${podcast.color} text-white`}>
                    <Play className="mr-2 h-4 w-4" /> Escuchar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 bg-muted/50 text-center text-sm text-muted-foreground">
        <div className="container px-4 md:px-6 mx-auto">
          <p>&copy; {new Date().getFullYear()} NicePod. Todos los derechos reservados.</p>
          <nav className="mt-4 flex justify-center space-x-4">
            <Link href="#" className="hover:text-primary">Política de Privacidad</Link>
            <Link href="#" className="hover:text-primary">Términos de Servicio</Link>
            <Link href="#" className="hover:text-primary">Contacto</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}