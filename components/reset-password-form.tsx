"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ResetPasswordForm() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)
        setMessage(null)

        if (password.length < 6) {
            setError("La contrasena debe tener al menos 6 caracteres.")
            return
        }

        if (password !== confirmPassword) {
            setError("Las contrasenas no coinciden.")
            return
        }

        setLoading(true)

        const { error: updateError } = await supabase.auth.updateUser({
            password,
        })

        setLoading(false)

        if (updateError) {
            setError(updateError.message)
            return
        }

        setMessage("Contrasena actualizada correctamente. Ya podes ingresar.")
        setPassword("")
        setConfirmPassword("")

        setTimeout(() => {
            router.push("/login")
            router.refresh()
        }, 1200)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="password">Nueva contrasena</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    placeholder="Minimo 6 caracteres"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    placeholder="Repeti la nueva contrasena"
                />
            </div>
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
                {loading ? "Actualizando..." : "Actualizar contrasena"}
            </Button>
        </form>
    )
}
