"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { CalendarDays, Send } from "lucide-react"
import { createPublicReservationRequest } from "@/app/actions/public-reservations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Court, Sport } from "@/app/actions/facilities"
import type { RegisteredComplex } from "@/app/actions/complex-settings"

function normalizeValue(value?: string | null) {
    return (value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
}

export function ReservationRequestForm({
    sports,
    courts,
    complexes,
    selectedComplexId,
    selectedCourtId,
    selectedDate,
    selectedTime,
    selectedSport,
}: {
    sports: Sport[]
    courts: Court[]
    complexes: RegisteredComplex[]
    selectedComplexId?: string
    selectedCourtId?: string
    selectedDate?: string
    selectedTime?: string
    selectedSport?: string
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sent, setSent] = useState(false)
    const [selectedComplex, setSelectedComplex] = useState(selectedComplexId || "")
    const [selectedCourt, setSelectedCourt] = useState(selectedCourtId || "")
    const filteredCourts = selectedComplex
        ? courts.filter((court) => court.complex_id === selectedComplex)
        : courts
    const normalizedSelectedSport = normalizeValue(selectedSport)
    const initialSport = sports.find((sport) => {
        const normalizedSportName = normalizeValue(sport.name)

        return normalizedSportName === normalizedSelectedSport ||
            normalizedSelectedSport.includes(normalizedSportName) ||
            normalizedSportName.includes(normalizedSelectedSport)
    })?.name || selectedSport || ""

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)

        const form = event.currentTarget
        const result = await createPublicReservationRequest(new FormData(form))

        setIsSubmitting(false)

        if (result?.error) {
            toast.error(result.error)
            return
        }

        form.reset()
        setSent(true)
        toast.success("Solicitud enviada correctamente")
    }

    const handleComplexChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedComplex(event.target.value)
        setSelectedCourt("")
    }

    if (sent) {
        return (
            <div className="rounded-lg border bg-card p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Solicitud enviada</h2>
                <p className="mt-3 text-muted-foreground">
                    El complejo revisara tu solicitud y se comunicara para confirmar disponibilidad.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                    <Button onClick={() => setSent(false)}>Enviar otra solicitud</Button>
                    <Button asChild variant="outline">
                        <Link href="/">Volver al inicio</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-5 rounded-lg border bg-card p-5 shadow-sm">
            <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="sr-only"
            />

            <div>
                <h2 className="text-xl font-semibold">Tus datos</h2>
                <p className="text-sm text-muted-foreground">Los usamos solo para coordinar la confirmacion del turno.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="fullName">Nombre y apellido</Label>
                    <Input id="fullName" name="fullName" placeholder="Ej: Ana Perez" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Telefono</Label>
                    <Input id="phone" name="phone" placeholder="Ej: 381..." required />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Email opcional</Label>
                <Input id="email" name="email" type="email" placeholder="tu@email.com" />
            </div>

            <div className="border-t pt-5">
                <h2 className="text-xl font-semibold">Preferencia de turno</h2>
                <p className="text-sm text-muted-foreground">La reserva queda pendiente hasta que el complejo la confirme.</p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="complexId">Complejo de preferencia</Label>
                <select
                    id="complexId"
                    name="complexId"
                    value={selectedComplex}
                    onChange={handleComplexChange}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    <option value="" className="bg-background text-foreground">Sin preferencia</option>
                    {complexes.map((complex) => (
                        <option key={complex.id} value={complex.id} className="bg-background text-foreground">
                            {complex.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="sport">Actividad</Label>
                    <select
                        id="sport"
                        name="sport"
                        required
                        defaultValue={initialSport}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        <option value="" className="bg-background text-foreground">Seleccionar</option>
                        {sports.map((sport) => (
                            <option key={sport.id} value={sport.name} className="bg-background text-foreground">{sport.name}</option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="courtId">Cancha o espacio opcional</Label>
                    <select
                        key={selectedComplex || "all-courts"}
                        id="courtId"
                        name="courtId"
                        value={selectedCourt}
                        onChange={(event) => setSelectedCourt(event.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        <option value="" className="bg-background text-foreground">Sin preferencia</option>
                        {filteredCourts.map((court) => (
                            <option key={court.id} value={court.id} className="bg-background text-foreground">
                                {selectedComplex ? court.name : `${court.name}${court.complexes?.name ? ` - ${court.complexes.name}` : ""}`}
                            </option>
                        ))}
                    </select>
                    {selectedComplex && filteredCourts.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                            Este complejo todavia no tiene canchas cargadas.
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="preferredDate">Fecha</Label>
                    <Input id="preferredDate" name="preferredDate" type="date" defaultValue={selectedDate || ""} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="preferredTime">Horario</Label>
                    <Input id="preferredTime" name="preferredTime" type="time" defaultValue={selectedTime || ""} required />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="notes">Comentario opcional</Label>
                <Textarea id="notes" name="notes" placeholder="Ej: Somos 4 personas, preferimos turno por la tarde..." />
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting}>
                <Send className="h-4 w-4" />
                {isSubmitting ? "Enviando..." : "Enviar solicitud"}
            </Button>
        </form>
    )
}
