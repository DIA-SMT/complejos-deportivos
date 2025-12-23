'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";

export async function getProfessors() {
    const supabase = await createClient();
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
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching professors:", error);
        return [];
    }

    return data;
}

export async function getAllProfessorSchedules() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("professor_schedules")
        .select(`
            *,
            professors (full_name),
            courts (name)
        `);

    if (error) {
        console.error("Error fetching schedules:", error);
        return [];
    }

    return data;
}

export async function createProfessor(formData: FormData) {
    // Verificar que el usuario sea admin
    await requireAdmin();

    const supabase = await createClient();

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;

    if (!fullName) {
        return { error: "El nombre es requerido" };
    }

    const { error } = await supabase.from("professors").insert({
        full_name: fullName,
        email: email || null,
    } as any);

    if (error) {
        console.error("Error creating professor:", error);
        return { error: "Error al crear profesor" };
    }

    revalidatePath("/profesores");
    return { success: true };
}

export async function addSchedule(formData: FormData) {
    // Verificar que el usuario sea admin
    await requireAdmin();

    const supabase = await createClient();

    const professorId = formData.get("professorId") as string;
    const dayOfWeek = formData.get("dayOfWeek") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const sport = formData.get("sport") as string;
    const description = formData.get("description") as string;

    if (!professorId || !dayOfWeek || !startTime || !endTime || !sport) {
        return { error: "Todos los campos son requeridos" };
    }

    const { error } = await supabase.from("professor_schedules").insert({
        professor_id: professorId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        sport: sport,
        description: description || null
    } as any);

    if (error) {
        console.error("Error adding schedule:", error);
        return { error: "Error al asignar horario" };
    }

    revalidatePath("/profesores");
    return { success: true };
}

export async function updateSchedule(formData: FormData) {
    // Verificar que el usuario sea admin
    await requireAdmin();

    const supabase = await createClient();

    const scheduleId = formData.get("scheduleId") as string;
    const dayOfWeek = formData.get("dayOfWeek") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const sport = formData.get("sport") as string;
    const description = formData.get("description") as string;

    if (!scheduleId || !dayOfWeek || !startTime || !endTime || !sport) {
        return { error: "Todos los campos obligatorios son requeridos" };
    }

    const { error } = await supabase
        .from("professor_schedules")
        .update({
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            sport: sport,
            description: description || null
        } as any)
        .eq("id", scheduleId);

    if (error) {
        console.error("Error updating schedule:", error);
        return { error: "Error al actualizar horario" };
    }

    revalidatePath("/profesores");
    return { success: true };
}

export async function deleteSchedule(scheduleId: string) {
    // Verificar que el usuario sea admin
    await requireAdmin();

    const supabase = await createClient();

    const { error } = await supabase
        .from("professor_schedules")
        .delete()
        .eq("id", scheduleId);

    if (error) {
        console.error("Error deleting schedule:", error);
        return { error: "Error al eliminar horario" };
    }

    revalidatePath("/profesores");
    return { success: true };
}
