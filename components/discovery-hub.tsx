// components/discovery-hub.tsx
// VERSIÓN POTENCIADA: Utiliza UniverseCard para una experiencia visual inmersiva.

import { UniverseCard } from "@/components/universe-card"; // [CAMBIO QUIRÚRGICO #1]: Se cambia la importación.

// [CAMBIO QUIRÚRGICO #2]: Se actualiza la estructura de datos para incluir las imágenes.
const discoveryHubCategories = [
    {
        key: "deep_thought",
        title: "Pensamiento Profundo",
        image: "/images/universes/deep-thought.png",
        href: "/podcasts?tab=discover&universe=deep_thought"
    },
    {
        key: "practical_tools",
        title: "Herramientas Prácticas",
        image: "/images/universes/practical-tools.png",
        href: "/podcasts?tab=discover&universe=practical_tools"
    },
    {
        key: "tech_and_innovation",
        title: "Innovación y Tec.",
        image: "/images/universes/tech.png",
        href: "/podcasts?tab=discover&universe=tech_and_innovation"
    },
    {
        key: "narrative_and_stories",
        title: "Narrativa e Historias",
        image: "/images/universes/narrative.png",
        href: "/podcasts?tab=discover&universe=narrative_and_stories"
    },
];

export function DiscoveryHub() {
    return (
        <section className="my-12">
            {/* [CAMBIO QUIRÚRGICO #3]: Se renderiza el componente UniverseCard con las nuevas props. */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {discoveryHubCategories.map((category) => (
                    <UniverseCard
                        key={category.key}
                        title={category.title}
                        image={category.image}
                        href={category.href}
                        isActive={false} // En el hub, ninguna tarjeta está "activa" por defecto.
                    />
                ))}
            </div>
        </section>
    );
}