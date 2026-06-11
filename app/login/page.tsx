import { getComplexBranding } from "@/app/actions/complex-settings"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
    const branding = await getComplexBranding()

    return <LoginForm branding={branding} />
}
