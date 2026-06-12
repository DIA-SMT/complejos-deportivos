export type CalendarShift = {
    id: string
    originalScheduleId?: string
    date: string
    start_time: string
    end_time: string
    court_name: string
    professor_name: string
    group_name?: string
    status: string
    report?: {
        attendance: number | null
        notes: string | null
    } | null
}
