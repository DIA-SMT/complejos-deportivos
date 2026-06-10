"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createCourt, createSport, deleteCourt, deleteSport, type Court, type Sport } from "@/app/actions/facilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function FacilitiesSettings({ sports, courts }: { sports: Sport[]; courts: Court[] }) {
    const router = useRouter()
    const [isSportSubmitting, setIsSportSubmitting] = useState(false)
    const [isCourtSubmitting, setIsCourtSubmitting] = useState(false)

    const handleCreateSport = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSportSubmitting(true)
        const form = event.currentTarget
        const result = await createSport(new FormData(form))
        setIsSportSubmitting(false)

        if (result?.error) {
            toast.error(result.error)
            return
        }

        toast.success("Deporte creado correctamente")
        form.reset()
        router.refresh()
    }

    const handleCreateCourt = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsCourtSubmitting(true)
        const form = event.currentTarget
        const result = await createCourt(new FormData(form))
        setIsCourtSubmitting(false)

        if (result?.error) {
            toast.error(result.error)
            return
        }

        toast.success("Cancha creada correctamente")
        form.reset()
        router.refresh()
    }

    const handleDeleteSport = async (id: string) => {
        if (!confirm("Eliminar este deporte?")) return

        const result = await deleteSport(id)
        if (result?.error) {
            toast.error(result.error)
            return
        }

        toast.success("Deporte eliminado")
        router.refresh()
    }

    const handleDeleteCourt = async (id: string) => {
        if (!confirm("Eliminar esta cancha?")) return

        const result = await deleteCourt(id)
        if (result?.error) {
            toast.error(result.error)
            return
        }

        toast.success("Cancha eliminada")
        router.refresh()
    }

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <section className="grid gap-4">
                <form onSubmit={handleCreateSport} className="grid gap-3 rounded-lg border bg-muted/20 p-4">
                    <div>
                        <h3 className="font-semibold">Nuevo deporte</h3>
                        <p className="text-sm text-muted-foreground">Se usara en horarios de profesores, reportes y calendario.</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sport-name">Nombre</Label>
                        <Input id="sport-name" name="name" placeholder="Ej: Tenis" required />
                    </div>
                    <Button type="submit" disabled={isSportSubmitting}>
                        <PlusCircle className="h-4 w-4" />
                        {isSportSubmitting ? "Agregando..." : "Agregar deporte"}
                    </Button>
                </form>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Deporte</TableHead>
                                <TableHead className="w-16 text-right">Accion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                                        No hay deportes cargados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sports.map((sport) => (
                                    <TableRow key={sport.id}>
                                        <TableCell className="font-medium">{sport.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSport(sport.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <section className="grid gap-4">
                <form onSubmit={handleCreateCourt} className="grid gap-3 rounded-lg border bg-muted/20 p-4">
                    <div>
                        <h3 className="font-semibold">Nueva cancha o espacio</h3>
                        <p className="text-sm text-muted-foreground">Representa canchas, piletas, salas o sectores reservables.</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="court-name">Nombre</Label>
                        <Input id="court-name" name="name" placeholder="Ej: Cancha 1" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="court-type">Tipo</Label>
                        <Input id="court-type" name="type" placeholder="Ej: Futbol 5, Pileta, Salon" />
                    </div>
                    <Button type="submit" disabled={isCourtSubmitting}>
                        <PlusCircle className="h-4 w-4" />
                        {isCourtSubmitting ? "Agregando..." : "Agregar cancha"}
                    </Button>
                </form>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cancha / espacio</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="w-16 text-right">Accion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        No hay canchas cargadas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courts.map((court) => (
                                    <TableRow key={court.id}>
                                        <TableCell className="font-medium">{court.name}</TableCell>
                                        <TableCell>{court.type || "-"}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCourt(court.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>
        </div>
    )
}
