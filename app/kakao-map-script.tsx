"use client"

import Script from "next/script"

export function KakaoMapScript() {
  if (!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY) return null

  return (
    <Script
      id="kakao-maps-sdk"
      src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
      strategy="afterInteractive"
      onLoad={() => {
        window.kakao.maps.load(() => {
          window.dispatchEvent(new Event("kakao-maps-ready"))
        })
      }}
    />
  )
}
