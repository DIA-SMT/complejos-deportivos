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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { upsertClassReport } from "@/app/actions/reports"

interface CreateReportDialogProps {
    schedules: any[]
}

export function CreateReportDialog({ schedules }: CreateReportDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const result = await upsertClassReport(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Reporte guardado correctamente")
                setOpen(false)
            }
        } catch (error) {
            console.error("Error creating report:", error)
            toast.error("Error al guardar el reporte")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4" />
                    Nuevo Reporte
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Reporte de Clase</DialogTitle>
                    <DialogDescription>
                        Completá los datos de la clase.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="schedule">Clase</Label>
                            <Select name="scheduleId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar clase" />
                                </SelectTrigger>
                                <SelectContent>
                                    {schedules.map((schedule) => (
                                        <SelectItem key={schedule.id} value={schedule.id}>
                                            {schedule.sport} - {schedule.professors.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="attendance">Asistencia (cantidad)</Label>
                            <Input
                                id="attendance"
                                name="attendance"
                                type="number"
                                min="0"
                                placeholder="0"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Observaciones</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder="Notas sobre la clase..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Reporte
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
