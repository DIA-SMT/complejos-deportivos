import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getComplexBranding, getRegisteredComplexes } from "@/app/actions/complex-settings"
import { getCourts, getSports } from "@/app/actions/facilities"
import { ReservationRequestForm } from "@/components/public/reservation-request-form"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export const dynamic = "force-dynamic"

export default async function ReservarPage({
    searchParams,
}: {
    searchParams?: Promise<{ complexId?: string }>
}) {
    const params = await searchParams
    const selectedComplexId = params?.complexId
    const [branding, complexes, sports, courts] = await Promise.all([
        getComplexBranding(),
        getRegisteredComplexes(),
        getSports(),
        getCourts(),
    ])
    const selectedComplex = complexes.find((complex) => complex.id === selectedComplexId)

    return (
        <main className="min-h-screen bg-muted/30">
            <header className="border-b bg-background">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src={branding.logoSrc}
                            alt={branding.logoAlt}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-md object-contain"
                        />
                        <div>
                            <p className="font-semibold">Complejos Deportivos</p>
                            <p className="text-xs text-muted-foreground">Solicitud de turno</p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ModeToggle />
                        <Button asChild variant="ghost">
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="lg:pt-8">
                    <p className="text-sm font-medium text-primary">Reserva ciudadana</p>
                    <h1 className="mt-2 text-4xl font-bold tracking-tight">Solicita tu turno</h1>
                    <p className="mt-4 text-muted-foreground">
                        Completa tus datos y una preferencia de actividad, fecha y horario.
                        La solicitud queda pendiente hasta que el complejo confirme disponibilidad.
                    </p>
                    {selectedComplex ? (
                        <div className="mt-6 rounded-lg border bg-background p-4 text-sm">
                            <p className="font-medium">Complejo seleccionado</p>
                            <p className="mt-1 text-muted-foreground">{selectedComplex.name}</p>
                        </div>
                    ) : null}
                    <div className="mt-6 rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                        Este formulario inicia el registro de clientes/ciudadanos para futuras reservas,
                        historial de turnos y comunicaciones del complejo.
                    </div>
                </div>

                <ReservationRequestForm
                    sports={sports}
                    courts={courts}
                    complexes={complexes}
                    selectedComplexId={selectedComplexId}
                />
            </section>
        </main>
    )
}
