'use server'

import { createClient } from "@/utils/supabase/server"

export async function createPublicReservationRequest(formData: FormData) {
    const fullName = (formData.get("fullName") as string | null)?.trim()
    const phone = (formData.get("phone") as string | null)?.trim()
    const email = (formData.get("email") as string | null)?.trim()
    const website = (formData.get("website") as string | null)?.trim()
    const complexId = (formData.get("complexId") as string | null)?.trim()
    const sport = (formData.get("sport") as string | null)?.trim()
    const courtId = (formData.get("courtId") as string | null)?.trim()
    const preferredDate = (formData.get("preferredDate") as string | null)?.trim()
    const preferredTime = (formData.get("preferredTime") as string | null)?.trim()
    const notes = (formData.get("notes") as string | null)?.trim()

    if (website) {
        return { error: "No pudimos registrar la solicitud. Intenta nuevamente." }
    }

    if (!fullName || !phone || !sport || !preferredDate || !preferredTime) {
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
    const { error: requestError } = await supabase.rpc("create_public_reservation_request", {
        p_full_name: fullName,
        p_phone: phone,
        p_email: email || null,
        p_complex_id: complexId || null,
        p_sport: sport,
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

    return { success: true }
}
