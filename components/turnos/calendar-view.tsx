"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { MonthCalendar } from "./month-calendar"
import { WeekCalendar } from "./week-calendar"

interface CalendarViewProps {
    currentDate: Date
    shifts: any[]
}

export function CalendarView({ currentDate, shifts }: CalendarViewProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get view from URL or default to 'week'
    const viewParam = searchParams.get('view')
    const [view, setView] = useState<'month' | 'week'>(viewParam === 'month' ? 'month' : 'week')

    // Handler to navigate dates
    const changeDate = (offset: number) => {
        const newDate = new Date(currentDate)
        if (view === 'month') {
            newDate.setMonth(newDate.getMonth() + offset)
        } else {
            newDate.setDate(newDate.getDate() + (offset * 7))
        }

        const dateString = format(newDate, 'yyyy-MM-dd')
        router.push(`/turnos?week=${dateString}&view=${view}`)
    }

    const handleViewChange = (newView: 'month' | 'week') => {
        setView(newView)
        // Update URL to persist view preference
        const dateString = format(currentDate, 'yyyy-MM-dd')
        router.push(`/turnos?week=${dateString}&view=${newView}`)
    }

    return (
        <div className="flex flex-col h-full bg-background rounded-lg border shadow-sm">
            {/* Shared Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b gap-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-primary">Calendario</h1>
                </div>

                {/* Navigation and Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center bg-muted rounded-lg p-1">
                        <Button
                            variant={view === 'week' ? "secondary" : "ghost"}
                            size="sm"
                            className={`h-8 px-3 rounded-md ${view === 'week' ? "bg-background shadow-sm text-primary font-medium" : "text-muted-foreground"}`}
                            onClick={() => handleViewChange('week')}
                        >
                            Semana
                        </Button>
                        <Button
                            variant={view === 'month' ? "secondary" : "ghost"}
                            size="sm"
                            className={`h-8 px-3 rounded-md ${view === 'month' ? "bg-background shadow-sm text-primary font-medium" : "text-muted-foreground"}`}
                            onClick={() => handleViewChange('month')}
                        >
                            Mes
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="icon" onClick={() => changeDate(-1)} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-semibold min-w-[140px] text-center capitalize">
                            {view === 'month'
                                ? format(currentDate, "MMMM yyyy", { locale: es })
                                : `Semana ${format(currentDate, "d/M", { locale: es })}`
                            }
                        </span>
                        <Button variant="outline" size="icon" onClick={() => changeDate(1)} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content View */}
            <div className="flex-1 min-h-0">
                {view === 'month' ? (
                    // We render a strict month calendar grid here. 
                    // Note: modify MonthCalendar to accept className or remove its own header if reusing
                    // Since I created MonthCalendar with Header included previously, I should refactor it or just conditionally hide header inside it.
                    // For speed, I'll assume MonthCalendar handles its inner grid if I pass a prop or I'll just rely on this wrapper replacing the header.
                    // actually `MonthCalendar` from previous step has the Header baked in. I should probably use a `MonthCalendarGrid` or refactor `MonthCalendar`.
                    // Let's assume for this step I will refactor `components/turnos/month-calendar.tsx` NEXT to remove the header.
                    <MonthCalendar currentDate={currentDate} shifts={shifts} headless={true} />
                ) : (
                    <WeekCalendar currentDate={currentDate} shifts={shifts} />
                )}
            </div>
        </div>
    )
}
