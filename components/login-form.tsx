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

type AuthMode = "login" | "signup"

export function LoginForm({ branding }: { branding: ComplexBranding }) {
    const [mode, setMode] = useState<AuthMode>("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const normalizedEmail = email.trim().toLowerCase()

    const redirectAfterLogin = async () => {
        const { data: profile } = await supabase
            .from("user_profiles")
            .select("role")
            .single()

        router.push(profile?.role === "admin" ? "/seleccionar-complejo" : "/")
        router.refresh()
    }

    const handleLogin = async () => {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
        })

        if (signInError) {
            const message = signInError.message.toLowerCase().includes("email not confirmed")
                ? "Tenes que confirmar el correo antes de ingresar. Revisa tu bandeja de entrada."
                : signInError.message
            setError(message)
            return
        }

        if (data.user) {
            await redirectAfterLogin()
        }
    }

    const handleSignup = async () => {
        if (password.length < 6) {
            setError("La contrasena debe tener al menos 6 caracteres.")
            return
        }

        if (password !== confirmPassword) {
            setError("Las contrasenas no coinciden.")
            return
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
        })

        if (signUpError) {
            setError(signUpError.message)
            return
        }

        if (data.session) {
            await redirectAfterLogin()
            return
        }

        setMessage("Cuenta creada. Revisa tu correo para confirmar el registro antes de ingresar.")
        setMode("login")
        setPassword("")
        setConfirmPassword("")
    }

    const handlePasswordRecovery = async () => {
        setError(null)
        setMessage(null)

        if (!normalizedEmail) {
            setError("Ingresa tu correo electronico para recuperar la contrasena.")
            return
        }

        setLoading(true)

        const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
            redirectTo: `${window.location.origin}/actualizar-contrasena`,
        })

        setLoading(false)

        if (recoveryError) {
            setError(recoveryError.message)
            return
        }

        setMessage("Te enviamos un enlace para restablecer la contrasena.")
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)
        setMessage(null)
        setLoading(true)

        try {
            if (mode === "login") {
                await handleLogin()
            } else {
                await handleSignup()
            }
        } catch {
            setError(mode === "login" ? "Error inesperado al iniciar sesion" : "Error inesperado al crear la cuenta")
        } finally {
            setLoading(false)
        }
    }

    const switchMode = () => {
        setMode((currentMode) => currentMode === "login" ? "signup" : "login")
        setError(null)
        setMessage(null)
        setPassword("")
        setConfirmPassword("")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-white p-4 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
            <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between rounded-lg border border-emerald-200 bg-white/80 px-4 py-3 text-sm shadow-sm backdrop-blur dark:border-emerald-900 dark:bg-slate-950/80">
                <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">Portal de complejos deportivos</p>
                    <p className="text-muted-foreground">Los usuarios consultan complejos; los administradores gestionan la operacion.</p>
                </div>
            </div>
            <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="flex flex-col items-center space-y-1">
                        <div className="mb-4">
                            <Image
                                src={branding.logoSrc}
                                alt={branding.logoAlt}
                                width={150}
                                height={50}
                                className="h-auto max-h-20 w-auto object-contain"
                            />
                        </div>
                        <CardTitle className="text-center text-2xl font-bold">
                            {mode === "login" ? "Iniciar sesion" : "Crear cuenta"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {mode === "login"
                                ? "Ingresa para consultar tu complejo o administrar el sistema."
                                : "La cuenta se crea como usuario normal. Los admins se asignan internamente."}
                        </CardDescription>
                        <p className="text-center text-xs text-muted-foreground">
                            {branding.appName} · {branding.displayName}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo electronico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
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
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            {mode === "signup" ? (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="********"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            ) : null}
                            {error ? (
                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                    {error}
                                </div>
                            ) : null}
                            {message ? (
                                <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                                    {message}
                                </div>
                            ) : null}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading
                                    ? mode === "login" ? "Iniciando sesion..." : "Creando cuenta..."
                                    : mode === "login" ? "Iniciar sesion" : "Crear cuenta"}
                            </Button>
                        </form>

                        <Button type="button" variant="link" className="mt-3 w-full" onClick={switchMode} disabled={loading}>
                            {mode === "login" ? "No tengo cuenta, crear una" : "Ya tengo cuenta, iniciar sesion"}
                        </Button>
                        {mode === "login" ? (
                            <Button type="button" variant="link" className="w-full" onClick={handlePasswordRecovery} disabled={loading}>
                                Olvide mi contrasena
                            </Button>
                        ) : null}

                        <div className="mt-8 space-y-1 text-center text-xs text-muted-foreground">
                            <p>&copy; {new Date().getFullYear()}</p>
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
