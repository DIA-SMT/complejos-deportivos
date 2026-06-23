import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDays, CheckCircle2, ShieldCheck, UserCheck, XCircle } from "lucide-react"
import { getCredentialByCode } from "@/app/actions/memberships"
import { DigitalCredentialCard } from "@/components/members/digital-credential-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Validación de credencial",
    robots: {
        index: false,
        follow: false,
    },
}

function formatDate(value: string) {
    const [year, month, day] = value.split("-").map(Number)

    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(year, month - 1, day))
}

function getValidationResult(
    credential: Awaited<ReturnType<typeof getCredentialByCode>>
) {
    if (!credential) {
        return {
            isValid: false,
            title: "Credencial inexistente",
            description: "El código escaneado no corresponde a una credencial registrada.",
        }
    }

    if (credential.members?.status !== "active") {
        return {
            isValid: false,
            title: "Socio no habilitado",
            description: "La cuenta del socio se encuentra suspendida o inactiva.",
        }
    }

    if (credential.status === "expired") {
        return {
            isValid: false,
            title: "Cuota vencida",
            description: `La vigencia de la credencial terminó el ${formatDate(credential.expires_at)}.`,
        }
    }

    if (credential.status !== "active") {
        return {
            isValid: false,
            title: "Credencial suspendida",
            description: "La credencial existe, pero actualmente no está habilitada.",
        }
    }

    return {
        isValid: true,
        title: "Socio al día",
        description: `Credencial auténtica y vigente hasta el ${formatDate(credential.expires_at)}.`,
    }
}

export default async function CredencialPage({
    params,
}: {
    params: Promise<{ code: string }>
}) {
    const { code } = await params
    const credential = await getCredentialByCode(code)
    const validation = getValidationResult(credential)

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#edf4fb] p-4 dark:bg-[#09111f]">
            <div className="w-full max-w-2xl space-y-4">
                {credential ? (
                    <>
                        <Card className={validation.isValid ? "border-emerald-500/50" : "border-red-500/50"}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {validation.isValid ? (
                                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                    ) : (
                                        <XCircle className="h-6 w-6 text-red-600" />
                                    )}
                                    {validation.title}
                                </CardTitle>
                                <CardDescription>{validation.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-md border bg-background p-3">
                                    <ShieldCheck className="mb-2 h-5 w-5 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Autenticidad</p>
                                    <p className="font-semibold">Verificada</p>
                                </div>
                                <div className="rounded-md border bg-background p-3">
                                    <UserCheck className="mb-2 h-5 w-5 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Estado del socio</p>
                                    <p className="font-semibold">
                                        {credential.members?.status === "active" ? "Activo" : "No habilitado"}
                                    </p>
                                </div>
                                <div className="rounded-md border bg-background p-3">
                                    <CalendarDays className="mb-2 h-5 w-5 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Cuota</p>
                                    <p className="font-semibold">
                                        {credential.status === "active" ? "Al día" : "No vigente"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <DigitalCredentialCard credential={credential} showValidationQr={false} />
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/">Volver al inicio</Link>
                        </Button>
                    </>
                ) : (
                    <Card className="border-red-500/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <XCircle className="h-6 w-6 text-red-600" />
                                {validation.title}
                            </CardTitle>
                            <CardDescription>{validation.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/">Volver</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    )
}
