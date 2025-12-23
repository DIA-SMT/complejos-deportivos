import { ClassReportDialog } from "./class-report-dialog"
import { ClipboardList, CheckCircle2 } from "lucide-react"

interface ShiftItemProps {
    shift: {
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
    isAdmin?: boolean
}

export function ShiftItem({ shift, isAdmin = false }: ShiftItemProps) {
    const isRecurring = !!shift.originalScheduleId;
    const hasReport = !!shift.report;

    return (
        <div className="group relative rounded-lg border bg-card text-card-foreground shadow-sm p-3 mb-2 flex flex-col gap-1 border-l-4 border-l-primary/20 hover:bg-accent/50 transition-colors">
            {isRecurring && shift.date && isAdmin && (
                <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                    <ClassReportDialog
                        scheduleId={shift.originalScheduleId!}
                        date={shift.date}
                        professorName={shift.professor_name}
                        courtName={shift.court_name}
                        groupName={shift.group_name}
                        existingReport={shift.report}
                        trigger={
                            <button className={`p-1 rounded-md transition-colors ${hasReport ? 'text-green-600 hover:bg-green-100' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                                {hasReport ? <CheckCircle2 className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                            </button>
                        }
                    />
                </div>
            )}

            <div className="flex items-center justify-between pr-6">
                <span className="font-bold text-sm">
                    {shift.court_name} • {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                </span>
            </div>
            <div className="text-sm text-muted-foreground">
                Profesor: {shift.professor_name}
            </div>
            <div className="text-sm text-muted-foreground">
                {shift.group_name}
            </div>
            {hasReport && shift.report?.attendance != null && (
                <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {shift.report.attendance} alumnos
                </div>
            )}
            {!hasReport && (
                <div className="flex gap-2 mt-1 text-xs text-muted-foreground/70">
                    <span>Sin turno anterior</span>
                    <span>•</span>
                    <span>Sin turno siguiente</span>
                </div>
            )}
        </div>
    )
}
