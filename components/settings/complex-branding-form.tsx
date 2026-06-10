"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { updateComplexBranding } from "@/app/actions/complex-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ComplexBranding } from "@/lib/complex-config"

export function ComplexBrandingForm({ branding }: { branding: ComplexBranding }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [logoPreview, setLogoPreview] = useState(branding.logoSrc)
    const router = useRouter()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)

        const result = await updateComplexBranding(new FormData(event.currentTarget))

        setIsSubmitting(false)

        if (result?.error) {
            toast.error(result.error)
            return
        }

        toast.success("Configuracion guardada correctamente")
        router.refresh()
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-6">
            {branding.id && <input type="hidden" name="id" value={branding.id} />}

            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="appName">Nombre de la plataforma</Label>
                        <Input
                            id="appName"
                            name="appName"
                            defaultValue={branding.appName}
                            required
                            placeholder="Ej: Turnos Sport"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="complexName">Nombre del complejo</Label>
                        <Input
                            id="complexName"
                            name="complexName"
                            defaultValue={branding.complexName}
                            required
                            placeholder="Ej: Complejo Norte"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripcion</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={branding.description}
                            required
                            placeholder="Descripcion corta para metadatos y presentacion"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="logoSrc">Logo</Label>
                        <Input
                            id="logoSrc"
                            name="logoSrc"
                            defaultValue={branding.logoSrc}
                            required
                            placeholder="/logo.png o https://..."
                            onChange={(event) => setLogoPreview(event.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="assistantName">Nombre del asistente</Label>
                        <Input
                            id="assistantName"
                            name="assistantName"
                            defaultValue={branding.assistantName}
                            required
                            placeholder="Ej: Profe virtual"
                        />
                    </div>
                </div>

                <div className="rounded-lg border bg-muted/20 p-4">
                    <p className="text-sm font-medium">Vista previa</p>
                    <div className="mt-4 flex min-h-40 flex-col items-center justify-center gap-3 rounded-md border bg-background p-4 text-center">
                        {logoPreview ? (
                            <Image
                                src={logoPreview}
                                alt={branding.logoAlt}
                                width={160}
                                height={80}
                                className="max-h-20 w-auto object-contain"
                            />
                        ) : null}
                        <div>
                            <p className="font-semibold">{branding.appName}</p>
                            <p className="text-sm text-muted-foreground">{branding.displayName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="footerLine1">Pie de pagina 1</Label>
                    <Input
                        id="footerLine1"
                        name="footerLine1"
                        defaultValue={branding.footerLines[0] || ""}
                        placeholder="Ej: Desarrollado por..."
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="footerLine2">Pie de pagina 2</Label>
                    <Input
                        id="footerLine2"
                        name="footerLine2"
                        defaultValue={branding.footerLines[1] || ""}
                        placeholder="Ej: Nombre de la organizacion"
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Guardando..." : "Guardar configuracion"}
                </Button>
            </div>
        </form>
    )
}
