// app/(geo-mode)/geo/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Madrid Resonance | Modo Explorador",
  themeColor: "#000000",
};

export default function GeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Fondo Ambiental Abstracto */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900 rounded-full blur-[120px]" />
      </div>

      {/* Contenido Seguro */}
      <main className="relative z-10 h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
}