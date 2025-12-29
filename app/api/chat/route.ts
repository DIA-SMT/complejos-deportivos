import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/app/actions/auth'
import { getInventory } from '@/app/actions/inventory'
import { getProfessors, getAllProfessorSchedules } from '@/app/actions/professors'

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

        // Obtener turnos de la semana actual
        const supabase = await createClient()
        const today = new Date()
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay() + 1) // Lunes
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6) // Domingo

        const { data: shifts } = await supabase
            .from('shifts')
            .select('*, courts(name), professors(full_name)')
            .gte('date', weekStart.toISOString().split('T')[0])
            .lte('date', weekEnd.toISOString().split('T')[0])

        // Preparar contexto del sistema
        const systemContext = {
            inventario: inventory || [],
            profesores: professors || [],
            horarios: schedules || [],
            turnos: shifts || [],
            usuario: {
                email: user.email,
                rol: user.role
            }
        }

        // Construir el prompt del sistema
        const systemPrompt = `Eres un asistente virtual para un sistema de gestión de complejos deportivos de la Municipalidad de San Miguel de Tucumán.
Tienes acceso a la siguiente información:

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

TURNOS DE ESTA SEMANA:
${JSON.stringify(systemContext.turnos.map((t: any) => ({
            fecha: t.date,
            hora_inicio: t.start_time,
            hora_fin: t.end_time,
            cancha: t.courts?.name,
            profesor: t.professors?.full_name,
            estado: t.status
        })), null, 2)}

TU PERSONALIDAD:
- Sos "canchero", amigable y bien argentino (tucumano si te sale).
- Usá voseo (vos tenés, vos podés) y modismos argentinos tranquis (che, dale, genial, joya, mira).
- No seas excesivamente formal ni robótico. Sos como un compañero de trabajo buena onda.
- Mantené siempre el respeto y la utilidad, pero con onda.

EJEMPLOS DE RESPUESTA:
- "¡Dale, ahí te busco esa info!"
- "Che, fíjate que el profe Juan tiene libre a las 5."
- "Joya, acá te paso el inventario."

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

