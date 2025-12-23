'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";

export async function upsertClassReport(formData: FormData) {
    // Verificar que el usuario sea admin
    await requireAdmin();

    const supabase = await createClient();

    const scheduleId = formData.get("scheduleId") as string;
    const date = formData.get("date") as string;
    const attendance = formData.get("attendance") ? parseInt(formData.get("attendance") as string) : null;
    const notes = formData.get("notes") as string;

    if (!scheduleId || !date) {
        return { error: "Faltan datos requeridos" };
    }

    const { error } = await supabase
        .from("class_reviews")
        .upsert({
            schedule_id: scheduleId,
            date: date,
            attendance: attendance,
            notes: notes || null,
        }, {
            onConflict: 'schedule_id, date'
        });

    if (error) {
        console.error("Error saving report:", error);
        return { error: "Error al guardar el reporte" };
    }

    revalidatePath("/turnos");
    return { success: true };
}
