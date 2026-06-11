'use server'

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/app/actions/auth"
import { createClient } from "@/utils/supabase/server"
import { createComplexBranding, complexConfig, newComplexBranding } from "@/lib/complex-config"

export type RegisteredComplex = {
    id: string
    name: string
    app_name: string | null
    logo_url: string | null
    description: string | null
    address: string | null
    latitude: number | null
    longitude: number | null
    map_marker_icon: string | null
}

export async function getComplexBranding(complexId?: string | null) {
    const supabase = await createClient()

    let query = supabase
        .from("complexes")
        .select("*")

    query = complexId
        ? query.eq("id", complexId)
        : query.order("created_at", { ascending: true }).limit(1)

    const { data, error } = await query
        .maybeSingle()

    if (error) {
        console.error("Error fetching complex branding:", error)
        return complexConfig
    }

    return createComplexBranding(data)
}

export async function getNewComplexBranding() {
    return newComplexBranding
}

export async function getRegisteredComplexes(): Promise<RegisteredComplex[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("complexes")
        .select("id, name, app_name, logo_url, description, address, latitude, longitude, map_marker_icon")
        .order("name", { ascending: true })

    if (error) {
        console.error("Error fetching registered complexes:", error)
        return []
    }

    return data || []
}

export async function getActiveComplexId(): Promise<string | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("complexes")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error("Error fetching active complex:", error)
        return null
    }

    return data?.id || null
}

export async function updateComplexBranding(formData: FormData) {
    await requireAdmin()

    const supabase = await createClient()

    const id = (formData.get("id") as string | null)?.trim()
    const complexName = (formData.get("complexName") as string | null)?.trim()
    const logoSrc = (formData.get("logoSrc") as string | null)?.trim()
    const address = (formData.get("address") as string | null)?.trim()
    const latitude = (formData.get("latitude") as string | null)?.trim()
    const longitude = (formData.get("longitude") as string | null)?.trim()
    const mapMarkerIcon = (formData.get("mapMarkerIcon") as string | null)?.trim()
    const description = (formData.get("description") as string | null)?.trim()
    const footerLine1 = (formData.get("footerLine1") as string | null)?.trim()
    const footerLine2 = (formData.get("footerLine2") as string | null)?.trim()

    if (!complexName || !logoSrc || !description) {
        return { error: "Completa nombre del complejo, logo y descripcion." }
    }

    const payload = {
        name: complexName,
        app_name: complexConfig.appName,
        logo_url: logoSrc,
        address: address || null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        map_marker_icon: mapMarkerIcon || complexConfig.mapMarkerIcon,
        description,
        footer_line_1: footerLine1 || null,
        footer_line_2: footerLine2 || null,
        assistant_name: complexConfig.assistantName,
    }

    const result = id
        ? await supabase.from("complexes").update(payload as any).eq("id", id).select("id").maybeSingle()
        : await supabase.from("complexes").insert(payload as any).select("id").maybeSingle()

    if (result.error) {
        console.error("Error updating complex branding:", result.error)
        return {
            error: "No se pudo guardar la configuracion. Verifica que la migracion de branding este aplicada en Supabase.",
        }
    }

    revalidatePath("/")
    revalidatePath("/login")
    revalidatePath("/configuracion")
    revalidatePath("/turnos")

    return { success: true, id: result.data?.id }
}
