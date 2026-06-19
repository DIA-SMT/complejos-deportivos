"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
    approveMembershipRequest,
    rejectMembershipRequest,
    type MembershipRequest,
} from "@/app/actions/memberships"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getDefaultMembershipExpiration } from "@/lib/membership-duration"

export function MembershipRequestReviewList({ requests }: { requests: MembershipRequest[] }) {
    const [processingId, setProcessingId] = useState<string | null>(null)

    const handleApprove = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)
        const requestId = formData.get("requestId") as string

        setProcessingId(requestId)
        const result = await approveMembershipRequest(formData)
        setProcessingId(null)

        if (result?.error) {
            toast.error(result.error)
            return
        }

        toast.success("Solicitud aprobada y carnet creado")
        form.reset()
    }

    const handleReject = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const requestId = formData.get("requestId") as string

        setProcessingId(requestId)
        const result = await rejectMembershipRequest(formData)
        setProcessingId(null)

        if (result?.error) {
            toast.error(result.error)
            return
        }

        toast.success("Solicitud rechazada")
    }

    if (!requests.length) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Cuando un usuario pida asociarse desde su portal, va a aparecer aca para aprobarlo.
            </div>
        )
    }

    return (
        <div className="grid gap-3 lg:grid-cols-2">
            {requests.map((request) => {
                const isProcessing = processingId === request.id
                const expirationInputId = `expiresAt-${request.id}`

                return (
                    <div key={request.id} className="rounded-lg border p-4">
                        <div className="space-y-1">
                            <h3 className="font-semibold">{request.first_name} {request.last_name}</h3>
                            <p className="text-sm text-muted-foreground">DNI {request.dni}</p>
                            <p className="text-sm text-muted-foreground">{request.email}</p>
                            {request.phone ? (
                                <p className="text-sm text-muted-foreground">Tel. {request.phone}</p>
                            ) : null}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-md bg-muted px-2 py-1">{request.requested_membership_type}</span>
                            {request.requested_activities.map((activity) => (
                                <span key={activity} className="rounded-md bg-primary/10 px-2 py-1 text-primary">
                                    {activity}
                                </span>
                            ))}
                        </div>

                        {request.notes ? (
                            <p className="mt-3 rounded-md bg-muted p-2 text-sm text-muted-foreground">{request.notes}</p>
                        ) : null}

                        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                            <form onSubmit={handleApprove} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                <input type="hidden" name="requestId" value={request.id} />
                                <div className="grid gap-2">
                                    <Label htmlFor={expirationInputId}>Vencimiento del carnet</Label>
                                    <Input
                                        id={expirationInputId}
                                        name="expiresAt"
                                        type="date"
                                        defaultValue={getDefaultMembershipExpiration(request.requested_membership_type)}
                                        required
                                    />
                                </div>
                                <Button type="submit" size="sm" className="self-end" disabled={isProcessing}>
                                    {isProcessing ? "Procesando..." : "Aprobar"}
                                </Button>
                            </form>
                            <form onSubmit={handleReject} className="self-end">
                                <input type="hidden" name="requestId" value={request.id} />
                                <Button type="submit" variant="ghost" size="sm" className="w-full" disabled={isProcessing}>
                                    Rechazar
                                </Button>
                            </form>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
