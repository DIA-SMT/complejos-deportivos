"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clock, User, Award, MapPin } from "lucide-react"
import { getSportEmoji } from "@/lib/utils/sport-emojis"

interface ShiftDetailDialogProps {
    isOpen: boolean
    onClose: () => void
    shift: any // We can refine this type later if needed
}

export function ShiftDetailDialog({ isOpen, onClose, shift }: ShiftDetailDialogProps) {
    if (!shift) return null

    const statusColor =
        shift.status === 'completed' ? 'bg-green-100 text-green-800' :
            shift.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'

    const statusLabel =
        shift.status === 'completed' ? 'Completado' :
            shift.status === 'cancelled' ? 'Cancelado' :
                'Programado'

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center mr-6">
                        <span>{getSportEmoji(shift.group_name || shift.court_name || "")} {shift.group_name || "Turno"}</span>
                        <Badge variant="secondary" className={statusColor}>
                            {statusLabel}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Detalles del turno seleccionado
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Fecha</p>
                            <p className="text-sm text-muted-foreground capitalize">
                                {format(new Date(shift.date + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Horario</p>
                            <p className="text-sm text-muted-foreground">
                                {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Cancha/Espacio</p>
                            <p className="text-sm text-muted-foreground">{shift.court_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Profesor</p>
                            <p className="text-sm text-muted-foreground">{shift.professor_name}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={onClose}>Cerrar</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
