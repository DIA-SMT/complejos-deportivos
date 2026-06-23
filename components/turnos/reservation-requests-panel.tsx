"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
    CalendarCheck2,
    Check,
    Clock3,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    UserRound,
    X,
} from "lucide-react"
import { toast } from "sonner"
import {
    updateReservationRequestStatus,
    type AdminReservationRequest,
} from "@/app/actions/public-reservations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Filter = "pending" | "confirmed" | "rejected"

const filters: { value: Filter; label: string }[] = [
    { value: "pending", label: "Pendientes" },
    { value: "confirmed", label: "Confirmadas" },
    { value: "rejected", label: "Rechazadas" },
]

function formatDate(value: string) {
    return new Intl.DateTimeFormat("es-AR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${value}T12:00:00Z`))
}

function whatsappPhone(value: string) {
    let digits = value.replace(/\D/g, "")
    if (digits.startsWith("0")) digits = digits.slice(1)
    if (!digits.startsWith("54") && digits.length === 10) digits = `549${digits}`
    return digits
}

function whatsappUrl(request: AdminReservationRequest) {
    const confirmed = request.status === "confirmed"
    const message = confirmed
        ? `Hola ${request.citizens?.full_name || ""}, confirmamos tu turno de ${request.sport} en ${request.complexes?.name || "el complejo"} para el ${formatDate(request.preferred_date)} a las ${request.preferred_time.slice(0, 5)} en ${request.courts?.name || "la cancha seleccionada"}.`
        : `Hola ${request.citizens?.full_name || ""}, te informamos que no pudimos confirmar tu solicitud de ${request.sport} para el ${formatDate(request.preferred_date)} a las ${request.preferred_time.slice(0, 5)}. Podés ingresar nuevamente y elegir otro horario disponible.`

    return `https://wa.me/${whatsappPhone(request.citizens?.phone || "")}?text=${encodeURIComponent(message)}`
}

export function ReservationRequestsPanel({
    requests,
}: {
    requests: AdminReservationRequest[]
}) {
    const router = useRouter()
    const [filter, setFilter] = useState<Filter>("pending")
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const filteredRequests = useMemo(
        () => requests.filter((request) => request.status === filter),
        [filter, requests],
    )

    const updateStatus = (requestId: string, status: "confirmed" | "rejected") => {
        setProcessingId(requestId)
        startTransition(async () => {
            const result = await updateReservationRequestStatus(requestId, status)
            setProcessingId(null)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success(status === "confirmed" ? "Solicitud confirmada" : "Solicitud rechazada")
            router.refresh()
        })
    }

    return (
        <section className="rounded-2xl border border-blue-100/80 bg-white/85 p-5 shadow-[0_14px_36px_rgba(51,78,110,0.10)] backdrop-blur-sm dark:border-white/10 dark:bg-[#0a1426]/92">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300">
                        <CalendarCheck2 className="h-4 w-4" />
                        Solicitudes ciudadanas
                    </div>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight">Bandeja de reservas</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Confirmá o rechazá solicitudes y avisá al ciudadano por WhatsApp.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {filters.map((item) => {
                        const count = requests.filter((request) => request.status === item.value).length
                        return (
                            <Button
                                key={item.value}
                                type="button"
                                variant={filter === item.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(item.value)}
                            >
                                {item.label}
                                <Badge variant="secondary" className="ml-1">
                                    {count}
                                </Badge>
                            </Button>
                        )
                    })}
                </div>
            </div>

            <div className="mt-5 grid gap-3">
                {filteredRequests.length ? filteredRequests.map((request) => (
                    <article
                        key={request.id}
                        className="rounded-xl border border-blue-100/90 bg-blue-50/45 p-4 dark:border-white/8 dark:bg-white/3"
                    >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <div>
                                    <p className="inline-flex items-center gap-2 font-semibold">
                                        <UserRound className="h-4 w-4 text-blue-500" />
                                        {request.citizens?.full_name || "Sin nombre"}
                                    </p>
                                    <p className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5" />
                                        {request.citizens?.phone || "Sin teléfono"}
                                    </p>
                                    {request.citizens?.email ? (
                                        <p className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                                            <Mail className="h-3.5 w-3.5" />
                                            {request.citizens.email}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <p className="font-semibold">{request.sport}</p>
                                    <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 text-blue-500" />
                                        {request.courts?.name || "Sin cancha"}
                                    </p>
                                </div>

                                <div>
                                    <p className="font-semibold capitalize">{formatDate(request.preferred_date)}</p>
                                    <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock3 className="h-4 w-4 text-emerald-500" />
                                        {request.preferred_time.slice(0, 5)}
                                    </p>
                                </div>

                                <div>
                                    <Badge
                                        className={
                                            request.status === "confirmed"
                                                ? "bg-emerald-600 text-white"
                                                : request.status === "rejected"
                                                    ? "bg-rose-600 text-white"
                                                    : "bg-amber-500 text-white"
                                        }
                                    >
                                        {request.status === "confirmed"
                                            ? "Confirmada"
                                            : request.status === "rejected"
                                                ? "Rechazada"
                                                : "Pendiente"}
                                    </Badge>
                                    {request.notes ? (
                                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                            “{request.notes}”
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
                                {request.status === "pending" ? (
                                    <>
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={isPending && processingId === request.id}
                                            onClick={() => updateStatus(request.id, "confirmed")}
                                        >
                                            <Check className="h-4 w-4" />
                                            Confirmar
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            disabled={isPending && processingId === request.id}
                                            onClick={() => updateStatus(request.id, "rejected")}
                                        >
                                            <X className="h-4 w-4" />
                                            Rechazar
                                        </Button>
                                    </>
                                ) : (
                                    <Button asChild type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-500">
                                        <a href={whatsappUrl(request)} target="_blank" rel="noopener noreferrer">
                                            <MessageCircle className="h-4 w-4" />
                                            Avisar por WhatsApp
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </article>
                )) : (
                    <div className="rounded-xl border border-dashed border-blue-200 p-8 text-center text-sm text-muted-foreground dark:border-white/15">
                        No hay solicitudes {filter === "pending" ? "pendientes" : filter === "confirmed" ? "confirmadas" : "rechazadas"}.
                    </div>
                )}
            </div>
        </section>
    )
}
