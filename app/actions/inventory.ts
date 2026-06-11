'use server'

import { revalidatePath } from "next/cache"
import { requireAdmin } from "./auth"
import { getActiveComplexId } from "@/app/actions/complex-settings"
import { createClient } from "@/utils/supabase/server"

export async function getInventory() {
    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()

    if (!activeComplexId) return []

    const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("complex_id", activeComplexId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching inventory:", error)
        return []
    }

    return data
}

export async function createInventoryItem(formData: FormData) {
    await requireAdmin()

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()
    const name = (formData.get("name") as string | null)?.trim()
    const quantity = parseInt((formData.get("quantity") as string | null) || "")
    const description = (formData.get("description") as string | null)?.trim()

    if (!activeComplexId) {
        return { error: "Primero configura un complejo activo" }
    }

    if (!name || isNaN(quantity)) {
        return { error: "Nombre y cantidad son requeridos" }
    }

    const { error } = await supabase.from("inventory").insert({
        name,
        quantity,
        description: description || null,
        complex_id: activeComplexId,
    } as any)

    if (error) {
        console.error("Error creating item:", error)
        return { error: "Error al crear el item" }
    }

    revalidatePath("/inventario")
    return { success: true }
}

export async function updateInventoryItem(formData: FormData) {
    await requireAdmin()

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()
    const id = (formData.get("id") as string | null)?.trim()
    const name = (formData.get("name") as string | null)?.trim()
    const quantity = parseInt((formData.get("quantity") as string | null) || "")
    const description = (formData.get("description") as string | null)?.trim()

    if (!activeComplexId) {
        return { error: "Primero configura un complejo activo" }
    }

    if (!id || !name || isNaN(quantity)) {
        return { error: "ID, nombre y cantidad son requeridos" }
    }

    const { data, error } = await supabase
        .from("inventory")
        .update({
            name,
            quantity,
            description: description || null,
        } as any)
        .eq("id", id)
        .eq("complex_id", activeComplexId)
        .select()

    if (error) {
        console.error("Error updating item:", error)
        return { error: "Error al actualizar el item: " + error.message }
    }

    if (!data || data.length === 0) {
        return { error: "No se pudo actualizar. Verifica permisos o si el item existe." }
    }

    revalidatePath("/inventario")
    return { success: true }
}
