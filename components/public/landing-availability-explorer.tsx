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
  { match: ["handball", "balonmano"], icon: "\u{1F93E}", label: "Handball", accent: "from-indigo-500/20 to-blue-500/20" },
  { match: ["hockey"], icon: "\u{1F3D1}", label: "Hockey", accent: "from-emerald-500/20 to-teal-500/20" },
  { match: ["atletismo", "running"], icon: "\u{1F3C3}", label: "Atletismo", accent: "from-amber-500/20 to-orange-500/20" },
  { match: ["artes marciales", "karate", "judo", "taekwondo"], icon: "\u{1F94B}", label: "Artes marciales", accent: "from-red-500/20 to-rose-500/20" },
]

const generalSports: Sport[] = [
  { id: "general-futbol", name: "Fútbol", icon_url: null, created_at: null },
  { id: "general-basket", name: "Básquet", icon_url: null, created_at: null },
  { id: "general-voley", name: "Vóley", icon_url: null, created_at: null },
  { id: "general-padel-tenis", name: "Pádel / Tenis", icon_url: null, created_at: null },
  { id: "general-natacion", name: "Natación", icon_url: null, created_at: null },
  { id: "general-gimnasia", name: "Gimnasia", icon_url: null, created_at: null },
  { id: "general-handball", name: "Handball", icon_url: null, created_at: null },
  { id: "general-hockey", name: "Hockey", icon_url: null, created_at: null },
  { id: "general-atletismo", name: "Atletismo", icon_url: null, created_at: null },
  { id: "general-artes-marciales", name: "Artes marciales", icon_url: null, created_at: null },
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
  const normalizedCourt = normalizeValue(`${court.name} ${court.type || ""} ${court.sports?.name || ""}`)
  const includesTerm = selection.include.map(normalizeValue).some((term) => normalizedCourt.includes(term))
  const excludesTerm = selection.exclude?.map(normalizeValue).some((term) => normalizedCourt.includes(term)) || false

  return includesTerm && !excludesTerm
}

function sportsOverlap(first: Sport, second: Sport) {
  const firstTerms = getSportVisual(first.name).match.map(normalizeValue)
  const secondTerms = getSportVisual(second.name).match.map(normalizeValue)
  const firstName = normalizeValue(first.name)
  const secondName = normalizeValue(second.name)

  return firstName === secondName
    || firstTerms.some((term) => secondName.includes(term))
    || secondTerms.some((term) => firstName.includes(term))
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
  const featuredSports = useMemo(() => {
    const additionalSports = sports.filter(
      (sport) => !generalSports.some((generalSport) => sportsOverlap(generalSport, sport)),
    )

    return [...generalSports, ...additionalSports]
  }, [sports])

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
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-300">
              <span className="h-5 w-1 rounded-full bg-blue-500" />
              Elegí tu deporte
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Encontrá espacios por actividad
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Seleccioná una disciplina y consultá qué complejos tienen canchas o espacios compatibles.
            </p>
          </div>
          <Button asChild variant="outline" className="border-blue-200/80 bg-white/65 text-slate-700 shadow-sm backdrop-blur hover:bg-white hover:text-blue-700 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white">
            <Link href="/reservar">Reservar ahora</Link>
          </Button>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {(featuredSports.length ? featuredSports : [{ id: "default", name: "Actividades deportivas", icon_url: null, created_at: null }]).map((sport) => {
            const visual = getSportVisual(sport.name)
            const sportSelection = buildSportSelection(sport)
            const availableCourts = courts.filter((court) => courtMatchesSelection(court, sportSelection)).length

            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => setSelection(sportSelection)}
                className="group relative min-h-48 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-5 text-left text-slate-950 shadow-[0_10px_28px_rgba(51,78,110,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_18px_40px_rgba(37,99,235,0.16)] dark:border-white/10 dark:bg-[#0a1426] dark:text-white dark:shadow-black/10 dark:hover:border-blue-400/40 dark:hover:shadow-blue-950/30"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${visual.accent} opacity-70 transition-opacity duration-300 group-hover:opacity-100 dark:opacity-20 dark:group-hover:opacity-70`} />
                <span
                  aria-label={visual.label}
                  className="pointer-events-none absolute -right-1 top-4 text-6xl opacity-65 saturate-125 drop-shadow-sm transition-all duration-500 group-hover:-translate-x-2 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:opacity-100 dark:opacity-25 dark:saturate-100 dark:group-hover:opacity-90"
                >
                  {visual.icon}
                </span>
                <div className="relative z-10">
                  <div className="mb-10 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200/70 bg-blue-100/70 text-blue-700 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 dark:border-white/10 dark:bg-white/5 dark:text-blue-300">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">{sport.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {availableCourts
                      ? `${availableCourts} ${availableCourts === 1 ? "espacio cargado" : "espacios cargados"}`
                      : "Sin espacios cargados"}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition group-hover:text-blue-700 dark:text-blue-300 dark:opacity-70 dark:group-hover:opacity-100">
                    Ver complejos
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section id="espacios" className="border-y border-blue-100/80 bg-[#dfeaf6] dark:border-white/8 dark:bg-[#06101f]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-300">
              <span className="h-5 w-1 rounded-full bg-blue-500" />
              Canchas y espacios
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Buscá por tipo de espacio
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Elegí una categoría y mirá qué complejos tienen instalaciones compatibles cargadas.
            </p>
            <Button asChild variant="outline" className="mt-7 border-blue-200/80 bg-white/65 text-slate-700 shadow-sm backdrop-blur hover:bg-white hover:text-blue-700 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white">
              <Link href="/reservar">Reservar sin elegir cancha</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {courtPresets.map((court) => (
              <button
                key={court.id}
                type="button"
                onClick={() => setSelection({ kind: "court", name: court.id, title: court.name, include: court.include, exclude: court.exclude })}
                className="group relative min-h-36 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-5 text-left text-slate-950 shadow-[0_10px_28px_rgba(51,78,110,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_18px_40px_rgba(37,99,235,0.16)] dark:border-white/10 dark:bg-[#0a1426] dark:text-white dark:hover:border-blue-400/40 dark:hover:shadow-blue-950/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${court.accent} opacity-70 transition-opacity duration-300 group-hover:opacity-100 dark:opacity-20 dark:group-hover:opacity-70`} />
                <div className="relative z-10">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200/80 bg-blue-100/80 text-2xl shadow-sm saturate-125 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 dark:border-white/10 dark:bg-white/5 dark:saturate-100">
                    {court.icon}
                  </div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">{court.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{court.type}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition group-hover:text-blue-700 dark:text-blue-300 dark:opacity-70 dark:group-hover:opacity-100">
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
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 px-4 py-5 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center">
          <div className="max-h-[86vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-blue-100 bg-[#edf4fb] text-slate-950 shadow-2xl animate-in slide-in-from-bottom-6 zoom-in-95 duration-300 dark:border-white/10 dark:bg-[#07101f] dark:text-white">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-blue-100 bg-[#edf4fb]/95 p-5 backdrop-blur dark:border-white/10 dark:bg-[#07101f]/95">
              <div>
                <p className="text-sm font-medium text-blue-300">Complejos compatibles</p>
                <h3 className="text-2xl font-bold tracking-tight">{selection.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Estos complejos tienen canchas o espacios cargados para esta selección.
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
                  <div key={complex.id} className="rounded-2xl border border-blue-100/90 bg-white/75 p-5 text-slate-950 shadow-sm dark:border-white/10 dark:bg-[#0a1426] dark:text-white">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-blue-50 text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-blue-300">
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
                        <p className="mt-1 text-sm text-muted-foreground">{complex.address || "Dirección no configurada"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {complexCourts.slice(0, 3).map((court) => (
                        <span key={court.id} className="rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground dark:border-white/8 dark:bg-white/5">
                          {court.name}
                        </span>
                      ))}
                    </div>
                    <Button asChild className="mt-5 w-full bg-blue-600 text-white hover:bg-blue-500">
                      <Link href={`/reservar?complexId=${complex.id}`}>
                        Elegir este complejo
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )
              }) : (
                <div className="rounded-2xl border border-dashed bg-muted/40 p-6 text-sm text-muted-foreground md:col-span-2 lg:col-span-3 dark:border-white/15 dark:bg-white/5">
                  Todavía no hay complejos con espacios cargados para {selection.title}.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
