"use client"

import { useEffect, useRef, useState } from "react"
import { LocateFixed } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
    interface Window {
        L?: LeafletApi
    }
}

type LeafletMap = {
    setView: (coordinates: [number, number], zoom: number) => LeafletMap
    on: (event: "click", callback: (event: LeafletClickEvent) => void) => void
    remove: () => void
}

type LeafletMarker = {
    addTo: (map: LeafletMap) => LeafletMarker
    setLatLng: (coordinates: [number, number]) => void
}

type LeafletClickEvent = {
    latlng: {
        lat: number
        lng: number
    }
}

type LeafletApi = {
    map: (element: HTMLElement, options: {
        zoomControl: boolean
        attributionControl: boolean
        scrollWheelZoom: boolean
        dragging: boolean
        touchZoom: boolean
        doubleClickZoom: boolean
        boxZoom: boolean
        keyboard: boolean
    }) => LeafletMap
    tileLayer: (url: string, options: { maxZoom: number; attribution: string }) => { addTo: (map: LeafletMap) => void }
    divIcon: (options: { className: string; html: string; iconSize: [number, number]; iconAnchor: [number, number] }) => unknown
    marker: (coordinates: [number, number], options: { icon: unknown }) => LeafletMarker
}

type NominatimResponse = {
    display_name?: string
    address?: {
        road?: string
        pedestrian?: string
        footway?: string
        cycleway?: string
        house_number?: string
        neighbourhood?: string
        suburb?: string
        city_district?: string
        city?: string
        town?: string
        village?: string
        municipality?: string
        state?: string
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

let leafletPromise: Promise<LeafletApi | null> | null = null

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
                existingScript.addEventListener("load", () => resolve(window.L ?? null))
                existingScript.addEventListener("error", reject)
                return
            }

            const script = document.createElement("script")
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            script.async = true
            script.dataset.leaflet = "true"
            script.onload = () => resolve(window.L ?? null)
            script.onerror = reject
            document.body.appendChild(script)
        })
    }

    return leafletPromise
}

function formatAddress(data: NominatimResponse) {
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

        const data = (await response.json()) as NominatimResponse
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
    const mapWrapperRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<LeafletMap | null>(null)
    const markerRef = useRef<LeafletMarker | null>(null)
    const onChangeRef = useRef(onChange)
    const markerIconRef = useRef(selectedMarkerIcon)
    const initialZoomRef = useRef(initialLatitude && initialLongitude ? 15 : 12)
    const [isMapOpen, setIsMapOpen] = useState(false)
    const [isResolvingAddress, setIsResolvingAddress] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState({
        latitude: initialLatitude ?? DEFAULT_CENTER.latitude,
        longitude: initialLongitude ?? DEFAULT_CENTER.longitude,
    })
    const selectedLocationRef = useRef(selectedLocation)

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
        markerIconRef.current = selectedMarkerIcon
    }, [selectedMarkerIcon])

    useEffect(() => {
        selectedLocationRef.current = selectedLocation
    }, [selectedLocation])

    useEffect(() => {
        let isMounted = true
        if (!isMapOpen) return

        loadLeaflet().then((L) => {
            if (!isMounted || !L || !mapElementRef.current || mapRef.current) return

            const currentLocation = selectedLocationRef.current
            const map = L.map(mapElementRef.current, {
                zoomControl: true,
                attributionControl: true,
                scrollWheelZoom: false,
                dragging: false,
                touchZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                keyboard: false,
            }).setView([currentLocation.latitude, currentLocation.longitude], initialZoomRef.current)

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap",
            }).addTo(map)

            const leafletMarkerIcon = L.divIcon({
                className: "osm-location-marker",
                html: `<span><i>${markerIconRef.current}</i></span>`,
                iconSize: [38, 48],
                iconAnchor: [19, 44],
            })

            const marker = L.marker([currentLocation.latitude, currentLocation.longitude], {
                icon: leafletMarkerIcon,
            }).addTo(map)

            markerRef.current = marker
            mapRef.current = map

            map.on("click", async (event) => {
                const nextLocation = {
                    latitude: Number(event.latlng.lat.toFixed(7)),
                    longitude: Number(event.latlng.lng.toFixed(7)),
                }

                marker.setLatLng([nextLocation.latitude, nextLocation.longitude])
                setSelectedLocation(nextLocation)
                setIsResolvingAddress(true)
                const address = await reverseGeocode(nextLocation.latitude, nextLocation.longitude)
                setIsResolvingAddress(false)
                onChangeRef.current({ ...nextLocation, address })
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
    }, [isMapOpen])

    useEffect(() => {
        const wrapper = mapWrapperRef.current
        if (!wrapper) return

        const keepPageScroll = (event: WheelEvent) => {
            event.stopImmediatePropagation()
        }

        wrapper.addEventListener("wheel", keepPageScroll, { capture: true, passive: true })
        return () => wrapper.removeEventListener("wheel", keepPageScroll, { capture: true })
    }, [])

    const useCurrentLocation = () => {
        if (!navigator.geolocation) return
        setIsMapOpen(true)

        navigator.geolocation.getCurrentPosition(async (position) => {
            const nextLocation = {
                latitude: Number(position.coords.latitude.toFixed(7)),
                longitude: Number(position.coords.longitude.toFixed(7)),
            }

            mapRef.current?.setView([nextLocation.latitude, nextLocation.longitude], 16)
            markerRef.current?.setLatLng([nextLocation.latitude, nextLocation.longitude])
            setSelectedLocation(nextLocation)
            setIsResolvingAddress(true)
            const address = await reverseGeocode(nextLocation.latitude, nextLocation.longitude)
            setIsResolvingAddress(false)
            onChange({ ...nextLocation, address })
        })
    }

    return (
        <div className="grid gap-2">
            <div className="rounded-lg border bg-muted/20 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium">Ubicacion en mapa</p>
                        <p className="text-xs text-muted-foreground">
                            {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsMapOpen((value) => !value)}>
                            {isMapOpen ? "Ocultar mapa" : "Editar en mapa"}
                        </Button>
                        <Button type="button" variant="secondary" size="sm" onClick={useCurrentLocation}>
                            <LocateFixed className="h-4 w-4" />
                            Mi ubicacion
                        </Button>
                    </div>
                </div>
            </div>

            {isMapOpen ? (
                <div ref={mapWrapperRef} className="relative touch-pan-y overflow-hidden rounded-lg border">
                    <div ref={mapElementRef} className="h-72 w-full bg-muted" />
                </div>
            ) : null}

            <p className="text-xs text-muted-foreground">
                {isResolvingAddress
                    ? "Buscando direccion del punto seleccionado..."
                    : "Hace click en el mapa para marcar la ubicacion exacta. Se guardara la direccion visible y las coordenadas quedan como dato tecnico."}
            </p>
        </div>
    )
}
