import { SidebarProvider } from "@/components/sidebar-context"
import { DashboardContent } from "./dashboard-content"
import { getCurrentUser } from "@/app/actions/auth"
import { Chatbot } from "@/components/chatbot/chatbot"
import { getComplexBranding } from "@/app/actions/complex-settings"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // El middleware ya maneja la redirección si no hay usuario autenticado
    // Solo obtenemos el usuario para pasarlo al componente
    const user = await getCurrentUser()
    const branding = await getComplexBranding()

    return (
        <SidebarProvider>
            <DashboardContent user={user} branding={branding}>{children}</DashboardContent>
            <Chatbot />
        </SidebarProvider>
    )
}
