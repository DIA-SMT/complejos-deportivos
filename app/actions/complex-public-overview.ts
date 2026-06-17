'use server'

import { addDays } from "date-fns"
import { requireAuth } from "@/app/actions/auth"
import { getActiveComplexId, getComplexBranding } from "@/app/actions/complex-settings"
import { getCourts, getSports } from "@/app/actions/facilities"
import { createClient } from "@/utils/supabase/server"

export async function getComplexPublicOverview() {
    await requireAuth()

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()
    const today = new Date()
    const startDate = today.toISOString().slice(0, 10)
    const endDate = addDays(today, 14).toISOString().slice(0, 10)

    if (!activeComplexId) {
        return {
            activeComplexId: null,
            branding: await getComplexBranding(null),
            sports: await getSports(),
            courts: [],
            professors: [],
            schedules: [],
            shifts: [],
            reservationRequests: [],
        }
    }

    const [
        branding,
        sports,
        courts,
        professorsResult,
        schedulesResult,
        shiftsResult,
        reservationRequestsResult,
    ] = await Promise.all([
        getComplexBranding(activeComplexId),
        getSports(),
        getCourts({ complexId: activeComplexId }),
        supabase
            .from("professors")
            .select("id, full_name, email, specialty, status")
            .eq("complex_id", activeComplexId)
            .order("full_name", { ascending: true }),
        supabase
            .from("professor_schedules")
            .select(`
                id,
                day_of_week,
                start_time,
                end_time,
                sport,
                description,
                professors (full_name),
                courts (name)
            `)
            .eq("complex_id", activeComplexId)
            .order("day_of_week", { ascending: true })
            .order("start_time", { ascending: true }),
        supabase
            .from("shifts")
            .select(`
                id,
                court_id,
                date,
                start_time,
                end_time,
                status,
                price,
                courts (name),
                professors (full_name)
            `)
            .eq("complex_id", activeComplexId)
            .gte("date", startDate)
            .lte("date", endDate)
            .order("date", { ascending: true })
            .order("start_time", { ascending: true }),
        supabase
            .from("reservation_requests")
            .select("id, court_id, preferred_date, preferred_time, status")
            .eq("complex_id", activeComplexId)
            .gte("preferred_date", startDate)
            .lte("preferred_date", endDate)
            .in("status", ["pending", "confirmed"])
            .order("preferred_date", { ascending: true })
            .order("preferred_time", { ascending: true }),
    ])

    if (professorsResult.error) {
        console.error("Error fetching public professors:", professorsResult.error)
    }

    if (schedulesResult.error) {
        console.error("Error fetching public schedules:", schedulesResult.error)
    }

    if (shiftsResult.error) {
        console.error("Error fetching public shifts:", shiftsResult.error)
    }

    if (reservationRequestsResult.error) {
        console.error("Error fetching public reservation requests:", reservationRequestsResult.error)
    }

    return {
        activeComplexId,
        branding,
        sports,
        courts,
        professors: professorsResult.data || [],
        schedules: schedulesResult.data || [],
        shifts: shiftsResult.data || [],
        reservationRequests: reservationRequestsResult.data || [],
    }
}
