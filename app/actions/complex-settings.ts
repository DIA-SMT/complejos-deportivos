'use server'

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/app/actions/auth"
import { createClient } from "@/utils/supabase/server"
import { createComplexBranding, complexConfig } from "@/lib/complex-config"

export async function getComplexBranding() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("complexes")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error("Error fetching complex branding:", error)
        return complexConfig
    }

    return createComplexBranding(data)
}

export async function updateComplexBranding(formData: FormData) {
    await requireAdmin()

    const supabase = await createClient()

    const id = (formData.get("id") as string | null)?.trim()
    const appName = (formData.get("appName") as string | null)?.trim()
    const complexName = (formData.get("complexName") as string | null)?.trim()
    const logoSrc = (formData.get("logoSrc") as string | null)?.trim()
    const description = (formData.get("description") as string | null)?.trim()
    const footerLine1 = (formData.get("footerLine1") as string | null)?.trim()
    const footerLine2 = (formData.get("footerLine2") as string | null)?.trim()
    const assistantName = (formData.get("assistantName") as string | null)?.trim()

    if (!appName || !complexName || !logoSrc || !description || !assistantName) {
        return { error: "Completá nombre de app, complejo, logo, descripción y asistente." }
    }

    const payload = {
        name: complexName,
        app_name: appName,
        logo_url: logoSrc,
        description,
        footer_line_1: footerLine1 || null,
        footer_line_2: footerLine2 || null,
        assistant_name: assistantName,
    }

    const result = id
        ? await supabase.from("complexes").update(payload as any).eq("id", id).select("id").maybeSingle()
        : await supabase.from("complexes").insert(payload as any).select("id").maybeSingle()

    if (result.error) {
        console.error("Error updating complex branding:", result.error)
        return {
            error: "No se pudo guardar la configuración. Verificá que la migración de branding esté aplicada en Supabase.",
        }
    }

    revalidatePath("/")
    revalidatePath("/login")
    revalidatePath("/configuracion")
    revalidatePath("/turnos")

    return { success: true }
}
