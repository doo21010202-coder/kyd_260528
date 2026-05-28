"use client"

import { useEffect, useRef } from "react"
import { STOPS } from "@/config/schedule"
import type { StopId } from "@/types/shuttle"

declare global {
  interface Window { kakao: any }
}

// 모듈 레벨 싱글톤 — 중복 로드 방지
let sdkPromise: Promise<void> | null = null

function getKakaoMaps(key: string): Promise<void> {
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise<void>((resolve) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(resolve)
      return
    }
    const script = document.createElement("script")
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`
    script.onload = () => window.kakao.maps.load(resolve)
    document.head.appendChild(script)
  })
  return sdkPromise
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
    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY
    if (!key || !containerRef.current) return

    let cancelled = false

    getKakaoMaps(key).then(() => {
      if (cancelled || !containerRef.current) return

      const fromStop = STOPS.find((s) => s.id === from)
      const toStop = to ? STOPS.find((s) => s.id === to) : undefined
      if (!fromStop?.lat || !fromStop?.lng) return

      const fromLatLng = new window.kakao.maps.LatLng(fromStop.lat, fromStop.lng)

      if (!mapRef.current) {
        mapRef.current = new window.kakao.maps.Map(containerRef.current, {
          center: fromLatLng,
          level: 4,
        })
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
    })

    return () => { cancelled = true }
  }, [from, to])

  return (
    <div
      ref={containerRef}
      className="w-full h-52 rounded-lg bg-muted overflow-hidden"
    />
  )
}
