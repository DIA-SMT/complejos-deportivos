"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { updateCourt, type Court, type Sport } from "@/app/actions/facilities"
import { imageFileToCompactDataUrl } from "@/components/settings/image-file-utils"
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

export function EditCourtDialog({ court, sports }: { court: Court; sports: Sport[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [iconPreview, setIconPreview] = useState(court.icon_url || "")

    const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const image = await imageFileToCompactDataUrl(file, { maxSize: 256, quality: 0.78 })
            if (image.length > 500_000) {
                toast.error("La imagen es demasiado pesada.")
                event.target.value = ""
                return
            }
            setIconPreview(image)
        } catch {
            toast.error("No pudimos procesar esa imagen.")
        }
    }

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        formData.set("id", court.id)
        formData.set("iconUrl", iconPreview)
        const result = await updateCourt(formData)
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
            return
        }

        toast.success("Cancha actualizada")
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Editar cancha">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar cancha</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar cancha o espacio</DialogTitle>
                    <DialogDescription>
                        Los cambios se aplican solamente a {court.complexes?.name || "este complejo"}.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4">
                    <input type="hidden" name="complexId" value={court.complex_id || ""} />
                    <div className="grid gap-2">
                        <Label htmlFor={`court-name-${court.id}`}>Nombre</Label>
                        <Input id={`court-name-${court.id}`} name="name" defaultValue={court.name} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`court-sport-${court.id}`}>Deporte</Label>
                        <select
                            id={`court-sport-${court.id}`}
                            name="sportId"
                            defaultValue={court.sport_id || ""}
                            required
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        >
                            <option value="">Seleccionar deporte</option>
                            {sports.map((sport) => (
                                <option key={sport.id} value={sport.id}>{sport.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`court-type-${court.id}`}>Variante o tipo</Label>
                        <Input id={`court-type-${court.id}`} name="type" defaultValue={court.type || ""} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`court-icon-${court.id}`}>Logo o referencia visual</Label>
                        <Input id={`court-icon-${court.id}`} type="file" accept="image/*" onChange={handleImage} />
                        {iconPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={iconPreview} alt="" className="h-14 w-14 rounded-md object-contain" />
                        ) : null}
                        {iconPreview ? (
                            <Button type="button" variant="outline" size="sm" onClick={() => setIconPreview("")}>
                                Quitar imagen
                            </Button>
                        ) : null}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
