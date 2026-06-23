import { getComplexAdminAssignments } from "@/app/actions/admin-access"
import { requireSuperAdmin } from "@/app/actions/auth"
import { getRegisteredComplexes } from "@/app/actions/complex-settings"
import { ComplexAdminManager } from "@/components/admin/complex-admin-manager"

export const dynamic = "force-dynamic"

export default async function AdministradoresPage() {
    await requireSuperAdmin()
    const [complexes, assignments] = await Promise.all([
        getRegisteredComplexes(),
        getComplexAdminAssignments(),
    ])

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-medium text-primary">Superadministración</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">Administradores de complejos</h1>
                <p className="mt-2 text-muted-foreground">
                    Asigna responsables. Cada administrador sólo podrá operar los complejos indicados.
                </p>
            </div>
            <ComplexAdminManager complexes={complexes} assignments={assignments} />
        </div>
    )
}
