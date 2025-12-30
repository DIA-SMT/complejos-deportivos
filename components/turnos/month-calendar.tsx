"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Search, LayoutGrid, List, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShiftDetailDialog } from "./shift-detail-dialog"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { getSportEmoji } from "@/lib/utils/sport-emojis"

interface MonthCalendarProps {
    currentDate: Date
    shifts: any[]
    headless?: boolean
}

export function MonthCalendar({ currentDate, shifts, headless = false }: MonthCalendarProps) {
    const router = useRouter()
    const [selectedShift, setSelectedShift] = useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Calendar logic
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const allDays = eachDayOfInterval({ start: startDate, end: endDate })

    // Handler to navigate months - Only used if NOT headless, but we kept it for compatibility
    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate)
        newDate.setMonth(newDate.getMonth() + offset)
        const dateString = format(newDate, 'yyyy-MM-dd')
        router.push(`/turnos?week=${dateString}`)
    }

    const handleShiftClick = (e: React.MouseEvent, shift: any) => {
        e.stopPropagation()
        setSelectedShift(shift)
        setIsDialogOpen(true)
    }

    return (
        <div className={cn("flex flex-col h-full bg-background animate-fade-in", !headless && "rounded-lg border shadow-sm")}>
            {/* Header - Only show if not headless */}
            {!headless && (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b gap-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-primary">Calendario</h1>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-2 ml-4">
                            <Button variant="outline" size="icon" onClick={() => changeMonth(-1)} className="h-8 w-8 hover-lift transition-smooth">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-semibold min-w-[120px] text-center capitalize">
                                {format(currentDate, "MMMM yyyy", { locale: es })}
                            </span>
                            <Button variant="outline" size="icon" onClick={() => changeMonth(1)} className="h-8 w-8 hover-lift transition-smooth">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b bg-blue-600 text-primary-foreground">
                {["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"].map((dayName) => (
                    <div key={dayName} className="py-2 text-center text-xs font-semibold tracking-wider">
                        {dayName}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-fr bg-muted/20 flex-1">
                {allDays.map((dayItem, index) => {
                    const dateKey = format(dayItem, 'yyyy-MM-dd')
                    const dayShifts = shifts.filter((s: any) => s.date === dateKey)
                    // Sort shifts by time
                    dayShifts.sort((a: any, b: any) => a.start_time.localeCompare(b.start_time))

                    const isCurrentMonth = isSameMonth(dayItem, monthStart)
                    const isToday = isSameDay(dayItem, new Date())

                    return (
                        <div
                            key={dateKey}
                            className={cn(
                                "min-h-[100px] md:min-h-[120px] p-1 md:p-2 border-b border-r flex flex-col transition-all duration-300 hover:bg-muted/40 hover:shadow-inner animate-fade-in",
                                !isCurrentMonth && "bg-muted/5 text-muted-foreground",
                                isToday && "bg-blue-50/50 ring-2 ring-blue-200 ring-inset"
                            )}
                            style={{ animationDelay: `${index * 20}ms` }}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span
                                    className={cn(
                                        "text-xs md:text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full transition-all duration-300",
                                        isToday ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 animate-pulse-glow" : "text-muted-foreground"
                                    )}
                                >
                                    {format(dayItem, "d")}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-1 scrollbar-none">
                                {dayShifts.map((shift: any, shiftIndex: number) => (
                                    <div
                                        key={shift.id}
                                        onClick={(e) => handleShiftClick(e, shift)}
                                        className={cn(
                                            "group relative px-1.5 py-1 rounded text-[10px] md:text-xs truncate cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-l-2 animate-slide-in-up",
                                            shift.status === 'completed' ? "bg-green-100 text-green-700 border-green-500 hover:bg-green-200" :
                                                shift.status === 'cancelled' ? "bg-red-100 text-red-700 border-red-500 hover:bg-red-200" :
                                                    "bg-blue-100 text-blue-700 border-blue-500 hover:bg-blue-200"
                                        )}
                                        style={{ animationDelay: `${shiftIndex * 50}ms` }}
                                        title={`${shift.start_time.slice(0, 5)} - ${shift.group_name || shift.court_name}`}
                                    >
                                        <span className="font-semibold mr-1">{shift.start_time.slice(0, 5)}</span>
                                        <span className="hidden md:inline">
                                            {getSportEmoji(shift.group_name || shift.court_name)} {shift.group_name || shift.court_name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            <ShiftDetailDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                shift={selectedShift}
            />
        </div>
    )
}
