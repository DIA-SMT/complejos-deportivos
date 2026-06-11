'use server'

import { createClient } from "@/utils/supabase/server"

export async function createPublicReservationRequest(formData: FormData) {
    const fullName = (formData.get("fullName") as string | null)?.trim()
    const phone = (formData.get("phone") as string | null)?.trim()
    const email = (formData.get("email") as string | null)?.trim()
    const complexId = (formData.get("complexId") as string | null)?.trim()
    const sport = (formData.get("sport") as string | null)?.trim()
    const courtId = (formData.get("courtId") as string | null)?.trim()
    const preferredDate = (formData.get("preferredDate") as string | null)?.trim()
    const preferredTime = (formData.get("preferredTime") as string | null)?.trim()
    const notes = (formData.get("notes") as string | null)?.trim()

    if (!fullName || !phone || !sport || !preferredDate || !preferredTime) {
        return { error: "Completa nombre, telefono, actividad, fecha y horario." }
    }

    const supabase = await createClient()

    const { data: citizen, error: citizenError } = await supabase
        .from("citizens")
        .insert({
            full_name: fullName,
            phone,
            email: email || null,
        })
        .select("id")
        .single()

    if (citizenError) {
        console.error("Error creating citizen:", citizenError)
        return { error: "No pudimos guardar tus datos. Verifica que la migracion de ciudadanos este aplicada." }
    }

    const { error: requestError } = await supabase
        .from("reservation_requests")
        .insert({
            citizen_id: citizen.id,
            complex_id: complexId || null,
            sport,
            court_id: courtId || null,
            preferred_date: preferredDate,
            preferred_time: preferredTime,
            notes: notes || null,
            status: "pending",
        })

    if (requestError) {
        console.error("Error creating reservation request:", requestError)
        return { error: "No pudimos registrar la solicitud. Intenta nuevamente." }
    }

    return { success: true }
}
