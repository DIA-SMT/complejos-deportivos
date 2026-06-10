"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ComplexBranding } from "@/lib/complex-config"

export function LoginForm({ branding }: { branding: ComplexBranding }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) {
                setError(signInError.message)
                setLoading(false)
                return
            }

            if (data.user) {
                router.push("/turnos")
                router.refresh()
            }
        } catch {
            setError("Error inesperado al iniciar sesion")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-white dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 p-4">
            <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between rounded-lg border border-emerald-200 bg-white/80 px-4 py-3 text-sm shadow-sm backdrop-blur dark:border-emerald-900 dark:bg-slate-950/80">
                <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">Modo SaaS configurable activo</p>
                    <p className="text-muted-foreground">Esta instancia puede adaptar marca, logo, pie de pagina y asistente por complejo.</p>
                </div>
            </div>
            <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="mb-4">
                        <Image
                            src={branding.logoSrc}
                            alt={branding.logoAlt}
                            width={150}
                            height={50}
                            className="h-auto w-auto object-contain max-h-20"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        {branding.appName}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {branding.displayName}
                    </CardDescription>
                    <p className="text-xs text-muted-foreground text-center">
                        Instancia configurable para administracion deportiva
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo electronico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contrasena</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Iniciando sesion..." : "Iniciar sesion"}
                        </Button>
                    </form>

                    <div className="mt-8 text-xs text-muted-foreground text-center space-y-1">
                        <p>© {new Date().getFullYear()}</p>
                        {branding.footerLines.map((line) => (
                            <p key={line}>{line}</p>
                        ))}
                    </div>
                </CardContent>
            </Card>
            </div>
        </div>
    )
}
