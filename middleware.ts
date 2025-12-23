import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Rutas públicas (login)
    const isLoginPage = request.nextUrl.pathname === '/login'
    
    // Si está en login y ya está autenticado, verificar que tenga perfil
    if (isLoginPage && user) {
        // Verificar si tiene perfil
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', user.id)
            .single()
        
        if (profile) {
            return NextResponse.redirect(new URL('/turnos', request.url))
        }
        // Si no tiene perfil, permitir quedarse en login para que se cree
    }

    // Si no está en login y no está autenticado, redirigir a login
    if (!isLoginPage && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Si está autenticado pero no tiene perfil, el trigger debería crearlo automáticamente
    // Si no existe, redirigir a login (el usuario necesitará que se cree el perfil manualmente)
    if (!isLoginPage && user) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', user.id)
            .single()
        
        // Si no tiene perfil, el trigger debería haberlo creado
        // Si no existe, puede ser un usuario antiguo - permitir acceso pero mostrar advertencia
        // (El layout manejará mostrar "No autenticado" si no hay perfil)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

