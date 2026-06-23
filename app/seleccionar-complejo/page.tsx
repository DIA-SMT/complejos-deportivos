import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Building2 } from "lucide-react"
import { requireAdmin } from "@/app/actions/auth"
import { getActiveComplexId, getManageableComplexes, selectActiveComplexAndRedirect } from "@/app/actions/complex-settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function SeleccionarComplejoPage({
    searchParams,
}: {
    searchParams?: Promise<{ error?: string }>
}) {
    const user = await requireAdmin()
    const params = await searchParams
    const [complexes, activeComplexId] = await Promise.all([
        getManageableComplexes(),
        getActiveComplexId(),
    ])

    if (user.role === "complex_admin" && complexes.length === 1) {
        redirect("/turnos")
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#edf4fb] p-4 dark:bg-[#09111f]">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>Elegir complejo</CardTitle>
                    <CardDescription>
                        Selecciona con que complejo queres trabajar. Todo el panel se va a filtrar por esta eleccion.
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
                            Todavia no hay complejos cargados. Crea el primero desde Configuracion.
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {complexes.map((complex) => (
                                <form key={complex.id} action={selectActiveComplexAndRedirect}>
                                    <input type="hidden" name="complexId" value={complex.id} />
                                    <button
                                        type="submit"
                                        className="flex h-full w-full items-start gap-4 rounded-2xl border border-blue-100/90 bg-white/80 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-white/10 dark:bg-[#0a1426]"
                                    >
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
                                            {activeComplexId === complex.id ? (
                                                <span className="mt-3 inline-flex rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                                                    Activo
                                                </span>
                                            ) : null}
                                        </span>
                                    </button>
                                </form>
                            ))}
                        </div>
                    )}

                    {user.role === "superadmin" ? (
                        <Button asChild variant="outline">
                            <Link href="/configuracion?new=1">Crear nuevo complejo</Link>
                        </Button>
                    ) : null}
                </CardContent>
            </Card>
        </main>
    )
}
