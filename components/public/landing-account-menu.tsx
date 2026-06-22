"use client"

import Link from "next/link"
import {
    CalendarDays,
    ChevronDown,
    IdCard,
    LogIn,
    LogOut,
    Moon,
    Settings,
    Sun,
    User,
} from "lucide-react"
import { useTheme } from "next-themes"
import { logout } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"

export function LandingAccountMenu({
    email,
    role,
}: {
    email?: string | null
    role?: string | null
}) {
    const { setTheme, theme } = useTheme()
    const authenticated = Boolean(email)

    return (
        <details className="group relative z-[70]">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-white/30 bg-black/35 px-3 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-md transition hover:bg-black/50 [&::-webkit-details-marker]:hidden">
                {authenticated ? <User className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                <span>{authenticated ? "Mi perfil" : "Ingresar"}</span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>

            <div className="absolute right-0 z-[80] mt-2 w-[min(18rem,calc(100vw-2.5rem))] overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-2xl ring-1 ring-black/10">
                {authenticated ? (
                    <>
                        <div className="border-b px-4 py-3">
                            <p className="text-xs text-muted-foreground">Sesión iniciada como</p>
                            <p className="truncate text-sm font-medium">{email}</p>
                        </div>
                        <nav className="grid p-2 text-sm">
                            <MenuLink href="/mi-perfil" icon={User}>Mi perfil</MenuLink>
                            <MenuLink href="/complejo#mi-carnet" icon={IdCard}>Mi credencial</MenuLink>
                            <MenuLink href="/complejo#mis-reservas" icon={CalendarDays}>Mis reservas</MenuLink>
                            {role === "superadmin" || role === "complex_admin" ? (
                                <MenuLink
                                    href={role === "superadmin" ? "/turnos" : "/seleccionar-complejo"}
                                    icon={Settings}
                                >
                                    Panel administrativo
                                </MenuLink>
                            ) : null}
                        </nav>
                    </>
                ) : (
                    <div className="grid gap-2 p-3">
                        <p className="text-sm text-muted-foreground">
                            Ingresá o registrate para administrar tus reservas y credencial.
                        </p>
                        <Button asChild size="sm">
                            <Link href="/login">Ingresar / Registrarse</Link>
                        </Button>
                    </div>
                )}

                <div className="border-t p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Apariencia</p>
                    <div className="grid grid-cols-3 gap-1">
                        <ThemeButton
                            active={theme === "light"}
                            onClick={() => setTheme("light")}
                            icon={Sun}
                            label="Claro"
                        />
                        <ThemeButton
                            active={theme === "dark"}
                            onClick={() => setTheme("dark")}
                            icon={Moon}
                            label="Oscuro"
                        />
                        <ThemeButton
                            active={theme === "system"}
                            onClick={() => setTheme("system")}
                            icon={Settings}
                            label="Auto"
                        />
                    </div>
                </div>

                {authenticated ? (
                    <form action={logout} className="border-t p-2">
                        <button
                            type="submit"
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar sesión
                        </button>
                    </form>
                ) : null}
            </div>
        </details>
    )
}

function MenuLink({
    href,
    icon: Icon,
    children,
}: {
    href: string
    icon: typeof User
    children: React.ReactNode
}) {
    return (
        <Link href={href} className="flex items-center gap-2 rounded-md px-3 py-2 transition hover:bg-accent">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {children}
        </Link>
    )
}

function ThemeButton({
    active,
    onClick,
    icon: Icon,
    label,
}: {
    active: boolean
    onClick: () => void
    icon: typeof Sun
    label: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs transition ${
                active ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    )
}
