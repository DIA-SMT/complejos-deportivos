import { addSchedule, createProfessor, getProfessors } from "@/app/actions/professors";
import { getCurrentUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Clock, Calendar, ClipboardList } from "lucide-react";
import { Database } from "@/types/database.types";
import { Textarea } from "../../../components/ui/textarea";
import { ScheduleItem } from "@/components/schedule-item";
import { AddScheduleForm } from "@/components/professors/add-schedule-form";

type ProfessorWithSchedules = Database['public']['Tables']['professors']['Row'] & {
    professor_schedules: (Database['public']['Tables']['professor_schedules']['Row'] & {
        courts: { name: string } | null
        class_reviews: Database['public']['Tables']['class_reviews']['Row'][]
    })[]
}

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ProfessorWorkloadChart } from "@/components/professor-workload-chart";

export default async function ProfesoresPage() {
    const professors = (await getProfessors()) as unknown as ProfessorWithSchedules[];
    const user = await getCurrentUser();
    const isAdmin = user?.role === 'admin';
    // Courts removed as per user request

    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const sports = ["Fútbol", "Voley", "Basket", "Gimnasia", "Padel", "Natación"];

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Profesores y Horarios</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Administrá el staff de profesores, sus horarios de clases y asignaciones de canchas.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Columna Izquierda: Alta de Profesor - Solo visible para admin */}
                {isAdmin && (
                    <div className="md:col-span-4 lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Nuevo Profesor</CardTitle>
                                <CardDescription>Dar de alta un nuevo profesor.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* @ts-expect-error Server Action return type mismatch */}
                                <form action={createProfessor} className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="fullName">Nombre Completo</Label>
                                        <Input id="fullName" name="fullName" placeholder="Juan Pérez" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" placeholder="juan@ejemplo.com" />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Crear
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Columna Derecha: Lista de Profesores y Horarios */}
                <div className={isAdmin ? "md:col-span-8 lg:col-span-9" : "md:col-span-12"}>
                    {professors.length === 0 ? (
                        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No hay profesores cargados.</p>
                        </div>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Lista de Profesores</CardTitle>
                                <CardDescription>Hacé click en un profesor para ver o administrar sus horarios.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {professors.map((prof) => (
                                        <AccordionItem key={prof.id} value={prof.id} className="bg-blue-50/50 border-blue-100 mb-2 rounded-md overflow-hidden dark:bg-blue-950/20 dark:border-blue-900">
                                            <AccordionTrigger className="hover:no-underline px-3 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors">
                                                <div className="flex flex-col items-start text-left">
                                                    <span className="text-sm sm:text-base font-semibold">{prof.full_name}</span>
                                                    <span className="text-xs text-muted-foreground font-normal">{prof.email || "Sin email registrado"}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-2">
                                                <div className="grid gap-6 lg:grid-cols-2 pt-4">
                                                    {/* Lista de Horarios */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-sm font-medium leading-none flex items-center gap-2">
                                                            <Clock className="h-4 w-4" /> Horarios Asignados
                                                        </h4>
                                                        {/* @ts-ignore */}
                                                        {(prof as any).professor_schedules && (prof as any).professor_schedules.length > 0 ? (
                                                            <div className="grid gap-2">
                                                                {/* @ts-ignore */}
                                                                {(prof as any).professor_schedules.map((schedule: any) => (
                                                                    <ScheduleItem
                                                                        key={schedule.id}
                                                                        schedule={schedule}
                                                                        days={days}
                                                                        sports={sports}
                                                                        isAdmin={isAdmin}
                                                                    />
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground italic">Sin horarios asignados.</p>
                                                        )}
                                                    </div>

                                                    {/* Formulario de Asignación de Horario - Solo visible para admin */}
                                                    {isAdmin && (
                                                        <div className="space-y-4 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 border-border">
                                                            <h4 className="text-sm font-medium leading-none flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" /> Asignar Nuevo Horario
                                                            </h4>
                                                            <AddScheduleForm
                                                                professorId={prof.id}
                                                                days={days}
                                                                sports={sports}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="px-2 sm:px-6 pb-6 pt-2">
                                                    <div className="border-t pt-4">
                                                        <h4 className="text-sm font-medium leading-none flex items-center gap-2 mb-4">
                                                            <ClipboardList className="h-4 w-4" /> Historial de Reportes
                                                        </h4>

                                                        {(() => {
                                                            const allReviews = (prof as any).professor_schedules
                                                                ?.flatMap((s: any) =>
                                                                    (s.class_reviews || []).map((r: any) => ({ ...r, schedule: s }))
                                                                )
                                                                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

                                                            if (allReviews.length === 0) {
                                                                return <p className="text-sm text-muted-foreground italic">No hay reportes registrados.</p>;
                                                            }

                                                            return (
                                                                <div className="grid gap-2 max-h-60 overflow-y-auto pr-2">
                                                                    {allReviews.map((review: any) => (
                                                                        <div key={`${review.schedule_id}-${review.date}`} className="flex flex-col gap-1 rounded-md border p-3 text-sm bg-background/50 hover:bg-background transition-colors">
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="font-semibold text-primary text-xs sm:text-sm">{review.schedule.sport} - {review.schedule.day_of_week} {review.schedule.start_time.slice(0, 5)}</span>
                                                                                <span className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</span>
                                                                            </div>
                                                                            <div className="flex gap-4 text-xs text-muted-foreground">
                                                                                <span>Asistencia: {review.attendance ?? '-'}</span>
                                                                            </div>
                                                                            {review.notes && (
                                                                                <p className="text-muted-foreground mt-1 bg-muted/30 p-2 rounded italic text-xs sm:text-sm">"{review.notes}"</p>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Gráfico de Carga Horaria */}
            {professors.length > 0 && (
                <ProfessorWorkloadChart professors={professors} />
            )}
        </div>
    );
}
