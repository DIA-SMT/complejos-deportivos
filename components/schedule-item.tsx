"use client";

import { useState } from "react";
import { updateSchedule, deleteSchedule } from "@/app/actions/professors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MapPin, FileText, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

interface ScheduleItemProps {
    schedule: any;
    days: string[];
    sports: string[];
    isAdmin?: boolean;
}

export function ScheduleItem({ schedule, days, sports, isAdmin = false }: ScheduleItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (formData: FormData) => {
        setIsLoading(true);
        const result = await updateSchedule(formData);
        setIsLoading(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Horario actualizado correctamente");
            setIsEditing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de que querés eliminar este horario?")) return;

        setIsLoading(true);
        const result = await deleteSchedule(schedule.id);
        setIsLoading(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Horario eliminado correctamente");
        }
    };

    if (isEditing) {
        return (
            <form action={handleUpdate} className="flex flex-col text-sm rounded-md border p-3 bg-muted/50 gap-3">
                <input type="hidden" name="scheduleId" value={schedule.id} />

                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label htmlFor={`edit-day-${schedule.id}`} className="text-xs">Día</Label>
                        <select
                            id={`edit-day-${schedule.id}`}
                            name="dayOfWeek"
                            defaultValue={schedule.day_of_week}
                            className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            required
                        >
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor={`edit-sport-${schedule.id}`} className="text-xs">Deporte</Label>
                        <select
                            id={`edit-sport-${schedule.id}`}
                            name="sport"
                            defaultValue={schedule.sport}
                            className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            required
                        >
                            {sports.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label htmlFor={`edit-start-${schedule.id}`} className="text-xs">Inicio</Label>
                        <Input
                            id={`edit-start-${schedule.id}`}
                            name="startTime"
                            type="time"
                            defaultValue={schedule.start_time}
                            className="h-8 text-xs"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor={`edit-end-${schedule.id}`} className="text-xs">Fin</Label>
                        <Input
                            id={`edit-end-${schedule.id}`}
                            name="endTime"
                            type="time"
                            defaultValue={schedule.end_time}
                            className="h-8 text-xs"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label htmlFor={`edit-desc-${schedule.id}`} className="text-xs">Descripción</Label>
                    <Textarea
                        id={`edit-desc-${schedule.id}`}
                        name="description"
                        defaultValue={schedule.description || ""}
                        className="h-16 min-h-[64px] resize-none text-xs"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                    >
                        <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={isLoading}
                    >
                        <Check className="h-3.5 w-3.5 mr-1" /> Guardar
                    </Button>
                </div>
            </form>
        );
    }

    return (
        <div className="group flex flex-col text-sm rounded-md border p-2 bg-muted/50 gap-2 relative hover:bg-muted/80 transition-colors">
            {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsEditing(true)}
                    >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        <Trash2 className="h-3.5 w-3.5 text-destructive/70 hover:text-destructive" />
                    </Button>
                </div>
            )}

            <div className={`flex items-center justify-between ${isAdmin ? 'pr-14 md:pr-16' : ''}`}>
                <div className="flex gap-2 items-center">
                    <span className="font-semibold text-primary">{schedule.day_of_week}</span>
                    <span>{schedule.start_time?.slice(0, 5)} - {schedule.end_time?.slice(0, 5)}</span>
                </div>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{schedule.sport}</span>
            </div>
            {(schedule.courts?.name || schedule.description) && (
                <div className="text-xs text-muted-foreground border-t pt-1 flex flex-col gap-1">
                    {schedule.courts?.name && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="font-medium">{schedule.courts.name}</span>
                        </div>
                    )}
                    {schedule.description && (
                        <div className="flex items-start gap-1">
                            <FileText className="h-3 w-3 mt-0.5" />
                            <span>{schedule.description}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
