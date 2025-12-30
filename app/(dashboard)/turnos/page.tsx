
export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarView } from "@/components/turnos/calendar-view"

interface TurnosPageProps {
    searchParams: Promise<{ week?: string }>
}

export default async function TurnosPage({ searchParams }: TurnosPageProps) {
    const params = await searchParams
    const supabase = await createClient()

    // Default to current date or selected "week" (which acts as anchor date)
    const currentDate = params.week ? new Date(params.week + 'T00:00:00') : new Date()

    // Calculate full month grid range
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const startIso = calendarStart.toISOString().split('T')[0]
    const endIso = calendarEnd.toISOString().split('T')[0]

    // Fetch shifts for the whole calendar range
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

    // Fetch class reviews
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

    // Generate formatted shifts list including recurring ones
    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedShifts: any[] = []

    // Add normal shifts
    shifts?.forEach((shift: any) => {
        formattedShifts.push({
            id: shift.id,
            date: shift.date,
            start_time: shift.start_time,
            end_time: shift.end_time,
            court_name: shift.courts?.name || "Sin cancha",
            professor_name: shift.professors?.full_name || "Sin profesor",
            group_name: shift.group_name || "",
            status: shift.status
        })
    })

    // Add recurring schedules
    allDays.forEach(day => {
        const dateKey = format(day, 'yyyy-MM-dd')
        const dayName = format(day, 'EEEE', { locale: es })
        const normalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recurringSchedules?.forEach((schedule: any) => {
            if (schedule.day_of_week === normalizedDayName) {
                const report = reviewsMap.get(`${schedule.id}-${dateKey}`);

                formattedShifts.push({
                    id: `sched-${schedule.id}-${dateKey}`,
                    originalScheduleId: schedule.id,
                    date: dateKey,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    court_name: schedule.sport,
                    professor_name: schedule.professors?.full_name || "Sin profesor",
                    group_name: `Clase de ${schedule.sport}`,
                    status: "scheduled",
                    report: report ? { attendance: report.attendance, notes: report.notes } : null
                })
            }
        })
    })

    return (
        <div className="h-[calc(100vh-6rem)] w-full">
            <CalendarView currentDate={currentDate} shifts={formattedShifts} />
        </div>
    )
}
