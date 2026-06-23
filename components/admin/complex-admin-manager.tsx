"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
    assignComplexAdmin,
    removeComplexAdmin,
    type ComplexAdminAssignment,
} from "@/app/actions/admin-access"
import type { RegisteredComplex } from "@/app/actions/complex-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ComplexAdminManager({
    complexes,
    assignments,
}: {
    complexes: RegisteredComplex[]
    assignments: ComplexAdminAssignment[]
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAssign = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)
        const form = event.currentTarget
        const result = await assignComplexAdmin(new FormData(form))
        setIsSubmitting(false)

        if (result?.error) {
            toast.error(result.error)
            return
        }

        form.reset()
        toast.success("Administrador asignado")
    }

    const handleRemove = async (formData: FormData) => {
        const result = await removeComplexAdmin(formData)
        if (result?.error) {
            toast.error(result.error)
            return
        }
        toast.success("Asignación eliminada")
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <form onSubmit={handleAssign} className="grid h-fit gap-4 rounded-lg border p-5">
                <div>
                    <h2 className="font-semibold">Asignar responsable</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        La cuenta debe existir previamente como usuario.
                    </p>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input id="admin-email" name="email" type="email" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="admin-complex">Complejo</Label>
                    <select
                        id="admin-complex"
                        name="complexId"
                        required
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                        <option value="">Seleccionar</option>
                        {complexes.map((complex) => (
                            <option key={complex.id} value={complex.id}>{complex.name}</option>
                        ))}
                    </select>
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Asignando..." : "Asignar administrador"}
                </Button>
            </form>

            <div className="space-y-3">
                {assignments.length ? assignments.map((assignment) => (
                    <div key={`${assignment.user_id}-${assignment.complex_id}`} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-semibold">{assignment.user_profiles?.email || "Usuario"}</p>
                            <p className="text-sm text-muted-foreground">
                                {assignment.complexes?.name || "Complejo"}
                            </p>
                        </div>
                        <form action={handleRemove}>
                            <input type="hidden" name="userId" value={assignment.user_id} />
                            <input type="hidden" name="complexId" value={assignment.complex_id} />
                            <Button type="submit" variant="ghost" size="sm">Quitar</Button>
                        </form>
                    </div>
                )) : (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                        No hay administradores de complejo asignados.
                    </div>
                )}
            </div>
        </div>
    )
}
