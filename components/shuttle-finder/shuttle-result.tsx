"use client"

import { ClockIcon, MoonIcon, ZapIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getNextShuttles, getNextServiceInfo, isServiceDay } from "@/lib/shuttle"
import { STOPS, ROUTE_STOP_ORDER } from "@/config/schedule"
import type { StopId } from "@/types/shuttle"

interface ShuttleResultProps {
  from: StopId
  to: StopId
  now: Date
}

function formatNextDate(date: Date): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"]
  return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`
}

function stopName(id: StopId): string {
  return STOPS.find((s) => s.id === id)?.name ?? id
}

function isValidDirection(from: StopId, to: StopId): boolean {
  const fi = ROUTE_STOP_ORDER.indexOf(from)
  const ti = ROUTE_STOP_ORDER.indexOf(to)
  return fi >= 0 && ti >= 0 && fi < ti
}

export function ShuttleResult({ from, to, now }: ShuttleResultProps) {
  // 주말·공휴일 (드롭다운이 있어도 이 컴포넌트가 호출될 수 있는 경우를 대비)
  if (!isServiceDay(now)) {
    const info = getNextServiceInfo("jeongmun", "sac1", now)
    return (
      <NoServiceNotice
        message="오늘은 운행하지 않습니다"
        nextDate={info ? formatNextDate(info.date) : undefined}
        nextTime={info?.firstTime}
      />
    )
  }

  // 역방향 선택
  if (!isValidDirection(from, to)) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        이 방향의 직행 노선이 없습니다
      </div>
    )
  }

  const shuttles = getNextShuttles(from, to, now)

  if (shuttles.length === 0) {
    const info = getNextServiceInfo(from, to, now)
    return (
      <NoServiceNotice
        message="오늘 운행이 종료되었습니다"
        nextDate={info ? formatNextDate(info.date) : undefined}
        nextTime={info?.firstTime}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {stopName(from)} → {stopName(to)}
        </span>
        <span className="text-xs text-muted-foreground">
          현재{" "}
          {String(now.getHours()).padStart(2, "0")}:
          {String(now.getMinutes()).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {shuttles.map((s) => {
          const isSoon = s.minutesRemaining === 0
          return (
            <Card
              key={s.departureTime}
              className={isSoon ? "border-2 border-foreground" : ""}
            >
              <CardContent className="flex items-center justify-between py-3 px-4">
                <div>
                  <div className="text-2xl font-bold leading-none mb-1">
                    {s.departureTime}
                  </div>
                  <div
                    className={`text-xs ${isSoon ? "font-bold" : "text-muted-foreground"}`}
                  >
                    {isSoon ? "곧 출발" : `${s.minutesRemaining}분 후`}
                  </div>
                </div>
                {isSoon ? (
                  <ZapIcon className="size-5" />
                ) : (
                  <ClockIcon className="size-5 text-muted-foreground" />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function NoServiceNotice({
  message,
  nextDate,
  nextTime,
}: {
  message: string
  nextDate?: string
  nextTime?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center border rounded-lg bg-muted/40">
      <MoonIcon className="size-7 text-muted-foreground" />
      <p className="text-sm font-semibold">{message}</p>
      {nextDate && nextTime && (
        <p className="text-xs text-muted-foreground">
          다음 운행일 ({nextDate})<br />
          첫 셔틀: <span className="font-medium">{nextTime}</span>
        </p>
      )}
    </div>
  )
}
