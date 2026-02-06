// app/(platform)/layout.tsx - VERSIÓN: 1.0 (Workstation Shell)
import { InstallPwaButton } from '@/components/install-pwa-button';
import { Navigation } from "@/components/navigation";
import { OfflineIndicator } from '@/components/offline-indicator';
import { PageTransition } from "@/components/page-transition";
import { PlayerOrchestrator } from "@/components/player-orchestrator";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SmoothScrollWrapper } from "@/components/smooth-scroll-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { AudioProvider } from "@/contexts/audio-context";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      <SmoothScrollWrapper>
        <OfflineIndicator />
        <InstallPwaButton />
        <ScrollToTop />
        <Navigation />
        <PageTransition>
          <main className="relative z-10">{children}</main>
        </PageTransition>
        <PlayerOrchestrator />
        <Toaster />
      </SmoothScrollWrapper>
    </AudioProvider>
  );
}