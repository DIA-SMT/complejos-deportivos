"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AccountProfileForm({ email }: { email: string }) {
    const [newEmail, setNewEmail] = useState(email)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const updateEmail = async (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)
        setMessage(null)

        const normalizedEmail = newEmail.trim().toLowerCase()

        if (!normalizedEmail) {
            setError("Ingresa un email valido.")
            return
        }

        if (normalizedEmail === email.toLowerCase()) {
            setMessage("El email no tuvo cambios.")
            return
        }

        setLoading(true)
        const { error: updateError } = await supabase.auth.updateUser({ email: normalizedEmail })
        setLoading(false)

        if (updateError) {
            setError(updateError.message)
            return
        }

        setMessage("Te enviamos un correo para confirmar el cambio de email.")
        router.refresh()
    }

    const updatePassword = async (event: React.FormEvent) => {
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
        const { error: updateError } = await supabase.auth.updateUser({ password })
        setLoading(false)

        if (updateError) {
            setError(updateError.message)
            return
        }

        setPassword("")
        setConfirmPassword("")
        setMessage("Contrasena actualizada correctamente.")
    }

    return (
        <div className="space-y-6">
            <form onSubmit={updateEmail} className="space-y-3">
                <div className="space-y-2">
                    <Label htmlFor="newEmail">Email</Label>
                    <Input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(event) => setNewEmail(event.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    Guardar email
                </Button>
            </form>

            <form onSubmit={updatePassword} className="space-y-3 border-t pt-5">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="password">Nueva contrasena</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            disabled={loading}
                            minLength={6}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            disabled={loading}
                            minLength={6}
                        />
                    </div>
                </div>
                <Button type="submit" variant="outline" disabled={loading}>
                    Cambiar contrasena
                </Button>
            </form>

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
        </div>
    )
}
