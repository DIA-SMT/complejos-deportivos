"use client"

import Link from "next/link"
import Image from "next/image"
import { ClipboardList, CalendarDays, Users, ChevronLeft, ChevronRight, User, Settings, Home, Building2, IdCard, UserCog } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/sidebar-context"
import type { ComplexBranding } from "@/lib/complex-config"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string
    branding: ComplexBranding
    canManageSettings?: boolean
    canManageOperations?: boolean
    canManageAdmins?: boolean
}

export function Sidebar({ className, branding, canManageSettings = false, canManageOperations = false, canManageAdmins = false }: SidebarProps) {
    const { isCollapsed, toggleSidebar, setIsMobileOpen } = useSidebar()

    const handleLinkClick = () => {
        // Close mobile sidebar when a link is clicked
        setIsMobileOpen(false)
    }

    return (
        <div className={cn("pb-4 h-full flex flex-col transition-all duration-300", className)}>
            <div className="space-y-4 py-4 flex-1">
                <div className="px-3 py-2">
                    {/* Toggle Button - Only show on desktop */}
                    <div className={cn("hidden md:flex items-center mb-4", isCollapsed ? "justify-center" : "justify-end px-4")}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="h-8 w-8"
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : (
                                <ChevronLeft className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Header */}
                    {!isCollapsed && (
                        <>
                            <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                                
                            </h2>
                            <h1 className="mb-6 px-4 text-xl font-bold tracking-tight">
                                {branding.appName}
                                <span className="block text-sm font-normal text-muted-foreground">{branding.displayName}</span>
                            </h1>
                        </>
                    )}

                    {/* Navigation Links */}
                    <div className="space-y-1">
                        <Link href="/" onClick={handleLinkClick}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full",
                                    isCollapsed ? "md:justify-center md:px-2" : "justify-start"
                                )}
                                title={isCollapsed ? "Inicio" : undefined}
                            >
                                <Home className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                                <span className={cn(isCollapsed && "md:hidden")}>Inicio</span>
                            </Button>
                        </Link>
                        <Link href="/complejo" onClick={handleLinkClick}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full",
                                    isCollapsed ? "md:justify-center md:px-2" : "justify-start"
                                )}
                                title={isCollapsed ? "Complejo" : undefined}
                            >
                                <Building2 className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                                <span className={cn(isCollapsed && "md:hidden")}>Complejo</span>
                            </Button>
                        </Link>
                        {canManageOperations && (
                            <Link href="/profesores" onClick={handleLinkClick}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full",
                                    isCollapsed ? "md:justify-center md:px-2" : "justify-start"
                                )}
                                title={isCollapsed ? "Profesores" : undefined}
                            >
                                <Users className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                                <span className={cn(isCollapsed && "md:hidden")}>Profesores</span>
                            </Button>
                            </Link>
                        )}
                        {canManageOperations && (
                            <Link href="/inventario" onClick={handleLinkClick}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full",
                                    isCollapsed ? "md:justify-center md:px-2" : "justify-start"
                                )}
                                title={isCollapsed ? "Inventario" : undefined}
                            >
                                <ClipboardList className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                                <span className={cn(isCollapsed && "md:hidden")}>Inventario</span>
                            </Button>
                            </Link>
                        )}

                        {canManageOperations && (
                            <Link href="/turnos" onClick={handleLinkClick}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full",
                                    isCollapsed ? "md:justify-center md:px-2" : "justify-start"
                                )}
                                title={isCollapsed ? "Turnos" : undefined}
                            >
                                <CalendarDays className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                                <span className={cn(isCollapsed && "md:hidden")}>Turnos</span>
                            </Button>
                            </Link>
                        )}
                        {canManageOperations && (
                            <Link href="/reportes" onClick={handleLinkClick}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full",
                                    isCollapsed ? "md:justify-center md:px-2" : "justify-start"
                                )}
                                title={isCollapsed ? "Reportes" : undefined}
                            >
                                <ClipboardList className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                                <span className={cn(isCollapsed && "md:hidden")}>Reportes</span>
                            </Button>
                            </Link>
                        )}
                        {canManageOperations && (
                            <Link href="/socios" onClick={handleLinkClick}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full",
                                        isCollapsed ? "md:justify-center md:px-2" : "justify-start"
                                    )}
                                    title={isCollapsed ? "Socios" : undefined}
                                >
                                    <IdCard className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                                    <span className={cn(isCollapsed && "md:hidden")}>Socios</span>
                                </Button>
                            </Link>
                        )}
                        <Link href="/perfil" onClick={handleLinkClick}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full",
                                    isCollapsed ? "md:justify-center md:px-2" : "justify-start"
                                )}
                                title={isCollapsed ? "Perfil" : undefined}
                            >
                                <User className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                                <span className={cn(isCollapsed && "md:hidden")}>Mi Perfil</span>
                            </Button>
                        </Link>
                        {canManageSettings && (
                            <Link href="/configuracion" onClick={handleLinkClick}>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full border-dashed",
                                        isCollapsed ? "md:justify-center md:px-2" : "justify-start"
                                    )}
                                    title={isCollapsed ? "Configuracion" : undefined}
                                >
                                    <Settings className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                                    <span className={cn(isCollapsed && "md:hidden")}>Configuracion</span>
                                </Button>
                            </Link>
                        )}
                        {canManageAdmins && (
                            <Link href="/administradores" onClick={handleLinkClick}>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full border-dashed",
                                        isCollapsed ? "md:justify-center md:px-2" : "justify-start"
                                    )}
                                    title={isCollapsed ? "Administradores" : undefined}
                                >
                                    <UserCog className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                                    <span className={cn(isCollapsed && "md:hidden")}>Administradores</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            {!isCollapsed && (
                <div className="px-4 py-2 mt-auto text-xs text-muted-foreground text-center">
                    <div className="flex justify-center mb-4">
                        <Image
                            src={branding.logoSrc}
                            alt={branding.logoAlt}
                            width={150}
                            height={50}
                            className="h-auto w-auto object-contain max-h-16 opacity-80 hover:opacity-100 transition-opacity"
                        />
                    </div>
                    <p>© {new Date().getFullYear()}</p>
                    {branding.footerLines.map((line) => (
                        <p key={line}>{line}</p>
                    ))}
                </div>
            )}
        </div>
    )
}
