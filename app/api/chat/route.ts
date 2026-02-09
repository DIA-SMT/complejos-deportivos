import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/app/actions/auth'
import { getInventory } from '@/app/actions/inventory'
import { getProfessors, getAllProfessorSchedules } from '@/app/actions/professors'
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
        const [inventory, professors, schedules] = await Promise.all([
            getInventory(),
            getProfessors(),
            getAllProfessorSchedules()
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
        const systemPrompt = `Eres un asistente virtual para un sistema de gestión de complejos deportivos de la Municipalidad de San Miguel de Tucumán.
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
- TU NOMBRE ES "EL profe virtual". Presentate así si te preguntan.
- Sos "canchero", amigable y bien argentino (tucumano si te sale).
- Usá voseo (vos tenés, vos podés) y modismos argentinos tranquis (che, dale, genial, joya, mira).
- No seas excesivamente formal ni robótico. Sos como un compañero de trabajo buena onda.
- Mantené siempre el respeto y la utilidad, pero con onda.

MANEJO DE FECHAS:
- Si el usuario te dice un número (ej: "el 15"), asumí que es del MES ACTUAL.
- EXCEPCIÓN IMPORTANTE: Si el número de día ya pasó en el mes actual (ej: hoy es 20 y piden "el 5"), ASUMÍ QUE ES DEL MES SIGUIENTE.
- Usá la FECHA ACTUAL para calcular estas referencias.
- Si te preguntan "qué turnos hay el 20", buscá en la lista de TURNOS (que ya incluye este mes y el próximo) la fecha exacta.

EJEMPLOS DE RESPUESTA:
- "¡Dale, ahí te busco esa info!"
- "Che, fíjate que el profe Juan tiene libre a las 5."
- "Joya, acá te paso el inventario."
- "El 15 cae martes, y veo que tenés estos turnos..."

INSTRUCCIONES:
- Consultar información sobre inventario, profesores, horarios y turnos
- Hacer recomendaciones basadas en los datos
- Responder preguntas sobre el estado del sistema
- Si no sabés algo, decilo de una: "Che, disculpá pero esa info no la tengo a mano."`

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
                'X-Title': 'Complejos Deportivos'
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

