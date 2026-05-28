"use client"

import { useState, useEffect } from "react"
import { ArrowDownIcon, BusIcon, CalendarOffIcon } from "lucide-react"
import { StopSelector } from "./stop-selector"
import { isServiceDay, getNextServiceInfo } from "@/lib/shuttle"
import type { StopId } from "@/types/shuttle"

function formatNextServiceDate(date: Date): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"]
  const mo = date.getMonth() + 1
  const d = date.getDate()
  const dow = days[date.getDay()]
  return `${mo}/${d}(${dow})`
}

export function ShuttleFinder({ now: nowProp }: { now?: Date } = {}) {
  const [now, setNow] = useState(nowProp ?? new Date())
  const [from, setFrom] = useState<StopId | "">("")
  const [to, setTo] = useState<StopId | "">("")

  useEffect(() => {
    if (nowProp) return
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [nowProp])

  const serviceDay = isServiceDay(now)

  if (!serviceDay) {
    const firstStop = "bonkwan"
    const secondStop = "yeongu"
    const info = getNextServiceInfo(firstStop, secondStop, now)
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <CalendarOffIcon className="size-10 text-muted-foreground" />
        <p className="font-semibold">오늘은 운행하지 않습니다</p>
        {info && (
          <p className="text-sm text-muted-foreground">
            다음 운행일 ({formatNextServiceDate(info.date)})<br />
            <span className="font-medium">{info.firstTime}</span>부터 운행합니다
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <StopSelector
        label="출발 정류장"
        value={from}
        onChange={setFrom}
        disabledId={to || null}
      />

      <div className="flex justify-center text-muted-foreground">
        <ArrowDownIcon className="size-4" />
      </div>

      <StopSelector
        label="도착 정류장"
        value={to}
        onChange={setTo}
        disabledId={from || null}
      />

      <div className="mt-2">
        {!from || !to ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center border rounded-lg bg-muted/40">
            <BusIcon className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              출발지와 도착지를 선택하면<br />다음 셔틀을 안내해 드립니다
            </p>
          </div>
        ) : (
          <div data-testid="result-area" data-from={from} data-to={to} />
        )}
      </div>
    </div>
  )
}
