import { addMonths, addYears, format } from "date-fns"

export function getDefaultMembershipExpiration(type?: string | null) {
    const today = new Date()
    const normalizedType = type?.trim().toLowerCase() || "mensual"
    let expirationDate: Date

    if (normalizedType === "trimestral") {
        expirationDate = addMonths(today, 3)
    } else if (normalizedType === "semestral") {
        expirationDate = addMonths(today, 6)
    } else if (normalizedType === "anual") {
        expirationDate = addYears(today, 1)
    } else {
        expirationDate = addMonths(today, 1)
    }

    return format(expirationDate, "yyyy-MM-dd")
}
