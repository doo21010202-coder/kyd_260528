import { ROUTE_STOP_ORDER, SCHEDULE_RUNS, HOLIDAYS } from "@/config/schedule"
import type { ShuttleResult, NextServiceInfo, StopId } from "@/types/shuttle"

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${mo}-${d}`
}

export function isServiceDay(date: Date): boolean {
  const day = date.getDay()
  if (day === 0 || day === 6) return false
  return !HOLIDAYS.includes(formatDate(date))
}

export function getNextWeekday(date: Date): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + 1)
  next.setHours(0, 0, 0, 0)
  while (!isServiceDay(next)) {
    next.setDate(next.getDate() + 1)
  }
  return next
}

export function getNextShuttles(
  from: StopId,
  to: StopId,
  now: Date,
  max = 3
): ShuttleResult[] {
  if (!isServiceDay(now)) return []

  const fromIdx = ROUTE_STOP_ORDER.indexOf(from)
  const toIdx = ROUTE_STOP_ORDER.indexOf(to)

  // 유효하지 않은 방향(역방향 포함) 처리
  if (fromIdx < 0 || toIdx < 0 || fromIdx >= toIdx) return []

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const results: ShuttleResult[] = []

  for (const run of SCHEDULE_RUNS) {
    if (results.length >= max) break

    const fromTime = run.times[fromIdx]
    const toTime = run.times[toIdx]

    // 출발지 또는 도착지에 미정차인 회차 제외
    if (!fromTime || !toTime) continue

    const diff = toMinutes(fromTime) - nowMinutes
    if (diff >= 0) {
      results.push({ departureTime: fromTime, minutesRemaining: diff })
    }
  }

  return results
}

export function getNextServiceInfo(
  from: StopId,
  to: StopId,
  now: Date
): NextServiceInfo | null {
  const fromIdx = ROUTE_STOP_ORDER.indexOf(from)
  const toIdx = ROUTE_STOP_ORDER.indexOf(to)
  if (fromIdx < 0 || toIdx < 0 || fromIdx >= toIdx) return null

  // 출발지에 정차하는 첫 번째 회차의 시각
  const firstTime = SCHEDULE_RUNS.find((r) => r.times[fromIdx] !== null)
    ?.times[fromIdx]
  if (!firstTime) return null

  return { date: getNextWeekday(now), firstTime }
}
