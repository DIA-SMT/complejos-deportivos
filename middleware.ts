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
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

    const isLoginPage = request.nextUrl.pathname === '/login'
    const publicRoutes = ['/', '/reservar', '/actualizar-contrasena']
    const isPublicCredentialRoute = request.nextUrl.pathname.startsWith('/credencial/')
    const isPublicRoute = isLoginPage || isPublicCredentialRoute || publicRoutes.includes(request.nextUrl.pathname)
    const adminRoutes = ['/seleccionar-complejo', '/configuracion', '/profesores', '/inventario', '/turnos', '/reportes', '/socios']
    const superadminRoutes = ['/administradores']
    const isAdminRoute = adminRoutes.some((route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`))

    if (isLoginPage && user) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, role')
            .eq('id', user.id)
            .single()

        if (profile) {
            const destination = profile.role === 'superadmin'
                ? '/turnos'
                : profile.role === 'complex_admin'
                    ? '/turnos'
                    : '/'
            return NextResponse.redirect(new URL(destination, request.url))
        }
    }

    if (!isPublicRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && isAdminRoute) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'superadmin' && profile?.role !== 'complex_admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    if (user && superadminRoutes.some((route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`))) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'superadmin') {
            return NextResponse.redirect(new URL('/complejo', request.url))
        }
    }

    if (user && request.nextUrl.pathname === '/perfil') {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'superadmin' && profile?.role !== 'complex_admin') {
            return NextResponse.redirect(new URL('/mi-perfil', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)',
    ],
}
