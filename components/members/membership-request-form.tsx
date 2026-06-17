"use client"

import { useState } from "react"
import { toast } from "sonner"
import { requestMembership } from "@/app/actions/memberships"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function MembershipRequestForm({ email }: { email: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)

        const result = await requestMembership(new FormData(event.currentTarget))

        setIsSubmitting(false)

        if (result?.error) {
            toast.error(result.error)
            return
        }

        setSent(true)
        toast.success("Solicitud enviada correctamente")
    }

    if (sent) {
        return (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200">
                Tu solicitud de asociacion quedo pendiente de aprobacion.
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border p-4">
            <div>
                <p className="font-semibold">Solicitar asociarme</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    La solicitud se envia a administracion. Si la aprueban, vas a ver tu carnet aca.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Cuenta: {email}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="requestFirstName">Nombre</Label>
                    <Input id="requestFirstName" name="firstName" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="requestLastName">Apellido</Label>
                    <Input id="requestLastName" name="lastName" required />
                </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="requestDni">DNI</Label>
                    <Input id="requestDni" name="dni" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="requestPhone">Telefono</Label>
                    <Input id="requestPhone" name="phone" />
                </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="requestMembershipType">Tipo de membresia</Label>
                    <Select name="membershipType" defaultValue="mensual">
                        <SelectTrigger id="requestMembershipType" className="w-full">
                            <SelectValue placeholder="Selecciona una membresia" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mensual">Mensual</SelectItem>
                            <SelectItem value="trimestral">Trimestral</SelectItem>
                            <SelectItem value="semestral">Semestral</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                            <SelectItem value="staff">Profesor / staff</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="requestActivities">Actividades</Label>
                    <Input id="requestActivities" name="requestedActivities" placeholder="Futbol, Padel, Gimnasio" />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="requestNotes">Comentario opcional</Label>
                <Textarea id="requestNotes" name="notes" placeholder="Ej: Quiero asociarme para usar la pileta..." />
            </div>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar solicitud"}
            </Button>
        </form>
    )
}
