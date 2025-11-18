// components/navigation.tsx
// VERSIÓN FINAL: Actualizado con el nuevo logo de marca desde la carpeta /public.

"use client";

import Link from "next/link";
import Image from "next/image"; // [CAMBIO QUIRÚRGICO #1]: Se importa el componente de Imagen de Next.js.
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
          {/* [CAMBIO QUIRÚRGICO #2]: Se reemplaza el logo antiguo por el nuevo componente <Image>. */}
          <Link href="/" className="flex items-center">
            <Image
              src="/nicepod-logo.svg" // Asume que el logo se llama así en la carpeta /public
              alt="NicePod Logo"
              width={120} // Ajusta el ancho según el diseño de tu logo
              height={40} // Ajusta la altura para que encaje bien en la barra de h-16 (64px)
              priority // Carga la imagen con prioridad ya que es parte del LCP (Largest Contentful Paint)
            />
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
            ) : user && profile ? (
              <>
                <NotificationBell />
                {isAdmin && (<Link href="/admin/prompts" title="Panel de Administrador"><Button variant="ghost" size="icon"><ShieldCheck className="h-5 w-5 text-green-500" /></Button></Link>)}
                
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
                    {/* [CAMBIO QUIRÚRGICO #3]: Se reemplaza también el logo en el menú móvil para consistencia. */}
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                       <Image
                         src="/nicepod-logo.svg"
                         alt="NicePod Logo"
                         width={120}
                         height={40}
                       />
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
                  ) : user && profile ? (
                    <>
                      <Button variant="ghost" className="w-full justify-start text-base py-6" disabled>
                        <Bell className="mr-2 h-5 w-5" /> Notificaciones
                      </Button>
                      
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