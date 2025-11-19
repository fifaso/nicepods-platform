// middleware.ts
// VERSIÓN ACTUALIZADA: Redirige a los usuarios autenticados a la página de inicio ('/') en lugar de a '/create'.

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

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // [CAMBIO QUIRÚRGICO]: Si un usuario logueado intenta acceder a una ruta pública,
  // ahora lo redirigimos a la página de inicio ('/'), que es nuestro nuevo dashboard.
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