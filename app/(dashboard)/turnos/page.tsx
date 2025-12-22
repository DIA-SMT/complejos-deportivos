
export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server"
import { DayCard } from "@/components/turnos/day-card"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addWeeks, subWeeks } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface TurnosPageProps {
    searchParams: Promise<{ week?: string }>
}

export default async function TurnosPage({ searchParams }: TurnosPageProps) {
    const params = await searchParams
    const supabase = await createClient()

    const currentDate = params.week ? new Date(params.week + 'T00:00:00') : new Date()
    // Ensure monday start
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })

    const formattedRange = `${format(weekStart, "dd/MM")} - ${format(weekEnd, "dd/MM")}`

    const startIso = weekStart.toISOString().split('T')[0]
    const endIso = weekEnd.toISOString().split('T')[0]

    const { data: shifts, error } = await supabase
        .from("shifts")
        .select(`
      *,
      courts (name),
      professors (full_name)
    `)
        .gte("date", startIso)
        .lte("date", endIso)

    if (error) {
        console.error("Error fetching shifts:", error)
    }

    // Fetch recurring professor schedules
    const { data: recurringSchedules, error: scheduleError } = await supabase
        .from("professor_schedules")
        .select(`
            *,
            professors (full_name)
        `)

    if (scheduleError) {
        console.error("Error fetching recurring schedules:", scheduleError)
    }

    // Fetch class reviews for this week
    const { data: classReviews, error: reviewsError } = await supabase
        .from("class_reviews")
        .select("*")
        .gte("date", startIso)
        .lte("date", endIso)

    if (reviewsError) {
        console.error("Error fetching class reviews:", reviewsError)
    }

    const reviewsMap = new Map();
    classReviews?.forEach((review: any) => {
        const key = `${review.schedule_id}-${review.date}`;
        reviewsMap.set(key, review);
    });

    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
    // Mon-Sun included

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shiftsByDate: Record<string, any[]> = {}

    days.forEach(day => {
        const dateKey = format(day, 'yyyy-MM-dd')
        shiftsByDate[dateKey] = []

        // Map recurring schedules
        const dayName = format(day, 'EEEE', { locale: es })
        // Basic normalization to match DB 'Lunes', 'Martes', etc.
        const normalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recurringSchedules?.forEach((schedule: any) => {
            // Handle accent differences if necessary, though DB likely stores standard Spanish names
            if (schedule.day_of_week === normalizedDayName) {
                const report = reviewsMap.get(`${schedule.id}-${dateKey}`);

                shiftsByDate[dateKey].push({
                    id: `sched-${schedule.id}`, // specific prefix to avoid collision
                    originalScheduleId: schedule.id,
                    date: dateKey,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    court_name: schedule.sport, // Using sport as "location" context
                    professor_name: schedule.professors?.full_name || "Sin profesor",
                    group_name: `Clase de ${schedule.sport}`,
                    status: "scheduled",
                    report: report ? { attendance: report.attendance, notes: report.notes } : null
                })
            }
        })
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shifts?.forEach((shift: any) => {
        if (shiftsByDate[shift.date]) {
            shiftsByDate[shift.date].push({
                id: shift.id,
                start_time: shift.start_time,
                end_time: shift.end_time,
                court_name: shift.courts?.name || "Sin cancha",
                professor_name: shift.professors?.full_name || "Sin profesor",
                group_name: shift.group_name || "",
                status: shift.status
            })
        }
    })

    const prevWeek = subWeeks(weekStart, 1).toISOString().split('T')[0]
    const nextWeek = addWeeks(weekStart, 1).toISOString().split('T')[0]

    // Check if we're viewing the current week
    const today = new Date()
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 })
    const isCurrentWeek = weekStart.getTime() === currentWeekStart.getTime()

    return (
        <div className="flex flex-col space-y-4">
            {/* Compact Week Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex gap-2 text-xs sm:text-sm text-primary font-medium">
                    <Link href={`/turnos?week=${prevWeek}`} className="hover:underline">← Semana anterior</Link>
                    <span className="text-muted-foreground">|</span>
                    {isCurrentWeek ? (
                        <span className="text-muted-foreground cursor-not-allowed">Semana siguiente →</span>
                    ) : (
                        <Link href={`/turnos?week=${nextWeek}`} className="hover:underline">Semana siguiente →</Link>
                    )}
                </div>
                <div className="text-xs sm:text-sm font-bold text-foreground border-2 border-primary rounded-md px-3 py-1.5">
                    {formattedRange}
                </div>
            </div>

            {/* Grid of Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl bg-blue-50/30">
                {days.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd')
                    const dayShifts = shiftsByDate[dateKey] || []
                    // Sort by time
                    dayShifts.sort((a, b) => a.start_time.localeCompare(b.start_time))

                    return (
                        <DayCard
                            key={dateKey}
                            dayName={format(day, 'EEEE', { locale: es })}
                            dateDisplay={format(day, 'd MMM', { locale: es })}
                            shifts={dayShifts}
                        />
                    )
                })}
            </div>
        </div>
    )
}
