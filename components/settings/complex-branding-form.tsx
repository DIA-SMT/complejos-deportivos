"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Save } from "lucide-react"
import { toast } from "sonner"
import { updateComplexBranding } from "@/app/actions/complex-settings"
import { imageFileToCompactDataUrl } from "@/components/settings/image-file-utils"
import { LocationMapPicker } from "@/components/settings/location-map-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ComplexBranding } from "@/lib/complex-config"
import { mapMarkerOptions } from "@/lib/complex-config"

const markerOptions = [
    { value: "📍", label: "Pin clasico" },
    { value: "🏅", label: "Polideportivo olimpico" },
    { value: "⚽", label: "Futbol" },
    { value: "🏀", label: "Basket" },
    { value: "🏐", label: "Voley" },
    { value: "🎾", label: "Padel / tenis" },
    { value: "🏊", label: "Natacion" },
    { value: "🤸", label: "Gimnasia" },
    { value: "🏋️", label: "Entrenamiento" },
]

export function ComplexBrandingForm({ branding }: { branding: ComplexBranding }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [logoPreview, setLogoPreview] = useState(branding.logoSrc)
    const [logoFileName, setLogoFileName] = useState("")
    const [complexNamePreview, setComplexNamePreview] = useState(branding.complexName)
    const [addressPreview, setAddressPreview] = useState(branding.address)
    const [latitude, setLatitude] = useState<number | null>(branding.latitude)
    const [longitude, setLongitude] = useState<number | null>(branding.longitude)
    const [mapMarkerIcon, setMapMarkerIcon] = useState(branding.mapMarkerIcon)
    const router = useRouter()

    const handleLogoFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const compactImage = await imageFileToCompactDataUrl(file, { maxSize: 480, quality: 0.78 })

            if (compactImage.length > 900_000) {
                toast.error("La imagen sigue siendo muy pesada. Proba con un logo mas liviano.")
                event.target.value = ""
                return
            }

            setLogoPreview(compactImage)
            setLogoFileName(file.name)
        } catch {
            toast.error("No pudimos procesar esa imagen.")
        }
    }

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
        if (!branding.id && result?.id) {
            router.push(`/configuracion?complexId=${result.id}`)
            return
        }
        router.refresh()
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-6">
            {branding.id && <input type="hidden" name="id" value={branding.id} />}

            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>Nombre de la plataforma</Label>
                        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
                            {branding.appName}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Este nombre lo define la plataforma, no cada complejo.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="complexName">Nombre del complejo</Label>
                        <Input
                            id="complexName"
                            name="complexName"
                            defaultValue={branding.complexName}
                            required
                            placeholder="Ej: Complejo Norte"
                            onChange={(event) => setComplexNamePreview(event.target.value)}
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
                        <Label htmlFor="logoFile">Logo</Label>
                        <Input id="logoFile" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoFile} />
                        <input type="hidden" id="logoSrc" name="logoSrc" value={logoPreview} />
                        <p className="text-xs text-muted-foreground">
                            PNG funciona bien. Si tiene fondo transparente, la vista previa usa un fondo claro para que se vea.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Ubicacion</Label>
                        <Input
                            id="address"
                            name="address"
                            value={addressPreview}
                            placeholder="Ej: Av. Principal 123, San Miguel de Tucuman"
                            onChange={(event) => setAddressPreview(event.target.value)}
                            required
                        />
                        <input type="hidden" name="latitude" value={latitude ?? ""} />
                        <input type="hidden" name="longitude" value={longitude ?? ""} />
                        <input type="hidden" name="mapMarkerIcon" value={mapMarkerIcon} />

                        <div className="grid gap-2">
                            <Label htmlFor="mapMarkerIcon">Icono del marcador</Label>
                            <select
                                id="mapMarkerIcon"
                                value={mapMarkerIcon}
                                onChange={(event) => setMapMarkerIcon(event.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                {(mapMarkerOptions.length ? mapMarkerOptions : markerOptions).map((option) => (
                                    <option key={option.value} value={option.value} className="bg-background text-foreground">
                                        {option.value} {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <LocationMapPicker
                            key={mapMarkerIcon}
                            initialLatitude={latitude}
                            initialLongitude={longitude}
                            markerIcon={mapMarkerIcon}
                            onChange={(location) => {
                                setLatitude(location.latitude)
                                setLongitude(location.longitude)
                                if (location.address) {
                                    setAddressPreview(location.address)
                                }
                            }}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Asistente ciudadano</Label>
                        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
                            {branding.assistantName}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            El asistente es parte de la plataforma y mantiene el mismo nombre para todos los complejos.
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border bg-muted/20 p-4">
                    <p className="text-sm font-medium">Vista previa</p>
                    <div className="mt-4 flex min-h-56 flex-col items-center justify-center gap-3 rounded-md border bg-background p-4 text-center">
                        {logoPreview ? (
                            <div className="flex w-full justify-center rounded-md border bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0px] p-4 dark:bg-[linear-gradient(45deg,#334155_25%,transparent_25%),linear-gradient(-45deg,#334155_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#334155_75%),linear-gradient(-45deg,transparent_75%,#334155_75%)]">
                                <div className="rounded-md bg-white p-3 shadow-sm">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={logoPreview}
                                        alt={branding.logoAlt}
                                        className="max-h-28 max-w-44 object-contain"
                                    />
                                </div>
                            </div>
                        ) : null}
                        {logoFileName ? <p className="text-xs text-muted-foreground">{logoFileName}</p> : null}
                        <div>
                            <p className="font-semibold">{branding.appName}</p>
                            <p className="text-sm text-muted-foreground">{complexNamePreview || branding.displayName}</p>
                            {addressPreview ? (
                                <p className="mt-2 inline-flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {addressPreview}
                                </p>
                            ) : null}
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
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="footerLine2">Pie de pagina 2</Label>
                    <Input
                        id="footerLine2"
                        name="footerLine2"
                        defaultValue={branding.footerLines[1] || ""}
                        placeholder="Ej: Nombre de la organizacion"
                        required
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
