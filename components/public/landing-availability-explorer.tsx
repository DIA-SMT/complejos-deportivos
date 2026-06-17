"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRight, Building2, Dumbbell, X } from "lucide-react"
import type { RegisteredComplex } from "@/app/actions/complex-settings"
import type { Court, Sport } from "@/app/actions/facilities"
import { Button } from "@/components/ui/button"

const sportVisuals = [
  { match: ["futbol", "football", "soccer"], icon: "\u26BD", label: "Pelota de futbol", accent: "from-sky-500/20 to-emerald-500/20" },
  { match: ["basket", "basquet", "basquetbol"], icon: "\u{1F3C0}", label: "Pelota de basket", accent: "from-orange-500/20 to-red-500/20" },
  { match: ["voley", "volley", "voleibol"], icon: "\u{1F3D0}", label: "Pelota de voley", accent: "from-yellow-400/20 to-sky-500/20" },
  { match: ["padel", "tenis", "tennis"], icon: "\u{1F3BE}", label: "Pelota de padel", accent: "from-lime-400/20 to-green-500/20" },
  { match: ["natacion", "pileta", "swim"], icon: "\u{1F3CA}", label: "Natacion", accent: "from-cyan-400/20 to-blue-500/20" },
  { match: ["gimnasia", "gym", "funcional"], icon: "\u{1F938}", label: "Gimnasia", accent: "from-fuchsia-500/20 to-rose-500/20" },
]

const courtPresets = [
  {
    id: "futbol-5",
    name: "Cancha de futbol 5",
    type: "Futbol",
    include: ["futbol 5", "futbol5", "f5", "society"],
    exclude: ["futbol 11", "futbol11", "f11"],
    icon: "\u26BD",
    accent: "from-sky-500/20 to-emerald-500/20",
  },
  {
    id: "futbol-11",
    name: "Cancha de futbol 11",
    type: "Futbol",
    include: ["futbol 11", "futbol11", "f11", "cancha grande"],
    exclude: ["futbol 5", "futbol5", "f5"],
    icon: "\u{1F945}",
    accent: "from-emerald-500/20 to-green-600/20",
  },
  {
    id: "basket",
    name: "Cancha de basket",
    type: "Basket",
    include: ["basket", "basquet", "basquetbol"],
    icon: "\u{1F3C0}",
    accent: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "voley",
    name: "Cancha de voley",
    type: "Voley",
    include: ["voley", "volley", "voleibol"],
    icon: "\u{1F3D0}",
    accent: "from-yellow-400/20 to-sky-500/20",
  },
  {
    id: "padel",
    name: "Cancha de padel",
    type: "Padel",
    include: ["padel", "tenis", "tennis"],
    icon: "\u{1F3BE}",
    accent: "from-lime-400/20 to-green-500/20",
  },
  {
    id: "pileta",
    name: "Pileta / natatorio",
    type: "Natacion",
    include: ["pileta", "natacion", "natatorio", "swim"],
    icon: "\u{1F3CA}",
    accent: "from-cyan-400/20 to-blue-500/20",
  },
]

type Selection =
  | { kind: "sport"; name: string; title: string; include: string[]; exclude?: string[] }
  | { kind: "court"; name: string; title: string; include: string[]; exclude?: string[] }

function normalizeValue(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function getSportVisual(name: string) {
  const normalizedName = normalizeValue(name)
  return sportVisuals.find((visual) => visual.match.some((term) => normalizedName.includes(term))) || {
    match: [name],
    icon: "\u{1F3C5}",
    label: "Actividad deportiva",
    accent: "from-primary/20 to-emerald-500/20",
  }
}

function buildSportSelection(sport: Sport): Selection {
  const normalizedName = normalizeValue(sport.name)

  if (normalizedName.includes("futbol 11") || normalizedName.includes("futbol11") || normalizedName.includes("f11")) {
    return {
      kind: "sport",
      name: sport.name,
      title: sport.name,
      include: ["futbol 11", "futbol11", "f11", "cancha grande"],
      exclude: ["futbol 5", "futbol5", "f5", "futbol de salon", "futbol salon", "futsal", "sala"],
    }
  }

  if (
    normalizedName.includes("futbol de salon") ||
    normalizedName.includes("futbol salon") ||
    normalizedName.includes("futsal") ||
    normalizedName.includes("sala")
  ) {
    return {
      kind: "sport",
      name: sport.name,
      title: sport.name,
      include: ["futbol de salon", "futbol salon", "futsal", "salon", "sala", "futbol 5", "futbol5", "f5"],
      exclude: ["futbol 11", "futbol11", "f11", "cancha grande"],
    }
  }

  const visual = getSportVisual(sport.name)

  return {
    kind: "sport",
    name: sport.name,
    title: sport.name,
    include: [sport.name, ...visual.match],
  }
}

function courtMatchesSelection(court: Court, selection: Selection) {
  const normalizedCourt = normalizeValue(`${court.name} ${court.type || ""}`)
  const includesTerm = selection.include.map(normalizeValue).some((term) => normalizedCourt.includes(term))
  const excludesTerm = selection.exclude?.map(normalizeValue).some((term) => normalizedCourt.includes(term)) || false

  return includesTerm && !excludesTerm
}

export function LandingAvailabilityExplorer({
  sports,
  courts,
  complexes,
}: {
  sports: Sport[]
  courts: Court[]
  complexes: RegisteredComplex[]
}) {
  const [selection, setSelection] = useState<Selection | null>(null)
  const featuredSports = sports.slice(0, 6)

  const matchingCourts = useMemo(() => {
    if (!selection) return []
    return courts.filter((court) => court.complex_id && courtMatchesSelection(court, selection))
  }, [courts, selection])

  const matchingComplexes = useMemo(() => {
    if (!selection) return []
    const matchingIds = new Set(matchingCourts.map((court) => court.complex_id))
    return complexes.filter((complex) => matchingIds.has(complex.id))
  }, [complexes, matchingCourts, selection])

  return (
    <>
      <section id="actividades" className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Deportes</p>
            <h2 className="text-3xl font-bold tracking-tight">Elegilo y mira donde esta disponible</h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/reservar">Reservar ahora</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(featuredSports.length ? featuredSports : [{ id: "default", name: "Actividades deportivas", icon_url: null, created_at: null }]).map((sport) => {
            const visual = getSportVisual(sport.name)

            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => setSelection(buildSportSelection(sport))}
                className="group relative min-h-44 overflow-hidden rounded-lg border bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${visual.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <span
                  aria-label={visual.label}
                  className="pointer-events-none absolute -right-5 -bottom-8 text-7xl opacity-0 transition-all duration-500 group-hover:-translate-x-3 group-hover:-translate-y-4 group-hover:rotate-[-10deg] group-hover:scale-110 group-hover:opacity-100"
                >
                  {visual.icon}
                </span>
                <div className="relative z-10">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{sport.name}</h3>
                  <p className="mt-2 max-w-[85%] text-sm text-muted-foreground">
                    Consulta disponibilidad y envia una solicitud para que el complejo la confirme.
                  </p>
                  <div className="mt-4 inline-flex translate-y-2 items-center gap-1 text-xs font-medium text-primary opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    Ver complejos
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section id="espacios" className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-medium text-primary">Espacios</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Canchas por disciplina</h2>
            <p className="mt-4 text-muted-foreground">
              Elegi un tipo de cancha y mira que complejos tienen espacios compatibles cargados.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/reservar">Reservar sin elegir cancha</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {courtPresets.map((court) => (
              <button
                key={court.id}
                type="button"
                onClick={() => setSelection({ kind: "court", name: court.id, title: court.name, include: court.include, exclude: court.exclude })}
                className="group relative overflow-hidden rounded-lg border bg-background p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${court.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className="relative z-10">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-xl text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    {court.icon}
                  </div>
                  <h3 className="font-semibold">{court.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{court.type}</p>
                  <div className="mt-4 inline-flex translate-y-2 items-center gap-1 text-xs font-medium text-primary opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    Ver complejos
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selection ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 py-5 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center">
          <div className="max-h-[86vh] w-full max-w-5xl overflow-y-auto rounded-lg border bg-background shadow-2xl animate-in slide-in-from-bottom-6 zoom-in-95 duration-300">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background/95 p-5 backdrop-blur">
              <div>
                <p className="text-sm font-medium text-primary">Complejos compatibles</p>
                <h3 className="text-2xl font-bold tracking-tight">{selection.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Estos complejos tienen canchas o espacios cargados para esta seleccion.
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setSelection(null)} aria-label="Cerrar">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-3">
              {matchingComplexes.length ? matchingComplexes.map((complex) => {
                const complexCourts = matchingCourts.filter((court) => court.complex_id === complex.id)

                return (
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
                        <h4 className="font-semibold">{complex.name}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{complex.address || "Direccion no configurada"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {complexCourts.slice(0, 3).map((court) => (
                        <span key={court.id} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {court.name}
                        </span>
                      ))}
                    </div>
                    <Button asChild className="mt-5 w-full">
                      <Link href={`/reservar?complexId=${complex.id}`}>
                        Elegir este complejo
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )
              }) : (
                <div className="rounded-lg border border-dashed bg-card p-6 text-sm text-muted-foreground md:col-span-2 lg:col-span-3">
                  Todavia no hay complejos con espacios cargados para {selection.title}.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
