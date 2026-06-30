import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/utils/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function isAuthorized(request: NextRequest) {
    const cronSecret = process.env.CRON_SECRET
    const authorization = request.headers.get("authorization")

    return Boolean(cronSecret && authorization === `Bearer ${cronSecret}`)
}

function getTodayInArgentina() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date())
}

export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    const today = getTodayInArgentina()

    const { data, error } = await supabase
        .from("member_credentials")
        .update({
            status: "expired",
            updated_at: new Date().toISOString(),
        })
        .lt("expires_at", today)
        .eq("status", "active")
        .select("id")

    if (error) {
        console.error("Cron expire-memberships failed:", error)

        return NextResponse.json(
            { error: "Could not expire memberships." },
            { status: 500 },
        )
    }

    return NextResponse.json({
        ok: true,
        date: today,
        expiredCredentials: data?.length ?? 0,
    })
}
