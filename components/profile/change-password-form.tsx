"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Key, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

export function ChangePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Validaciones
        if (newPassword.length < 6) {
            toast.error("La nueva contraseña debe tener al menos 6 caracteres")
            setLoading(false)
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error("Las contraseñas no coinciden")
            setLoading(false)
            return
        }

        if (currentPassword === newPassword) {
            toast.error("La nueva contraseña debe ser diferente a la actual")
            setLoading(false)
            return
        }

        try {
            // Obtener el usuario actual
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            
            if (userError || !user) {
                toast.error("No estás autenticado")
                setLoading(false)
                return
            }

            // Verificar la contraseña actual
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email!,
                password: currentPassword,
            })

            if (signInError) {
                toast.error("La contraseña actual es incorrecta")
                setLoading(false)
                return
            }

            // Actualizar la contraseña
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) {
                console.error("Error updating password:", updateError)
                toast.error("Error al actualizar la contraseña. Intenta nuevamente.")
                setLoading(false)
                return
            }

            toast.success("Contraseña actualizada correctamente")
            // Limpiar formulario
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            router.refresh()
        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al cambiar la contraseña")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <div className="relative">
                    <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Ingresá tu contraseña actual"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <div className="relative">
                    <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                <p className="text-xs text-muted-foreground">
                    La contraseña debe tener al menos 6 caracteres.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repetí la nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                <Key className="mr-2 h-4 w-4" />
                {loading ? "Cambiando..." : "Cambiar Contraseña"}
            </Button>
        </form>
    )
}

