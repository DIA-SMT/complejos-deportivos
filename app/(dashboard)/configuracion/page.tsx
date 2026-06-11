import { requireAdmin } from "@/app/actions/auth"
import { getComplexBranding, getNewComplexBranding, getRegisteredComplexes } from "@/app/actions/complex-settings"
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
    searchParams?: Promise<{ complexId?: string; new?: string }>
}) {
    await requireAdmin()
    const params = await searchParams
    const complexes = await getRegisteredComplexes()
    const isNewComplex = params?.new === "1"
    const selectedComplexId = isNewComplex ? null : params?.complexId || complexes[0]?.id || null
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
                    <CardTitle>Complejo seleccionado</CardTitle>
                    <CardDescription>
                        Todo lo que cargues debajo queda asociado a este complejo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{isNewComplex ? "Crear complejo" : "Marca y presentacion"}</CardTitle>
                    <CardDescription>
                        Guardá primero esta informacion para crear o actualizar el complejo seleccionado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ComplexBrandingForm branding={branding} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Deportes y canchas</CardTitle>
                    <CardDescription>
                        Las disciplinas son generales de la plataforma; las canchas y espacios quedan asociadas al complejo seleccionado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isNewComplex ? (
                        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                            Primero guardá el complejo. Después vas a poder cargar sus canchas, espacios y referencias.
                        </div>
                    ) : (
                        <FacilitiesSettings
                            sports={sports}
                            courts={courts}
                            complexes={complexes}
                            selectedComplexId={selectedComplexId}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
