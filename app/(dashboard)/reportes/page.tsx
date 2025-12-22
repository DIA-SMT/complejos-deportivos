
import { createClient } from "@/utils/supabase/server"
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Calendar, ChevronLeft, ChevronRight, FileText } from "lucide-react"

interface ReportesPageProps {
    searchParams: Promise<{ week?: string }>
}

export default async function ReportesPage({ searchParams }: ReportesPageProps) {
    const params = await searchParams
    const supabase = await createClient()

    const today = new Date()
    const currentWeekStart = params.week ? parseISO(params.week) : startOfWeek(today, { weekStartsOn: 1 })

    // Ensure Monday start
    const weekStart = startOfWeek(currentWeekStart, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })

    const formattedRange = `${format(weekStart, "d 'de' MMMM", { locale: es })} - ${format(weekEnd, "d 'de' MMMM", { locale: es })}`

    const startIso = weekStart.toISOString().split('T')[0]
    const endIso = weekEnd.toISOString().split('T')[0]

    // Fetch reports with related info
    const { data: reports, error } = await supabase
        .from("class_reviews")
        .select(`
            *,
            professor_schedules (
                sport,
                start_time,
                end_time,
                professors (full_name),
                courts (name)
            )
        `)
        .gte("date", startIso)
        .lte("date", endIso)
        .order('date', { ascending: true })

    if (error) {
        console.error("Error fetching reports:", error)
    }

    // Group reports by day
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reportsByDay: Record<string, any[]> = {}

    reports?.forEach(report => {
        if (!reportsByDay[report.date]) {
            reportsByDay[report.date] = []
        }
        reportsByDay[report.date].push(report)
    })

    const prevWeek = subWeeks(weekStart, 1).toISOString().split('T')[0]
    const nextWeek = addWeeks(weekStart, 1).toISOString().split('T')[0]

    // Helper to get day name
    const getDayName = (dateStr: string) => {
        const date = parseISO(dateStr)
        const name = format(date, 'EEEE d', { locale: es })
        return name.charAt(0).toUpperCase() + name.slice(1)
    }

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Reportes Semanales</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Historial de reportes de clases, asistencia y observaciones.
                    </p>
                </div>
            </div>

            {/* Week Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card p-4 rounded-lg border shadow-sm gap-4">
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/reportes?week=${prevWeek}`}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex flex-col items-center flex-1 sm:flex-initial sm:min-w-[200px]">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">SEMANA</span>
                        <div className="flex items-center gap-2 text-sm sm:text-lg font-semibold">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-xs sm:text-base">{formattedRange}</span>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/reportes?week=${nextWeek}`}>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                    Total reportes: <span className="font-medium text-foreground">{reports?.length || 0}</span>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-6">
                {Object.keys(reportsByDay).sort().map((date) => (
                    <Card key={date}>
                        <CardHeader className="py-3 sm:py-4 bg-muted/40">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {getDayName(date)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px] sm:w-[150px]">Horario</TableHead>
                                            <TableHead className="w-[150px] sm:w-[200px]">Actividad</TableHead>
                                            <TableHead className="hidden md:table-cell w-[200px]">Profesor</TableHead>
                                            <TableHead className="w-[80px] sm:w-[100px] text-center">Asist.</TableHead>
                                            <TableHead className="hidden lg:table-cell">Observaciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportsByDay[date]?.map((report: any) => (
                                            <TableRow key={report.id}>
                                                <TableCell className="font-medium text-xs sm:text-sm">
                                                    {report.professor_schedules?.start_time?.slice(0, 5)} - {report.professor_schedules?.end_time?.slice(0, 5)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-xs sm:text-sm">{report.professor_schedules?.sport}</span>
                                                        <span className="text-xs text-muted-foreground">{report.professor_schedules?.courts?.name}</span>
                                                        <span className="text-xs text-muted-foreground md:hidden">{report.professor_schedules?.professors?.full_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-sm">{report.professor_schedules?.professors?.full_name}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
                                                        {report.attendance ?? '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell max-w-[300px]">
                                                    {report.notes ? (
                                                        <p className="text-sm text-muted-foreground italic truncate" title={report.notes}>
                                                            "{report.notes}"
                                                        </p>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Show notes on mobile below the table */}
                            <div className="lg:hidden border-t">
                                {reportsByDay[date]?.map((report: any) => (
                                    report.notes && (
                                        <div key={`notes-${report.id}`} className="p-3 border-b last:border-b-0 bg-muted/20">
                                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                                {report.professor_schedules?.start_time?.slice(0, 5)} - {report.professor_schedules?.sport}
                                            </p>
                                            <p className="text-sm text-muted-foreground italic">"{report.notes}"</p>
                                        </div>
                                    )
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {(!reports || reports.length === 0) && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        No hay reportes cargados para esta semana.
                    </div>
                )}
            </div>
        </div>
    )
}
