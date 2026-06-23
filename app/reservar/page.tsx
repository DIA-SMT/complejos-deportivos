import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, CalendarCheck, ClipboardList, MapPin } from "lucide-react"
import { getRegisteredComplexes } from "@/app/actions/complex-settings"
import { getCourts, getPublicComplexSports, getSports } from "@/app/actions/facilities"
import { getPublicAvailabilityBlocks } from "@/app/actions/public-reservations"
import { ReservationRequestForm } from "@/components/public/reservation-request-form"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export const dynamic = "force-dynamic"

export default async function ReservarPage({
    searchParams,
}: {
    searchParams?: Promise<{ complexId?: string; courtId?: string; date?: string; time?: string; sport?: string }>
}) {
    const params = await searchParams
    const selectedComplexId = params?.complexId
    const complexes = await getRegisteredComplexes()
    const selectedComplex = complexes.find((complex) => complex.id === selectedComplexId)
    const selectedComplexForQuery = selectedComplex?.id || null
    const [courts, sports, complexSports, availabilityBlocks] = await Promise.all([
        getCourts({ includeAll: true }),
        getSports({ includeAll: true }),
        getPublicComplexSports(),
        getPublicAvailabilityBlocks(),
    ])

    return (
        <main className="min-h-screen bg-[#edf4fb] dark:bg-[#09111f]">
            <header className="border-b border-blue-100/80 bg-white/75 shadow-sm backdrop-blur-xl dark:border-white/8 dark:bg-[#07101f]/80">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/logoMuni-sm.png"
                            alt="Logo de la Municipalidad"
                            width={44}
                            height={44}
                            className="h-11 w-11 rounded-xl bg-white object-contain p-1 shadow-sm"
                        />
                        <div>
                            <p className="font-semibold">Deportes Municipio</p>
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

            <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[0.75fr_1.25fr]">
                <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                    <div>
                        <p className="text-sm font-medium text-primary">Reserva ciudadana</p>
                        <h1 className="mt-2 text-4xl font-bold tracking-tight">Solicita tu turno</h1>
                        <p className="mt-4 text-muted-foreground">
                            Elegí un complejo, una actividad disponible, la cancha, fecha y horario. La solicitud queda pendiente hasta que el complejo la confirme.
                        </p>
                    </div>
                    {selectedComplex ? (
                        <div className="rounded-2xl border border-blue-100/90 bg-white/75 p-4 text-sm shadow-sm dark:border-white/10 dark:bg-white/5">
                            <p className="inline-flex items-center gap-2 font-medium">
                                <MapPin className="h-4 w-4 text-primary" />
                                Complejo seleccionado
                            </p>
                            <p className="mt-1 text-muted-foreground">{selectedComplex.name}</p>
                        </div>
                    ) : null}

                    <div className="grid gap-3">
                        <div className="rounded-2xl border border-blue-100/90 bg-white/75 p-4 text-sm shadow-sm dark:border-white/10 dark:bg-white/5">
                            <p className="inline-flex items-center gap-2 font-medium">
                                <ClipboardList className="h-4 w-4 text-primary" />
                                1. Datos de contacto
                            </p>
                            <p className="mt-1 text-muted-foreground">Sirven para confirmar o rechazar la solicitud.</p>
                        </div>
                        <div className="rounded-2xl border border-blue-100/90 bg-white/75 p-4 text-sm shadow-sm dark:border-white/10 dark:bg-white/5">
                            <p className="inline-flex items-center gap-2 font-medium">
                                <CalendarCheck className="h-4 w-4 text-primary" />
                                2. Complejo, actividad y horario
                            </p>
                            <p className="mt-1 text-muted-foreground">Las disciplinas y canchas se filtran según el complejo elegido.</p>
                        </div>
                    </div>
                </div>

                <ReservationRequestForm
                    sports={sports}
                    courts={courts}
                    complexSports={complexSports}
                    availabilityBlocks={availabilityBlocks}
                    complexes={complexes}
                    selectedComplexId={selectedComplexForQuery || undefined}
                    selectedCourtId={params?.courtId}
                    selectedDate={params?.date}
                    selectedTime={params?.time}
                    selectedSport={params?.sport}
                    showComplexPortalLink={Boolean(selectedComplexForQuery)}
                />
            </section>
        </main>
    )
}
