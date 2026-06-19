'use server'

import { revalidatePath } from "next/cache"
import { getUserActiveComplexId } from "@/app/actions/complex-settings"
import { createClient } from "@/utils/supabase/server"

export type UserReservationRequest = {
    id: string
    sport: string
    preferred_date: string
    preferred_time: string
    status: string
    notes: string | null
    created_at: string
    courts: { name: string } | null
    complexes: { name: string } | null
}

export async function createPublicReservationRequest(formData: FormData) {
    const fullName = (formData.get("fullName") as string | null)?.trim()
    const phone = (formData.get("phone") as string | null)?.trim()
    const email = (formData.get("email") as string | null)?.trim()
    const website = (formData.get("website") as string | null)?.trim()
    const complexId = (formData.get("complexId") as string | null)?.trim()
    const sportId = (formData.get("sportId") as string | null)?.trim()
    const courtId = (formData.get("courtId") as string | null)?.trim()
    const preferredDate = (formData.get("preferredDate") as string | null)?.trim()
    const preferredTime = (formData.get("preferredTime") as string | null)?.trim()
    const notes = (formData.get("notes") as string | null)?.trim()

    if (website) {
        return { error: "No pudimos registrar la solicitud. Intenta nuevamente." }
    }

    if (!fullName || !phone || !sportId || !preferredDate || !preferredTime) {
        return { error: "Completa nombre, telefono, actividad, fecha y horario." }
    }

    if (fullName.length < 3 || fullName.length > 120) {
        return { error: "Ingresa un nombre valido." }
    }

    if (!/^[0-9+()\-\s]{6,30}$/.test(phone)) {
        return { error: "Ingresa un telefono valido." }
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "Ingresa un email valido." }
    }

    if (notes && notes.length > 500) {
        return { error: "El comentario no puede superar los 500 caracteres." }
    }

    const today = new Date().toISOString().slice(0, 10)
    if (preferredDate < today) {
        return { error: "La fecha no puede ser anterior a hoy." }
    }

    const supabase = await createClient()
    const { data: sport, error: sportError } = await supabase
        .from("sports")
        .select("id, name")
        .eq("id", sportId)
        .maybeSingle()

    if (sportError || !sport) {
        return { error: "La actividad seleccionada no existe." }
    }

    if (courtId) {
        const { data: court, error: courtError } = await supabase
            .from("courts")
            .select("id, sport_id, complex_id")
            .eq("id", courtId)
            .maybeSingle()

        if (courtError || !court) {
            return { error: "La cancha seleccionada no existe." }
        }

        if (court.sport_id !== sport.id) {
            return { error: "La cancha seleccionada no corresponde a la actividad elegida." }
        }

        if (complexId && court.complex_id && court.complex_id !== complexId) {
            return { error: "La cancha seleccionada no pertenece al complejo elegido." }
        }
    }

    const { error: requestError } = await supabase.rpc("create_public_reservation_request", {
        p_full_name: fullName,
        p_phone: phone,
        p_email: email || null,
        p_complex_id: complexId || null,
        p_sport_id: sport.id,
        p_court_id: courtId || null,
        p_preferred_date: preferredDate,
        p_preferred_time: preferredTime,
        p_notes: notes || null,
    })

    if (requestError) {
        console.error("Error creating reservation request:", requestError)
        return {
            error: requestError.message || "No pudimos registrar la solicitud. Verifica que la migracion de reservas publicas este aplicada.",
        }
    }

    revalidatePath("/complejo")
    revalidatePath("/reservar")

    return { success: true }
}

export async function getMyReservationRequestsForActiveComplex(): Promise<UserReservationRequest[]> {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    const activeComplexId = await getUserActiveComplexId()

    if (userError || !user || !activeComplexId) return []

    const { data, error } = await supabase
        .from("reservation_requests")
        .select(`
            id,
            sport,
            preferred_date,
            preferred_time,
            status,
            notes,
            created_at,
            courts (name),
            complexes (name)
        `)
        .eq("complex_id", activeComplexId)
        .eq("user_id", user.id)
        .order("preferred_date", { ascending: true })
        .order("preferred_time", { ascending: true })
        .limit(12)

    if (error) {
        console.error("Error fetching user reservation requests:", error)
        return []
    }

    return (data || []) as UserReservationRequest[]
}
