'use server'

import { revalidatePath } from "next/cache"
import { requireAdmin } from "./auth"
import { getActiveComplexId } from "@/app/actions/complex-settings"
import { createClient } from "@/utils/supabase/server"

function revalidateProfessors() {
    revalidatePath("/profesores")
    revalidatePath("/turnos")
    revalidatePath("/reportes")
}

export async function getProfessors() {
    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()

    if (!activeComplexId) return []

    const { data, error } = await supabase
        .from("professors")
        .select(`
            *,
            professor_schedules (
                *,
                courts (name),
                class_reviews (*)
            )
        `)
        .eq("complex_id", activeComplexId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching professors:", error)
        return []
    }

    return data
}

export async function getAllProfessorSchedules() {
    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()

    if (!activeComplexId) return []

    const { data, error } = await supabase
        .from("professor_schedules")
        .select(`
            *,
            professors (full_name),
            courts (name)
        `)
        .eq("complex_id", activeComplexId)

    if (error) {
        console.error("Error fetching schedules:", error)
        return []
    }

    return data
}

export async function createProfessor(formData: FormData) {
    await requireAdmin()

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()
    const fullName = (formData.get("fullName") as string | null)?.trim()
    const email = (formData.get("email") as string | null)?.trim()

    if (!activeComplexId) {
        return { error: "Primero configura un complejo activo" }
    }

    if (!fullName) {
        return { error: "El nombre es requerido" }
    }

    const { error } = await supabase.from("professors").insert({
        full_name: fullName,
        email: email || null,
        complex_id: activeComplexId,
    } as any)

    if (error) {
        console.error("Error creating professor:", error)
        return { error: "Error al crear profesor" }
    }

    revalidateProfessors()
    return { success: true }
}

export async function addSchedule(formData: FormData) {
    await requireAdmin()

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()
    const professorId = (formData.get("professorId") as string | null)?.trim()
    const dayOfWeek = (formData.get("dayOfWeek") as string | null)?.trim()
    const startTime = (formData.get("startTime") as string | null)?.trim()
    const endTime = (formData.get("endTime") as string | null)?.trim()
    const sport = (formData.get("sport") as string | null)?.trim()
    const courtId = (formData.get("courtId") as string | null)?.trim()
    const description = (formData.get("description") as string | null)?.trim()

    if (!activeComplexId) {
        return { error: "Primero configura un complejo activo" }
    }

    if (!professorId || !dayOfWeek || !startTime || !endTime || !sport) {
        return { error: "Todos los campos son requeridos" }
    }

    const { error } = await supabase.from("professor_schedules").insert({
        professor_id: professorId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        sport,
        court_id: courtId || null,
        description: description || null,
        complex_id: activeComplexId,
    } as any)

    if (error) {
        console.error("Error adding schedule:", error)
        return { error: `Error al asignar horario: ${error.message || "Error desconocido"}` }
    }

    revalidateProfessors()
    return { success: true }
}

export async function updateSchedule(formData: FormData) {
    await requireAdmin()

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()
    const scheduleId = (formData.get("scheduleId") as string | null)?.trim()
    const dayOfWeek = (formData.get("dayOfWeek") as string | null)?.trim()
    const startTime = (formData.get("startTime") as string | null)?.trim()
    const endTime = (formData.get("endTime") as string | null)?.trim()
    const sport = (formData.get("sport") as string | null)?.trim()
    const courtId = (formData.get("courtId") as string | null)?.trim()
    const description = (formData.get("description") as string | null)?.trim()

    if (!activeComplexId) {
        return { error: "Primero configura un complejo activo" }
    }

    if (!scheduleId || !dayOfWeek || !startTime || !endTime || !sport) {
        return { error: "Todos los campos obligatorios son requeridos" }
    }

    const { error } = await supabase
        .from("professor_schedules")
        .update({
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            sport,
            court_id: courtId || null,
            description: description || null,
        } as any)
        .eq("id", scheduleId)
        .eq("complex_id", activeComplexId)

    if (error) {
        console.error("Error updating schedule:", error)
        return { error: "Error al actualizar horario" }
    }

    revalidateProfessors()
    return { success: true }
}

export async function deleteSchedule(scheduleId: string) {
    await requireAdmin()

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()

    if (!activeComplexId) {
        return { error: "Primero configura un complejo activo" }
    }

    const { error } = await supabase
        .from("professor_schedules")
        .delete()
        .eq("id", scheduleId)
        .eq("complex_id", activeComplexId)

    if (error) {
        console.error("Error deleting schedule:", error)
        return { error: "Error al eliminar horario" }
    }

    revalidateProfessors()
    return { success: true }
}

export async function updateProfessor(formData: FormData) {
    await requireAdmin()

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()
    const professorId = (formData.get("professorId") as string | null)?.trim()
    const fullName = (formData.get("fullName") as string | null)?.trim()
    const email = (formData.get("email") as string | null)?.trim()

    if (!activeComplexId) {
        return { error: "Primero configura un complejo activo" }
    }

    if (!professorId || !fullName) {
        return { error: "El ID y nombre son requeridos" }
    }

    const { error } = await supabase
        .from("professors")
        .update({
            full_name: fullName,
            email: email || null,
        } as any)
        .eq("id", professorId)
        .eq("complex_id", activeComplexId)

    if (error) {
        console.error("Error updating professor:", error)
        return { error: "Error al actualizar profesor" }
    }

    revalidateProfessors()
    return { success: true }
}

export async function deleteProfessor(professorId: string) {
    await requireAdmin()

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()

    if (!activeComplexId) {
        return { error: "Primero configura un complejo activo" }
    }

    const { error: schedulesError } = await supabase
        .from("professor_schedules")
        .delete()
        .eq("professor_id", professorId)
        .eq("complex_id", activeComplexId)

    if (schedulesError) {
        console.error("Error deleting professor schedules:", schedulesError)
        return { error: "Error al eliminar horarios del profesor" }
    }

    const { error } = await supabase
        .from("professors")
        .delete()
        .eq("id", professorId)
        .eq("complex_id", activeComplexId)

    if (error) {
        console.error("Error deleting professor:", error)
        return { error: "Error al eliminar profesor" }
    }

    revalidateProfessors()
    return { success: true }
}
