import Link from "next/link"
import {
    getMembersForActiveComplex,
    getMembershipRequestsForActiveComplex,
    updateMemberCredentialStatus,
} from "@/app/actions/memberships"
import { AdminMemberCreateForm } from "@/components/members/admin-member-create-form"
import { MembershipRequestReviewList } from "@/components/members/membership-request-review-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function SociosPage() {
    const [members, requests] = await Promise.all([
        getMembersForActiveComplex(),
        getMembershipRequestsForActiveComplex(),
    ])
    const pendingRequests = requests.filter((request) => request.status === "pending")

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-medium text-primary">Socios</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">Credenciales y carnets</h1>
                <p className="mt-2 text-muted-foreground">
                    Carga socios del complejo, genera una credencial digital y administra su estado.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Solicitudes de asociacion</CardTitle>
                    <CardDescription>
                        {pendingRequests.length ? `${pendingRequests.length} solicitud(es) pendiente(s).` : "No hay solicitudes pendientes."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MembershipRequestReviewList requests={pendingRequests} />
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Nuevo socio</CardTitle>
                        <CardDescription>La credencial se genera automaticamente.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AdminMemberCreateForm />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Socios cargados</CardTitle>
                        <CardDescription>{members.length} socio(s) en el complejo activo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {members.length ? (
                            <div className="space-y-3">
                                {members.map((member) => {
                                    const credential = member.member_credentials[0]

                                    return (
                                        <div key={member.id} className="rounded-xl border border-blue-100/90 bg-white/55 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                <div>
                                                    <h3 className="font-semibold">{member.first_name} {member.last_name}</h3>
                                                    <p className="text-sm text-muted-foreground">DNI {member.dni}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email || "Sin email asociado"}</p>
                                                    {credential ? (
                                                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                                            <span className="rounded-md bg-muted px-2 py-1 font-mono">{credential.code}</span>
                                                            <span className="rounded-md bg-muted px-2 py-1">{credential.membership_type}</span>
                                                            <span className="rounded-md bg-muted px-2 py-1">Vence {credential.expires_at}</span>
                                                            <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">{credential.status}</span>
                                                        </div>
                                                    ) : null}
                                                </div>
                                                {credential ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={`/credencial/${encodeURIComponent(credential.code)}`}>
                                                                Ver carnet
                                                            </Link>
                                                        </Button>
                                                        <form action={async (formData) => {
                                                            "use server"
                                                            await updateMemberCredentialStatus(formData)
                                                        }}>
                                                            <input type="hidden" name="credentialId" value={credential.id} />
                                                            <input type="hidden" name="status" value={credential.status === "suspended" ? "active" : "suspended"} />
                                                            <Button type="submit" variant="ghost" size="sm">
                                                                {credential.status === "suspended" ? "Reactivar" : "Suspender"}
                                                            </Button>
                                                        </form>
                                                    </div>
                                                ) : null}
                                            </div>
                                            {member.notes ? (
                                                <p className="mt-3 rounded-md bg-muted p-2 text-sm text-muted-foreground">{member.notes}</p>
                                            ) : null}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                Todavia no hay socios cargados.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
