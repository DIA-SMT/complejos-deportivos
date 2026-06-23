'use server'

import { addDays, format } from "date-fns"
import { requireAuth } from "@/app/actions/auth"
import { getComplexBranding, getUserActiveComplexId } from "@/app/actions/complex-settings"
import { getCourts, getSports } from "@/app/actions/facilities"
import { createClient } from "@/utils/supabase/server"

export async function getComplexPublicOverview() {
    await requireAuth()

    const supabase = await createClient()
    const activeComplexId = await getUserActiveComplexId()
    const today = new Date()
    const startDate = format(today, "yyyy-MM-dd")
    const endDate = format(addDays(today, 14), "yyyy-MM-dd")

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
            .select("id, full_name, email, specialty")
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
