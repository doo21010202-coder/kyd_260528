"use client"

import { useEffect, useRef } from "react"
import { STOPS } from "@/config/schedule"
import type { StopId } from "@/types/shuttle"

declare global {
  interface Window {
    kakao: any
  }
}

interface ShuttleMapProps {
  from: StopId
  to?: StopId | ""
}

export function ShuttleMap({ from, to }: ShuttleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    console.log("[ShuttleMap] effect from:", from, "to:", to)
    console.log("[ShuttleMap] container:", !!containerRef.current)
    console.log("[ShuttleMap] kakao:", typeof window.kakao, "maps:", typeof window.kakao?.maps)

    if (!containerRef.current) return

    function initMap() {
      console.log("[ShuttleMap] initMap called, container:", !!containerRef.current)
      if (!containerRef.current) return

      const fromStop = STOPS.find((s) => s.id === from)
      const toStop = to ? STOPS.find((s) => s.id === to) : undefined

      console.log("[ShuttleMap] fromStop:", fromStop?.name, fromStop?.lat, fromStop?.lng)
      if (!fromStop?.lat || !fromStop?.lng) return

      const fromLatLng = new window.kakao.maps.LatLng(fromStop.lat, fromStop.lng)

      if (!mapRef.current) {
        console.log("[ShuttleMap] creating map")
        mapRef.current = new window.kakao.maps.Map(containerRef.current, {
          center: fromLatLng,
          level: 4,
        })
        console.log("[ShuttleMap] map created:", !!mapRef.current)
      }

      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current = []

      const fromMarker = new window.kakao.maps.Marker({
        position: fromLatLng,
        title: fromStop.name,
      })
      fromMarker.setMap(mapRef.current)
      markersRef.current.push(fromMarker)

      if (toStop?.lat && toStop?.lng) {
        const toLatLng = new window.kakao.maps.LatLng(toStop.lat, toStop.lng)
        const toMarker = new window.kakao.maps.Marker({
          position: toLatLng,
          title: toStop.name,
        })
        toMarker.setMap(mapRef.current)
        markersRef.current.push(toMarker)

        const bounds = new window.kakao.maps.LatLngBounds()
        bounds.extend(fromLatLng)
        bounds.extend(toLatLng)
        mapRef.current.setBounds(bounds, 80)
      } else {
        mapRef.current.setCenter(fromLatLng)
        mapRef.current.setLevel(4)
      }
      console.log("[ShuttleMap] done")
    }

    if (window.kakao?.maps) {
      console.log("[ShuttleMap] maps exists, calling maps.load()")
      window.kakao.maps.load(initMap)
      return
    }

    console.log("[ShuttleMap] waiting for kakao-maps-ready event")
    const handler = () => {
      console.log("[ShuttleMap] kakao-maps-ready received")
      window.kakao.maps.load(initMap)
    }
    window.addEventListener("kakao-maps-ready", handler, { once: true })
    return () => window.removeEventListener("kakao-maps-ready", handler)
  }, [from, to])

  return (
    <div
      ref={containerRef}
      className="w-full h-52 rounded-lg bg-muted overflow-hidden"
    />
  )
}
