import Image from "next/image"
import Link from "next/link"
import { Building2, Clock, Dumbbell, IdCard, LogOut, MapPin, User, Users } from "lucide-react"
import { logout, requireAuth } from "@/app/actions/auth"
import { getComplexPublicOverview } from "@/app/actions/complex-public-overview"
import { getMyCredentialForActiveComplex, getMyPendingMembershipRequestForActiveComplex } from "@/app/actions/memberships"
import { getMyReservationRequestsForActiveComplex } from "@/app/actions/public-reservations"
import { AvailabilityPicker } from "@/components/complex/availability-picker"
import { UserReservationList } from "@/components/complex/user-reservation-list"
import { DigitalCredentialCard } from "@/components/members/digital-credential-card"
import { MembershipRequestForm } from "@/components/members/membership-request-form"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

const dayOrder = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"]

function formatTime(value: string) {
    return value.slice(0, 5)
}

export default async function ComplejoPage() {
    const [user, overview, myCredential, pendingMembershipRequest, myReservationRequests] = await Promise.all([
        requireAuth(),
        getComplexPublicOverview(),
        getMyCredentialForActiveComplex(),
        getMyPendingMembershipRequestForActiveComplex(),
        getMyReservationRequestsForActiveComplex(),
    ])
    const {
        activeComplexId,
        branding,
        sports,
        courts,
        professors,
        schedules,
        shifts,
        reservationRequests,
    } = overview
    const sortedSchedules = [...schedules].sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week)
        return dayDiff || a.start_time.localeCompare(b.start_time)
    })

    return (
        <main className="min-h-screen bg-[#edf4fb] dark:bg-[#09111f]">
            <header className="sticky top-0 z-30 border-b border-blue-100/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/8 dark:bg-[#07101f]/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                            {branding.logoSrc ? (
                                <Image
                                    src={branding.logoSrc}
                                    alt={branding.logoAlt}
                                    width={40}
                                    height={40}
                                    className="max-h-10 max-w-10 rounded-md object-contain"
                                />
                            ) : (
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                        <div className="hidden leading-tight sm:block">
                            <p className="text-sm font-semibold">{branding.appName}</p>
                            <p className="text-xs text-muted-foreground">{branding.displayName}</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        {myCredential ? (
                            <Button asChild variant="ghost" size="sm">
                                <Link href="#mi-carnet">
                                    <IdCard className="h-4 w-4" />
                                    <span className="hidden sm:inline">Mi credencial</span>
                                </Link>
                            </Button>
                        ) : null}
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/mi-perfil">Mi perfil</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/elegir-complejo">Cambiar complejo</Link>
                        </Button>
                        <form action={logout}>
                            <Button type="submit" variant="ghost" size="sm">
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Salir</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:py-8">
                <section className="relative overflow-hidden rounded-2xl border border-blue-100/90 bg-white/80 shadow-[0_18px_45px_rgba(51,78,110,0.10)] dark:border-white/10 dark:bg-[#0a1426]">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-white/30 to-transparent dark:from-blue-950/45 dark:via-transparent dark:to-transparent" />
                    <div className="relative grid gap-6 p-6 lg:grid-cols-[1fr_260px] lg:p-8">
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-background shadow-sm">
                                    {branding.logoSrc ? (
                                        <Image
                                            src={branding.logoSrc}
                                            alt={branding.logoAlt}
                                            width={56}
                                            height={56}
                                            className="max-h-14 max-w-14 rounded-md object-contain"
                                        />
                                    ) : (
                                        <Building2 className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-primary">Complejo seleccionado</p>
                                    <h1 className="text-3xl font-bold tracking-tight">{branding.displayName}</h1>
                                </div>
                            </div>

                            <p className="max-w-3xl text-muted-foreground">
                                {branding.description || "Informacion publica del complejo, actividades disponibles y horarios cargados."}
                            </p>

                            {branding.address ? (
                                <p className="inline-flex items-center gap-2 rounded-md bg-background/80 px-3 py-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    {branding.address}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                            <Card>
                                <CardContent className="flex items-center gap-3 p-4">
                                    <Dumbbell className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-2xl font-bold">{sports.length}</p>
                                        <p className="text-xs text-muted-foreground">Deportes</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="flex items-center gap-3 p-4">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-2xl font-bold">{courts.length}</p>
                                        <p className="text-xs text-muted-foreground">Espacios</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="flex items-center gap-3 p-4">
                                    <Users className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-2xl font-bold">{professors.length}</p>
                                        <p className="text-xs text-muted-foreground">Profesores</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <Card id="reservar-turno" className="scroll-mt-24">
                        <CardHeader>
                            <CardTitle>Actividades y espacios</CardTitle>
                            <CardDescription>Deportes disponibles y canchas cargadas para este complejo.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div>
                                <p className="mb-2 text-sm font-medium">Deportes</p>
                                <div className="flex flex-wrap gap-2">
                                    {sports.map((sport) => (
                                        <span key={sport.id} className="rounded-md bg-primary/10 px-3 py-1 text-sm text-primary">
                                            {sport.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 text-sm font-medium">Canchas y espacios</p>
                                {courts.length ? (
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {courts.map((court) => (
                                            <div key={court.id} className="rounded-md border p-3">
                                                <p className="font-medium">{court.name}</p>
                                                <p className="text-sm text-muted-foreground">{court.type || "Espacio deportivo"}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                                        Todavia no hay canchas cargadas para este complejo.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Profesores</CardTitle>
                            <CardDescription>Equipo visible para los usuarios del complejo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {professors.length ? (
                                <div className="space-y-2">
                                    {professors.map((professor) => (
                                        <div key={professor.id} className="rounded-md border p-3">
                                            <p className="font-medium">{professor.full_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {professor.specialty || professor.email || "Profesor del complejo"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                                    Todavia no hay profesores cargados.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Horarios de clases</CardTitle>
                            <CardDescription>Clases recurrentes publicadas por el complejo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {sortedSchedules.length ? (
                                <div className="space-y-2">
                                    {sortedSchedules.map((schedule) => (
                                        <div key={schedule.id} className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                                            <div>
                                                <p className="font-medium">{schedule.sport}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {schedule.professors?.full_name || "Sin profesor"} - {schedule.courts?.name || "Sin cancha"}
                                                </p>
                                                {schedule.description ? (
                                                    <p className="mt-1 text-sm text-muted-foreground">{schedule.description}</p>
                                                ) : null}
                                            </div>
                                            <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                                                <Clock className="h-4 w-4 text-primary" />
                                                {schedule.day_of_week} {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                                    Todavia no hay clases recurrentes cargadas.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Reservar turno</CardTitle>
                            <CardDescription>
                                Elegi una cancha y un dia. Los horarios verdes estan disponibles y los rojos ya estan ocupados o en revision.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AvailabilityPicker
                                complexId={activeComplexId}
                                courts={courts}
                                shifts={shifts}
                                reservationRequests={reservationRequests}
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card id="mis-reservas" className="scroll-mt-24">
                    <CardHeader>
                        <CardTitle>Mis reservas</CardTitle>
                        <CardDescription>
                            Seguimiento de tus solicitudes en este complejo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserReservationList reservations={myReservationRequests} />
                    </CardContent>
                </Card>

                <Card id="mi-carnet" className="scroll-mt-24">
                    <CardHeader>
                        <CardTitle>Mi carnet de socio</CardTitle>
                        <CardDescription>
                            Credencial digital asociada a tu email dentro de este complejo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {myCredential ? (
                            <DigitalCredentialCard credential={myCredential} />
                        ) : pendingMembershipRequest ? (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
                                <p className="font-semibold">Solicitud pendiente de aprobacion</p>
                                <p className="mt-1">
                                    Pediste asociarte como {pendingMembershipRequest.requested_membership_type}.
                                    Cuando administracion la apruebe, el carnet va a aparecer aca automaticamente.
                                </p>
                                {pendingMembershipRequest.requested_activities.length ? (
                                    <p className="mt-2">
                                        Actividades: {pendingMembershipRequest.requested_activities.join(", ")}
                                    </p>
                                ) : null}
                            </div>
                        ) : (
                            <MembershipRequestForm email={user.email} />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mi cuenta en este complejo</CardTitle>
                        <CardDescription>
                            Accesos y preferencias del usuario dentro del complejo seleccionado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr]">
                        <div className="rounded-md border p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold">Perfil</p>
                                    <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {user.role === "superadmin"
                                            ? "Superadministrador"
                                            : user.role === "complex_admin"
                                                ? "Administrador de complejo"
                                                : "Usuario"}
                                    </p>
                                </div>
                            </div>
                            <Button asChild className="mt-4 w-full">
                                <Link href="/mi-perfil">Modificar mis datos</Link>
                            </Button>
                        </div>

                        <div className="rounded-md border p-4">
                            <p className="font-semibold">Preferencias y accesos</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Cambia el tema, cambia de complejo o sali de tu cuenta.
                            </p>
                            <div className="mt-4 grid gap-2">
                                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                    <span className="text-sm font-medium">Tema</span>
                                    <ModeToggle />
                                </div>
                                <Button asChild variant="outline">
                                    <Link href="/elegir-complejo">Elegir otro complejo</Link>
                                </Button>
                                <form action={logout}>
                                    <Button type="submit" variant="ghost" className="w-full">
                                        <LogOut className="h-4 w-4" />
                                        Cerrar sesion
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
