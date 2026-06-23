import Link from "next/link"
import { LogOut, Palette, User } from "lucide-react"
import { requireAuth, logout } from "@/app/actions/auth"
import { AccountProfileForm } from "@/components/account-profile-form"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function MiPerfilPage() {
    const user = await requireAuth()

    return (
        <main className="min-h-screen bg-[#edf4fb] p-4 dark:bg-[#09111f]">
            <div className="mx-auto w-full max-w-5xl space-y-4 py-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button asChild variant="ghost">
                        <Link href="/">Volver a la landing</Link>
                    </Button>
                    <form action={logout}>
                        <Button type="submit" variant="outline">
                            <LogOut className="h-4 w-4" />
                            Cerrar sesion
                        </Button>
                    </form>
                </div>

                <section className="rounded-2xl border border-blue-100/90 bg-white/75 p-6 shadow-[0_12px_32px_rgba(51,78,110,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-[#07101f]/80">
                    <p className="text-sm font-medium text-primary">Cuenta</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">Mi perfil</h1>
                    <p className="mt-2 max-w-2xl text-muted-foreground">
                        Administra tus datos de acceso y tus preferencias para navegar el portal de complejos.
                    </p>
                </section>

                <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos de la cuenta</CardTitle>
                            <CardDescription>
                                Actualiza tu email o cambia la contrasena de acceso.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AccountProfileForm email={user.email} />
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Estado
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Email actual</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Tipo de cuenta</p>
                                    <p className="font-medium">
                                        {user.role === "superadmin"
                                            ? "Superadministrador"
                                            : user.role === "complex_admin"
                                                ? "Administrador de complejo"
                                                : "Usuario"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-primary" />
                                    Tema
                                </CardTitle>
                                <CardDescription>Cambia entre modo claro y oscuro.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ModeToggle />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Accesos</CardTitle>
                                <CardDescription>Atajos utiles para seguir navegando.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-2">
                                <Button asChild variant="outline">
                                    <Link href="/elegir-complejo">Elegir complejo</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/complejo">Ver complejo elegido</Link>
                                </Button>
                                {user.role === "superadmin" || user.role === "complex_admin" ? (
                                    <Button asChild variant="secondary">
                                        <Link href={user.role === "superadmin" ? "/turnos" : "/seleccionar-complejo"}>
                                            Panel admin
                                        </Link>
                                    </Button>
                                ) : null}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}
