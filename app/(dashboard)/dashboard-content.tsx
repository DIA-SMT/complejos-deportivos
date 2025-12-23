"use client"

import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/components/sidebar-context"
import { Menu, X, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { logout } from "@/app/actions/auth"
import { UserProfile } from "@/app/actions/auth"
import { Badge } from "@/components/ui/badge"

function DashboardContent({ children, user }: { children: React.ReactNode; user: UserProfile | null }) {
    const { isCollapsed, isMobileOpen, toggleMobileSidebar, setIsMobileOpen } = useSidebar()

    const handleLogout = async () => {
        await logout()
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar - Desktop */}
            <aside
                className={cn(
                    "hidden md:block border-r bg-background fixed h-full inset-y-0 z-30 transition-all duration-300",
                    isCollapsed ? "w-16" : "w-64"
                )}
            >
                <Sidebar className="h-full" />
            </aside>

            {/* Sidebar - Mobile */}
            <aside
                className={cn(
                    "md:hidden fixed h-full inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform duration-300 ease-in-out",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <Sidebar className="h-full" />
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    "flex-1 flex flex-col min-h-screen transition-all duration-300",
                    isCollapsed ? "md:ml-16" : "md:ml-64"
                )}
            >
                {/* Top Header */}
                <header className="flex h-14 md:h-16 items-center justify-between border-b px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={toggleMobileSidebar}
                        >
                            {isMobileOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                        {/* Placeholder for complex selector or breadcrumb */}
                        <span className="text-xs md:text-sm font-medium">Seleccioná un complejo</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        {user ? (
                            <>
                                <Link href="/perfil">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <User className="h-4 w-4" />
                                        <span className="hidden md:inline text-xs">{user.email}</span>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                                            {user.role === 'admin' ? 'Admin' : 'Usuario'}
                                        </Badge>
                                    </Button>
                                </Link>
                                <form action={handleLogout}>
                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2"
                                        title="Cerrar sesión"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span className="hidden md:inline">Cerrar sesión</span>
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <span className="text-xs text-muted-foreground">No autenticado</span>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 space-y-4 p-4 md:p-8 pt-4 md:pt-6">
                    {children}
                </div>
            </main>
        </div>
    )
}

export { DashboardContent }

