"use client"

import { useEffect, useRef, useState } from "react"
import { LocateFixed } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
    interface Window {
        L?: any
    }
}

type LocationMapPickerProps = {
    initialLatitude?: number | null
    initialLongitude?: number | null
    markerIcon?: string
    onChange: (location: { latitude: number; longitude: number; address?: string }) => void
}

const DEFAULT_CENTER = {
    latitude: -26.82414,
    longitude: -65.2226,
}

let leafletPromise: Promise<any> | null = null

function loadLeaflet() {
    if (typeof window === "undefined") return Promise.resolve(null)
    if (window.L) return Promise.resolve(window.L)

    if (!leafletPromise) {
        leafletPromise = new Promise((resolve, reject) => {
            if (!document.querySelector('link[data-leaflet="true"]')) {
                const link = document.createElement("link")
                link.rel = "stylesheet"
                link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                link.dataset.leaflet = "true"
                document.head.appendChild(link)
            }

            const existingScript = document.querySelector<HTMLScriptElement>('script[data-leaflet="true"]')
            if (existingScript) {
                existingScript.addEventListener("load", () => resolve(window.L))
                existingScript.addEventListener("error", reject)
                return
            }

            const script = document.createElement("script")
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            script.async = true
            script.dataset.leaflet = "true"
            script.onload = () => resolve(window.L)
            script.onerror = reject
            document.body.appendChild(script)
        })
    }

    return leafletPromise
}

function formatAddress(data: any) {
    const address = data?.address || {}
    const road = address.road || address.pedestrian || address.footway || address.cycleway
    const houseNumber = address.house_number
    const neighbourhood = address.neighbourhood || address.suburb || address.city_district
    const city = address.city || address.town || address.village || address.municipality
    const state = address.state

    if (road && houseNumber) {
        return [(`${road} ${houseNumber}`), neighbourhood, city].filter(Boolean).join(", ")
    }

    if (road) {
        return [road, neighbourhood, city].filter(Boolean).join(", ")
    }

    if (data?.display_name) {
        return data.display_name.split(",").slice(0, 4).map((part: string) => part.trim()).join(", ")
    }

    return [neighbourhood, city, state].filter(Boolean).join(", ")
}

async function reverseGeocode(latitude: number, longitude: number) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${latitude}&lon=${longitude}`,
            {
                headers: {
                    Accept: "application/json",
                },
            }
        )

        if (!response.ok) return undefined

        const data = await response.json()
        const address = formatAddress(data)
        return address || undefined
    } catch {
        return undefined
    }
}

export function LocationMapPicker({
    initialLatitude,
    initialLongitude,
    markerIcon: selectedMarkerIcon = "📍",
    onChange,
}: LocationMapPickerProps) {
    const mapElementRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<any>(null)
    const markerRef = useRef<any>(null)
    const [isResolvingAddress, setIsResolvingAddress] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState({
        latitude: initialLatitude ?? DEFAULT_CENTER.latitude,
        longitude: initialLongitude ?? DEFAULT_CENTER.longitude,
    })

    useEffect(() => {
        let isMounted = true

        loadLeaflet().then((L) => {
            if (!isMounted || !L || !mapElementRef.current || mapRef.current) return

            const map = L.map(mapElementRef.current, {
                zoomControl: true,
                attributionControl: true,
            }).setView([selectedLocation.latitude, selectedLocation.longitude], initialLatitude && initialLongitude ? 15 : 12)

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap",
            }).addTo(map)

            const leafletMarkerIcon = L.divIcon({
                className: "osm-location-marker",
                html: `<span><i>${selectedMarkerIcon}</i></span>`,
                iconSize: [38, 48],
                iconAnchor: [19, 44],
            })

            const marker = L.marker([selectedLocation.latitude, selectedLocation.longitude], {
                icon: leafletMarkerIcon,
            }).addTo(map)

            markerRef.current = marker
            mapRef.current = map

            map.on("click", async (event: any) => {
                const nextLocation = {
                    latitude: Number(event.latlng.lat.toFixed(7)),
                    longitude: Number(event.latlng.lng.toFixed(7)),
                }

                marker.setLatLng([nextLocation.latitude, nextLocation.longitude])
                setSelectedLocation(nextLocation)
                setIsResolvingAddress(true)
                const address = await reverseGeocode(nextLocation.latitude, nextLocation.longitude)
                setIsResolvingAddress(false)
                onChange({ ...nextLocation, address })
            })
        })

        return () => {
            isMounted = false
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
                markerRef.current = null
            }
        }
    }, [])

    const useCurrentLocation = () => {
        if (!navigator.geolocation || !mapRef.current || !markerRef.current) return

        navigator.geolocation.getCurrentPosition(async (position) => {
            const nextLocation = {
                latitude: Number(position.coords.latitude.toFixed(7)),
                longitude: Number(position.coords.longitude.toFixed(7)),
            }

            mapRef.current.setView([nextLocation.latitude, nextLocation.longitude], 16)
            markerRef.current.setLatLng([nextLocation.latitude, nextLocation.longitude])
            setSelectedLocation(nextLocation)
            setIsResolvingAddress(true)
            const address = await reverseGeocode(nextLocation.latitude, nextLocation.longitude)
            setIsResolvingAddress(false)
            onChange({ ...nextLocation, address })
        })
    }

    return (
        <div className="grid gap-2">
            <div className="relative overflow-hidden rounded-lg border">
                <div ref={mapElementRef} className="h-72 w-full bg-muted" />
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={useCurrentLocation}
                    className="absolute right-3 top-3 z-[500] shadow-sm"
                >
                    <LocateFixed className="h-4 w-4" />
                    Mi ubicacion
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">
                {isResolvingAddress
                    ? "Buscando direccion del punto seleccionado..."
                    : "Hace click en el mapa para marcar la ubicacion exacta. Se guardara la direccion visible y las coordenadas quedan como dato tecnico."}
            </p>
        </div>
    )
}
