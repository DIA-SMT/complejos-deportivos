'use server'

import { revalidatePath } from "next/cache"
import { requireAdmin, requireAuth } from "@/app/actions/auth"
import { getActiveComplexId } from "@/app/actions/complex-settings"
import { createClient } from "@/utils/supabase/server"

export type MemberWithCredential = {
    id: string
    first_name: string
    last_name: string
    dni: string
    phone: string | null
    email: string | null
    photo_url: string | null
    status: string
    notes: string | null
    complex_id: string
    member_credentials: Array<{
        id: string
        code: string
        membership_type: string
        enabled_activities: string[]
        issued_at: string
        expires_at: string
        status: string
    }>
}

export type CredentialWithMember = {
    id: string
    code: string
    membership_type: string
    enabled_activities: string[]
    issued_at: string
    expires_at: string
    status: string
    complex_id: string
    members: {
        id: string
        first_name: string
        last_name: string
        dni: string
        phone: string | null
        email: string | null
        photo_url: string | null
        status: string
        complexes?: { name: string; logo_url: string | null } | null
    } | null
}

export type MembershipRequest = {
    id: string
    first_name: string
    last_name: string
    dni: string
    phone: string | null
    email: string
    requested_membership_type: string
    requested_activities: string[]
    notes: string | null
    status: string
    created_at: string
    complex_id: string
    user_id: string
}

function normalizeEmail(value?: string | null) {
    return value?.trim().toLowerCase() || null
}

function generateCredentialCode() {
    const chunk = Math.random().toString(36).slice(2, 8).toUpperCase()
    return `CRED-${chunk}`
}

const membershipTypes = new Set(["mensual", "trimestral", "semestral", "anual", "staff"])

function normalizeMembershipType(value?: string | null) {
    const type = value?.trim().toLowerCase() || "mensual"
    return membershipTypes.has(type) ? type : "mensual"
}

function revalidateMemberships() {
    revalidatePath("/socios")
    revalidatePath("/complejo")
    revalidatePath("/mi-perfil")
}

export async function getMembersForActiveComplex(): Promise<MemberWithCredential[]> {
    await requireAdmin()

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()

    if (!activeComplexId) return []

    const { data, error } = await supabase
        .from("members")
        .select(`
            id,
            first_name,
            last_name,
            dni,
            phone,
            email,
            photo_url,
            status,
            notes,
            complex_id,
            member_credentials (
                id,
                code,
                membership_type,
                enabled_activities,
                issued_at,
                expires_at,
                status
            )
        `)
        .eq("complex_id", activeComplexId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching members:", error)
        return []
    }

    return (data || []) as MemberWithCredential[]
}

export async function getMembershipRequestsForActiveComplex(): Promise<MembershipRequest[]> {
    await requireAdmin()

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()

    if (!activeComplexId) return []

    const { data, error } = await supabase
        .from("membership_requests")
        .select("*")
        .eq("complex_id", activeComplexId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching membership requests:", error)
        return []
    }

    return (data || []) as MembershipRequest[]
}

export async function getMyPendingMembershipRequestForActiveComplex(): Promise<MembershipRequest | null> {
    const user = await requireAuth()
    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()

    if (!activeComplexId) return null

    const { data, error } = await supabase
        .from("membership_requests")
        .select("*")
        .eq("complex_id", activeComplexId)
        .eq("user_id", user.id)
        .eq("status", "pending")
        .maybeSingle()

    if (error) {
        console.error("Error fetching my membership request:", error)
        return null
    }

    return data as MembershipRequest | null
}

export async function getMyCredentialForActiveComplex(): Promise<CredentialWithMember | null> {
    const user = await requireAuth()
    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()

    if (!activeComplexId) return null

    const { data, error } = await supabase
        .from("member_credentials")
        .select(`
            id,
            code,
            membership_type,
            enabled_activities,
            issued_at,
            expires_at,
            status,
            complex_id,
            members (
                id,
                first_name,
                last_name,
                dni,
                phone,
                email,
                photo_url,
                status,
                complexes (name, logo_url)
            )
        `)
        .eq("complex_id", activeComplexId)
        .eq("members.email", user.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error("Error fetching my credential:", error)
        return null
    }

    return data as CredentialWithMember | null
}

export async function getCredentialByCode(code: string): Promise<CredentialWithMember | null> {
    await requireAuth()

    const supabase = await createClient()
    const credentialCode = code.trim().toUpperCase()

    if (!credentialCode) return null

    const { data, error } = await supabase
        .from("member_credentials")
        .select(`
            id,
            code,
            membership_type,
            enabled_activities,
            issued_at,
            expires_at,
            status,
            complex_id,
            members (
                id,
                first_name,
                last_name,
                dni,
                phone,
                email,
                photo_url,
                status,
                complexes (name, logo_url)
            )
        `)
        .eq("code", credentialCode)
        .maybeSingle()

    if (error) {
        console.error("Error fetching credential by code:", error)
        return null
    }

    return data as CredentialWithMember | null
}

export async function requestMembership(formData: FormData) {
    const user = await requireAuth()
    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()
    const firstName = (formData.get("firstName") as string | null)?.trim()
    const lastName = (formData.get("lastName") as string | null)?.trim()
    const dni = (formData.get("dni") as string | null)?.trim()
    const phone = (formData.get("phone") as string | null)?.trim()
    const membershipType = normalizeMembershipType(formData.get("membershipType") as string | null)
    const activitiesRaw = (formData.get("requestedActivities") as string | null)?.trim()
    const notes = (formData.get("notes") as string | null)?.trim()

    if (!activeComplexId) {
        return { error: "Primero elegi un complejo." }
    }

    if (!firstName || !lastName || !dni) {
        return { error: "Completa nombre, apellido y DNI." }
    }

    const existingCredential = await getMyCredentialForActiveComplex()

    if (existingCredential) {
        return { error: "Ya tenes una credencial asociada a este complejo." }
    }

    const { data: pendingRequest } = await supabase
        .from("membership_requests")
        .select("id")
        .eq("complex_id", activeComplexId)
        .eq("user_id", user.id)
        .eq("status", "pending")
        .maybeSingle()

    if (pendingRequest) {
        return { error: "Ya tenes una solicitud pendiente para este complejo." }
    }

    const requestedActivities = activitiesRaw
        ? activitiesRaw.split(",").map((activity) => activity.trim()).filter(Boolean)
        : []

    const { error } = await supabase
        .from("membership_requests")
        .insert({
            user_id: user.id,
            complex_id: activeComplexId,
            first_name: firstName,
            last_name: lastName,
            dni,
            phone: phone || null,
            email: user.email,
            requested_membership_type: membershipType,
            requested_activities: requestedActivities,
            notes: notes || null,
            status: "pending",
        })

    if (error) {
        console.error("Error creating membership request:", error)
        return { error: `No se pudo enviar la solicitud: ${error.message}` }
    }

    revalidateMemberships()
    return { success: true }
}

export async function createMemberWithCredential(formData: FormData) {
    await requireAdmin()

    const supabase = await createClient()
    const activeComplexId = await getActiveComplexId()
    const firstName = (formData.get("firstName") as string | null)?.trim()
    const lastName = (formData.get("lastName") as string | null)?.trim()
    const dni = (formData.get("dni") as string | null)?.trim()
    const phone = (formData.get("phone") as string | null)?.trim()
    const email = normalizeEmail(formData.get("email") as string | null)
    const photoUrl = (formData.get("photoUrl") as string | null)?.trim()
    const membershipType = normalizeMembershipType(formData.get("membershipType") as string | null)
    const expiresAt = (formData.get("expiresAt") as string | null)?.trim()
    const activitiesRaw = (formData.get("enabledActivities") as string | null)?.trim()
    const notes = (formData.get("notes") as string | null)?.trim()

    if (!activeComplexId) {
        return { error: "Primero selecciona un complejo." }
    }

    if (!firstName || !lastName || !dni || !expiresAt) {
        return { error: "Completa nombre, apellido, DNI y vencimiento." }
    }

    const { data: existingMember } = await supabase
        .from("members")
        .select("id")
        .eq("complex_id", activeComplexId)
        .eq("dni", dni)
        .maybeSingle()

    if (existingMember) {
        return { error: "Ya existe un socio con ese DNI en este complejo." }
    }

    const { data: member, error: memberError } = await supabase
        .from("members")
        .insert({
            complex_id: activeComplexId,
            first_name: firstName,
            last_name: lastName,
            dni,
            phone: phone || null,
            email,
            photo_url: photoUrl || null,
            notes: notes || null,
            status: "active",
        })
        .select("id")
        .single()

    if (memberError || !member) {
        console.error("Error creating member:", memberError)
        return { error: `No se pudo crear el socio: ${memberError?.message || "Error desconocido"}` }
    }

    const enabledActivities = activitiesRaw
        ? activitiesRaw.split(",").map((activity) => activity.trim()).filter(Boolean)
        : []

    const { error: credentialError } = await supabase
        .from("member_credentials")
        .insert({
            member_id: member.id,
            complex_id: activeComplexId,
            code: generateCredentialCode(),
            membership_type: membershipType,
            enabled_activities: enabledActivities,
            expires_at: expiresAt,
            status: "active",
        })

    if (credentialError) {
        console.error("Error creating credential:", credentialError)
        await supabase.from("members").delete().eq("id", member.id)
        return { error: `No se pudo crear la credencial: ${credentialError.message}` }
    }

    revalidateMemberships()
    return { success: true }
}

export async function approveMembershipRequest(formData: FormData) {
    await requireAdmin()

    const supabase = await createClient()
    const requestId = (formData.get("requestId") as string | null)?.trim()
    const expiresAt = (formData.get("expiresAt") as string | null)?.trim()

    if (!requestId || !expiresAt) {
        return { error: "Falta solicitud o fecha de vencimiento." }
    }

    const { data: request, error: requestError } = await supabase
        .from("membership_requests")
        .select("*")
        .eq("id", requestId)
        .eq("status", "pending")
        .maybeSingle()

    if (requestError || !request) {
        return { error: "La solicitud no existe o ya fue procesada." }
    }

    const { data: existingMember } = await supabase
        .from("members")
        .select("id")
        .eq("complex_id", request.complex_id)
        .eq("dni", request.dni)
        .maybeSingle()

    if (existingMember) {
        return { error: "Ya existe un socio con ese DNI en este complejo." }
    }

    const { data: member, error: memberError } = await supabase
        .from("members")
        .insert({
            user_id: request.user_id,
            complex_id: request.complex_id,
            first_name: request.first_name,
            last_name: request.last_name,
            dni: request.dni,
            phone: request.phone,
            email: normalizeEmail(request.email),
            status: "active",
            notes: request.notes,
        })
        .select("id")
        .single()

    if (memberError || !member) {
        console.error("Error approving member:", memberError)
        return { error: "No se pudo crear el socio." }
    }

    const { error: credentialError } = await supabase
        .from("member_credentials")
        .insert({
            member_id: member.id,
            complex_id: request.complex_id,
            code: generateCredentialCode(),
            membership_type: request.requested_membership_type,
            enabled_activities: request.requested_activities,
            expires_at: expiresAt,
            status: "active",
        })

    if (credentialError) {
        console.error("Error approving credential:", credentialError)
        await supabase.from("members").delete().eq("id", member.id)
        return { error: "No se pudo crear la credencial." }
    }

    await supabase
        .from("membership_requests")
        .update({ status: "approved" })
        .eq("id", request.id)

    revalidateMemberships()
    return { success: true }
}

export async function rejectMembershipRequest(formData: FormData) {
    await requireAdmin()

    const requestId = (formData.get("requestId") as string | null)?.trim()

    if (!requestId) {
        return { error: "Falta solicitud." }
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from("membership_requests")
        .update({ status: "rejected" })
        .eq("id", requestId)

    if (error) {
        console.error("Error rejecting membership request:", error)
        return { error: "No se pudo rechazar la solicitud." }
    }

    revalidateMemberships()
    return { success: true }
}

export async function updateMemberCredentialStatus(formData: FormData) {
    await requireAdmin()

    const credentialId = (formData.get("credentialId") as string | null)?.trim()
    const status = (formData.get("status") as string | null)?.trim()

    if (!credentialId || !status || !["active", "expired", "suspended"].includes(status)) {
        return { error: "Estado invalido." }
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from("member_credentials")
        .update({ status })
        .eq("id", credentialId)

    if (error) {
        console.error("Error updating credential status:", error)
        return { error: "No se pudo actualizar la credencial." }
    }

    revalidateMemberships()
    return { success: true }
}
