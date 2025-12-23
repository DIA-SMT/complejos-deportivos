import { Sidebar } from "@/components/sidebar"
import { SidebarProvider } from "@/components/sidebar-context"
import { DashboardContent } from "./dashboard-content"
import { getCurrentUser } from "@/app/actions/auth"
import { Chatbot } from "@/components/chatbot/chatbot"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // El middleware ya maneja la redirección si no hay usuario autenticado
    // Solo obtenemos el usuario para pasarlo al componente
    const user = await getCurrentUser()

    return (
        <SidebarProvider>
            <DashboardContent user={user}>{children}</DashboardContent>
            <Chatbot />
        </SidebarProvider>
    )
}
