export type ComplexBranding = {
    id?: string
    appName: string
    complexName: string
    displayName: string
    logoSrc: string
    logoAlt: string
    description: string
    footerLines: string[]
    assistantName: string
}

export const complexConfig: ComplexBranding = {
    appName: "Complejo SaaS",
    complexName: "Complejo Deportivo Ledesma",
    displayName: "Complejo Deportivo Ledesma",
    logoSrc: "/logoMuni-sm.png",
    logoAlt: "Logo del complejo deportivo",
    description: "Sistema configurable para gestionar complejos deportivos",
    footerLines: [
        "Marca, datos y asistente personalizables",
        "Preparado para operar como SaaS",
    ],
    assistantName: "Migue",
}

type ComplexBrandingRecord = {
    id?: string | null
    name?: string | null
    app_name?: string | null
    logo_url?: string | null
    description?: string | null
    footer_line_1?: string | null
    footer_line_2?: string | null
    assistant_name?: string | null
}

export function createComplexBranding(record?: ComplexBrandingRecord | null): ComplexBranding {
    if (!record) {
        return complexConfig
    }

    const complexName = record.name?.trim() || complexConfig.complexName
    const appName = record.app_name?.trim() || complexConfig.appName
    const logoSrc = record.logo_url?.trim() || complexConfig.logoSrc
    const footerLines = [
        record.footer_line_1?.trim() || complexConfig.footerLines[0],
        record.footer_line_2?.trim() || complexConfig.footerLines[1],
    ].filter(Boolean)

    return {
        id: record.id || undefined,
        appName,
        complexName,
        displayName: complexName,
        logoSrc,
        logoAlt: `Logo de ${complexName}`,
        description: record.description?.trim() || complexConfig.description,
        footerLines,
        assistantName: record.assistant_name?.trim() || complexConfig.assistantName,
    }
}
