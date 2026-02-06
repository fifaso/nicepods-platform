// app/(marketing)/layout.tsx - VERSIÓN: 1.0 (Marketing Canvas)
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Aquí podríamos añadir un header de marketing simple en el futuro */}
      <main className="flex-grow z-10">
        {children}
      </main>
      {/* Footer minimalista de marca */}
    </div>
  );
}