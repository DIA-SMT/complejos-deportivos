"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CredentialWithMember } from "@/app/actions/memberships"

function getStatusLabel(status: string) {
    if (status === "active") return "Activo"
    if (status === "expired") return "Vencido"
    if (status === "suspended") return "Suspendido"
    return status
}

function getStatusVariant(status: string) {
    return status === "active" ? "default" : "destructive"
}

export function DigitalCredentialCard({ credential }: { credential: CredentialWithMember }) {
    const member = credential.members
    const validationUrl = useMemo(() => {
        if (typeof window === "undefined") return `/credencial/${credential.code}`
        return `${window.location.origin}/credencial/${credential.code}`
    }, [credential.code])
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(validationUrl)}`

    return (
        <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="bg-primary p-4 text-primary-foreground">
                <p className="text-xs uppercase tracking-wide opacity-80">Credencial digital</p>
                <h3 className="mt-1 text-xl font-bold">{member?.complexes?.name || "Complejo deportivo"}</h3>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-[1fr_180px]">
                <div className="space-y-3">
                    <div>
                        <p className="text-2xl font-bold">
                            {member ? `${member.first_name} ${member.last_name}` : "Socio"}
                        </p>
                        <p className="text-sm text-muted-foreground">DNI {member?.dni || "-"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant={getStatusVariant(credential.status)}>{getStatusLabel(credential.status)}</Badge>
                        <Badge variant="secondary">{credential.membership_type}</Badge>
                    </div>
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                            <p className="text-muted-foreground">Codigo</p>
                            <p className="font-mono font-semibold">{credential.code}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Vence</p>
                            <p className="font-semibold">{credential.expires_at}</p>
                        </div>
                    </div>
                    {credential.enabled_activities.length ? (
                        <div>
                            <p className="text-sm text-muted-foreground">Actividades habilitadas</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {credential.enabled_activities.map((activity) => (
                                    <span key={activity} className="rounded-md bg-muted px-2 py-1 text-xs">
                                        {activity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
                <div className="flex flex-col items-center justify-center gap-3 rounded-md bg-background p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrSrc} alt={`QR de credencial ${credential.code}`} className="h-36 w-36 rounded-md bg-white p-2" />
                    <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/credencial/${credential.code}`}>Validar</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
