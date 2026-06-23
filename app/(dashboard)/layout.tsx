import { SidebarProvider } from "@/components/sidebar-context"
import { DashboardContent } from "./dashboard-content"
import { getCurrentUser } from "@/app/actions/auth"
import { getComplexBranding, getManageableComplexes } from "@/app/actions/complex-settings"
import { municipalPlatformBranding } from "@/lib/complex-config"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // El middleware ya maneja la redirección si no hay usuario autenticado
    // Solo obtenemos el usuario para pasarlo al componente
    const user = await getCurrentUser()
    const [complexBranding, manageableComplexes] = await Promise.all([
        getComplexBranding(),
        getManageableComplexes(),
    ])
    const branding = user?.role === "superadmin" ? municipalPlatformBranding : complexBranding
    const canChangeComplex = user?.role === "superadmin" || manageableComplexes.length > 1

    return (
        <SidebarProvider>
            <DashboardContent user={user} branding={branding} canChangeComplex={canChangeComplex}>
                {children}
            </DashboardContent>
        </SidebarProvider>
    )
}
