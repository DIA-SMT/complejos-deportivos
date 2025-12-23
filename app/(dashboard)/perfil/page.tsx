export const dynamic = 'force-dynamic'

import { requireAuth } from "@/app/actions/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { UserInfo } from "@/components/profile/user-info"

export default async function PerfilPage() {
    // requireAuth ya maneja el redirect si no hay usuario
    const user = await requireAuth()

    return (
        <div className="flex flex-col space-y-6">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Mi Perfil</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Administrá tu información personal y configuración de cuenta.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Información del Usuario */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Cuenta</CardTitle>
                        <CardDescription>
                            Tu información personal y rol en el sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserInfo user={user} />
                    </CardContent>
                </Card>

                {/* Cambiar Contraseña */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cambiar Contraseña</CardTitle>
                        <CardDescription>
                            Actualizá tu contraseña para mantener tu cuenta segura.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChangePasswordForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

