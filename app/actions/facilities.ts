'use server'

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/app/actions/auth"
import { createClient } from "@/utils/supabase/server"
import { getActiveComplexId } from "@/app/actions/complex-settings"

export type Sport = {
    id: string
    name: string
    icon_url: string | null
    created_at: string | null
}

export type Court = {
    id: string
    name: string
    type: string | null
    icon_url: string | null
    complex_id: string | null
    created_at: string | null
    complexes?: { name: string } | null
}

const fallbackSports = ["Futbol", "Voley", "Basket", "Gimnasia", "Padel", "Natacion"]

export async function getSports(): Promise<Sport[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("sports")
        .select("*")
        .order("name", { ascending: true })

    if (error) {
        console.error("Error fetching sports:", error)
        return fallbackSports.map((name) => ({
            id: name,
            name,
            icon_url: null,
            created_at: null,
        }))
    }

    return (data || []) as Sport[]
}

export async function getCourts(options?: { includeAll?: boolean; complexId?: string | null }): Promise<Court[]> {
    const supabase = await createClient()
    const selectedComplexId = options?.complexId ?? (options?.includeAll ? null : await getActiveComplexId())

    let query = supabase
        .from("courts")
        .select("*, complexes(name)")
        .order("name", { ascending: true })

    if (selectedComplexId) {
        query = query.or(`complex_id.eq.${selectedComplexId},complex_id.is.null`)
    }

    const { data, error } = await query

    if (error) {
        console.error("Error fetching courts:", error)
        return []
    }

    return data || []
}

export async function createSport(formData: FormData) {
    await requireAdmin()

    const name = (formData.get("name") as string | null)?.trim()
    const iconUrl = (formData.get("iconUrl") as string | null)?.trim()

    if (!name) {
        return { error: "El nombre del deporte es requerido" }
    }

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()
    const { error } = await supabase.from("sports").insert({ name, icon_url: iconUrl || null } as any)

    if (error) {
        console.error("Error creating sport:", error)
        return { error: "No se pudo crear el deporte. Verifica que la migracion de deportes este aplicada." }
    }

    revalidateFacilities()
    return { success: true }
}

export async function deleteSport(id: string) {
    await requireAdmin()

    const supabase = await createClient()
    const { error } = await supabase.from("sports").delete().eq("id", id)

    if (error) {
        console.error("Error deleting sport:", error)
        return { error: "No se pudo eliminar el deporte" }
    }

    revalidateFacilities()
    return { success: true }
}

export async function createCourt(formData: FormData) {
    await requireAdmin()

    const name = (formData.get("name") as string | null)?.trim()
    const type = (formData.get("type") as string | null)?.trim()
    const complexId = (formData.get("complexId") as string | null)?.trim()
    const iconUrl = (formData.get("iconUrl") as string | null)?.trim()

    if (!name) {
        return { error: "El nombre de la cancha es requerido" }
    }

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()
    const { error } = await supabase.from("courts").insert({
        name,
        type: type || null,
        complex_id: complexId || activeComplexId,
        icon_url: iconUrl || null,
    } as any)

    if (error) {
        console.error("Error creating court:", error)
        return { error: "No se pudo crear la cancha" }
    }

    revalidateFacilities()
    return { success: true }
}

export async function deleteCourt(id: string) {
    await requireAdmin()

    const supabase = await createClient()
    const { error } = await supabase.from("courts").delete().eq("id", id)

    if (error) {
        console.error("Error deleting court:", error)
        return { error: "No se pudo eliminar la cancha" }
    }

    revalidateFacilities()
    return { success: true }
}

function revalidateFacilities() {
    revalidatePath("/configuracion")
    revalidatePath("/profesores")
    revalidatePath("/turnos")
    revalidatePath("/reportes")
}
