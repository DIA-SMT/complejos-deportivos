"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/database.types";
import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks } from "date-fns";
import { es } from "date-fns/locale";

type ProfessorWithSchedules = Database['public']['Tables']['professors']['Row'] & {
    professor_schedules: Database['public']['Tables']['professor_schedules']['Row'][]
}

interface ProfessorWorkloadChartProps {
    professors: ProfessorWithSchedules[];
}

interface ProfessorWorkload {
    name: string;
    hours: number;
    color: string;
}

function calculateWeeklyHours(schedules: Database['public']['Tables']['professor_schedules']['Row'][]): number {
    return schedules.reduce((total, schedule) => {
        if (!schedule.start_time || !schedule.end_time) return total;

        const [startHour, startMinute] = schedule.start_time.split(':').map(Number);
        const [endHour, endMinute] = schedule.end_time.split(':').map(Number);

        const startInMinutes = startHour * 60 + startMinute;
        const endInMinutes = endHour * 60 + endMinute;

        let diffInMinutes = endInMinutes - startInMinutes;
        if (diffInMinutes < 0) {
            diffInMinutes += 24 * 60; // Asumir que cruza la medianoche
        }

        const durationInHours = diffInMinutes / 60;

        return total + durationInHours;
    }, 0);
}

function getWorkloadColor(hours: number): string {
    if (hours >= 20) return "bg-red-500";
    if (hours >= 12) return "bg-orange-500";
    if (hours >= 6) return "bg-yellow-500";
    return "bg-green-500";
}

function getWorkloadLevel(hours: number): string {
    if (hours >= 20) return "Muy Alta";
    if (hours >= 12) return "Alta";
    if (hours >= 6) return "Media";
    return "Baja";
}

export function ProfessorWorkloadChart({ professors }: ProfessorWorkloadChartProps) {
    const [selectedWeek, setSelectedWeek] = useState(new Date());

    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    const formattedRange = `${format(weekStart, "dd/MM")} - ${format(weekEnd, "dd/MM")}`;

    // Check if we're viewing the current week
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const isCurrentWeek = weekStart.getTime() === currentWeekStart.getTime();

    const handlePrevWeek = () => {
        setSelectedWeek(subWeeks(selectedWeek, 1));
    };

    const handleNextWeek = () => {
        if (!isCurrentWeek) {
            setSelectedWeek(addWeeks(selectedWeek, 1));
        }
    };

    const workloadData: ProfessorWorkload[] = professors
        .filter(prof => prof.professor_schedules && prof.professor_schedules.length > 0)
        .map(prof => ({
            name: prof.full_name,
            hours: calculateWeeklyHours(prof.professor_schedules || []),
            color: getWorkloadColor(calculateWeeklyHours(prof.professor_schedules || []))
        }))
        .sort((a, b) => b.hours - a.hours);

    if (workloadData.length === 0) {
        return null;
    }

    const maxHours = Math.max(...workloadData.map(d => d.hours));

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Carga Horaria Semanal
                        </CardTitle>
                        <CardDescription>
                            Horas totales de clases asignadas por semana para cada profesor
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePrevWeek}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-bold text-foreground border-2 border-primary rounded-md px-3 py-1.5 min-w-[120px] text-center">
                            {formattedRange}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNextWeek}
                            disabled={isCurrentWeek}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {workloadData.map((data, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{data.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                        {data.hours.toFixed(1)} hs
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${data.color === "bg-red-500" ? "bg-red-100 text-red-700" :
                                        data.color === "bg-orange-500" ? "bg-orange-100 text-orange-700" :
                                            data.color === "bg-yellow-500" ? "bg-yellow-100 text-yellow-700" :
                                                "bg-green-100 text-green-700"
                                        }`}>
                                        {getWorkloadLevel(data.hours)}
                                    </span>
                                </div>
                            </div>
                            <div className="relative h-8 bg-muted rounded-md overflow-hidden">
                                <div
                                    className={`h-full ${data.color} transition-all duration-500 ease-out flex items-center justify-end px-3`}
                                    style={{ width: `${(data.hours / maxHours) * 100}%` }}
                                >
                                    {data.hours >= maxHours * 0.2 && (
                                        <span className="text-xs font-semibold text-white">
                                            {data.hours.toFixed(1)}h
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Leyenda de carga:</span>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                                <span>Baja (&lt;6h)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-sm bg-yellow-500"></div>
                                <span>Media (6-12h)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
                                <span>Alta (12-20h)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                                <span>Muy Alta (≥20h)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
