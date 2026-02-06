// app/(marketing)/page.tsx
// VERSIÓN: 1.0 (The Witness Portal - High Impact Landing)

import { DiscoveryHub } from "@/components/discovery-hub";
import { MapPreviewFrame } from "@/components/geo/map-preview-frame";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Headphones, Zap } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">

      {/* SECCIÓN HERO: LA LLAMADA AL TESTIGO */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest animate-fade-in">
            <Zap className="h-3 w-3" /> NicePod V2.5 está aquí
          </div>

          <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-zinc-900 dark:text-white">
            LA CIUDAD TIENE <br />
            <span className="text-primary italic">MEMORIA</span>.
          </h1>

          <p className="max-w-2xl mx-auto text-lg lg:text-2xl text-muted-foreground font-medium leading-relaxed">
            NicePod transforma el mapa en un sistema nervioso digital. Crea y descubre crónicas sonoras ancladas a la realidad física.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="rounded-full px-8 text-lg font-bold h-14 shadow-xl shadow-primary/20">
              <Link href="/login">Entrar en la Bóveda <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-lg font-bold h-14 backdrop-blur-md bg-white/5">
              <Link href="/signup">Unirse como Cronista</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECCIÓN VISUAL: MADRID RESONANCE */}
      <section className="w-full max-w-5xl mx-auto px-4 pb-24 group">
        <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20 pointer-events-none" />
          <MapPreviewFrame />
          <div className="absolute bottom-8 left-8 z-30">
            <p className="text-white font-black text-2xl tracking-tighter uppercase italic opacity-80">
              Madrid <span className="text-primary">Live</span>
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE VALOR: LOS PILARES */}
      <section className="py-24 bg-zinc-900/5 dark:bg-white/5 border-y border-zinc-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">

          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Animismo Urbano</h3>
            <p className="text-muted-foreground leading-relaxed">
              No somos un diario personal. Somos la voz de los edificios, las calles y los monumentos de Madrid.
            </p>
          </div>

          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Headphones className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Audio-Realidad</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sintetizamos guiones de alta densidad con Gemini 1.5 Pro, optimizados para una locución neuronal perfecta.
            </p>
          </div>

          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Economía Circular</h3>
            <p className="text-muted-foreground leading-relaxed">
              Cada podcast generado alimenta nuestro Knowledge Vault, creando una inteligencia colectiva perpetua.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER CTA */}
      <footer className="py-20 text-center">
        <DiscoveryHub showOnlyCategories={true} />
        <p className="mt-12 text-sm text-muted-foreground">© 2026 NicePod. Witness, Not Diarist.</p>
      </footer>
    </div>
  );
}