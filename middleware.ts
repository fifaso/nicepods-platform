// middleware.ts

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

  // ========================================================================
  // INICIO DE LA MODIFICACIÓN PROFESIONAL
  // ========================================================================
  // La línea original "const { data: { user } } = await supabase.auth.getUser()"
  // ha sido reemplazada por el siguiente bloque try-catch.
  // Esto previene el error 'AuthApiError: Invalid Refresh Token' que se muestra
  // en la consola del servidor durante el desarrollo. El error es un comportamiento
  // esperado cuando un usuario no autenticado accede al sitio, y este bloque
  // lo maneja de forma segura sin llenar los logs de "ruido".

  let user = null; // Declaramos la variable 'user' en un alcance superior.

  try {
    // Intentamos obtener los datos del usuario.
    const { data } = await supabase.auth.getUser();
    // Si la operación tiene éxito, asignamos el objeto de usuario.
    // Usamos el encadenamiento opcional (?.) para mayor seguridad.
    user = data?.user;
  } catch (error) {
    // Si ocurre un error (como el token no encontrado), lo capturamos aquí.
    // No necesitamos hacer nada; 'user' simplemente permanecerá como 'null',
    // que es el estado correcto para un usuario no autenticado.
  }
  
  // ========================================================================
  // FIN DE LA MODIFICACIÓN PROFESIONAL
  // ========================================================================


  // ========================================================================
  // INICIO DE LA MEJORA DEFINITIVA: LÓGICA DE REDIRECCIÓN CENTRALIZADA
  // Esta lógica permanece sin cambios, ya que ahora recibe la variable 'user'
  // correctamente definida (ya sea con datos de usuario o como 'null').
  // ========================================================================
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
  if (user && isPublicRoute) {
    // Lo redirigimos a la página de creación, que es su "dashboard" principal.
    return NextResponse.redirect(new URL('/create', request.url))
  }
  // ========================================================================
  // FIN DE LA MEJORA
  // ========================================================================

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}