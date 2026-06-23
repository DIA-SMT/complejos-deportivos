import { SidebarProvider } from "@/components/sidebar-context"
import { DashboardContent } from "./dashboard-content"
import { getCurrentUser } from "@/app/actions/auth"
import { getComplexBranding } from "@/app/actions/complex-settings"
import { municipalPlatformBranding } from "@/lib/complex-config"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // El middleware ya maneja la redirección si no hay usuario autenticado
    // Solo obtenemos el usuario para pasarlo al componente
    const user = await getCurrentUser()
    const complexBranding = await getComplexBranding()
    const branding = user?.role === "superadmin" ? municipalPlatformBranding : complexBranding

    return (
        <SidebarProvider>
            <DashboardContent user={user} branding={branding}>{children}</DashboardContent>
        </SidebarProvider>
    )
}
