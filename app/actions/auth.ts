'use server'

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export type UserRole = 'common' | 'complex_admin' | 'superadmin'

export interface UserProfile {
    id: string
    email: string
    role: UserRole
}

/**
 * Obtiene el usuario autenticado y su perfil
 */
export async function getCurrentUser() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        console.error('Auth error or no user:', authError)
        return null
    }

    const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
    let profile = existingProfile

    if (!profile && !profileError) {
        const { data: createdProfile, error: createProfileError } = await supabase
            .from('user_profiles')
            .insert({
                id: user.id,
                email: user.email || '',
                role: 'common',
            })
            .select('*')
            .single()

        if (createProfileError) {
            console.error('Profile creation error:', createProfileError)
        } else {
            profile = createdProfile
        }
    }

    if (profileError) {
        console.error('Profile error:', profileError)
        console.error('User ID:', user.id)
        console.error('User email:', user.email)
        return null
    }

    if (!profile) {
        console.error('No profile found for user:', user.id)
        return null
    }

    return {
        id: user.id,
        email: user.email || profile.email,
        role: profile.role as UserRole
    } as UserProfile
}

/**
 * Verifica si el usuario actual es admin
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === 'complex_admin' || user?.role === 'superadmin'
}

/**
 * Verifica si el usuario está autenticado
 */
export async function requireAuth(): Promise<UserProfile> {
    const user = await getCurrentUser()
    
    if (!user) {
        redirect('/login')
    }
    
    return user
}

/**
 * Verifica si el usuario es admin, redirige si no lo es
 */
export async function requireAdmin(): Promise<UserProfile> {
    const user = await requireAuth()
    
    if (user.role !== 'complex_admin' && user.role !== 'superadmin') {
        redirect('/complejo')
    }
    
    return user
}

export async function requireSuperAdmin(): Promise<UserProfile> {
    const user = await requireAuth()

    if (user.role !== 'superadmin') {
        redirect('/complejo')
    }

    return user
}

/**
 * Cierra la sesión del usuario
 */
export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}


