export type ComplexBranding = {
    id?: string
    appName: string
    complexName: string
    displayName: string
    logoSrc: string
    logoAlt: string
    address: string
    latitude: number | null
    longitude: number | null
    mapMarkerIcon: string
    description: string
    footerLines: string[]
    assistantName: string
}

export const complexConfig: ComplexBranding = {
    appName: "DeportesMunicipio",
    complexName: "Complejo Deportivo Ledesma",
    displayName: "Complejo Deportivo Ledesma",
    logoSrc: "/logoMuni-sm.png",
    logoAlt: "Logo del complejo deportivo",
    address: "",
    latitude: null,
    longitude: null,
    mapMarkerIcon: "📍",
    description: "Sistema configurable para gestionar complejos deportivos",
    footerLines: [
        "Marca, datos y asistente personalizables",
        "Preparado para operar como SaaS",
    ],
    assistantName: "Migue",
}

export const newComplexBranding: ComplexBranding = {
    ...complexConfig,
    id: undefined,
    complexName: "",
    displayName: "Nuevo complejo",
    address: "",
    latitude: null,
    longitude: null,
    mapMarkerIcon: "🏅",
    description: "",
    footerLines: complexConfig.footerLines,
}

type ComplexBrandingRecord = {
    id?: string | null
    name?: string | null
    app_name?: string | null
    logo_url?: string | null
    address?: string | null
    latitude?: number | null
    longitude?: number | null
    map_marker_icon?: string | null
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
    const appName = complexConfig.appName
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
        address: record.address?.trim() || complexConfig.address,
        latitude: record.latitude ?? complexConfig.latitude,
        longitude: record.longitude ?? complexConfig.longitude,
        mapMarkerIcon: record.map_marker_icon?.trim() || complexConfig.mapMarkerIcon,
        description: record.description?.trim() || complexConfig.description,
        footerLines,
        assistantName: complexConfig.assistantName,
    }
}
