'use server'

import { revalidatePath } from "next/cache"
import { addDays, format } from "date-fns"
import { requireAdmin } from "@/app/actions/auth"
import { getActiveComplexId, getUserActiveComplexId } from "@/app/actions/complex-settings"
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

export type PublicAvailabilityBlock = {
    court_id: string
    date: string
    start_time: string
    end_time: string | null
}

export type AdminReservationRequest = {
    id: string
    sport: string
    preferred_date: string
    preferred_time: string
    status: string
    notes: string | null
    created_at: string
    citizens: {
        full_name: string
        phone: string
        email: string | null
    } | null
    courts: { name: string } | null
    complexes: { name: string } | null
}

export async function getAdminReservationRequestsForActiveComplex(): Promise<AdminReservationRequest[]> {
    await requireAdmin()
    const activeComplexId = await getActiveComplexId()

    if (!activeComplexId) return []

    const supabase = await createClient()
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
            citizens (full_name, phone, email),
            courts (name),
            complexes (name)
        `)
        .eq("complex_id", activeComplexId)
        .order("created_at", { ascending: false })
        .limit(100)

    if (error) {
        console.error("Error fetching admin reservation requests:", error)
        return []
    }

    return (data || []) as AdminReservationRequest[]
}

export async function updateReservationRequestStatus(
    requestId: string,
    status: "confirmed" | "rejected",
) {
    await requireAdmin()
    const activeComplexId = await getActiveComplexId()

    if (!activeComplexId) {
        return { error: "Seleccioná un complejo antes de gestionar solicitudes." }
    }

    const supabase = await createClient()
    const { data: request, error: requestError } = await supabase
        .from("reservation_requests")
        .select("id, status, complex_id, court_id, preferred_date, preferred_time")
        .eq("id", requestId)
        .eq("complex_id", activeComplexId)
        .maybeSingle()

    if (requestError || !request) {
        return { error: "La solicitud no existe o no pertenece al complejo activo." }
    }

    if (request.status !== "pending") {
        return { error: "La solicitud ya fue procesada." }
    }

    if (status === "confirmed" && request.court_id) {
        const { data: conflict, error: conflictError } = await supabase
            .from("reservation_requests")
            .select("id")
            .eq("court_id", request.court_id)
            .eq("preferred_date", request.preferred_date)
            .eq("preferred_time", request.preferred_time)
            .eq("status", "confirmed")
            .neq("id", request.id)
            .limit(1)

        if (conflictError) {
            return { error: "No se pudo validar la disponibilidad del turno." }
        }

        if (conflict?.length) {
            return { error: "Ese horario ya fue confirmado para otra solicitud." }
        }
    }

    const { error } = await supabase
        .from("reservation_requests")
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq("id", request.id)
        .eq("complex_id", activeComplexId)
        .eq("status", "pending")

    if (error) {
        return { error: `No se pudo actualizar la solicitud: ${error.message}` }
    }

    revalidatePath("/turnos")
    revalidatePath("/complejo")
    revalidatePath("/reservar")

    return { success: true }
}

export async function getPublicAvailabilityBlocks(): Promise<PublicAvailabilityBlock[]> {
    const supabase = await createClient()
    const today = new Date()
    const startDate = format(today, "yyyy-MM-dd")
    const endDate = format(addDays(today, 13), "yyyy-MM-dd")

    const [shiftsResult, requestsResult] = await Promise.all([
        supabase
            .from("shifts")
            .select("court_id, date, start_time, end_time")
            .not("court_id", "is", null)
            .neq("status", "cancelled")
            .gte("date", startDate)
            .lte("date", endDate),
        supabase
            .from("reservation_requests")
            .select("court_id, preferred_date, preferred_time")
            .not("court_id", "is", null)
            .in("status", ["pending", "confirmed"])
            .gte("preferred_date", startDate)
            .lte("preferred_date", endDate),
    ])

    if (shiftsResult.error) {
        console.error("Error fetching public shifts availability:", shiftsResult.error)
    }
    if (requestsResult.error) {
        console.error("Error fetching public requests availability:", requestsResult.error)
    }

    return [
        ...(shiftsResult.data || []).map((shift) => ({
            court_id: shift.court_id as string,
            date: shift.date,
            start_time: shift.start_time,
            end_time: shift.end_time,
        })),
        ...(requestsResult.data || []).map((request) => ({
            court_id: request.court_id as string,
            date: request.preferred_date,
            start_time: request.preferred_time,
            end_time: null,
        })),
    ]
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

    if (!fullName || !phone || !complexId || !sportId || !courtId || !preferredDate || !preferredTime) {
        return { error: "Completa nombre, teléfono, complejo, actividad, cancha, fecha y horario." }
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

    if (!/^(0[8-9]|1[0-9]|2[0-1]):00$/.test(preferredTime.slice(0, 5))) {
        return { error: "Seleccioná uno de los horarios disponibles." }
    }

    const supabase = await createClient()
    const { data: sportAssociation, error: sportError } = await supabase
        .from("complex_sports")
        .select("sports(id, name)")
        .eq("complex_id", complexId)
        .eq("sport_id", sportId)
        .maybeSingle()
    const sport = Array.isArray(sportAssociation?.sports)
        ? sportAssociation.sports[0]
        : sportAssociation?.sports

    if (sportError || !sport) {
        return { error: "La actividad seleccionada no está disponible en el complejo elegido." }
    }

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

    if (court.complex_id !== complexId) {
        return { error: "La cancha seleccionada no pertenece al complejo elegido." }
    }

    const requestedStart = preferredTime.slice(0, 5)
    const [requestedHour, requestedMinute] = requestedStart.split(":").map(Number)
    const requestedEndMinutes = requestedHour * 60 + requestedMinute + 60
    const requestedEnd = `${Math.floor(requestedEndMinutes / 60).toString().padStart(2, "0")}:${(requestedEndMinutes % 60).toString().padStart(2, "0")}`
    const [shiftConflicts, requestConflicts] = await Promise.all([
        supabase
            .from("shifts")
            .select("id")
            .eq("court_id", courtId)
            .eq("date", preferredDate)
            .neq("status", "cancelled")
            .lt("start_time", requestedEnd)
            .gt("end_time", requestedStart)
            .limit(1),
        supabase
            .from("reservation_requests")
            .select("id")
            .eq("court_id", courtId)
            .eq("preferred_date", preferredDate)
            .eq("preferred_time", requestedStart)
            .in("status", ["pending", "confirmed"])
            .limit(1),
    ])

    if (shiftConflicts.error || requestConflicts.error) {
        return { error: "No pudimos confirmar la disponibilidad. Intenta nuevamente." }
    }

    if (shiftConflicts.data?.length || requestConflicts.data?.length) {
        return { error: "Ese horario acaba de dejar de estar disponible. Elegí otro turno." }
    }

    const { error: requestError } = await supabase.rpc("create_public_reservation_request", {
        p_full_name: fullName,
        p_phone: phone,
        p_email: email || null,
        p_complex_id: complexId,
        p_sport_id: sport.id,
        p_court_id: courtId,
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
