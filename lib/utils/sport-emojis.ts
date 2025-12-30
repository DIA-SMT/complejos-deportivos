export const getSportEmoji = (sportName: string): string => {
    const lowerName = sportName.toLowerCase()

    if (lowerName.includes('futbol') || lowerName.includes('fútbol')) return '⚽'
    if (lowerName.includes('basket') || lowerName.includes('básquet') || lowerName.includes('basquet')) return '🏀'
    if (lowerName.includes('tenis') || lowerName.includes('tennis')) return '🎾'
    if (lowerName.includes('voley') || lowerName.includes('vóley')) return '🏐'
    if (lowerName.includes('padel') || lowerName.includes('pádel')) return '🎾'
    if (lowerName.includes('hockey')) return '🏑'
    if (lowerName.includes('rugby')) return '🏉'
    if (lowerName.includes('natacion') || lowerName.includes('natación')) return '🏊'
    if (lowerName.includes('boxeo')) return '🥊'
    if (lowerName.includes('gym') || lowerName.includes('gimnasio')) return '🏋️'

    return '🏅' // default
}
