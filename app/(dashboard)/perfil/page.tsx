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
            <div className="relative w-full h-[250px] sm:h-[300px] rounded-xl overflow-hidden mb-8 shadow-xl animate-fade-in group">
                <div className="absolute inset-0 bg-blue-900/20">
                    <img
                        src="/images/perfil.png"
                        alt="Fondo Perfil"
                        className="absolute inset-0 w-full h-full object-cover transform scale-110"
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/60 to-transparent dark:from-black/90 dark:via-black/60 mix-blend-multiply"></div>
                </div>

                <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 text-white space-y-2">
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md animate-slide-in-left">
                        Mi Perfil
                    </h2>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl font-light drop-shadow animate-slide-in-left animation-delay-200">
                        Administrá tu información personal y configuración de cuenta.
                    </p>
                </div>
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

