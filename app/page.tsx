import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Building2, CalendarDays, MessageCircle, ShieldCheck } from "lucide-react"
import { getRegisteredComplexes } from "@/app/actions/complex-settings"
import { getCourts, getSports } from "@/app/actions/facilities"
import { LandingAvailabilityExplorer } from "@/components/public/landing-availability-explorer"
import { SportsParallaxBackground } from "@/components/public/sports-parallax-background"
import { ModeToggle } from "@/components/mode-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [complexes, sports, courts] = await Promise.all([
    getRegisteredComplexes(),
    getSports(),
    getCourts({ includeAll: true }),
  ])

  const featuredComplexes = complexes.slice(0, 6)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative min-h-[92vh] overflow-hidden">
        <Image
          src="/calendar-bg.jpeg"
          alt="Complejo deportivo"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <SportsParallaxBackground />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 text-white">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logoMuni-sm.png"
              alt="Logo del sistema de complejos deportivos"
              width={42}
              height={42}
              className="h-10 w-10 rounded-md bg-white object-contain p-1"
            />
            <div className="leading-tight">
              <p className="font-semibold">Complejos Deportivos</p>
              <p className="text-xs text-white/75">Reservas ciudadanas</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#complejos" className="text-white/80 hover:text-white">Complejos</a>
            <a href="#actividades" className="text-white/80 hover:text-white">Deportes</a>
            <a href="#espacios" className="text-white/80 hover:text-white">Canchas</a>
            <Link href="/login" className="text-white/80 hover:text-white">Acceso interno</Link>
            <div className="rounded-md border border-white/20 bg-white/10 text-white backdrop-blur">
              <ModeToggle />
            </div>
            <Button asChild size="sm" className="bg-white text-black hover:bg-white/90">
              <Link href="/reservar">Solicitar turno</Link>
            </Button>
          </nav>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(92vh-92px)] max-w-7xl flex-col justify-center px-5 pb-20 text-white">
          <Badge className="mb-5 w-fit border-white/30 bg-white/15 text-white hover:bg-white/20">
            Sistema publico de reservas
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Reserva turnos en complejos deportivos registrados
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
            Consulta complejos, deportes y canchas disponibles desde un unico lugar.
            Elegi una opcion y mira que complejos compatibles estan cargados.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full bg-white text-black hover:bg-white/90 sm:w-auto">
              <a href="#complejos">
                Seleccionar complejo
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto">
              <a href="#actividades">Ver deportes</a>
            </Button>
          </div>

          <div className="mt-12 grid max-w-4xl gap-3 sm:grid-cols-3">
            <div className="border-l border-white/30 pl-4">
              <CalendarDays className="mb-2 h-5 w-5" />
              <p className="text-sm font-medium">Solicitud simple</p>
              <p className="text-xs text-white/70">Envia tus datos y preferencia horaria.</p>
            </div>
            <div className="border-l border-white/30 pl-4">
              <ShieldCheck className="mb-2 h-5 w-5" />
              <p className="text-sm font-medium">Complejo de preferencia</p>
              <p className="text-xs text-white/70">El turno queda pendiente hasta ser validado.</p>
            </div>
            <div className="border-l border-white/30 pl-4">
              <MessageCircle className="mb-2 h-5 w-5" />
              <p className="text-sm font-medium">Migue te orienta</p>
              <p className="text-xs text-white/70">Consulta clases, espacios y horarios.</p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-b from-transparent via-background/70 to-background" />
      </section>

      <section id="complejos" className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Seleccionar complejo</p>
            <h2 className="text-3xl font-bold tracking-tight">Selecciona tu complejo de preferencia</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Tambien podes elegir por deporte o por tipo de cancha y ver los complejos compatibles.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/reservar">Reservar sin preferencia</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(featuredComplexes.length ? featuredComplexes : [{
            id: "default",
            name: "Complejo a configurar",
            description: "Cuando registres complejos, van a aparecer como opciones para los ciudadanos.",
            address: "Sin direccion configurada",
            logo_url: null,
            app_name: null,
          }]).map((complex) => (
            <div key={complex.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {complex.logo_url ? (
                    <Image
                      src={complex.logo_url}
                      alt={`Logo de ${complex.name}`}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-md object-contain"
                    />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold">{complex.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{complex.address || "Direccion no configurada"}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {complex.description || "Complejo registrado en el sistema para gestionar actividades, espacios y solicitudes."}
              </p>
              <Button asChild className="mt-5 w-full" disabled={complex.id === "default"}>
                <Link href={complex.id === "default" ? "/reservar" : `/reservar?complexId=${complex.id}`}>
                  Elegir este complejo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <LandingAvailabilityExplorer sports={sports} courts={courts} complexes={complexes} />

      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Queres solicitar un turno?</h2>
          <p className="mt-2 text-muted-foreground">Dejanos tus datos y el complejo se comunica para confirmar.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/reservar">
            Iniciar solicitud
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </main>
  )
}
