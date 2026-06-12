import { requireAdmin } from "@/app/actions/auth"
import { getActiveComplexId, getComplexBranding, getNewComplexBranding, getRegisteredComplexes } from "@/app/actions/complex-settings"
import { getCourts, getSports } from "@/app/actions/facilities"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ComplexBrandingForm } from "@/components/settings/complex-branding-form"
import { FacilitiesSettings } from "@/components/settings/facilities-settings"

export const dynamic = "force-dynamic"

export default async function ConfiguracionPage({
    searchParams,
}: {
    searchParams?: Promise<{ complexId?: string; new?: string; error?: string }>
}) {
    await requireAdmin()
    const params = await searchParams
    const complexes = await getRegisteredComplexes()
    const activeComplexId = await getActiveComplexId()
    const isNewComplex = params?.new === "1"
    const selectedComplexId = isNewComplex ? null : params?.complexId || activeComplexId || complexes[0]?.id || null
    const [branding, sports, courts] = await Promise.all([
        isNewComplex ? getNewComplexBranding() : getComplexBranding(selectedComplexId),
        getSports(),
        selectedComplexId ? getCourts({ complexId: selectedComplexId }) : Promise.resolve([]),
    ])

    return (
        <div className="flex flex-col space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuracion del complejo</h1>
                <p className="text-muted-foreground">
                    Elegi que complejo queres configurar para no mezclar datos entre sedes.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{isNewComplex ? "Crear complejo" : "Configuracion del complejo"}</CardTitle>
                    <CardDescription>
                        Todo lo que cargues aca queda asociado al complejo elegido.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {params?.error ? (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {params.error}
                        </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/20 p-4">
                        {complexes.map((complex) => (
                            <Button
                                key={complex.id}
                                asChild
                                variant={selectedComplexId === complex.id ? "default" : "outline"}
                            >
                                <Link href={`/configuracion?complexId=${complex.id}`}>
                                    {complex.name}
                                </Link>
                            </Button>
                        ))}
                        <Button asChild variant={isNewComplex ? "default" : "secondary"}>
                            <Link href="/configuracion?new=1">Nuevo complejo</Link>
                        </Button>
                    </div>

                    <ComplexBrandingForm branding={branding} />

                    <div className="border-t pt-8">
                        <div className="mb-5">
                            <h2 className="text-xl font-semibold tracking-tight">Deportes y canchas</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Las disciplinas son generales de la plataforma; las canchas y espacios quedan asociados al complejo seleccionado.
                            </p>
                        </div>
                        {isNewComplex ? (
                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                Primero guarda el complejo. Despues vas a poder cargar sus canchas, espacios y referencias.
                            </div>
                        ) : (
                            <FacilitiesSettings
                                sports={sports}
                                courts={courts}
                                selectedComplexId={selectedComplexId}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}

