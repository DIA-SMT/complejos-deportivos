'use server'

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { requireAdmin, requireAuth } from "@/app/actions/auth"
import { createClient } from "@/utils/supabase/server"
import { createComplexBranding, complexConfig, newComplexBranding, normalizeMapMarkerIcon } from "@/lib/complex-config"

const LEGACY_ACTIVE_COMPLEX_COOKIE = "activeComplexId"
const ADMIN_ACTIVE_COMPLEX_COOKIE = "adminActiveComplexId"
const USER_ACTIVE_COMPLEX_COOKIE = "userActiveComplexId"

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
    const activeComplexId = complexId ?? await getActiveComplexId()

    let query = supabase
        .from("complexes")
        .select("*")

    query = activeComplexId
        ? query.eq("id", activeComplexId)
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

async function getFirstComplexId() {
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

async function getValidComplexIdFromCookies(cookieNames: string[]) {
    const cookieStore = await cookies()
    const supabase = await createClient()

    for (const cookieName of cookieNames) {
        const selectedComplexId = cookieStore.get(cookieName)?.value

        if (!selectedComplexId) continue

        const { data: selectedComplex, error: selectedComplexError } = await supabase
            .from("complexes")
            .select("id")
            .eq("id", selectedComplexId)
            .maybeSingle()

        if (!selectedComplexError && selectedComplex?.id) {
            return selectedComplex.id
        }
    }

    return null
}

export async function getAdminActiveComplexId(): Promise<string | null> {
    return await getValidComplexIdFromCookies([ADMIN_ACTIVE_COMPLEX_COOKIE, LEGACY_ACTIVE_COMPLEX_COOKIE])
        || await getFirstComplexId()
}

export async function getUserActiveComplexId(): Promise<string | null> {
    return await getValidComplexIdFromCookies([USER_ACTIVE_COMPLEX_COOKIE, LEGACY_ACTIVE_COMPLEX_COOKIE])
        || await getFirstComplexId()
}

export async function getActiveComplexId(): Promise<string | null> {
    return getAdminActiveComplexId()
}

export async function setActiveComplex(formData: FormData) {
    await requireAdmin()

    const complexId = (formData.get("complexId") as string | null)?.trim()

    if (!complexId) {
        return { error: "Selecciona un complejo." }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
        .from("complexes")
        .select("id")
        .eq("id", complexId)
        .maybeSingle()

    if (error || !data) {
        return { error: "El complejo seleccionado no existe." }
    }

    const cookieStore = await cookies()
    cookieStore.set(ADMIN_ACTIVE_COMPLEX_COOKIE, complexId, {
        path: "/",
        sameSite: "lax",
        httpOnly: true,
    })

    revalidatePath("/")
    revalidatePath("/turnos")
    revalidatePath("/profesores")
    revalidatePath("/inventario")
    revalidatePath("/reportes")
    revalidatePath("/configuracion")

    return { success: true }
}

export async function setUserActiveComplex(formData: FormData) {
    await requireAuth()

    const complexId = (formData.get("complexId") as string | null)?.trim()

    if (!complexId) {
        return { error: "Selecciona un complejo." }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
        .from("complexes")
        .select("id")
        .eq("id", complexId)
        .maybeSingle()

    if (error || !data) {
        return { error: "El complejo seleccionado no existe." }
    }

    const cookieStore = await cookies()
    cookieStore.set(USER_ACTIVE_COMPLEX_COOKIE, complexId, {
        path: "/",
        sameSite: "lax",
        httpOnly: true,
    })

    revalidatePath("/complejo")
    revalidatePath("/elegir-complejo")

    return { success: true }
}

export async function selectUserComplexAndRedirect(formData: FormData) {
    const result = await setUserActiveComplex(formData)

    if (result?.error) {
        redirect(`/elegir-complejo?error=${encodeURIComponent(result.error)}`)
    }

    redirect("/complejo")
}

export async function selectActiveComplexAndRedirect(formData: FormData) {
    const result = await setActiveComplex(formData)

    if (result?.error) {
        redirect(`/seleccionar-complejo?error=${encodeURIComponent(result.error)}`)
    }

    redirect("/turnos")
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
    const mapMarkerIcon = normalizeMapMarkerIcon(formData.get("mapMarkerIcon") as string | null)
    const description = (formData.get("description") as string | null)?.trim()
    const footerLine1 = (formData.get("footerLine1") as string | null)?.trim()
    const footerLine2 = (formData.get("footerLine2") as string | null)?.trim()

    if (!complexName || !logoSrc || !description || !address || !latitude || !longitude || !mapMarkerIcon || !footerLine1 || !footerLine2) {
        return { error: "Completa todos los campos del complejo antes de guardar." }
    }

    let duplicateQuery = supabase
        .from("complexes")
        .select("id")
        .ilike("name", complexName)

    if (id) {
        duplicateQuery = duplicateQuery.neq("id", id)
    }

    const { data: duplicateComplex, error: duplicateError } = await duplicateQuery.maybeSingle()

    if (duplicateError) {
        console.error("Error checking duplicate complex:", duplicateError)
        return { error: "No se pudo validar si el complejo ya existe." }
    }

    if (duplicateComplex) {
        return { error: "Ya existe un complejo con ese nombre." }
    }

    const payload = {
        name: complexName,
        app_name: complexConfig.appName,
        logo_url: logoSrc,
        address: address || null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        map_marker_icon: mapMarkerIcon,
        description,
        footer_line_1: footerLine1 || null,
        footer_line_2: footerLine2 || null,
        assistant_name: complexConfig.assistantName,
    }

    const result = id
        ? await supabase.from("complexes").update(payload).eq("id", id).select("id").maybeSingle()
        : await supabase.from("complexes").insert(payload).select("id").maybeSingle()

    if (result.error) {
        console.error("Error updating complex branding:", result.error)
        return {
            error: "No se pudo guardar la configuracion. Verifica que la migracion de branding este aplicada en Supabase.",
        }
    }

    if (result.data?.id) {
        const cookieStore = await cookies()
        cookieStore.set(ADMIN_ACTIVE_COMPLEX_COOKIE, result.data.id, {
            path: "/",
            sameSite: "lax",
            httpOnly: true,
        })
    }

    revalidatePath("/")
    revalidatePath("/login")
    revalidatePath("/configuracion")
    revalidatePath("/turnos")

    return { success: true, id: result.data?.id }
}
