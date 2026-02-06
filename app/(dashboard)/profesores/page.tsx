import { getProfessors } from "@/app/actions/professors";
import { getCurrentUser } from "@/app/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, ClipboardList } from "lucide-react";
import { Database } from "@/types/database.types";
import { ScheduleItem } from "@/components/schedule-item";
import { AddScheduleForm } from "@/components/professors/add-schedule-form";
import { CreateProfessorForm } from "@/components/professors/create-professor-form";
import { ProfessorActions } from "@/components/professors/professor-actions";

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
            <div className="relative w-full h-[250px] sm:h-[300px] rounded-xl overflow-hidden mb-8 shadow-xl animate-fade-in group">
                <div className="absolute inset-0 bg-blue-900/20">
                    <img
                        src="/images/profesores.png"
                        alt="Fondo Profesores"
                        className="absolute inset-0 w-full h-full object-cover transform scale-110"
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/60 to-transparent dark:from-black/90 dark:via-black/60 mix-blend-multiply"></div>
                </div>

                <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 text-white space-y-2">
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md animate-slide-in-left">
                        Profesores y Horarios
                    </h2>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl font-light drop-shadow animate-slide-in-left animation-delay-200">
                        Gestioná el equipo de profesionales, organizá los cronogramas de clases y optimizá el uso de las instalaciones deportivas.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Columna Izquierda: Alta de Profesor - Solo visible para admin */}
                {isAdmin && (
                    <div className="md:col-span-4 lg:col-span-3 animate-slide-in-up animation-delay-100">
                        <Card className="hover-lift">
                            <CardHeader>
                                <CardTitle>Nuevo Profesor</CardTitle>
                                <CardDescription>Dar de alta un nuevo profesor.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CreateProfessorForm />
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
                        <Card className="animate-slide-in-up animation-delay-200 hover-lift">
                            <CardHeader>
                                <CardTitle>Lista de Profesores</CardTitle>
                                <CardDescription>Hacé click en un profesor para ver o administrar sus horarios.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {professors.map((prof) => (
                                        <AccordionItem key={prof.id} value={prof.id} className="bg-blue-50/50 border-blue-100 mb-2 rounded-md overflow-hidden dark:bg-blue-950/20 dark:border-blue-900 transition-all duration-300 hover:shadow-md">
                                            <div className="flex items-center justify-between w-full pr-2 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors">
                                                <AccordionTrigger className="hover:no-underline px-3 flex-1 hover:bg-transparent">
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="text-sm sm:text-base font-semibold">{prof.full_name}</span>
                                                        <span className="text-xs text-muted-foreground font-normal">{prof.email || "Sin email registrado"}</span>
                                                    </div>
                                                </AccordionTrigger>
                                                {isAdmin && (
                                                    <div className="flex-shrink-0 ml-2">
                                                        <ProfessorActions professor={{ id: prof.id, full_name: prof.full_name, email: prof.email }} />
                                                    </div>
                                                )}
                                            </div>
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
            {
                professors.length > 0 && (
                    <ProfessorWorkloadChart professors={professors} />
                )
            }
        </div >
    );
}
