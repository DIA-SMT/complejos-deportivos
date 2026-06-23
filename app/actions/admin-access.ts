'use server'

import { revalidatePath } from "next/cache"
import { requireSuperAdmin } from "@/app/actions/auth"
import { createClient } from "@/utils/supabase/server"

export type ComplexAdminAssignment = {
    user_id: string
    complex_id: string
    created_at: string
    user_profiles: { email: string; role: string } | null
    complexes: { name: string } | null
}

export async function getComplexAdminAssignments(): Promise<ComplexAdminAssignment[]> {
    await requireSuperAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("complex_admins")
        .select(`
            user_id,
            complex_id,
            created_at,
            user_profiles!complex_admins_user_id_fkey (email, role),
            complexes (name)
        `)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching complex admins:", error)
        return []
    }

    return (data || []) as ComplexAdminAssignment[]
}

export async function assignComplexAdmin(formData: FormData) {
    const superadmin = await requireSuperAdmin()
    const email = (formData.get("email") as string | null)?.trim().toLowerCase()
    const complexId = (formData.get("complexId") as string | null)?.trim()

    if (!email || !complexId) {
        return { error: "Completa email y complejo." }
    }

    const supabase = await createClient()
    const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id, role")
        .ilike("email", email)
        .maybeSingle()

    if (profileError || !profile) {
        return { error: "No existe una cuenta registrada con ese email." }
    }

    if (profile.role === "superadmin") {
        return { error: "Un superadministrador ya tiene acceso a todos los complejos." }
    }

    const { error: roleError } = await supabase
        .from("user_profiles")
        .update({ role: "complex_admin" })
        .eq("id", profile.id)

    if (roleError) {
        console.error("Error updating admin role:", roleError)
        return { error: "No se pudo actualizar el rol del usuario." }
    }

    const { error: assignmentError } = await supabase
        .from("complex_admins")
        .upsert({
            user_id: profile.id,
            complex_id: complexId,
            created_by: superadmin.id,
        })

    if (assignmentError) {
        console.error("Error assigning complex admin:", assignmentError)
        return { error: "No se pudo asignar el complejo." }
    }

    revalidatePath("/administradores")
    return { success: true }
}

export async function removeComplexAdmin(formData: FormData) {
    await requireSuperAdmin()
    const userId = (formData.get("userId") as string | null)?.trim()
    const complexId = (formData.get("complexId") as string | null)?.trim()

    if (!userId || !complexId) {
        return { error: "Falta la asignación." }
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from("complex_admins")
        .delete()
        .eq("user_id", userId)
        .eq("complex_id", complexId)

    if (error) {
        console.error("Error removing complex admin:", error)
        return { error: "No se pudo quitar la asignación." }
    }

    const { count } = await supabase
        .from("complex_admins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

    if (!count) {
        await supabase
            .from("user_profiles")
            .update({ role: "common" })
            .eq("id", userId)
            .eq("role", "complex_admin")
    }

    revalidatePath("/administradores")
    return { success: true }
}
