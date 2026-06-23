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
import { ModeToggle } from "@/components/mode-toggle"
import { Chatbot } from "@/components/chatbot/chatbot"
import type { ComplexBranding } from "@/lib/complex-config"

function DashboardContent({
    children,
    user,
    branding,
    canChangeComplex,
}: {
    children: React.ReactNode
    user: UserProfile | null
    branding: ComplexBranding
    canChangeComplex: boolean
}) {
    const { isCollapsed, isMobileOpen, toggleMobileSidebar, setIsMobileOpen } = useSidebar()

    const handleLogout = async () => {
        await logout()
    }

    return (
        <div className="flex min-h-screen bg-[#edf4fb] dark:bg-[#09111f]">
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar - Desktop */}
            <aside
                className={cn(
                    "hidden md:block border-r border-blue-100/80 bg-white/80 shadow-[8px_0_30px_rgba(51,78,110,0.05)] backdrop-blur-xl fixed h-full inset-y-0 z-30 transition-all duration-300 ease-in-out dark:border-white/8 dark:bg-[#07101f]/95 dark:shadow-black/20",
                    isCollapsed ? "w-16" : "w-64"
                )}
            >
                <Sidebar
                    className="h-full"
                    branding={branding}
                    canManageSettings={user?.role === "superadmin" || user?.role === "complex_admin"}
                    canManageOperations={user?.role === "superadmin" || user?.role === "complex_admin"}
                    canManageAdmins={user?.role === "superadmin"}
                />
            </aside>

            {/* Sidebar - Mobile */}
            <aside
                className={cn(
                    "md:hidden fixed h-full inset-y-0 left-0 z-50 w-64 border-r border-blue-100 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out animate-slide-in-left dark:border-white/10 dark:bg-[#07101f]/98",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <Sidebar
                    className="h-full"
                    branding={branding}
                    canManageSettings={user?.role === "superadmin" || user?.role === "complex_admin"}
                    canManageOperations={user?.role === "superadmin" || user?.role === "complex_admin"}
                    canManageAdmins={user?.role === "superadmin"}
                />
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                    isCollapsed ? "md:ml-16" : "md:ml-64"
                )}
            >
                {/* Top Header */}
                <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-blue-100/80 bg-white/75 px-4 shadow-sm backdrop-blur-xl md:h-16 md:px-6 dark:border-white/8 dark:bg-[#09111f]/80">
                    <div className="flex items-center gap-4 animate-slide-in-down">
                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden hover-lift transition-smooth"
                            onClick={toggleMobileSidebar}
                        >
                            {isMobileOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                        <div className="flex flex-col leading-tight">
                            <span className="text-xs md:text-sm font-semibold uppercase">
                                {user?.role === "superadmin" ? branding.appName : branding.displayName}
                            </span>
                            <span className="hidden text-[11px] text-blue-600 dark:text-blue-300 md:inline">
                                {user?.role === "superadmin" ? branding.displayName : "Gestión deportiva municipal"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm animate-slide-in-down animation-delay-100">
                        <Chatbot variant="header" />
                        <ModeToggle />
                        {canChangeComplex ? (
                            <Link href="/seleccionar-complejo">
                                <Button variant="outline" size="sm" className="hidden md:inline-flex">
                                    Cambiar complejo
                                </Button>
                            </Link>
                        ) : null}
                        {user ? (
                            <>
                                <Link href="/perfil">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2 hover-lift transition-smooth"
                                    >
                                        <User className="h-4 w-4" />
                                        <span className="hidden md:inline text-xs">{user.email}</span>
                                        <Badge variant={user.role !== 'common' ? 'default' : 'secondary'} className="text-xs transition-all duration-300">
                                            {user.role === 'superadmin' ? 'Superadmin' : user.role === 'complex_admin' ? 'Admin' : 'Usuario'}
                                        </Badge>
                                    </Button>
                                </Link>
                                <form action={handleLogout}>
                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2 hover-lift transition-smooth"
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
                <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6 animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    )
}

export { DashboardContent }

