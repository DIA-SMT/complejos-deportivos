"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
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
                // Redirigir al dashboard
                router.push("/turnos")
                router.refresh()
            }
        } catch (err) {
            setError("Error inesperado al iniciar sesión")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="mb-4">
                        <Image
                            src="/logoMuni-sm.png"
                            alt="Logo Municipalidad San Miguel de Tucumán"
                            width={150}
                            height={50}
                            className="h-auto w-auto object-contain max-h-20"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        Complejos Deportivos
                    </CardTitle>
                    <CardDescription className="text-center">
                        Inicia sesión para continuar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo electrónico</Label>
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
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
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
                            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                        </Button>
                    </form>

                    <div className="mt-8 text-xs text-muted-foreground text-center space-y-1">
                        <p>© {new Date().getFullYear()}</p>
                        <p>Desarrollado por la Dirección de Inteligencia Artificial</p>
                        <p>Municipalidad de San Miguel de Tucumán</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

