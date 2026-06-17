import Link from "next/link"
import { ResetPasswordForm } from "@/components/reset-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ActualizarContrasenaPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Actualizar contrasena</CardTitle>
                    <CardDescription>
                        Ingresa una nueva contrasena para volver a acceder a tu cuenta.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ResetPasswordForm />
                    <Button asChild variant="ghost" className="w-full">
                        <Link href="/login">Volver al login</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    )
}
