import Link from "next/link"
import {
    approveMembershipRequest,
    createMemberWithCredential,
    getMembersForActiveComplex,
    getMembershipRequestsForActiveComplex,
    rejectMembershipRequest,
    updateMemberCredentialStatus,
} from "@/app/actions/memberships"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

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
                    {pendingRequests.length ? (
                        <div className="grid gap-3 lg:grid-cols-2">
                            {pendingRequests.map((request) => (
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
                                        <form action={async (formData) => {
                                            "use server"
                                            await approveMembershipRequest(formData)
                                        }} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                            <input type="hidden" name="requestId" value={request.id} />
                                            <Input name="expiresAt" type="date" aria-label="Vencimiento del carnet" required />
                                            <Button type="submit" size="sm">Aprobar</Button>
                                        </form>
                                        <form action={async (formData) => {
                                            "use server"
                                            await rejectMembershipRequest(formData)
                                        }}>
                                            <input type="hidden" name="requestId" value={request.id} />
                                            <Button type="submit" variant="ghost" size="sm" className="w-full">
                                                Rechazar
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                            Cuando un usuario pida asociarse desde su portal, va a aparecer aca para aprobarlo.
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Nuevo socio</CardTitle>
                        <CardDescription>La credencial se genera automaticamente.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={async (formData) => {
                            "use server"
                            await createMemberWithCredential(formData)
                        }} className="grid gap-4">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                <div className="grid gap-2">
                                    <Label htmlFor="firstName">Nombre</Label>
                                    <Input id="firstName" name="firstName" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastName">Apellido</Label>
                                    <Input id="lastName" name="lastName" required />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dni">DNI</Label>
                                <Input id="dni" name="dni" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefono</Label>
                                <Input id="phone" name="phone" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email del usuario</Label>
                                <Input id="email" name="email" type="email" placeholder="Debe coincidir con su cuenta para verlo en el portal" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="photoUrl">Foto URL opcional</Label>
                                <Input id="photoUrl" name="photoUrl" placeholder="https://..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="membershipType">Tipo de membresia</Label>
                                <Select name="membershipType" defaultValue="mensual">
                                    <SelectTrigger id="membershipType" className="w-full">
                                        <SelectValue placeholder="Selecciona una membresia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mensual">Mensual</SelectItem>
                                        <SelectItem value="trimestral">Trimestral</SelectItem>
                                        <SelectItem value="semestral">Semestral</SelectItem>
                                        <SelectItem value="anual">Anual</SelectItem>
                                        <SelectItem value="staff">Profesor / staff</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="expiresAt">Vencimiento</Label>
                                <Input id="expiresAt" name="expiresAt" type="date" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="enabledActivities">Actividades habilitadas</Label>
                                <Input id="enabledActivities" name="enabledActivities" placeholder="Futbol, Padel, Gimnasio" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Observaciones internas</Label>
                                <Textarea id="notes" name="notes" />
                            </div>
                            <Button type="submit">Crear credencial</Button>
                        </form>
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
                                        <div key={member.id} className="rounded-lg border p-4">
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
                                                            <Link href={`/credencial/${credential.code}`}>Ver carnet</Link>
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
