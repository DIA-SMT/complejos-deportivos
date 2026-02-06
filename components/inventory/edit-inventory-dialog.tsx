"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil } from "lucide-react"
import { updateInventoryItem } from "@/app/actions/inventory"
import { toast } from "sonner"

interface InventoryItem {
    id: string
    name: string
    quantity: number
    description?: string | null
}

export function EditInventoryDialog({ item }: { item: InventoryItem }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            // Append ID since it's not in a visible input
            formData.append("id", item.id)

            const result = await updateInventoryItem(formData)

            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Item actualizado correctamente")
                setOpen(false)
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/40 dark:hover:text-blue-400">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Item</DialogTitle>
                    <DialogDescription>
                        Modificá los detalles del item del inventario.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={item.name}
                            required
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="quantity">Cantidad</Label>
                        <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            defaultValue={item.quantity}
                            required
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                            id="description"
                            name="description"
                            defaultValue={item.description || ""}
                            className="col-span-3"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
