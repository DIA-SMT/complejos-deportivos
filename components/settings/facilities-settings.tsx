"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, ImageIcon, PlusCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
    createCourt,
    createSport,
    deleteCourts,
    deleteSports,
    type Court,
    type Sport,
} from "@/app/actions/facilities"
import { imageFileToCompactDataUrl } from "@/components/settings/image-file-utils"
import { EditCourtDialog } from "@/components/settings/edit-court-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function FacilitiesSettings({
    sports,
    courts,
    selectedComplexId,
    canManageSports = false,
}: {
    sports: Sport[]
    courts: Court[]
    selectedComplexId?: string | null
    canManageSports?: boolean
}) {
    const router = useRouter()
    const [isSportSubmitting, setIsSportSubmitting] = useState(false)
    const [isCourtSubmitting, setIsCourtSubmitting] = useState(false)
    const [formError, setFormError] = useState("")
    const [sportIconPreview, setSportIconPreview] = useState("")
    const [courtIconPreview, setCourtIconPreview] = useState("")
    const [selectedSportIds, setSelectedSportIds] = useState<string[]>([])
    const [selectedCourtIds, setSelectedCourtIds] = useState<string[]>([])
    const [isDeletingSports, setIsDeletingSports] = useState(false)
    const [isDeletingCourts, setIsDeletingCourts] = useState(false)

    const readImageFile = async (
        event: React.ChangeEvent<HTMLInputElement>,
        setPreview: (value: string) => void
    ) => {
        const file = event.target.files?.[0]

        if (!file) return

        try {
            const compactImage = await imageFileToCompactDataUrl(file, { maxSize: 256, quality: 0.78 })

            if (compactImage.length > 500_000) {
                toast.error("La imagen sigue siendo muy pesada. Proba con una referencia mas liviana.")
                event.target.value = ""
                return
            }

            setPreview(compactImage)
        } catch {
            toast.error("No pudimos procesar esa imagen.")
        }
    }

    const handleCreateSport = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setFormError("")
        setIsSportSubmitting(true)

        const form = event.currentTarget
        const result = await createSport(new FormData(form))
        setIsSportSubmitting(false)

        if (result?.error) {
            setFormError(result.error)
            toast.error(result.error)
            return
        }

        toast.success("Deporte creado correctamente")
        form.reset()
        setSportIconPreview("")
        router.refresh()
    }

    const handleCreateCourt = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setFormError("")
        setIsCourtSubmitting(true)

        const form = event.currentTarget
        const result = await createCourt(new FormData(form))
        setIsCourtSubmitting(false)

        if (result?.error) {
            setFormError(result.error)
            toast.error(result.error)
            return
        }

        toast.success("Cancha creada correctamente")
        form.reset()
        setCourtIconPreview("")
        router.refresh()
    }

    const toggleSelection = (
        id: string,
        selectedIds: string[],
        setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setSelectedIds(
            selectedIds.includes(id)
                ? selectedIds.filter((selectedId) => selectedId !== id)
                : [...selectedIds, id]
        )
    }

    const handleDeleteSports = async () => {
        if (!selectedSportIds.length) return
        if (!confirm(`¿Eliminar ${selectedSportIds.length} deporte(s) seleccionado(s)?`)) return

        setIsDeletingSports(true)
        const result = await deleteSports(selectedSportIds, selectedComplexId)
        setIsDeletingSports(false)
        if (result?.error) {
            toast.error(result.error)
            return
        }

        toast.success(`${selectedSportIds.length} deporte(s) eliminado(s)`)
        setSelectedSportIds([])
        router.refresh()
    }

    const handleDeleteCourts = async () => {
        if (!selectedCourtIds.length) return
        if (!confirm(`¿Eliminar ${selectedCourtIds.length} cancha(s) seleccionada(s)?`)) return

        setIsDeletingCourts(true)
        const result = await deleteCourts(selectedCourtIds, selectedComplexId)
        setIsDeletingCourts(false)
        if (result?.error) {
            toast.error(result.error)
            return
        }

        toast.success(`${selectedCourtIds.length} cancha(s) eliminada(s)`)
        setSelectedCourtIds([])
        router.refresh()
    }

    return (
        <div className="grid min-w-0 gap-8 lg:grid-cols-2">
            {formError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive lg:col-span-2">
                    {formError}
                </div>
            ) : null}

            <section className="grid min-w-0 gap-4">
                {canManageSports ? (
                <form onSubmit={handleCreateSport} className="grid gap-3 rounded-lg border bg-muted/20 p-4">
                    <div>
                        <h3 className="font-semibold">Nuevo deporte</h3>
                        <p className="text-sm text-muted-foreground">Se usara en horarios de profesores, reportes y calendario.</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sport-name">Nombre</Label>
                        <Input id="sport-name" name="name" placeholder="Ej: Tenis" required />
                    </div>
                    <input type="hidden" name="complexId" value={selectedComplexId || ""} />
                    <div className="grid gap-2">
                        <Label htmlFor="sport-icon">Logo o referencia visual</Label>
                        <Input
                            id="sport-icon"
                            type="file"
                            accept="image/*"
                            onChange={(event) => readImageFile(event, setSportIconPreview)}
                        />
                        <input type="hidden" name="iconUrl" value={sportIconPreview} />
                        {sportIconPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={sportIconPreview} alt="" className="h-12 w-12 rounded-md object-contain" />
                        ) : null}
                    </div>
                    <Button type="submit" disabled={isSportSubmitting}>
                        <PlusCircle className="h-4 w-4" />
                        {isSportSubmitting ? "Agregando..." : "Agregar deporte"}
                    </Button>
                </form>
                ) : (
                    <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                        No tenes permisos para modificar los deportes de este complejo.
                    </div>
                )}

                <div className="rounded-lg border">
                    {canManageSports && sports.length > 0 ? (
                        <div className="flex items-center justify-between gap-3 border-b p-3">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={selectedSportIds.length === sports.length}
                                    onChange={(event) => setSelectedSportIds(
                                        event.target.checked ? sports.map((sport) => sport.id) : []
                                    )}
                                    className="h-4 w-4 rounded border-input"
                                />
                                Seleccionar todos
                            </label>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={!selectedSportIds.length || isDeletingSports}
                                onClick={handleDeleteSports}
                            >
                                <Trash2 className="h-4 w-4" />
                                {isDeletingSports
                                    ? "Eliminando..."
                                    : `Eliminar seleccionados (${selectedSportIds.length})`}
                            </Button>
                        </div>
                    ) : null}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {canManageSports ? <TableHead className="w-10">Sel.</TableHead> : null}
                                <TableHead className="w-14">Logo</TableHead>
                                <TableHead>Deporte</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={canManageSports ? 3 : 2} className="text-center text-muted-foreground">
                                        No hay deportes cargados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sports.map((sport) => (
                                    <TableRow key={sport.id}>
                                        {canManageSports ? (
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    aria-label={`Seleccionar ${sport.name}`}
                                                    checked={selectedSportIds.includes(sport.id)}
                                                    onChange={() => toggleSelection(
                                                        sport.id,
                                                        selectedSportIds,
                                                        setSelectedSportIds
                                                    )}
                                                    className="h-4 w-4 rounded border-input"
                                                />
                                            </TableCell>
                                        ) : null}
                                        <TableCell>
                                            {sport.icon_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={sport.icon_url} alt="" className="h-8 w-8 rounded-md object-contain" />
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                    <ImageIcon className="h-4 w-4" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{sport.name}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <section className="grid min-w-0 gap-4">
                <form onSubmit={handleCreateCourt} className="grid gap-3 rounded-lg border bg-muted/20 p-4">
                    <div>
                        <h3 className="font-semibold">Nueva cancha o espacio</h3>
                        <p className="text-sm text-muted-foreground">Representa canchas, piletas, salas o sectores reservables.</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="court-name">Nombre</Label>
                        <Input id="court-name" name="name" placeholder="Ej: Cancha 1" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="court-sport">Deporte</Label>
                        <select
                            id="court-sport"
                            name="sportId"
                            required
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                            <option value="">Seleccionar deporte</option>
                            {sports.map((sport) => (
                                <option key={sport.id} value={sport.id}>{sport.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="court-type">Variante o tipo</Label>
                        <Input id="court-type" name="type" placeholder="Ej: Futbol 5, cancha cubierta" />
                    </div>
                    <input type="hidden" name="complexId" value={selectedComplexId || ""} />
                    <div className="grid gap-2">
                        <Label htmlFor="court-icon">Logo o referencia visual</Label>
                        <Input
                            id="court-icon"
                            type="file"
                            accept="image/*"
                            onChange={(event) => readImageFile(event, setCourtIconPreview)}
                        />
                        <input type="hidden" name="iconUrl" value={courtIconPreview} />
                        {courtIconPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={courtIconPreview} alt="" className="h-12 w-12 rounded-md object-contain" />
                        ) : null}
                    </div>
                    <Button type="submit" disabled={isCourtSubmitting}>
                        <PlusCircle className="h-4 w-4" />
                        {isCourtSubmitting ? "Agregando..." : "Agregar cancha"}
                    </Button>
                </form>

                <div className="min-w-0 overflow-hidden rounded-lg border">
                    {courts.length > 0 ? (
                        <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={selectedCourtIds.length === courts.length}
                                    onChange={(event) => setSelectedCourtIds(
                                        event.target.checked ? courts.map((court) => court.id) : []
                                    )}
                                    className="h-4 w-4 rounded border-input"
                                />
                                Seleccionar todas
                            </label>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="w-full sm:w-auto"
                                disabled={!selectedCourtIds.length || isDeletingCourts}
                                onClick={handleDeleteCourts}
                            >
                                <Trash2 className="h-4 w-4" />
                                {isDeletingCourts
                                    ? "Eliminando..."
                                    : `Eliminar seleccionadas (${selectedCourtIds.length})`}
                            </Button>
                        </div>
                    ) : null}
                    {courts.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                            No hay canchas cargadas.
                        </div>
                    ) : (
                        <div className="grid gap-2 p-3 md:hidden">
                            {courts.map((court) => (
                                <div key={court.id} className="flex min-w-0 items-center gap-3 rounded-lg border bg-background p-3">
                                    <input
                                        type="checkbox"
                                        aria-label={`Seleccionar ${court.name}`}
                                        checked={selectedCourtIds.includes(court.id)}
                                        onChange={() => toggleSelection(
                                            court.id,
                                            selectedCourtIds,
                                            setSelectedCourtIds
                                        )}
                                        className="h-4 w-4 shrink-0 rounded border-input"
                                    />
                                    {court.icon_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={court.icon_url} alt="" className="h-10 w-10 shrink-0 rounded-md object-contain" />
                                    ) : (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">{court.name}</p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {court.sports?.name || "Sin deporte vinculado"}
                                            {court.type && court.type !== court.sports?.name ? ` · ${court.type}` : ""}
                                        </p>
                                    </div>
                                    <EditCourtDialog court={court} sports={sports} />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">Sel.</TableHead>
                                <TableHead className="w-14">Logo</TableHead>
                                <TableHead>Cancha / espacio</TableHead>
                                <TableHead>Deporte / tipo</TableHead>
                                <TableHead className="w-14 text-right">Editar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courts.map((court) => (
                                    <TableRow key={court.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                aria-label={`Seleccionar ${court.name}`}
                                                checked={selectedCourtIds.includes(court.id)}
                                                onChange={() => toggleSelection(
                                                    court.id,
                                                    selectedCourtIds,
                                                    setSelectedCourtIds
                                                )}
                                                className="h-4 w-4 rounded border-input"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {court.icon_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={court.icon_url} alt="" className="h-8 w-8 rounded-md object-contain" />
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                    <Building2 className="h-4 w-4" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{court.name}</TableCell>
                                        <TableCell>
                                            <p>{court.sports?.name || "Sin deporte vinculado"}</p>
                                            {court.type && court.type !== court.sports?.name ? (
                                                <p className="text-xs text-muted-foreground">{court.type}</p>
                                            ) : null}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <EditCourtDialog court={court} sports={sports} />
                                        </TableCell>
                                    </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </div>
                </div>
            </section>
        </div>
    )
}
