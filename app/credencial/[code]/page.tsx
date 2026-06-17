import Link from "next/link"
import { CheckCircle2, XCircle } from "lucide-react"
import { getCredentialByCode } from "@/app/actions/memberships"
import { DigitalCredentialCard } from "@/components/members/digital-credential-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function CredencialPage({
    params,
}: {
    params: Promise<{ code: string }>
}) {
    const { code } = await params
    const credential = await getCredentialByCode(code)
    const isValid = credential?.status === "active" && credential.members?.status === "active"

    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-2xl space-y-4">
                {credential ? (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {isValid ? (
                                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                    ) : (
                                        <XCircle className="h-6 w-6 text-red-600" />
                                    )}
                                    {isValid ? "Credencial valida" : "Credencial no habilitada"}
                                </CardTitle>
                                <CardDescription>
                                    Estado actual: {credential.status}. Vencimiento: {credential.expires_at}.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <DigitalCredentialCard credential={credential} />
                    </>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Credencial no encontrada</CardTitle>
                            <CardDescription>
                                El codigo {code} no corresponde a una credencial disponible para tu usuario.
                            </CardDescription>
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
