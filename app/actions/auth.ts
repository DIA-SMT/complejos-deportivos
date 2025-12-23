'use server'

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export type UserRole = 'common' | 'admin'

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

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

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
        email: profile.email,
        role: profile.role as UserRole
    } as UserProfile
}

/**
 * Verifica si el usuario actual es admin
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === 'admin'
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
    
    if (user.role !== 'admin') {
        redirect('/turnos')
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


