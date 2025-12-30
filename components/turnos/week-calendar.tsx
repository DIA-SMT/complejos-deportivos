"use client"

import { useState } from "react"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ShiftDetailDialog } from "./shift-detail-dialog"
import { getSportEmoji } from "@/lib/utils/sport-emojis"

interface WeekCalendarProps {
    currentDate: Date
    shifts: any[]
}

export function WeekCalendar({ currentDate, shifts }: WeekCalendarProps) {
    const [selectedShift, setSelectedShift] = useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
    const hours = Array.from({ length: 16 }, (_, i) => i + 8) // 08:00 to 23:00

    const handleShiftClick = (e: React.MouseEvent, shift: any) => {
        e.stopPropagation()
        setSelectedShift(shift)
        setIsDialogOpen(true)
    }

    const getShiftStyle = (shift: any) => {
        const [startHour, startMinute] = shift.start_time.split(':').map(Number)
        const [endHour, endMinute] = shift.end_time.split(':').map(Number)

        const startMinutesTotal = (startHour - 8) * 60 + startMinute
        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute)

        return {
            top: `${(startMinutesTotal / (16 * 60)) * 100}%`,
            height: `${(durationMinutes / (16 * 60)) * 100}%`
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background rounded-b-lg border-x border-b shadow-sm">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b bg-blue-600 text-primary-foreground">
                <div className="p-2 border-r text-center text-xs font-medium text-primary-foreground/80 flex items-center justify-center border-blue-500">
                    Hora
                </div>
                {days.map((day) => {
                    const isToday = isSameDay(day, new Date())
                    return (
                        <div key={day.toString()} className={cn(
                            "p-2 text-center border-r border-blue-500 last:border-r-0 flex flex-col items-center justify-center min-w-[100px]",
                            isToday && "bg-blue-700/50"
                        )}>
                            <span className="text-xs text-primary-foreground/80 uppercase">{format(day, 'EEE', { locale: es })}</span>
                            <span className={cn(
                                "text-sm font-bold h-7 w-7 flex items-center justify-center rounded-full mt-1",
                                isToday ? "bg-white text-blue-600" : "text-primary-foreground"
                            )}>
                                {format(day, 'd')}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Calendar Body */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="grid grid-cols-8 min-h-[800px] relative">
                    {/* Time Column */}
                    <div className="border-r bg-muted/10">
                        {hours.map((hour) => (
                            <div key={hour} className="h-[50px] border-b text-xs text-muted-foreground p-1 text-right relative">
                                <span className="absolute -top-2 right-1">{`${hour}:00`}</span>
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    {days.map((day) => {
                        const dateKey = format(day, 'yyyy-MM-dd')
                        const dayShifts = shifts.filter((s: any) => s.date === dateKey)

                        return (
                            <div key={dateKey} className="border-r last:border-r-0 relative border-b-0">
                                {/* Grid lines */}
                                {hours.map((hour) => (
                                    <div key={hour} className="h-[50px] border-b" />
                                ))}

                                {/* Events */}
                                {dayShifts.map((shift: any) => (
                                    <div
                                        key={shift.id}
                                        onClick={(e) => handleShiftClick(e, shift)}
                                        style={getShiftStyle(shift)}
                                        className={cn(
                                            "absolute inset-x-1 rounded p-1 text-[10px] overflow-hidden cursor-pointer hover:brightness-95 hover:shadow-md transition-all border-l-2 z-10",
                                            shift.status === 'completed' ? "bg-green-100 text-green-700 border-green-500" :
                                                shift.status === 'cancelled' ? "bg-red-100 text-red-700 border-red-500" :
                                                    "bg-blue-100 text-blue-700 border-blue-500"
                                        )}
                                        title={`${shift.start_time.slice(0, 5)} - ${shift.group_name || shift.court_name}`}
                                    >
                                        <div className="font-bold leading-tight">
                                            {getSportEmoji(shift.group_name || shift.court_name)} {shift.group_name || shift.court_name}
                                        </div>
                                        <div className="hidden lg:block text-[9px] opacity-90">{shift.court_name}</div>
                                        <div className="text-[9px] mt-0.5 font-medium">{shift.start_time.slice(0, 5)}</div>
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                </div>
            </div>

            <ShiftDetailDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                shift={selectedShift}
            />
        </div>
    )
}
