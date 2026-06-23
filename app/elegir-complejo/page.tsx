import Image from "next/image"
import Link from "next/link"
import { Building2, LogOut } from "lucide-react"
import { requireAuth, logout } from "@/app/actions/auth"
import { getActiveComplexId, getRegisteredComplexes, selectUserComplexAndRedirect } from "@/app/actions/complex-settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function ElegirComplejoPage({
    searchParams,
}: {
    searchParams?: Promise<{ error?: string }>
}) {
    const [user, params, complexes, activeComplexId] = await Promise.all([
        requireAuth(),
        searchParams,
        getRegisteredComplexes(),
        getActiveComplexId(),
    ])

    return (
        <main className="min-h-screen bg-[#edf4fb] p-4 dark:bg-[#09111f]">
            <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-4">
                <div className="flex items-center justify-between gap-3">
                    <Button asChild variant="ghost">
                        <Link href="/">Volver al inicio</Link>
                    </Button>
                    <form action={logout}>
                        <Button type="submit" variant="outline">
                            <LogOut className="h-4 w-4" />
                            Salir
                        </Button>
                    </form>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Elegir complejo</CardTitle>
                        <CardDescription>
                            Hola {user.email}. Selecciona el complejo que queres consultar para ver informacion, horarios y turnos disponibles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {params?.error ? (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                {params.error}
                            </div>
                        ) : null}

                        {complexes.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                Todavia no hay complejos cargados.
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {complexes.map((complex) => (
                                    <form key={complex.id} action={selectUserComplexAndRedirect}>
                                        <input type="hidden" name="complexId" value={complex.id} />
                                        <button
                                            type="submit"
                                            className="flex h-full w-full flex-col gap-4 rounded-2xl border border-blue-100/90 bg-white/80 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-white/10 dark:bg-[#0a1426]"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                                                    {complex.logo_url ? (
                                                        <Image
                                                            src={complex.logo_url}
                                                            alt=""
                                                            width={48}
                                                            height={48}
                                                            className="h-12 w-12 rounded-md object-contain"
                                                        />
                                                    ) : (
                                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <span className="min-w-0">
                                                    <span className="block font-semibold">{complex.name}</span>
                                                    <span className="mt-1 block text-sm text-muted-foreground">
                                                        {complex.address || "Sin direccion cargada"}
                                                    </span>
                                                </span>
                                            </div>
                                            {activeComplexId === complex.id ? (
                                                <span className="w-fit rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                                                    Seleccionado
                                                </span>
                                            ) : null}
                                        </button>
                                    </form>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
