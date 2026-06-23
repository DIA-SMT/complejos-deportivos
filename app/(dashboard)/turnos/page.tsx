
export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarView } from "@/components/turnos/calendar-view"
import { getActiveComplexId } from "@/app/actions/complex-settings"
import { getAdminReservationRequestsForActiveComplex } from "@/app/actions/public-reservations"
import { ReservationRequestsPanel } from "@/components/turnos/reservation-requests-panel"
import type { CalendarShift } from "@/components/turnos/types"
import type { Tables } from "@/types/database.types"

interface TurnosPageProps {
    searchParams: Promise<{ week?: string }>
}

export default async function TurnosPage({ searchParams }: TurnosPageProps) {
    const params = await searchParams
    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()
    const reservationRequests = await getAdminReservationRequestsForActiveComplex()

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
    const shiftsQuery = supabase
        .from("shifts")
        .select(`
          *,
          courts (name),
          professors (full_name)
        `)
        .gte("date", startIso)
        .lte("date", endIso)

    const { data: shifts, error } = activeComplexId
        ? await shiftsQuery.eq("complex_id", activeComplexId)
        : { data: [], error: null }

    if (error) {
        console.error("Error fetching shifts:", error)
    }

    // Fetch recurring professor schedules
    const recurringSchedulesQuery = supabase
        .from("professor_schedules")
        .select(`
            *,
            professors (full_name)
        `)

    const { data: recurringSchedules, error: scheduleError } = activeComplexId
        ? await recurringSchedulesQuery.eq("complex_id", activeComplexId)
        : { data: [], error: null }

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

    const reviewsMap = new Map<string, Tables<"class_reviews">>();
    classReviews?.forEach((review) => {
        const key = `${review.schedule_id}-${review.date}`;
        reviewsMap.set(key, review);
    });

    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    const formattedShifts: CalendarShift[] = []

    // Add normal shifts
    shifts?.forEach((shift) => {
        const shiftWithGroup = shift as typeof shift & { group_name?: string | null }

        formattedShifts.push({
            id: shift.id,
            date: shift.date,
            start_time: shift.start_time,
            end_time: shift.end_time,
            court_name: shift.courts?.name || "Sin cancha",
            professor_name: shift.professors?.full_name || "Sin profesor",
            group_name: shiftWithGroup.group_name || "",
            status: shift.status || "scheduled"
        })
    })

    // Add recurring schedules
    allDays.forEach(day => {
        const dateKey = format(day, 'yyyy-MM-dd')
        const dayName = format(day, 'EEEE', { locale: es })
        const normalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

        recurringSchedules?.forEach((schedule) => {
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
        <div className="space-y-6">
            <ReservationRequestsPanel requests={reservationRequests} />
            <div className="relative flex h-[calc(100vh-9rem)] w-full flex-col overflow-hidden rounded-2xl">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/turnos.png"
                    alt="Fondo Turnos"
                    className="w-full h-full object-cover opacity-15"
                    style={{ objectFit: 'cover' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/80"></div>
            </div>

            <div className="relative z-10 flex-1 h-full">
                <CalendarView currentDate={currentDate} shifts={formattedShifts} />
            </div>
            </div>
        </div>
    )
}
