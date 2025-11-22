// components/discovery-hub.tsx
// Un componente dedicado para mostrar las 4 categorías principales de descubrimiento.

import { QuadrantCard } from "@/components/ui/quadrant-card";
import { Compass, Lightbulb, Bot, Mic } from "lucide-react";

const discoveryHubCategories = [
    {
        icon: <Lightbulb className="h-6 w-6" />,
        title: "Pensamiento Profundo",
        description: "Explora los 'porqués' del mundo.",
        href: "/podcasts?tab=discover&universe=deep_thought"
    },
    {
        icon: <Compass className="h-6 w-6" />,
        title: "Herramientas Prácticas",
        description: "Conocimiento aplicable para tu día a día.",
        href: "/podcasts?tab=discover&universe=practical_tools"
    },
    {
        icon: <Bot className="h-6 w-6" />,
        title: "Innovación y Tecnología",
        description: "Descubre cómo funciona el futuro.",
        href: "/podcasts?tab=discover&universe=tech_and_innovation"
    },
    {
        icon: <Mic className="h-6 w-6" />,
        title: "Narrativa e Historias",
        description: "Conecta a través del storytelling.",
        href: "/podcasts?tab=discover&universe=narrative_and_stories"
    },
];

export function DiscoveryHub() {
    return (
        <section className="my-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {discoveryHubCategories.map((category) => (
                    <QuadrantCard
                        key={category.href}
                        icon={category.icon}
                        title={category.title}
                        description={category.description}
                        href={category.href}
                    />
                ))}
            </div>
        </section>
    );
}