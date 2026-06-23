"use client"

import { useMemo, useState } from "react"
import {
    Building2,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    IdCard,
    ShieldCheck,
    UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CredentialWithMember } from "@/app/actions/memberships"

function formatDate(value: string) {
    const [year, month, day] = value.split("-").map(Number)

    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(year, month - 1, day))
}

function CardBackground() {
    return (
        <>
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_42%_25%,rgba(65,190,245,0.45),transparent_38%),linear-gradient(120deg,#0868e8_0%,#0759c4_48%,#03469e_100%)]"
            />
            <div
                aria-hidden="true"
                className="absolute inset-y-0 right-[22%] -z-10 w-44 -skew-x-[20deg] bg-gradient-to-b from-[#39b9f1]/20 to-transparent"
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-28 left-[38%] -z-10 h-72 w-72 rounded-full border border-white/10"
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-20 left-[43%] -z-10 h-56 w-56 rounded-full border border-[#ffdc00]/15"
            />
        </>
    )
}

function MunicipalHeader({ complexName }: { complexName: string }) {
    return (
        <header className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-14 w-32 shrink-0 items-center overflow-hidden sm:h-16 sm:w-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/Logo_SMT_neg_4.png"
                    alt="Municipalidad de San Miguel de Tucumán"
                    className="h-full w-full object-contain object-left"
                />
            </div>
            <div className="min-w-0 border-l border-white/30 pl-3 sm:pl-4">
                <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-[#ffdc00] sm:text-[10px]">
                    Deportes Municipio
                </p>
                <h2 className="mt-1 truncate text-base font-black uppercase tracking-[0.07em] sm:text-xl">
                    {complexName}
                </h2>
            </div>
        </header>
    )
}

export function DigitalCredentialCard({
    credential,
    showValidationQr = true,
}: {
    credential: CredentialWithMember
    showValidationQr?: boolean
}) {
    const [side, setSide] = useState<"front" | "back">("front")
    const member = credential.members
    const fullName = member ? `${member.first_name} ${member.last_name}` : "Socio"
    const complexName = member?.complexes?.name || "Complejo deportivo"
    const validationUrl = useMemo(() => {
        const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "")
        const baseUrl = configuredUrl || (typeof window !== "undefined" ? window.location.origin : "")
        const credentialPath = `/credencial/${encodeURIComponent(credential.code)}`

        return baseUrl ? `${baseUrl}${credentialPath}` : credentialPath
    }, [credential.code])
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(validationUrl)}`

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant={side === "front" ? "default" : "outline"}
                    onClick={() => setSide("front")}
                >
                    Frente
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={side === "back" ? "default" : "outline"}
                    onClick={() => setSide("back")}
                >
                    Dorso
                </Button>
            </div>

            <div className="mx-auto w-full max-w-[860px]">
                {side === "front" ? (
                    <article className="relative isolate aspect-[1.65/1] min-h-[330px] overflow-hidden rounded-[26px] border border-[#36a9e1]/70 bg-[#0756b8] text-white shadow-[0_24px_70px_rgba(3,74,155,0.32)]">
                        <CardBackground />

                        <div className="flex h-full flex-col p-5 sm:p-7">
                            <MunicipalHeader complexName={complexName} />

                            <div className="grid flex-1 items-center gap-4 py-4 sm:grid-cols-[135px_1fr_auto] sm:gap-6">
                                <div className="relative hidden h-[170px] overflow-hidden rounded-xl border border-white/40 bg-gradient-to-br from-sky-500/40 to-blue-950 shadow-lg sm:block">
                                    {member?.photo_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={member.photo_url}
                                            alt={`Foto de ${fullName}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center gap-2 text-white/55">
                                            <UserRound className="h-14 w-14" strokeWidth={1.2} />
                                            <span className="text-[9px] uppercase tracking-[0.2em]">Foto</span>
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#ffdc00]">
                                        Titular
                                    </p>
                                    <h3 className="mt-2 text-xl font-black uppercase leading-tight tracking-[0.05em] sm:text-3xl">
                                        {fullName}
                                    </h3>
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[8px] uppercase tracking-[0.22em] text-[#ffdc00]">Identificador</p>
                                            <p className="mt-1 whitespace-nowrap font-mono text-sm font-bold tracking-[0.08em] sm:text-base">
                                                {credential.code}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] uppercase tracking-[0.22em] text-[#ffdc00]">Tipo de credencial</p>
                                            <p className="mt-1 text-sm font-bold uppercase tracking-[0.06em]">
                                                Socio
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    {showValidationQr ? (
                                        <div className="rounded-xl bg-white p-2 shadow-xl">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={qrSrc}
                                                alt={`QR de credencial ${credential.code}`}
                                                className="h-28 w-28 sm:h-36 sm:w-36"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border border-[#ffdc00]/70 text-center text-[#ffdc00] sm:h-28 sm:w-28">
                                            <IdCard className="h-8 w-8" />
                                            <span className="mt-1 px-2 text-[8px] font-bold uppercase tracking-[0.12em]">
                                                Credencial digital
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <footer className="flex items-center justify-between border-t border-white/25 pt-3 text-[8px] uppercase tracking-[0.16em] text-white/70">
                                <span>Credencial digital personal</span>
                                <span className="text-[#ffdc00]">
                                    {showValidationQr ? "Escaneá el QR para validar" : "Uso personal"}
                                </span>
                            </footer>
                        </div>
                    </article>
                ) : (
                    <article className="relative isolate aspect-[1.65/1] min-h-[330px] overflow-hidden rounded-[26px] border border-[#36a9e1]/70 bg-[#0756b8] text-white shadow-[0_24px_70px_rgba(3,74,155,0.32)]">
                        <CardBackground />

                        <div className="flex h-full flex-col p-5 sm:p-7">
                            <MunicipalHeader complexName={complexName} />

                            <div className="grid flex-1 gap-5 py-5 sm:grid-cols-2 sm:gap-8">
                                <div className="grid content-center grid-cols-2 gap-x-5 gap-y-5">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-[0.22em] text-[#ffdc00]">DNI</p>
                                        <p className="mt-1 text-sm font-semibold">{member?.dni || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] uppercase tracking-[0.22em] text-[#ffdc00]">Tipo de credencial</p>
                                        <p className="mt-1 text-sm font-semibold">Socio deportivo</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] uppercase tracking-[0.22em] text-[#ffdc00]">Fecha de alta</p>
                                        <p className="mt-1 text-sm font-semibold">{formatDate(credential.issued_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] uppercase tracking-[0.22em] text-[#ffdc00]">Complejo</p>
                                        <p className="mt-1 text-sm font-semibold">{complexName}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[8px] uppercase tracking-[0.22em] text-[#ffdc00]">Código de credencial</p>
                                        <p className="mt-1 break-all font-mono text-sm font-bold tracking-[0.08em]">
                                            {credential.code}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center border-t border-white/20 pt-4 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                                    <p className="text-[8px] uppercase tracking-[0.22em] text-[#ffdc00]">
                                        Actividades habilitadas
                                    </p>
                                    {credential.enabled_activities.length ? (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {credential.enabled_activities.map((activity) => (
                                                <span
                                                    key={activity}
                                                    className="rounded-full border border-[#ffdc00]/55 bg-[#ffdc00]/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#fff2a6]"
                                                >
                                                    {activity}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-white/65">Sin actividades específicas.</p>
                                    )}

                                    <div className="mt-6 space-y-2 text-[9px] uppercase tracking-[0.12em] text-white/70">
                                        <p className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-[#ffdc00]" />
                                            Uso personal e intransferible
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-[#ffdc00]" />
                                            Presentar para el ingreso
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-[#ffdc00]" />
                                            Alta registrada el {formatDate(credential.issued_at)}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-[#ffdc00]" />
                                            Emitida por Deportes Municipio
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <footer className="border-t border-white/25 pt-3 text-center text-[8px] uppercase tracking-[0.18em] text-[#ffdc00]">
                                Municipalidad de San Miguel de Tucumán
                            </footer>
                        </div>
                    </article>
                )}
            </div>

            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Ver lado anterior"
                    onClick={() => setSide(side === "front" ? "back" : "front")}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>{side === "front" ? "1 de 2 · Frente" : "2 de 2 · Dorso"}</span>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Ver lado siguiente"
                    onClick={() => setSide(side === "front" ? "back" : "front")}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
