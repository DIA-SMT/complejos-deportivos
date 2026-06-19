"use client"

import { useState } from "react"
import { toast } from "sonner"
import { createMemberWithCredential } from "@/app/actions/memberships"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getDefaultMembershipExpiration } from "@/lib/membership-duration"

export function AdminMemberCreateForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [membershipType, setMembershipType] = useState("mensual")
    const [expiresAt, setExpiresAt] = useState(getDefaultMembershipExpiration("mensual"))

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)

        const form = event.currentTarget
        const result = await createMemberWithCredential(new FormData(form))

        setIsSubmitting(false)

        if (result?.error) {
            toast.error(result.error)
            return
        }

        form.reset()
        setMembershipType("mensual")
        setExpiresAt(getDefaultMembershipExpiration("mensual"))
        toast.success("Credencial creada correctamente")
    }

    const handleMembershipTypeChange = (value: string) => {
        setMembershipType(value)
        setExpiresAt(getDefaultMembershipExpiration(value))
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="grid gap-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" name="firstName" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input id="lastName" name="lastName" required />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="dni">DNI</Label>
                <Input id="dni" name="dni" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" name="phone" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email del usuario</Label>
                <Input id="email" name="email" type="email" placeholder="Debe coincidir con su cuenta para verlo en el portal" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="photoUrl">Foto URL opcional</Label>
                <Input id="photoUrl" name="photoUrl" placeholder="https://..." />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="membershipType">Tipo de membresia</Label>
                <Select name="membershipType" value={membershipType} onValueChange={handleMembershipTypeChange}>
                    <SelectTrigger id="membershipType" className="w-full">
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
                <Label htmlFor="expiresAt">Vencimiento del carnet</Label>
                <Input
                    id="expiresAt"
                    name="expiresAt"
                    type="date"
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="enabledActivities">Actividades habilitadas</Label>
                <Input id="enabledActivities" name="enabledActivities" placeholder="Futbol, Padel, Gimnasio" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="notes">Observaciones internas</Label>
                <Textarea id="notes" name="notes" />
            </div>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear credencial"}
            </Button>
        </form>
    )
}
