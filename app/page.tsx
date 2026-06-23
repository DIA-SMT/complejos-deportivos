import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  Dumbbell,
  MapPin,
  ShieldCheck,
} from "lucide-react"
import { getRegisteredComplexes } from "@/app/actions/complex-settings"
import { getPublicCourts, getSports } from "@/app/actions/facilities"
import { LandingAvailabilityExplorer } from "@/components/public/landing-availability-explorer"
import { LandingAccountMenu } from "@/components/public/landing-account-menu"
import { SportsParallaxBackground } from "@/components/public/sports-parallax-background"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export default async function Home() {
  const supabase = await createClient()
  const [complexes, sports, courts] = await Promise.all([
    getRegisteredComplexes(),
    getSports({ includeAll: true }),
    getPublicCourts(),
  ])
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
    : { data: null }

  const featuredComplexes = complexes.slice(0, 6)
  const complexCourtCounts = new Map<string, number>()
  courts.forEach((court) => {
    if (!court.complex_id) return
    complexCourtCounts.set(court.complex_id, (complexCourtCounts.get(court.complex_id) || 0) + 1)
  })

  return (
    <main className="min-h-screen overflow-hidden bg-[#eef4fb] text-slate-950 dark:bg-[#050b18] dark:text-white">
      <section className="relative w-full min-w-0 max-w-full min-h-[92vh] overflow-hidden border-b border-white/10 text-white">
        <Image
          src="/calendar-bg.jpeg"
          alt=""
          fill
          priority
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,9,23,0.98)_0%,rgba(4,17,40,0.9)_48%,rgba(4,21,48,0.64)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_36%,rgba(25,105,255,0.18),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(0,183,255,0.08),transparent_30%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
        <SportsParallaxBackground />

        <header className="relative z-[60] mx-auto max-w-[1440px] px-4 pt-4 sm:px-6">
          <div className="flex min-h-16 items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#030916]/80 px-3 shadow-2xl shadow-black/20 backdrop-blur-xl sm:gap-3 sm:px-5">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image
                src="/logoMuni-sm.png"
                alt="Logo del sistema de complejos deportivos"
                width={42}
                height={42}
                className="h-10 w-10 shrink-0 rounded-lg bg-white object-contain p-1"
              />
              <div className="min-w-0 max-w-[170px] leading-tight sm:max-w-none">
                <p className="truncate text-sm font-semibold sm:text-base">Complejos Deportivos</p>
                <p className="hidden text-xs text-white/55 sm:block">Reservas ciudadanas</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 rounded-xl p-1 text-sm lg:flex">
              <a href="#complejos" className="rounded-lg px-4 py-2 text-white/65 transition hover:bg-white/5 hover:text-white">
                Complejos
              </a>
              <a href="#actividades" className="rounded-lg px-4 py-2 text-white/65 transition hover:bg-white/5 hover:text-white">
                Deportes
              </a>
              <a href="#espacios" className="rounded-lg px-4 py-2 text-white/65 transition hover:bg-white/5 hover:text-white">
                Canchas
              </a>
              <Button asChild size="sm" className="ml-2 bg-blue-600 text-white shadow-lg shadow-blue-950/40 hover:bg-blue-500">
                <Link href="/reservar">Solicitar turno</Link>
              </Button>
            </nav>

            <LandingAccountMenu email={user?.email} role={profile?.role} />
          </div>
        </header>

        <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[1440px] flex-col justify-center px-5 pb-36 pt-12 sm:px-8 lg:min-h-[calc(92vh-96px)] lg:pb-40 lg:pt-16">
          <div className="min-w-0 max-w-3xl xl:max-w-[760px]">
            <Badge className="mb-6 border-blue-400/25 bg-blue-500/10 px-3 py-1 text-blue-100 hover:bg-blue-500/15">
              Sistema público de reservas
            </Badge>
            <h1 className="text-balance text-4xl font-bold leading-[1.04] tracking-[-0.04em] sm:text-6xl xl:text-7xl">
              Reservá turnos en
              <span className="block bg-gradient-to-r from-white via-blue-100 to-sky-300 bg-clip-text text-transparent">
                complejos deportivos
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Consultá complejos, deportes y canchas disponibles desde un único lugar.
              Elegí una opción y encontrá dónde realizar tu actividad.
            </p>

            <div className="mt-8 grid w-full max-w-md gap-3 sm:grid-cols-2">
              <Button asChild size="lg" className="h-12 w-full bg-blue-600 px-5 text-white shadow-xl shadow-blue-950/40 hover:bg-blue-500">
                <a href="#complejos">
                  Seleccionar complejo
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 w-full border-white/20 bg-white/5 px-5 text-white backdrop-blur hover:bg-white/10 hover:text-white"
              >
                <a href="#actividades">
                  <Dumbbell className="h-4 w-4" />
                  Ver deportes
                </a>
              </Button>
            </div>
          </div>

          <div className="absolute right-[21rem] top-[29%] hidden max-w-44 rounded-2xl border border-white/15 bg-[#07152d]/85 p-4 shadow-2xl backdrop-blur-xl 2xl:block">
            <p className="font-semibold text-sky-300">¡Hola!</p>
            <p className="mt-1 text-sm leading-5 text-white/75">
              Elegí un complejo para empezar.
            </p>
            <span className="absolute -right-2 bottom-5 h-4 w-4 rotate-45 border-r border-t border-white/15 bg-[#07152d]" />
          </div>

          <div className="relative z-40 mt-10 grid overflow-hidden rounded-2xl border border-white/10 bg-[#030916]/70 shadow-2xl shadow-black/30 backdrop-blur-xl sm:absolute sm:inset-x-8 sm:bottom-12 sm:mt-0 sm:grid-cols-3 lg:right-auto lg:w-[720px]">
            <HeroMetric
              icon={Building2}
              value={complexes.length}
              label="Complejos registrados"
              accent="text-blue-300"
            />
            <HeroMetric
              icon={Dumbbell}
              value={sports.length}
              label="Deportes disponibles"
              accent="text-emerald-300"
            />
            <HeroMetric
              icon={CalendarCheck2}
              value={courts.length}
              label="Canchas y espacios"
              accent="text-violet-300"
            />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 -bottom-px z-30 h-28 bg-gradient-to-b from-transparent via-[#dce9f7]/55 to-[#eef4fb] dark:via-[#050b18]/60 dark:to-[#050b18]" />
      </section>

      <LandingAvailabilityExplorer sports={sports} courts={courts} complexes={complexes} />

      <section id="complejos" className="relative border-t border-blue-100/80 bg-[#e7f0fa] dark:border-white/8 dark:bg-[#07101f]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,0.1),transparent_28%)]" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-20 sm:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-300">
                <span className="h-5 w-1 rounded-full bg-blue-500" />
                Complejos disponibles
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Elegí dónde querés entrenar
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Cada complejo conserva sus propias canchas, actividades y solicitudes.
              </p>
            </div>
            <Button asChild variant="outline" className="border-blue-200/80 bg-white/65 text-slate-700 shadow-sm backdrop-blur hover:bg-white hover:text-blue-700 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white">
              <Link href="/reservar">Reservar sin preferencia</Link>
            </Button>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {(featuredComplexes.length ? featuredComplexes : [{
              id: "default",
              name: "Complejo a configurar",
              description: "Cuando registres complejos, van a aparecer como opciones para los ciudadanos.",
              address: "Sin dirección configurada",
              logo_url: null,
              app_name: null,
              latitude: null,
              longitude: null,
              map_marker_icon: null,
            }]).map((complex, index) => {
              const courtCount = complexCourtCounts.get(complex.id) || 0

              return (
                <article
                  key={complex.id}
                  className="group overflow-hidden rounded-2xl border border-blue-100/90 bg-white/78 text-slate-950 shadow-[0_14px_35px_rgba(68,102,140,0.10)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_20px_45px_rgba(59,130,246,0.14)] dark:border-white/10 dark:bg-[#0a1426] dark:text-white dark:shadow-black/10 dark:hover:border-blue-400/35 dark:hover:shadow-blue-950/30"
                >
                  <div className="relative flex min-h-40 items-end overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,#0b1d3b,#09275b_55%,#0a4772)] p-5">
                    <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:32px_32px]" />
                    <div className={`absolute -right-10 -top-14 h-44 w-44 rounded-full blur-3xl ${
                      index % 3 === 0 ? "bg-blue-400/25" : index % 3 === 1 ? "bg-emerald-400/20" : "bg-violet-400/20"
                    }`} />
                    <div className="relative flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-2 shadow-xl backdrop-blur">
                        {complex.logo_url ? (
                          <Image
                            src={complex.logo_url}
                            alt={`Logo de ${complex.name}`}
                            width={64}
                            height={64}
                            className="h-full w-full rounded-xl object-contain"
                          />
                        ) : (
                          <Building2 className="h-7 w-7 text-blue-100" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-200/70">
                          Complejo deportivo
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-white">{complex.name}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                      <span>{complex.address || "Dirección no configurada"}</span>
                    </div>
                    <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-6 text-muted-foreground">
                      {complex.description || "Complejo registrado para gestionar actividades, espacios y solicitudes."}
                    </p>

                    <div className="mt-5 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground dark:border-white/8">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>
                        {courtCount
                          ? `${courtCount} ${courtCount === 1 ? "cancha o espacio cargado" : "canchas o espacios cargados"}`
                          : "Sin canchas cargadas todavía"}
                      </span>
                    </div>

                    <Button asChild className="mt-5 w-full bg-blue-600 text-white hover:bg-blue-500" disabled={complex.id === "default"}>
                      <Link href={complex.id === "default" ? "/reservar" : `/reservar?complexId=${complex.id}`}>
                        Elegir complejo
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-blue-100/80 bg-[#edf4fb] dark:border-white/8 dark:bg-[#050b18]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-16 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-300">Reservas ciudadanas</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              ¿Querés solicitar un turno?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Elegí una actividad, una cancha y el horario que preferís.
            </p>
          </div>
          <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-500">
            <Link href="/reservar">
              Iniciar solicitud
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

function HeroMetric({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: typeof Building2
  value: number
  label: string
  accent: string
}) {
  return (
    <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-semibold text-white">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  )
}
