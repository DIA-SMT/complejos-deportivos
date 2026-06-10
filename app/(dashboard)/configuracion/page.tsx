import { requireAdmin } from "@/app/actions/auth"
import { getComplexBranding } from "@/app/actions/complex-settings"
import { getCourts, getSports } from "@/app/actions/facilities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComplexBrandingForm } from "@/components/settings/complex-branding-form"
import { FacilitiesSettings } from "@/components/settings/facilities-settings"

export const dynamic = "force-dynamic"

export default async function ConfiguracionPage() {
    await requireAdmin()
    const [branding, sports, courts] = await Promise.all([
        getComplexBranding(),
        getSports(),
        getCourts(),
    ])

    return (
        <div className="flex flex-col space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuracion del complejo</h1>
                <p className="text-muted-foreground">
                    Personaliza la marca visible del sistema para este complejo deportivo.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Marca y presentacion</CardTitle>
                    <CardDescription>
                        Estos datos se usan en el login, la navegacion, los metadatos y el asistente virtual.
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
                        Configura las disciplinas y espacios que este complejo puede usar en horarios, turnos y reportes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FacilitiesSettings sports={sports} courts={courts} />
                </CardContent>
            </Card>
        </div>
    )
}
