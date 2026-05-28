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
    if (!containerRef.current) return

    function initMap() {
      if (!containerRef.current) return

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

      // 기존 마커 제거
      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current = []

      // 출발 마커
      const fromMarker = new window.kakao.maps.Marker({
        position: fromLatLng,
        title: fromStop.name,
      })
      fromMarker.setMap(mapRef.current)
      markersRef.current.push(fromMarker)

      // 도착 마커
      if (toStop?.lat && toStop?.lng) {
        const toLatLng = new window.kakao.maps.LatLng(toStop.lat, toStop.lng)
        const toMarker = new window.kakao.maps.Marker({
          position: toLatLng,
          title: toStop.name,
        })
        toMarker.setMap(mapRef.current)
        markersRef.current.push(toMarker)

        // 두 마커가 모두 보이도록 영역 조정
        const bounds = new window.kakao.maps.LatLngBounds()
        bounds.extend(fromLatLng)
        bounds.extend(toLatLng)
        mapRef.current.setBounds(bounds, 80)
      } else {
        mapRef.current.setCenter(fromLatLng)
        mapRef.current.setLevel(4)
      }
    }

    if (window.kakao?.maps) {
      // SDK 스크립트 실행 완료 — maps.load()가 readyState(0/1/2)를 자동 처리
      window.kakao.maps.load(initMap)
      return
    }

    // SDK 스크립트 아직 미로드 — KakaoMapScript onLoad 이벤트 대기
    const handler = () => window.kakao.maps.load(initMap)
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
