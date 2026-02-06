"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileDown, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface GenerateReportDialogProps {
    schedules: any[]
    reports: any[]
}

export function GenerateReportDialog({ schedules, reports }: GenerateReportDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedClass, setSelectedClass] = useState<string>("all")

    // Get unique classes for the dropdown
    const uniqueClasses = schedules.reduce((acc: any[], schedule) => {
        const key = `${schedule.sport} - ${schedule.professors.full_name}`
        if (!acc.find(item => item.key === key)) {
            acc.push({ ...schedule, key })
        }
        return acc
    }, [])

    const handleGeneratePDF = () => {
        setLoading(true)
        try {
            // Filter reports
            const filteredReports = selectedClass === "all"
                ? reports
                : reports.filter(report => {
                    const key = `${report.professor_schedules.sport} - ${report.professor_schedules.professors.full_name}`
                    return key === selectedClass
                })

            if (!filteredReports || filteredReports.length === 0) {
                toast.error("No hay reportes para la selección actual.")
                setLoading(false)
                return
            }

            const doc = new jsPDF()

            // Header
            doc.setFontSize(18)
            doc.text("Reporte Semanal de Clases", 14, 20)

            doc.setFontSize(12)
            doc.text(`Generado el: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 30)
            if (selectedClass !== "all") {
                doc.text(`Filtro: ${selectedClass}`, 14, 38)
            }

            // Table
            const tableData = filteredReports.map(report => [
                format(new Date(report.date), "dd/MM/yyyy"),
                format(new Date(report.date), "EEEE", { locale: es }),
                `${report.professor_schedules.sport} (${report.professor_schedules.start_time.slice(0, 5)} - ${report.professor_schedules.end_time.slice(0, 5)})`,
                report.professor_schedules.professors.full_name,
                report.attendance || "-",
                report.notes || "-"
            ])

            autoTable(doc, {
                startY: 45,
                head: [["Fecha", "Día", "Clase", "Profesor", "Asistencia", "Obs."]],
                body: tableData,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [41, 128, 185] }
            })

            // Save
            const fileName = `reporte_semanal_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`
            doc.save(fileName)

            toast.success("PDF generado correctamente")
            setOpen(false)

        } catch (error) {
            console.error("Error generating PDF:", error)
            toast.error("Error al generar el PDF")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2" variant="outline">
                    <FileDown className="h-4 w-4" />
                    Descargar PDF
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generar Reporte PDF</DialogTitle>
                    <DialogDescription>
                        Seleccioná los filtros para descargar el reporte semanal.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="class-select">Filtrar por Clase</Label>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger id="class-select">
                                <SelectValue placeholder="Seleccionar clase" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las clases</SelectItem>
                                {uniqueClasses.map((schedule, idx) => (
                                    <SelectItem key={idx} value={schedule.key}>
                                        {schedule.key}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleGeneratePDF} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Descargar PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
