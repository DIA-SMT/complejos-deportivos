"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { format } from "date-fns"
import { ArrowRight, Clock } from "lucide-react"
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
        <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-[240px_1fr]">
                <div className="grid gap-2">
                    <label htmlFor="availabilityCourt" className="text-sm font-medium">Cancha o espacio</label>
                    <select
                        id="availabilityCourt"
                        value={selectedCourtId}
                        onChange={(event) => setSelectedCourtId(event.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        {courts.map((court) => (
                            <option key={court.id} value={court.id}>{court.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid gap-2">
                    <p className="text-sm font-medium">Dia</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {days.map((day) => (
                            <button
                                key={day.value}
                                type="button"
                                onClick={() => setSelectedDate(day.value)}
                                className={`min-w-24 rounded-md border px-3 py-2 text-sm transition-colors ${selectedDate === day.value
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "bg-background hover:bg-muted"
                                    }`}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    const statusLabel = blockingShift
                        ? "Ocupado"
                        : blockingRequest?.status === "confirmed"
                            ? "Reservado"
                            : blockingRequest
                                ? "En revision"
                                : "Disponible"

                    return (
                        <div
                            key={`${selectedCourtId}-${selectedDate}-${slot.start}`}
                            className={`rounded-md border p-3 ${isOccupied
                                ? "border-red-200 bg-red-50 text-red-950 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-200"
                                : "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-200"
                                }`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-2 font-medium">
                                    <Clock className="h-4 w-4" />
                                    {slot.start} - {slot.end}
                                </span>
                                <span className="rounded-md bg-background/70 px-2 py-1 text-xs">
                                    {statusLabel}
                                </span>
                            </div>

                            {!isOccupied ? (
                                <Button asChild size="sm" className="mt-3 w-full">
                                    <Link href={`/reservar?complexId=${complexId}&courtId=${selectedCourtId}&date=${selectedDate}&time=${slot.start}&sport=${encodeURIComponent(selectedCourt?.sport_id || "")}`}>
                                        Solicitar
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <p className="mt-3 text-xs opacity-80">
                                    Elegi otro horario para {selectedCourt?.name || "esta cancha"}.
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
