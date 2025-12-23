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
