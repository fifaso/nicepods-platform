// app/(geo-mode)/geo/page.tsx
"use client";
import { GeoScannerUI } from "@/components/geo/scanner-ui";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GeoPage() {
  return (
    <>
      <header className="p-4 flex justify-between items-center">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="text-xs font-black tracking-[0.3em] uppercase text-white/30">
          MADRID RESONANCE v1.0
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <GeoScannerUI />
    </>
  );
}