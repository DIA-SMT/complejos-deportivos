'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";

export async function getInventory() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("inventory").select("*").order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching inventory:", error);
        return [];
    }

    return data;
}

export async function createInventoryItem(formData: FormData) {
    // Verificar que el usuario sea admin
    await requireAdmin();

    const supabase = await createClient();

    const name = formData.get("name") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const description = formData.get("description") as string;

    if (!name || isNaN(quantity)) {
        return { error: "Nombre y cantidad son requeridos" };
    }

    const { error } = await supabase.from("inventory").insert({
        name,
        quantity,
        description: description || null,
    } as any);

    if (error) {
        console.error("Error creating item:", error);
        return { error: "Error al crear el item" };
    }

    revalidatePath("/inventario");
    return { success: true };
}

export async function updateInventoryItem(formData: FormData) {
    console.log("updateInventoryItem called");
    try {
        await requireAdmin();
        console.log("Admin check passed");
    } catch (e) {
        console.error("Admin check failed:", e);
        return { error: "No autorizado" };
    }

    const supabase = await createClient();

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const description = formData.get("description") as string;

    console.log("Payload:", { id, name, quantity, description });

    if (!id || !name || isNaN(quantity)) {
        console.error("Validation failed");
        return { error: "ID, nombre y cantidad son requeridos" };
    }

    const { data, error } = await supabase
        .from("inventory")
        .update({
            name,
            quantity,
            description: description || null,
        } as any)
        .eq("id", id)
        .select();

    if (error) {
        console.error("Error updating item (Supabase):", error);
        return { error: "Error al actualizar el item: " + error.message };
    }

    if (!data || data.length === 0) {
        console.error("No rows updated. Check RLS policies or ID.");
        return { error: "No se pudo actualizar. Verificá permisos o si el item existe." };
    }

    console.log("Update success, data:", data);

    revalidatePath("/inventario");
    return { success: true };
}
