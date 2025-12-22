"use client";

import { useState } from "react";
import { addSchedule } from "@/app/actions/professors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AddScheduleFormProps {
    professorId: string;
    days: string[];
    sports: string[];
}

export function AddScheduleForm({ professorId, days, sports }: AddScheduleFormProps) {
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate end time is after start time
        if (startTime && endTime && endTime <= startTime) {
            toast.error("La hora de fin debe ser posterior a la hora de inicio");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        const result = await addSchedule(formData);

        setIsSubmitting(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Horario asignado correctamente");
            // Reset form
            e.currentTarget.reset();
            setStartTime("");
            setEndTime("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-3">
            <input type="hidden" name="professorId" value={professorId} />

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <Label htmlFor={`day-${professorId}`} className="text-xs">Día</Label>
                    <select
                        id={`day-${professorId}`}
                        name="dayOfWeek"
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    >
                        <option value="">Seleccionar</option>
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`sport-${professorId}`} className="text-xs">Deporte</Label>
                    <select
                        id={`sport-${professorId}`}
                        name="sport"
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    >
                        <option value="">Seleccionar</option>
                        {sports.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <Label htmlFor={`start-${professorId}`} className="text-xs">Inicio</Label>
                    <Input
                        id={`start-${professorId}`}
                        name="startTime"
                        type="time"
                        className="h-9"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`end-${professorId}`} className="text-xs">Fin</Label>
                    <Input
                        id={`end-${professorId}`}
                        name="endTime"
                        type="time"
                        className="h-9"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                    />
                </div>
            </div>

            {startTime && endTime && endTime <= startTime && (
                <p className="text-xs text-destructive">
                    La hora de fin debe ser posterior a la hora de inicio
                </p>
            )}

            <div className="space-y-1">
                <Label htmlFor={`desc-${professorId}`} className="text-xs">Descripción / Detalle</Label>
                <Textarea
                    id={`desc-${professorId}`}
                    name="description"
                    placeholder="Ej: Solo cancha 1, traer materiales..."
                    className="h-20 resize-none text-xs"
                />
            </div>

            <Button
                type="submit"
                size="sm"
                variant="secondary"
                className="w-full"
                disabled={isSubmitting || !!(startTime && endTime && endTime <= startTime)}
            >
                {isSubmitting ? "Asignando..." : "Asignar"}
            </Button>
        </form>
    );
}
