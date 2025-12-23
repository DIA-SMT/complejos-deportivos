
import { ShiftItem } from "./shift-item"

interface ShiftDisplay {
    id: string
    start_time: string
    end_time: string
    court_name: string
    professor_name: string
    group_name: string
    status: string
    originalScheduleId?: string
    date?: string
    report?: {
        attendance: number | null
        notes: string | null
    } | null
}

interface DayCardProps {
    dayName: string
    dateDisplay: string
    shifts: ShiftDisplay[]
    isAdmin?: boolean
}

// Color mapping for each day of the week
const dayColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    lunes: {
        bg: "bg-blue-50/50",
        border: "border-blue-200",
        text: "text-blue-700",
        badge: "bg-blue-100 text-blue-700 border-blue-200"
    },
    martes: {
        bg: "bg-purple-50/50",
        border: "border-purple-200",
        text: "text-purple-700",
        badge: "bg-purple-100 text-purple-700 border-purple-200"
    },
    miércoles: {
        bg: "bg-green-50/50",
        border: "border-green-200",
        text: "text-green-700",
        badge: "bg-green-100 text-green-700 border-green-200"
    },
    jueves: {
        bg: "bg-orange-50/50",
        border: "border-orange-200",
        text: "text-orange-700",
        badge: "bg-orange-100 text-orange-700 border-orange-200"
    },
    viernes: {
        bg: "bg-pink-50/50",
        border: "border-pink-200",
        text: "text-pink-700",
        badge: "bg-pink-100 text-pink-700 border-pink-200"
    },
    sábado: {
        bg: "bg-cyan-50/50",
        border: "border-cyan-200",
        text: "text-cyan-700",
        badge: "bg-cyan-100 text-cyan-700 border-cyan-200"
    },
    domingo: {
        bg: "bg-red-50/50",
        border: "border-red-200",
        text: "text-red-700",
        badge: "bg-red-100 text-red-700 border-red-200"
    }
}

export function DayCard({ dayName, dateDisplay, shifts, isAdmin = false }: DayCardProps) {
    const shiftCount = shifts.length
    const normalizedDay = dayName.toLowerCase()
    const colors = dayColors[normalizedDay] || {
        bg: "bg-gray-50/50",
        border: "border-gray-200",
        text: "text-gray-700",
        badge: "bg-gray-100 text-gray-700 border-gray-200"
    }

    return (
        <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} text-card-foreground shadow-sm flex flex-col h-full transition-all hover:shadow-md`}>
            <div className={`p-4 border-b-2 ${colors.border} flex justify-between items-start`}>
                <div>
                    <div className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${colors.text}`}>
                        {dayName}
                    </div>
                    <div className="text-lg font-bold">{dateDisplay}</div>
                </div>
                <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${colors.badge}`}>
                    {shiftCount} turno(s)
                </div>
            </div>
            <div className="p-4 flex-1 bg-white">
                {shiftCount === 0 ? (
                    <div className="text-sm text-muted-foreground h-full flex items-center justify-center min-h-[100px] border-2 border-dashed rounded-lg border-muted/50 bg-muted/20">
                        Sin turnos asignados.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {shifts.map((shift) => (
                            <ShiftItem key={shift.id} shift={shift} isAdmin={isAdmin} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
