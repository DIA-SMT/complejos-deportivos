import Link from "next/link"
import { CalendarDays, CheckCircle2, Clock, Hourglass, MapPin, Plus, XCircle } from "lucide-react"
import type { UserReservationRequest } from "@/app/actions/public-reservations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    rejected: "Rechazada",
    cancelled: "Cancelada",
    completed: "Completada",
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    confirmed: "default",
    rejected: "destructive",
    cancelled: "outline",
    completed: "outline",
}

function formatDate(value: string) {
    const [year, month, day] = value.split("-").map(Number)
    return new Intl.DateTimeFormat("es-AR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
    }).format(new Date(year, month - 1, day))
}

function formatTime(value: string) {
    return value.slice(0, 5)
}

export function UserReservationList({ reservations }: { reservations: UserReservationRequest[] }) {
    const pendingCount = reservations.filter((reservation) => reservation.status === "pending").length
    const confirmedCount = reservations.filter((reservation) => reservation.status === "confirmed").length
    const rejectedOrCancelledCount = reservations.filter((reservation) =>
        ["rejected", "cancelled"].includes(reservation.status)
    ).length

    if (!reservations.length) {
        return (
            <div className="grid gap-4 rounded-lg border border-dashed p-6 text-sm text-muted-foreground md:grid-cols-[1fr_auto] md:items-center">
                <div>
                    <p className="font-medium text-foreground">Todavia no tenes solicitudes de reserva.</p>
                    <p className="mt-1">
                        Cuando elijas un horario en este complejo, vas a poder seguir el estado desde aca.
                    </p>
                </div>
                <Button asChild>
                    <Link href="#reservar-turno">
                        <Plus className="h-4 w-4" />
                        Reservar
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-md border bg-muted/30 p-3">
                    <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Hourglass className="h-4 w-4 text-amber-600" />
                        Pendientes
                    </p>
                    <p className="mt-1 text-2xl font-bold">{pendingCount}</p>
                </div>
                <div className="rounded-md border bg-muted/30 p-3">
                    <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Confirmadas
                    </p>
                    <p className="mt-1 text-2xl font-bold">{confirmedCount}</p>
                </div>
                <div className="rounded-md border bg-muted/30 p-3">
                    <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Rechazadas
                    </p>
                    <p className="mt-1 text-2xl font-bold">{rejectedOrCancelledCount}</p>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                {reservations.map((reservation) => (
                    <div key={reservation.id} className="rounded-lg border p-4 transition-colors hover:bg-muted/30">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold">{reservation.sport}</p>
                                <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    {reservation.courts?.name || "Cancha a confirmar"}
                                </p>
                            </div>
                            <Badge variant={statusVariants[reservation.status] || "outline"}>
                                {statusLabels[reservation.status] || reservation.status}
                            </Badge>
                        </div>

                        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                            <span className="inline-flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-primary" />
                                {formatDate(reservation.preferred_date)}
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                {formatTime(reservation.preferred_time)}
                            </span>
                        </div>

                        {reservation.status === "pending" ? (
                            <p className="mt-3 rounded-md bg-amber-50 p-2 text-xs text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
                                El complejo todavia tiene que revisar esta solicitud.
                            </p>
                        ) : null}

                        {reservation.notes ? (
                            <p className="mt-3 rounded-md bg-muted p-2 text-sm text-muted-foreground">{reservation.notes}</p>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    )
}
