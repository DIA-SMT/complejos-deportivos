"use client";

import { useState } from "react";
import { createProfessor } from "@/app/actions/professors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

export function CreateProfessorForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const result = await createProfessor(formData);

        setIsSubmitting(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Profesor creado correctamente");
            // Reset form
            form.reset();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input id="fullName" name="fullName" placeholder="Juan Pérez" required className="transition-smooth" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="juan@ejemplo.com" />
            </div>
            <Button type="submit" className="w-full hover-lift transition-smooth" disabled={isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? "Creando..." : "Crear"}
            </Button>
        </form>
    );
}
