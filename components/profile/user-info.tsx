"use client"

import { UserProfile } from "@/app/actions/auth"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Shield } from "lucide-react"

interface UserInfoProps {
    user: UserProfile
}

export function UserInfo({ user }: UserInfoProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold">{user.email}</p>
                    <Badge 
                        variant={user.role === 'admin' ? 'default' : 'secondary'} 
                        className="mt-1"
                    >
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </Badge>
                </div>
            </div>

            <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Rol</p>
                        <p className="font-medium capitalize">{user.role === 'admin' ? 'Administrador' : 'Usuario común'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

