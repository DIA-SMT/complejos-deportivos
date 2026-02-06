"use client"

import Link from "next/link"
import Image from "next/image"
import { ClipboardList, CalendarDays, Users, ChevronLeft, ChevronRight, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/sidebar-context"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
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
                                Menu  
                                <span className="block text-sm font-normal text-muted-foreground">Gestión administrativa</span>
                            </h1>
                        </>
                    )}

                    {/* Navigation Links */}
                    <div className="space-y-1">
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
                    </div>
                </div>
            </div>

            {/* Footer */}
            {!isCollapsed && (
                <div className="px-4 py-2 mt-auto text-xs text-muted-foreground text-center">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logoMuni-sm.png"
                            alt="Logo Municipalidad San Miguel de Tucumán"
                            width={150}
                            height={50}
                            className="h-auto w-auto object-contain max-h-16 opacity-80 hover:opacity-100 transition-opacity"
                        />
                    </div>
                    <p>© {new Date().getFullYear()}</p>
                    <p>Desarrollado por la Dirección de Inteligencia Artificial</p>
                    <p>Municipalidad de San Miguel de Tucumán</p>
                </div>
            )}
        </div>
    )
}
