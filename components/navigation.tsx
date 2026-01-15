"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/notification-bell";
import { Mic, Menu, LogOut, ShieldCheck, Loader, User as UserIcon, Sparkles } from "lucide-react";
import { cn, getSafeAsset } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, isAdmin, signOut, isLoading } = useAuth();

  const navItems = [
    { href: "/create", label: "Crear" },
    { href: "/podcasts", label: "Micro-pods" },
    { href: "/pricing", label: "Precios" }
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logout:", error);
    }
  };

  const logoSrc = getSafeAsset("/nicepod-logo.png", "logo");

  return (
    <header className="sticky top-0 z-50 w-full p-4">
      <div className="relative max-w-screen-xl mx-auto flex h-16 items-center rounded-2xl border border-border/40 bg-background/80 px-4 shadow-xl backdrop-blur-lg">

        {/* LOGO */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 shadow-inner">
              <Image
                src={logoSrc}
                alt="NicePod"
                fill
                className="object-cover group-hover:scale-110 transition-all duration-500"
                loading="eager"
              />
            </div>
            <span className="font-black text-xl tracking-tighter hidden sm:block">NicePod</span>
          </Link>
        </div>

        {/* CTA CENTRAL MOVIL */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
          <Link href="/create">
            <Button
              size="sm"
              className="h-9 px-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl bg-aurora animate-aurora text-white border-none"
            >
              <Mic className="mr-1.5 h-3.5 w-3.5 animate-pulse" />
              Crear
            </Button>
          </Link>
        </div>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ul className="flex items-center space-x-1 rounded-full bg-muted/50 p-1 border border-border/20">
            {navItems.map((item) => {
              const isCreateBtn = item.href === '/create';
              if (isCreateBtn) {
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <Button size="sm" className="rounded-full px-5 h-8 text-[10px] font-black uppercase tracking-widest bg-aurora animate-aurora text-white border-none">
                        <Sparkles className="mr-1.5 h-3 w-3" />
                        {item.label}
                      </Button>
                    </Link>
                  </li>
                );
              }
              return (
                <li key={item.href}>
                  <Link href={item.href} className={cn("rounded-full px-4 py-1.5 text-xs font-bold uppercase transition-all block", isActive(item.href) ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-primary")}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* DERECHA */}
        <div className="flex-1 flex items-center justify-end space-x-2">
          <ThemeToggle />
          <div className="hidden sm:flex items-center space-x-2">
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : user && profile ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer border border-border hover:border-primary transition-all">
                      <AvatarImage src={getSafeAsset(profile.avatar_url, 'avatar')} />
                      <AvatarFallback className="font-bold">{profile.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground px-2 py-1.5">Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href={`/profile/${profile.username}`} className="flex items-center font-bold text-sm"><UserIcon className="mr-2 h-4 w-4" /> Perfil</Link></DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="bg-red-500/5 focus:bg-red-500/10"><Link href="/admin" className="text-red-500 font-bold text-xs uppercase"><ShieldCheck className="mr-2 h-4 w-4" /> Torre de Control</Link></DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-muted-foreground focus:text-destructive"><LogOut className="mr-2 h-4 w-4" /> Salir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href='/login'><Button variant="ghost" className="font-bold text-sm">Ingresar</Button></Link>
            )}
          </div>

          {/* MOVIL SHEET */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><Menu className="h-6 w-6" /></Button></SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs p-6 rounded-l-[2.5rem]">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center space-x-3"><Image src={logoSrc} alt="NP" width={32} height={32} /><span className="font-black text-xl">NicePod</span></SheetTitle>
                  <SheetDescription className="sr-only">Navegación Móvil</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-12">
                  {navItems.map((item) => {
                    const isCreateBtn = item.href === '/create';
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant={isActive(item.href) && !isCreateBtn ? "secondary" : "ghost"} className={cn("w-full justify-start text-lg h-14 rounded-2xl", isCreateBtn && "bg-aurora animate-aurora text-white font-black uppercase")}>
                          {isCreateBtn && <Mic className="mr-3 h-5 w-5 animate-pulse" />}
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}