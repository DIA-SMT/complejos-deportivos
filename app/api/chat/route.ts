import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/app/actions/auth'
import { getInventory } from '@/app/actions/inventory'
import { getProfessors, getAllProfessorSchedules } from '@/app/actions/professors'
import { getComplexBranding } from '@/app/actions/complex-settings'
import { eachDayOfInterval, format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const { message, conversationHistory = [] } = await request.json()

        if (!message) {
            return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
        }

        // Obtener datos del sistema
        const [inventory, professors, schedules, branding] = await Promise.all([
            getInventory(),
            getProfessors(),
            getAllProfessorSchedules(),
            getComplexBranding()
        ])

        // Obtener turnos del mes actual (para cubrir consultas por fechas numéricas)
        const supabase = await createClient()
        const today = new Date()
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0)

        console.log('--- DEBUG CHAT API ---')
        console.log('Range Start:', monthStart.toISOString().split('T')[0])
        console.log('Range End:', monthEnd.toISOString().split('T')[0])

        const { data: shifts, error: shiftError } = await supabase
            .from('shifts')
            .select('*, courts(name), professors(full_name)')
            .gte('date', monthStart.toISOString().split('T')[0])
            .lte('date', monthEnd.toISOString().split('T')[0])

        if (shiftError) console.error('Error fetching shifts:', shiftError)

        // Combinar turnos reales con horarios recurrentes ("virtual shifts")
        // Lógica replicada de app/(dashboard)/turnos/page.tsx
        const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
        const formattedShifts: any[] = []

        // 1. Agregar turnos reales de la base de datos
        shifts?.forEach((shift: any) => {
            formattedShifts.push({
                id: shift.id,
                date: shift.date,
                start_time: shift.start_time,
                end_time: shift.end_time,
                court_name: shift.courts?.name || "Sin cancha",
                professor_name: shift.professors?.full_name || "Sin profesor",
                status: shift.status,
                type: 'real' // Marker for debug/clarity
            })
        })

        // 2. Generar turnos virtuales desde horarios recurrentes
        allDays.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayName = format(day, 'EEEE', { locale: es })
            // Normalizar nombre del día (ej: "lunes" -> "Lunes")
            const normalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

            schedules?.forEach((schedule: any) => {
                if (schedule.day_of_week === normalizedDayName) {
                    // Verificar si ya existe un turno real para este horario (para no duplicar)
                    // Nota: Esta verificación es simple; en un sistema ideal chequearíamos solapamientos exactos.
                    // Por ahora asumimos que si hay un turno real, pisa al virtual si coinciden exactamente,
                    // pero para el chat es mejor mostrar todo.

                    formattedShifts.push({
                        id: `sched-${schedule.id}-${dateKey}`, // ID virtual
                        date: dateKey,
                        start_time: schedule.start_time,
                        end_time: schedule.end_time,
                        court_name: schedule.sport + " (Clase)", // Usamos deporte como 'locación' descriptiva si no hay cancha
                        professor_name: schedule.professors?.full_name || "Sin profesor",
                        status: "programado", // Status por defecto para clases regulares
                        type: 'virtual'
                    })
                }
            })
        })

        // Ordenar por fecha y hora
        formattedShifts.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.start_time}`)
            const dateB = new Date(`${b.date}T${b.start_time}`)
            return dateA.getTime() - dateB.getTime()
        })

        // Preparar contexto del sistema
        const systemContext = {
            inventario: inventory || [],
            profesores: professors || [],
            horarios: schedules || [],
            turnos: formattedShifts, // Usamos la lista combinada
            usuario: {
                email: user.email,
                rol: user.role
            }
        }

        // Formatear fecha actual para el contexto
        const todayFormatted = today.toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        // Construir el prompt del sistema
        const systemPrompt = `Eres un asistente virtual para ${branding.displayName}, dentro de un sistema de gestion de complejos deportivos.
Tienes acceso a la siguiente información:

FECHA ACTUAL: ${todayFormatted}

INVENTARIO:
${JSON.stringify(systemContext.inventario, null, 2)}

PROFESORES:
${JSON.stringify(systemContext.profesores.map((p: any) => ({
            nombre: p.full_name,
            email: p.email,
            especialidad: p.specialty,
            horarios: p.professor_schedules?.map((s: any) => ({
                dia: s.day_of_week,
                hora_inicio: s.start_time,
                hora_fin: s.end_time,
                deporte: s.sport
            }))
        })), null, 2)}

HORARIOS DE PROFESORES:
${JSON.stringify(systemContext.horarios.map((s: any) => ({
            profesor: s.professors?.full_name,
            dia: s.day_of_week,
            hora_inicio: s.start_time,
            hora_fin: s.end_time,
            deporte: s.sport
        })), null, 2)}

TURNOS (Mes actual y siguiente - Incluye clases regulares):
${JSON.stringify(systemContext.turnos.map((t: any) => ({
            fecha: t.date,
            hora_inicio: t.start_time,
            hora_fin: t.end_time,
            actividad: t.court_name, // Mapped from court_name logic above
            profesor: t.professor_name,
            estado: t.status,
            tipo: t.type // 'real' vs 'virtual'
        })), null, 2)}

TU PERSONALIDAD:
- TU NOMBRE ES "${branding.assistantName}". Presentate asi si te preguntan.
- Sos un asistente publico del complejo deportivo, pensado para orientar a vecinos, socios y visitantes.
- Usa un tono claro, amable, cercano y respetuoso. Podes usar voseo, pero evita sonar excesivamente informal.
- No asumas que la persona trabaja en el complejo. Explica la informacion como si fuera para un ciudadano que consulta desde una landing publica.
- Si una consulta requiere gestion interna, indica que debe comunicarse con administracion o acercarse al complejo.

MANEJO DE FECHAS:
- Si el usuario te dice un numero (ej: "el 15"), asumi que es del MES ACTUAL.
- EXCEPCION IMPORTANTE: Si el numero de dia ya paso en el mes actual (ej: hoy es 20 y piden "el 5"), ASUMI QUE ES DEL MES SIGUIENTE.
- Usa la FECHA ACTUAL para calcular estas referencias.
- Si te preguntan "que turnos hay el 20", busca en la lista de TURNOS (que ya incluye este mes y el proximo) la fecha exacta.

EJEMPLOS DE RESPUESTA:
- "Hola, te cuento las actividades disponibles para esa fecha."
- "Para el 15 encontre estos horarios disponibles."
- "Esa informacion conviene confirmarla con administracion del complejo."
- "No tengo ese dato cargado por ahora, pero puedo ayudarte con horarios, clases y espacios disponibles."

INSTRUCCIONES:
- Responder consultas publicas sobre actividades, clases, horarios, espacios y disponibilidad.
- No revelar informacion sensible o administrativa que no sea necesaria para el ciudadano.
- No prometas reservas confirmadas ni cambios de datos: hoy solo informas.
- Si no sabes algo, decilo con claridad y ofrece una alternativa de consulta.`

        // Construir historial de conversación
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...conversationHistory.slice(-10), // Últimos 10 mensajes para contexto
            {
                role: 'user',
                content: message
            }
        ]

        // Llamar a OpenRouter
        const openRouterApiKey = process.env.OPENROUTER_API_KEY
        if (!openRouterApiKey) {
            return NextResponse.json(
                { error: 'OpenRouter API key no configurada' },
                { status: 500 }
            )
        }

        const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openRouterApiKey}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-Title': branding.appName
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000
            })
        })

        if (!response.ok) {
            const error = await response.text()
            console.error('OpenRouter error:', error)
            return NextResponse.json(
                { error: 'Error al comunicarse con el asistente' },
                { status: 500 }
            )
        }

        const data = await response.json()
        const assistantMessage = data.choices[0]?.message?.content || 'No pude generar una respuesta.'

        return NextResponse.json({
            message: assistantMessage,
            usage: data.usage
        })

    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}


