"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { addDays, format } from "date-fns"
import { CalendarDays, CheckCircle2, Clock3, MapPin, Send } from "lucide-react"
import {
    createPublicReservationRequest,
    type PublicAvailabilityBlock,
} from "@/app/actions/public-reservations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ComplexSport, Court, Sport } from "@/app/actions/facilities"
import type { RegisteredComplex } from "@/app/actions/complex-settings"

function normalizeValue(value?: string | null) {
    return (value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
}

const SLOT_START_HOUR = 8
const SLOT_END_HOUR = 22

function timeToMinutes(value: string) {
    const [hours, minutes] = value.slice(0, 5).split(":").map(Number)
    return hours * 60 + minutes
}

function formatSlotTime(totalMinutes: number) {
    return `${Math.floor(totalMinutes / 60).toString().padStart(2, "0")}:${(totalMinutes % 60).toString().padStart(2, "0")}`
}

function overlapsBlock(start: string, end: string, block: PublicAvailabilityBlock) {
    const blockStart = timeToMinutes(block.start_time)
    const blockEnd = block.end_time ? timeToMinutes(block.end_time) : blockStart + 60
    return blockStart < timeToMinutes(end) && blockEnd > timeToMinutes(start)
}

export function ReservationRequestForm({
    sports,
    courts,
    complexSports,
    availabilityBlocks,
    complexes,
    selectedComplexId,
    selectedCourtId,
    selectedDate,
    selectedTime,
    selectedSport,
    showComplexPortalLink,
}: {
    sports: Sport[]
    courts: Court[]
    complexSports: ComplexSport[]
    availabilityBlocks: PublicAvailabilityBlock[]
    complexes: RegisteredComplex[]
    selectedComplexId?: string
    selectedCourtId?: string
    selectedDate?: string
    selectedTime?: string
    selectedSport?: string
    showComplexPortalLink?: boolean
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sent, setSent] = useState(false)
    const [selectedComplex, setSelectedComplex] = useState(selectedComplexId || "")
    const normalizedSelectedSport = normalizeValue(selectedSport)
    const initialSport = selectedComplexId ? sports.find((sport) => {
        const normalizedSportName = normalizeValue(sport.name)
        const belongsToComplex = complexSports.some(
            (association) => association.complex_id === selectedComplexId && association.sport_id === sport.id,
        )

        return belongsToComplex && (sport.id === selectedSport ||
            normalizedSportName === normalizedSelectedSport ||
            normalizedSelectedSport.includes(normalizedSportName) ||
            normalizedSportName.includes(normalizedSelectedSport))
    }) : undefined
    const [selectedSportId, setSelectedSportId] = useState(initialSport?.id || "")
    const [chosenDate, setChosenDate] = useState(selectedDate || "")
    const [chosenTime, setChosenTime] = useState(selectedTime || "")
    const availableSports = useMemo(() => {
        if (!selectedComplex) return []
        const availableIds = new Set(
            complexSports
                .filter((association) => association.complex_id === selectedComplex)
                .map((association) => association.sport_id),
        )
        return sports.filter((sport) => availableIds.has(sport.id))
    }, [complexSports, selectedComplex, sports])
    const selectedSportOption = availableSports.find((sport) => sport.id === selectedSportId)
    const complexCourts = selectedComplex
        ? courts.filter((court) => court.complex_id === selectedComplex)
        : []
    const filteredCourts = selectedSportId
        ? complexCourts.filter((court) => court.sport_id === selectedSportId)
        : []
    const selectedCourtStillValid = selectedCourtId && filteredCourts.some((court) => court.id === selectedCourtId)
    const [selectedCourt, setSelectedCourt] = useState(selectedCourtStillValid ? selectedCourtId : "")
    const days = useMemo(() => {
        const today = new Date()
        return Array.from({ length: 14 }, (_, index) => {
            const date = addDays(today, index)
            return {
                value: format(date, "yyyy-MM-dd"),
                weekday: new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(date).replace(".", ""),
                day: format(date, "dd"),
                month: new Intl.DateTimeFormat("es-AR", { month: "short" }).format(date).replace(".", ""),
                label: index === 0 ? "Hoy" : index === 1 ? "Mañana" : null,
            }
        })
    }, [])
    const slots = useMemo(() => Array.from(
        { length: SLOT_END_HOUR - SLOT_START_HOUR },
        (_, index) => {
            const startMinutes = (SLOT_START_HOUR + index) * 60
            return {
                start: formatSlotTime(startMinutes),
                end: formatSlotTime(startMinutes + 60),
            }
        },
    ), [])
    const availableSlots = useMemo(() => {
        if (!selectedCourt || !chosenDate) return []
        const now = new Date()
        const today = format(now, "yyyy-MM-dd")
        const nowMinutes = now.getHours() * 60 + now.getMinutes()
        const courtBlocks = availabilityBlocks.filter(
            (block) => block.court_id === selectedCourt && block.date === chosenDate,
        )

        return slots.filter((slot) => {
            if (chosenDate === today && timeToMinutes(slot.start) <= nowMinutes) return false
            return !courtBlocks.some((block) => overlapsBlock(slot.start, slot.end, block))
        })
    }, [availabilityBlocks, chosenDate, selectedCourt, slots])

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
        setSelectedSportId("")
        setSelectedCourt("")
        setChosenDate("")
        setChosenTime("")
    }

    const handleSportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSportId(event.target.value)
        setSelectedCourt("")
        setChosenDate("")
        setChosenTime("")
    }

    if (sent) {
        return (
            <div className="rounded-2xl border border-blue-100/90 bg-white/85 p-8 text-center shadow-[0_18px_45px_rgba(51,78,110,0.12)] dark:border-white/10 dark:bg-[#0a1426]">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Solicitud enviada</h2>
                <p className="mt-3 text-muted-foreground">
                    El complejo revisara tu solicitud y se comunicara para confirmar disponibilidad.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                    <Button onClick={() => setSent(false)}>Enviar otra solicitud</Button>
                    {showComplexPortalLink ? (
                        <Button asChild variant="outline">
                            <Link href="/complejo">Ver mis reservas</Link>
                        </Button>
                    ) : null}
                    <Button asChild variant="outline">
                        <Link href="/">Volver al inicio</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-6 rounded-2xl border border-blue-100/90 bg-white/85 p-6 shadow-[0_18px_45px_rgba(51,78,110,0.12)] backdrop-blur-sm dark:border-white/10 dark:bg-[#0a1426]">
            <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="sr-only"
            />

            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/25">
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

            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/25">
                <h2 className="text-xl font-semibold">Preferencia de turno</h2>
                <p className="text-sm text-muted-foreground">
                    Primero elegí el complejo. Después vas a ver únicamente sus disciplinas y canchas disponibles.
                </p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="complexId">Complejo de preferencia</Label>
                <select
                    id="complexId"
                    name="complexId"
                    value={selectedComplex}
                    onChange={handleComplexChange}
                    required
                    className="flex h-10 w-full rounded-lg border border-input bg-white/75 px-3 py-1 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 dark:bg-white/5"
                >
                    <option value="" className="bg-background text-foreground">Seleccionar complejo</option>
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
                        name="sportId"
                        required
                        value={selectedSportId}
                        onChange={handleSportChange}
                        disabled={!selectedComplex || availableSports.length === 0}
                        className="flex h-10 w-full rounded-lg border border-input bg-white/75 px-3 py-1 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 dark:bg-white/5"
                    >
                        <option value="" className="bg-background text-foreground">
                            {!selectedComplex
                                ? "Primero elegí un complejo"
                                : availableSports.length
                                    ? "Seleccionar actividad"
                                    : "Sin disciplinas disponibles"}
                        </option>
                        {availableSports.map((sport) => (
                            <option key={sport.id} value={sport.id} className="bg-background text-foreground">{sport.name}</option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="courtId">Cancha o espacio</Label>
                    <select
                        key={`${selectedComplex || "all-courts"}-${selectedSportId || "no-sport"}`}
                        id="courtId"
                        name="courtId"
                        value={selectedCourt}
                        onChange={(event) => {
                            setSelectedCourt(event.target.value)
                            setChosenDate("")
                            setChosenTime("")
                        }}
                        required
                        disabled={!selectedSportId || filteredCourts.length === 0}
                        className="flex h-10 w-full rounded-lg border border-input bg-white/75 px-3 py-1 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 dark:bg-white/5"
                    >
                        <option value="" className="bg-background text-foreground">
                            {!selectedComplex
                                ? "Primero elegí un complejo"
                                : selectedSportId
                                    ? "Seleccionar cancha"
                                    : "Primero elegí una actividad"}
                        </option>
                        {filteredCourts.map((court) => (
                            <option key={court.id} value={court.id} className="bg-background text-foreground">
                                {selectedComplex ? court.name : `${court.name}${court.complexes?.name ? ` - ${court.complexes.name}` : ""}`}
                            </option>
                        ))}
                    </select>
                    {selectedSportId && complexCourts.length > 0 && filteredCourts.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                            No hay canchas cargadas para {selectedSportOption?.name} en este complejo.
                        </p>
                    ) : null}
                    {selectedComplex && complexCourts.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                            Este complejo todavia no tiene canchas cargadas.
                        </p>
                    ) : null}
                </div>
            </div>

            {selectedSportOption ? (
                <div className="grid gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-sm text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-center dark:border-white/10 dark:bg-white/5">
                    <span className="inline-flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Actividad seleccionada: <strong className="text-foreground">{selectedSportOption.name}</strong>
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {filteredCourts.length} cancha(s) compatible(s)
                    </span>
                </div>
            ) : null}

            <section className="space-y-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 to-white/70 p-5 dark:border-white/10 dark:from-blue-950/35 dark:to-white/3">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/20">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Elegí día y horario</h2>
                        <p className="text-sm text-muted-foreground">
                            Sólo aparecen turnos libres para la cancha seleccionada.
                        </p>
                    </div>
                </div>

                {!selectedCourt ? (
                    <div className="rounded-xl border border-dashed border-blue-200 bg-white/50 p-5 text-center text-sm text-muted-foreground dark:border-white/15 dark:bg-white/3">
                        Primero seleccioná el complejo, la actividad y la cancha.
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label>Día disponible</Label>
                            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                                {days.map((day) => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => {
                                            setChosenDate(day.value)
                                            setChosenTime("")
                                        }}
                                        className={`rounded-xl border px-2 py-3 text-center transition-all ${
                                            chosenDate === day.value
                                                ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                                : "border-blue-100 bg-white/80 text-slate-700 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                                        }`}
                                    >
                                        <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-75">
                                            {day.label || day.weekday}
                                        </span>
                                        <span className="mt-1 block text-xl font-bold leading-none">{day.day}</span>
                                        <span className="mt-1 block text-[10px] uppercase opacity-70">{day.month}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {chosenDate ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label>Horarios libres</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {availableSlots.length} disponible(s)
                                    </span>
                                </div>
                                {availableSlots.length ? (
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                        {availableSlots.map((slot) => (
                                            <button
                                                key={slot.start}
                                                type="button"
                                                onClick={() => setChosenTime(slot.start)}
                                                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${
                                                    chosenTime === slot.start
                                                        ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                                                        : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200"
                                                }`}
                                            >
                                                <Clock3 className="h-4 w-4" />
                                                {slot.start} – {slot.end}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-200">
                                        No quedan horarios libres para este día. Probá con otra fecha.
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {chosenDate && chosenTime ? (
                            <div className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200">
                                <span className="inline-flex items-center gap-2 font-medium">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Turno seleccionado
                                </span>
                                <strong>{chosenDate.split("-").reverse().join("/")} · {chosenTime}</strong>
                            </div>
                        ) : null}
                    </>
                )}

                <input type="hidden" name="preferredDate" value={chosenDate} />
                <input type="hidden" name="preferredTime" value={chosenTime} />
            </section>

            <div className="grid gap-2">
                <Label htmlFor="notes">Comentario opcional</Label>
                <Textarea id="notes" name="notes" placeholder="Ej: Somos 4 personas, preferimos turno por la tarde..." />
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting || !chosenDate || !chosenTime}>
                <Send className="h-4 w-4" />
                {isSubmitting ? "Enviando..." : "Enviar solicitud"}
            </Button>
        </form>
    )
}
