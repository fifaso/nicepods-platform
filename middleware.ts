// middleware.ts
// VERSIÓN FINAL Y CORREGIDA: Redirige a los usuarios autenticados a la página de inicio ('/') como dashboard principal.

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) { response.cookies.set({ name, value, ...options }) },
        remove(name: string, options: CookieOptions) { response.cookies.delete({ name, ...options }) },
      },
    }
  )

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (error) {
    // El usuario no está autenticado. 'user' permanecerá como 'null'.
  }
  
  const protectedRoutes = ['/create', '/profile', '/dashboard']
  const publicRoutes = ['/login', '/signup']

  const isProtectedRoute = protectedRoutes.some(path => request.nextUrl.pathname.startsWith(path));
  const isPublicRoute = publicRoutes.some(path => request.nextUrl.pathname.startsWith(path));

  // CASO 1: El usuario no está logueado e intenta acceder a una ruta protegida.
  if (!user && isProtectedRoute) {
    // Lo redirigimos a login, guardando la página a la que quería ir.
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // CASO 2: El usuario SÍ está logueado e intenta acceder a una ruta pública (como login).
  // [CAMBIO QUIRÚRGICO]: Se cambia el destino de la redirección a la página raíz ('/').
  // Esta es ahora nuestra página de inicio y dashboard principal para usuarios autenticados.
  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}