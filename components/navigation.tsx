// components/navigation.tsx
// VERSIÓN FINAL CON ENLACE A PERFIL CORREGIDO

"use client";

import Link from "next/link";
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
} from "@/components/ui/sheet";
import { NotificationBell } from "@/components/notification-bell";
import { Mic, Menu, LogIn, LogOut, ShieldCheck, Loader, User as UserIcon, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // [INTERVENCIÓN QUIRÚRGICA]: Se obtiene el 'profile' completo del hook `useAuth`.
  const { user, profile, isAdmin, signOut, isLoading } = useAuth();

  const navItems = [
    { href: "/create", label: "Crear" },
    { href: "/podcasts", label: "Micro-pods" },
    { href: "/pricing", label: "Precios" }
  ];

  const isActive = (href: string) => pathname === href;

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full p-4">
      <div className="relative max-w-screen-xl mx-auto flex h-16 items-center rounded-2xl border border-border/40 bg-background/80 px-4 shadow-lg shadow-black/5 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl inline-block">NicePod</span>
          </Link>
        </div>

        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ul className="flex items-center space-x-2 rounded-full bg-muted/50 p-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-background shadow-sm text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 flex items-center justify-end space-x-2">
          <ThemeToggle />
          
          <div className="hidden sm:flex items-center space-x-2">
            {isLoading ? (
              <div className="w-20 h-10 flex items-center justify-center"><Loader className="h-5 w-5 animate-spin"/></div>
            ) : user && profile ? ( // Se asegura de que tanto user como profile existan
              <>
                <NotificationBell />
                {isAdmin && (<Link href="/admin/prompts" title="Panel de Administrador"><Button variant="ghost" size="icon"><ShieldCheck className="h-5 w-5 text-green-500" /></Button></Link>)}
                
                {/* [INTERVENCIÓN QUIRÚRGICA]: Se utiliza `profile.username` como la fuente de la verdad para el enlace. */}
                <Link href={`/profile/${profile.username}`} title="Perfil">
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback>{profile.full_name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <Link href='/login'><Button variant="ghost">Ingresar</Button></Link>
            )}
          </div>
          
          <Link href="/create"><Button className="hidden lg:inline-flex"><Mic className="mr-2 h-4 w-4" />Crear Nuevo Podcast</Button></Link>

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs">
                <SheetHeader>
                  <SheetTitle>
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2">
                       <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600">
                         <Mic className="h-6 w-6 text-white" />
                       </div>
                       <span className="font-bold text-xl">NicePod</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-3 mt-8">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={handleMobileLinkClick}>
                      <Button
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        className="w-full justify-start text-base py-6"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                  <hr className="border-border" />
                  {isLoading ? (
                    <div className="flex items-center justify-center p-4"><Loader className="h-6 w-6 animate-spin"/></div>
                  ) : user && profile ? ( // Se asegura de que tanto user como profile existan
                    <>
                      <Button variant="ghost" className="w-full justify-start text-base py-6" disabled>
                        <Bell className="mr-2 h-5 w-5" /> Notificaciones
                      </Button>
                      
                      {/* [INTERVENCIÓN QUIRÚRGICA]: Se utiliza `profile.username` para el enlace móvil. */}
                      <Link href={`/profile/${profile.username}`} onClick={handleMobileLinkClick}><Button variant="ghost" className="w-full justify-start text-base py-6"><UserIcon className="mr-2 h-5 w-5" /> Perfil</Button></Link>
                      
                      {isAdmin && <Link href="/admin/prompts" onClick={handleMobileLinkClick}><Button variant="ghost" className="w-full justify-start text-base py-6 text-green-500"><ShieldCheck className="mr-2 h-5 w-5" />Admin</Button></Link>}
                      <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-base py-6 text-red-500"><LogOut className="mr-2 h-5 w-5" /> Cerrar Sesión</Button>
                    </>
                  ) : (
                    <Link href="/login" onClick={handleMobileLinkClick}><Button variant="ghost" className="w-full justify-start text-base py-6"><LogIn className="h-5 w-5 mr-2" /> Ingresar</Button></Link>
                  )}
                  <hr className="border-border" />
                  <Link href="/create" onClick={handleMobileLinkClick}><Button size="lg" className="w-full py-6 text-base"><Mic className="mr-2 h-5 w-5" />Crear Nuevo Podcast</Button></Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}