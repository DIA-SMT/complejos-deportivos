'use server'

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/app/actions/auth"
import { createClient } from "@/utils/supabase/server"
import { getActiveComplexId, getManageableComplexes } from "@/app/actions/complex-settings"

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
    sport_id: string | null
    icon_url: string | null
    complex_id: string | null
    created_at: string | null
    complexes?: { name: string } | null
    sports?: { id: string; name: string } | null
}

export type ComplexSport = {
    complex_id: string
    sport_id: string
}

const fallbackSports = ["Futbol", "Voley", "Basket", "Gimnasia", "Padel", "Natacion"]

async function canManageComplex(complexId: string) {
    const manageableComplexes = await getManageableComplexes()
    return manageableComplexes.some((complex) => complex.id === complexId)
}

export async function getSports(options?: { includeAll?: boolean; complexId?: string | null }): Promise<Sport[]> {
    const supabase = await createClient()
    const selectedComplexId = options?.complexId ?? (options?.includeAll ? null : await getActiveComplexId())

    if (selectedComplexId) {
        const { data, error } = await supabase
            .from("complex_sports")
            .select("sports(*)")
            .eq("complex_id", selectedComplexId)

        if (!error) {
            return (data || [])
                .map((association) => Array.isArray(association.sports) ? association.sports[0] : association.sports)
                .filter((sport): sport is Sport => Boolean(sport))
                .sort((a, b) => a.name.localeCompare(b.name))
        }

        if (!error.message.includes("complex_sports")) {
            console.error("Error fetching sports for complex:", error)
        }
    }

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

    return (data || []).map((sport) => ({
        ...sport,
        icon_url: "icon_url" in sport ? sport.icon_url : null,
    })) as Sport[]
}

export async function getCourts(options?: { includeAll?: boolean; complexId?: string | null }): Promise<Court[]> {
    const supabase = await createClient()
    const selectedComplexId = options?.complexId ?? (options?.includeAll ? null : await getActiveComplexId())

    let query = supabase
        .from("courts")
        .select("*, complexes(name), sports(id, name)")
        .order("name", { ascending: true })

    if (selectedComplexId) {
        query = query.eq("complex_id", selectedComplexId)
    }

    const { data, error } = await query

    if (error) {
        console.error("Error fetching courts:", error)
        return []
    }

    return (data || []).map((court) => ({
        ...court,
        icon_url: "icon_url" in court ? court.icon_url : null,
        sports: Array.isArray(court.sports) ? court.sports[0] || null : court.sports,
    })) as Court[]
}

export async function getPublicCourts(): Promise<Court[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("courts")
        .select("*, complexes(name), sports(id, name)")
        .not("complex_id", "is", null)
        .order("name", { ascending: true })

    if (error) {
        console.error("Error fetching public courts:", error)
        return []
    }

    return (data || []).map((court) => ({
        ...court,
        icon_url: "icon_url" in court ? court.icon_url : null,
        sports: Array.isArray(court.sports) ? court.sports[0] || null : court.sports,
    })) as Court[]
}

export async function getPublicComplexSports(): Promise<ComplexSport[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("complex_sports")
        .select("complex_id, sport_id")

    if (error) {
        console.error("Error fetching sports by complex:", error)
        return []
    }

    return data || []
}

export async function createSport(formData: FormData) {
    const user = await requireAdmin()

    const name = (formData.get("name") as string | null)?.trim()
    const iconUrl = (formData.get("iconUrl") as string | null)?.trim()
    const complexId = (formData.get("complexId") as string | null)?.trim()

    if (!name || !complexId) {
        return { error: "El nombre del deporte y el complejo son requeridos." }
    }

    if (!await canManageComplex(complexId)) {
        return { error: "No tenes permisos para administrar los deportes de ese complejo." }
    }

    const supabase = await createClient()
    const { data: existingSport, error: lookupError } = await supabase
        .from("sports")
        .select("id, name")
        .ilike("name", name)
        .limit(1)
        .maybeSingle()

    if (lookupError) {
        return { error: `No se pudo validar el deporte: ${lookupError.message}` }
    }

    let sportId = existingSport?.id

    if (!sportId) {
        let { data: createdSport, error: createError } = await supabase
            .from("sports")
            .insert({ name, icon_url: iconUrl || null })
            .select("id")
            .single()

        if (createError?.message.includes("Could not find the 'icon_url' column")) {
            const retry = await supabase
                .from("sports")
                .insert({ name })
                .select("id")
                .single()

            createdSport = retry.data
            createError = retry.error
        }

        if (createError) {
            console.error("Error creating sport:", createError)
            return { error: `No se pudo crear el deporte: ${createError.message}` }
        }

        sportId = createdSport?.id
    }

    if (!sportId) {
        return { error: "No se pudo identificar el deporte creado." }
    }

    const { error: associationError } = await supabase
        .from("complex_sports")
        .upsert({
            complex_id: complexId,
            sport_id: sportId,
            created_by: user.id,
        }, {
            onConflict: "complex_id,sport_id",
            ignoreDuplicates: true,
        })

    if (associationError) {
        return { error: `No se pudo agregar el deporte al complejo: ${associationError.message}` }
    }

    revalidateFacilities()
    return { success: true }
}

export async function deleteSport(id: string, complexId: string) {
    return deleteSports([id], complexId)
}

export async function deleteSports(ids: string[], expectedComplexId?: string | null) {
    await requireAdmin()

    const sportIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
    const complexId = expectedComplexId?.trim()
    if (!sportIds.length || !complexId) {
        return { error: "Selecciona al menos un deporte." }
    }

    if (!await canManageComplex(complexId)) {
        return { error: "No tenes permisos para administrar los deportes de ese complejo." }
    }

    const supabase = await createClient()
    const { count: usedSports, error: usageError } = await supabase
        .from("courts")
        .select("id", { count: "exact", head: true })
        .eq("complex_id", complexId)
        .in("sport_id", sportIds)

    if (usageError) {
        return { error: `No se pudo validar el uso de los deportes: ${usageError.message}` }
    }

    if (usedSports) {
        return { error: "No podes quitar deportes que todavía tienen canchas o espacios asociados en este complejo." }
    }

    const { error } = await supabase
        .from("complex_sports")
        .delete()
        .eq("complex_id", complexId)
        .in("sport_id", sportIds)

    if (error) {
        console.error("Error removing sports from complex:", error)
        return { error: `No se pudieron quitar los deportes del complejo: ${error.message}` }
    }

    revalidateFacilities()
    return { success: true, deletedCount: sportIds.length }
}

export async function createCourt(formData: FormData) {
    await requireAdmin()

    const name = (formData.get("name") as string | null)?.trim()
    const type = (formData.get("type") as string | null)?.trim()
    const sportId = (formData.get("sportId") as string | null)?.trim()
    const complexId = (formData.get("complexId") as string | null)?.trim()
    const iconUrl = (formData.get("iconUrl") as string | null)?.trim()

    if (!name || !sportId) {
        return { error: "El nombre y el deporte de la cancha son requeridos" }
    }

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()
    const selectedComplexId = complexId || activeComplexId

    if (!selectedComplexId) {
        return { error: "Selecciona un complejo antes de cargar una cancha." }
    }

    if (!await canManageComplex(selectedComplexId)) {
        return { error: "No tenes permisos para administrar las canchas de ese complejo." }
    }

    const { data: sportAssociation, error: sportError } = await supabase
        .from("complex_sports")
        .select("sports(id, name)")
        .eq("complex_id", selectedComplexId)
        .eq("sport_id", sportId)
        .maybeSingle()
    const sport = Array.isArray(sportAssociation?.sports)
        ? sportAssociation.sports[0]
        : sportAssociation?.sports

    if (sportError || !sport) {
        return { error: "El deporte seleccionado no está habilitado para este complejo." }
    }

    const { error } = await supabase.from("courts").insert({
        name,
        type: type || sport.name,
        sport_id: sport.id,
        complex_id: selectedComplexId,
        icon_url: iconUrl || null,
    })

    if (error?.message.includes("Could not find the 'icon_url' column")) {
        const { error: retryError } = await supabase.from("courts").insert({
            name,
            type: type || sport.name,
            sport_id: sport.id,
            complex_id: selectedComplexId,
        })

        if (retryError) {
            console.error("Error creating court without icon:", retryError)
            return { error: `No se pudo crear la cancha: ${retryError.message}` }
        }

        revalidateFacilities()
        return { success: true }
    }

    if (error) {
        console.error("Error creating court:", error)
        return { error: `No se pudo crear la cancha: ${error.message}` }
    }

    revalidateFacilities()
    return { success: true }
}

export async function updateCourt(formData: FormData) {
    await requireAdmin()

    const id = (formData.get("id") as string | null)?.trim()
    const name = (formData.get("name") as string | null)?.trim()
    const type = (formData.get("type") as string | null)?.trim()
    const sportId = (formData.get("sportId") as string | null)?.trim()
    const iconUrl = (formData.get("iconUrl") as string | null)?.trim()
    const expectedComplexId = (formData.get("complexId") as string | null)?.trim()

    if (!id || !name || !sportId || !expectedComplexId) {
        return { error: "El nombre y el deporte de la cancha son requeridos." }
    }

    const supabase = await createClient()
    const { data: court, error: courtError } = await supabase
        .from("courts")
        .select("id, complex_id")
        .eq("id", id)
        .maybeSingle()

    if (courtError || !court?.complex_id) {
        return { error: "La cancha seleccionada no existe." }
    }

    if (court.complex_id !== expectedComplexId) {
        return { error: "La cancha no pertenece al complejo que estas configurando. Actualiza la pagina." }
    }

    if (!await canManageComplex(court.complex_id)) {
        return { error: "No tenes permisos para modificar esta cancha." }
    }

    const { data: sportAssociation, error: sportError } = await supabase
        .from("complex_sports")
        .select("sports(id, name)")
        .eq("complex_id", court.complex_id)
        .eq("sport_id", sportId)
        .maybeSingle()
    const sport = Array.isArray(sportAssociation?.sports)
        ? sportAssociation.sports[0]
        : sportAssociation?.sports

    if (sportError || !sport) {
        return { error: "El deporte seleccionado no está habilitado para este complejo." }
    }

    const updates = {
        name,
        type: type || sport.name,
        sport_id: sport.id,
        icon_url: iconUrl || null,
    }
    const { error } = await supabase
        .from("courts")
        .update(updates)
        .eq("id", id)
        .eq("complex_id", court.complex_id)

    if (error?.message.includes("Could not find the 'icon_url' column")) {
        const { error: retryError } = await supabase
            .from("courts")
            .update({
                name,
                type: type || sport.name,
                sport_id: sport.id,
            })
            .eq("id", id)
            .eq("complex_id", court.complex_id)

        if (retryError) {
            return { error: `No se pudo actualizar la cancha: ${retryError.message}` }
        }
    } else if (error) {
        return { error: `No se pudo actualizar la cancha: ${error.message}` }
    }

    revalidateFacilities()
    return { success: true }
}

export async function deleteCourt(id: string) {
    await requireAdmin()
    const supabase = await createClient()
    const { data: court } = await supabase
        .from("courts")
        .select("complex_id")
        .eq("id", id)
        .maybeSingle()

    return deleteCourts([id], court?.complex_id)
}

export async function deleteCourts(ids: string[], expectedComplexId?: string | null) {
    await requireAdmin()

    const courtIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
    const selectedComplexId = expectedComplexId?.trim()
    if (!courtIds.length || !selectedComplexId) {
        return { error: "Selecciona al menos una cancha." }
    }

    const supabase = await createClient()
    const { data: courts, error: courtsError } = await supabase
        .from("courts")
        .select("id, complex_id")
        .in("id", courtIds)

    if (courtsError || !courts || courts.length !== courtIds.length) {
        return { error: "No se pudieron validar todas las canchas seleccionadas." }
    }

    if (courts.some((court) => court.complex_id !== selectedComplexId)) {
        return {
            error: "La seleccion contiene canchas de otro complejo. Actualiza la pagina antes de eliminar.",
        }
    }

    const manageableComplexes = await getManageableComplexes()
    const manageableIds = new Set(manageableComplexes.map((complex) => complex.id))
    if (courts.some((court) => !court.complex_id || !manageableIds.has(court.complex_id))) {
        return { error: "No tenes permisos para eliminar alguna de las canchas seleccionadas." }
    }

    const { error } = await supabase.from("courts").delete().in("id", courtIds)

    if (error) {
        console.error("Error deleting courts:", error)
        if (error.code === "23503") {
            return {
                error: "No se pueden eliminar las canchas seleccionadas porque alguna tiene horarios, turnos o reservas asociados.",
            }
        }
        return { error: `No se pudieron eliminar las canchas: ${error.message}` }
    }

    revalidateFacilities()
    return { success: true, deletedCount: courtIds.length }
}

function revalidateFacilities() {
    revalidatePath("/")
    revalidatePath("/reservar")
    revalidatePath("/complejo")
    revalidatePath("/configuracion")
    revalidatePath("/profesores")
    revalidatePath("/turnos")
    revalidatePath("/reportes")
}
