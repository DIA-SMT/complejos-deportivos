"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { format } from "date-fns"
import { ArrowRight, CalendarDays, CheckCircle2, Clock3 } from "lucide-react"
import type { Court } from "@/app/actions/facilities"
import { Button } from "@/components/ui/button"

type ShiftSlot = {
    id: string
    court_id: string | null
    date: string
    start_time: string
    end_time: string
    status: string | null
}

type ReservationRequestSlot = {
    id: string
    court_id: string | null
    preferred_date: string
    preferred_time: string
    status: string
}

const SLOT_START_HOUR = 8
const SLOT_END_HOUR = 22
const SLOT_MINUTES = 60

function toDateInputValue(date: Date) {
    return format(date, "yyyy-MM-dd")
}

function formatDayLabel(date: Date, index: number) {
    if (index === 0) return "Hoy"
    if (index === 1) return "Manana"

    return new Intl.DateTimeFormat("es-AR", { weekday: "short", day: "numeric" }).format(date)
}

function formatTime(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0")
    const minutes = (totalMinutes % 60).toString().padStart(2, "0")
    return `${hours}:${minutes}`
}

function timeToMinutes(value: string) {
    const [hours, minutes] = value.slice(0, 5).split(":").map(Number)
    return hours * 60 + minutes
}

function buildSlots() {
    const slots: { start: string; end: string }[] = []

    for (let minute = SLOT_START_HOUR * 60; minute < SLOT_END_HOUR * 60; minute += SLOT_MINUTES) {
        slots.push({
            start: formatTime(minute),
            end: formatTime(minute + SLOT_MINUTES),
        })
    }

    return slots
}

function overlapsSlot(slotStart: string, slotEnd: string, itemStart: string, itemEnd?: string | null) {
    const slotStartMinutes = timeToMinutes(slotStart)
    const slotEndMinutes = timeToMinutes(slotEnd)
    const itemStartMinutes = timeToMinutes(itemStart)
    const itemEndMinutes = itemEnd ? timeToMinutes(itemEnd) : itemStartMinutes + SLOT_MINUTES

    return itemStartMinutes < slotEndMinutes && itemEndMinutes > slotStartMinutes
}

export function AvailabilityPicker({
    complexId,
    courts,
    shifts,
    reservationRequests,
}: {
    complexId: string | null
    courts: Court[]
    shifts: ShiftSlot[]
    reservationRequests: ReservationRequestSlot[]
}) {
    const [selectedCourtId, setSelectedCourtId] = useState(courts[0]?.id || "")
    const days = useMemo(() => {
        const today = new Date()
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(today)
            date.setDate(today.getDate() + index)

            return {
                value: toDateInputValue(date),
                label: formatDayLabel(date, index),
            }
        })
    }, [])
    const [selectedDate, setSelectedDate] = useState(days[0]?.value || "")
    const [selectedTime, setSelectedTime] = useState("")
    const slots = useMemo(() => buildSlots(), [])
    const selectedCourt = courts.find((court) => court.id === selectedCourtId)

    if (!complexId) {
        return (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Primero elegi un complejo para ver disponibilidad.
            </div>
        )
    }

    if (!courts.length) {
        return (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Este complejo todavia no tiene canchas cargadas para reservar.
            </div>
        )
    }

    return (
        <div className="space-y-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 to-white/70 p-5 dark:border-white/10 dark:from-blue-950/35 dark:to-white/3">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/20">
                    <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Disponibilidad de turnos</h3>
                    <p className="text-sm text-muted-foreground">
                        Elegí una cancha, el día y uno de los horarios disponibles.
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <label htmlFor="availabilityCourt" className="text-sm font-medium">Cancha o espacio</label>
                    <select
                        id="availabilityCourt"
                        value={selectedCourtId}
                        onChange={(event) => {
                            setSelectedCourtId(event.target.value)
                            setSelectedTime("")
                        }}
                        className="flex h-10 w-full rounded-lg border border-input bg-white/75 px-3 py-1 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 dark:bg-white/5"
                    >
                        {courts.map((court) => (
                            <option key={court.id} value={court.id}>{court.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid gap-2">
                    <p className="text-sm font-medium">Día</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {days.map((day) => {
                            const date = new Date(`${day.value}T12:00:00`)
                            const dayNumber = new Intl.DateTimeFormat("es-AR", { day: "2-digit" }).format(date)
                            const month = new Intl.DateTimeFormat("es-AR", { month: "short" }).format(date).replace(".", "")
                            const weekday = new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(date).replace(".", "")

                            return (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => {
                                        setSelectedDate(day.value)
                                        setSelectedTime("")
                                    }}
                                    className={`min-w-[76px] shrink-0 rounded-xl border px-2 py-3 text-center transition-all ${selectedDate === day.value
                                        ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                        : "border-blue-100 bg-white/80 text-slate-700 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                                        }`}
                                >
                                    <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-75">
                                        {day.label || weekday}
                                    </span>
                                    <span className="mt-1 block text-xl font-bold leading-none">{dayNumber}</span>
                                    <span className="mt-1 block text-[10px] uppercase opacity-70">{month}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Horarios</p>
                    <span className="text-xs text-muted-foreground">Seleccioná un horario libre</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slots.map((slot) => {
                    const blockingShift = shifts.find((shift) =>
                        shift.court_id === selectedCourtId &&
                        shift.date === selectedDate &&
                        shift.status !== "cancelled" &&
                        overlapsSlot(slot.start, slot.end, shift.start_time, shift.end_time)
                    )
                    const blockingRequest = reservationRequests.find((request) =>
                        request.court_id === selectedCourtId &&
                        request.preferred_date === selectedDate &&
                        overlapsSlot(slot.start, slot.end, request.preferred_time)
                    )
                    const isOccupied = Boolean(blockingShift || blockingRequest)
                    return (
                        <button
                            key={`${selectedCourtId}-${selectedDate}-${slot.start}`}
                            type="button"
                            disabled={isOccupied}
                            onClick={() => setSelectedTime(slot.start)}
                            className={`min-h-16 rounded-xl border px-3 py-3 text-center transition-all ${
                                isOccupied
                                    ? "cursor-not-allowed border-slate-200 bg-slate-100/80 text-slate-400 dark:border-white/8 dark:bg-white/3 dark:text-slate-500"
                                    : selectedTime === slot.start
                                        ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                                        : "border-emerald-200 bg-emerald-50 text-emerald-900 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200"
                            }`}
                        >
                            <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold">
                                <Clock3 className="h-4 w-4 shrink-0" />
                                {slot.start} – {slot.end}
                            </span>
                            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide opacity-70">
                                {isOccupied
                                    ? blockingShift
                                        ? "Ocupado"
                                        : blockingRequest?.status === "confirmed"
                                            ? "Reservado"
                                            : "En revisión"
                                    : selectedTime === slot.start
                                        ? "Seleccionado"
                                        : "Libre"}
                            </span>
                        </button>
                    )
                })}
                </div>
            </div>

            {selectedTime ? (
                <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200">
                    <span className="inline-flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        {selectedCourt?.name} · {selectedDate.split("-").reverse().join("/")} · {selectedTime}
                    </span>
                    <Button asChild size="sm">
                        <Link href={`/reservar?complexId=${complexId}&courtId=${selectedCourtId}&date=${selectedDate}&time=${selectedTime}&sport=${encodeURIComponent(selectedCourt?.sport_id || "")}`}>
                            Solicitar este turno
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            ) : null}
        </div>
    )
}
