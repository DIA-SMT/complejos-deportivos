"use client";

import { useState } from "react";
import { upsertClassReport } from "@/app/actions/reports";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ClassReportDialogProps {
    scheduleId: string;
    date: string;
    professorName: string;
    courtName: string;
    groupName: string;
    existingReport?: {
        attendance: number | null;
        notes: string | null;
    } | null;
    trigger?: React.ReactNode;
}

export function ClassReportDialog({
    scheduleId,
    date,
    professorName,
    courtName,
    groupName,
    existingReport,
    trigger
}: ClassReportDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        const attendanceValue = formData.get("attendance");

        // Validate attendance is not negative
        if (attendanceValue && parseInt(attendanceValue as string) < 0) {
            toast.error("La cantidad de alumnos no puede ser negativa");
            return;
        }

        setIsLoading(true);
        const result = await upsertClassReport(formData);
        setIsLoading(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Reporte guardado correctamente");
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ClipboardList className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reporte de Clase</DialogTitle>
                    <DialogDescription>
                        {groupName} - {new Date(date).toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <input type="hidden" name="scheduleId" value={scheduleId} />
                    <input type="hidden" name="date" value={date} />

                    <div className="grid gap-2">
                        <Label htmlFor="info" className="text-xs text-muted-foreground">Información</Label>
                        <div className="text-sm rounded-md border p-2 bg-muted/50">
                            <p><strong>Profesor:</strong> {professorName}</p>
                            <p><strong>Cancha:</strong> {courtName}</p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="attendance">Cantidad de Alumnos</Label>
                        <Input
                            id="attendance"
                            name="attendance"
                            type="number"
                            placeholder="0"
                            defaultValue={existingReport?.attendance || ""}
                            min="0"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notas / Observaciones</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Ej: Se trabajó técnica de pase check..."
                            defaultValue={existingReport?.notes || ""}
                            className="h-24 resize-none"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            <Save className="mr-2 h-4 w-4" />
                            {isLoading ? "Guardando..." : "Guardar Reporte"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
