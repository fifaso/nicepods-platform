"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevenir que Chrome muestre el mini-banner automáticamente (opcional)
      e.preventDefault();
      // Guardar el evento para dispararlo después
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar el prompt nativo
    deferredPrompt.prompt();

    // Esperar a que el usuario decida
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    
    setDeferredPrompt(null);
  };

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-24 left-4 z-50 md:hidden animate-in slide-in-from-bottom-5">
      <Button 
        onClick={handleInstallClick} 
        className="rounded-full shadow-xl bg-primary text-white font-bold px-4 py-6"
      >
        <Download className="mr-2 h-5 w-5" /> Instalar App
      </Button>
    </div>
  );
}