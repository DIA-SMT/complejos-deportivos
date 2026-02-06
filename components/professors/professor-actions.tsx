"use client";

import { useState } from "react";
import { updateProfessor, deleteProfessor } from "@/app/actions/professors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

interface Professor {
    id: string;
    full_name: string;
    email: string | null;
}

interface ProfessorActionsProps {
    professor: Professor;
}

export function ProfessorActions({ professor }: ProfessorActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [fullName, setFullName] = useState(professor.full_name);
    const [email, setEmail] = useState(professor.email || "");

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUpdating(true);

        const formData = new FormData();
        formData.set("professorId", professor.id);
        formData.set("fullName", fullName);
        formData.set("email", email);

        const result = await updateProfessor(formData);

        setIsUpdating(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Profesor actualizado correctamente");
            setIsEditOpen(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);

        const result = await deleteProfessor(professor.id);

        setIsDeleting(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Profesor eliminado correctamente");
        }
    };

    return (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Editar Profesor</DialogTitle>
                        <DialogDescription>
                            Modificá los datos del profesor. Hacé clic en guardar cuando termines.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-fullName">Nombre Completo</Label>
                                <Input
                                    id="edit-fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Juan Pérez"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="juan@ejemplo.com"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? "Guardando..." : "Guardar cambios"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar profesor?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará a <strong>{professor.full_name}</strong> y todos sus horarios asignados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
