import { SCHEDULES, HOLIDAYS } from "@/config/schedule"
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

  const schedule = SCHEDULES.find((s) => s.from === from && s.to === to)
  if (!schedule) return []

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const results: ShuttleResult[] = []

  for (const time of schedule.times) {
    if (results.length >= max) break
    const diff = toMinutes(time) - nowMinutes
    if (diff >= 0) {
      results.push({ departureTime: time, minutesRemaining: diff })
    }
  }

  return results
}

export function getNextServiceInfo(
  from: StopId,
  to: StopId,
  now: Date
): NextServiceInfo | null {
  const schedule = SCHEDULES.find((s) => s.from === from && s.to === to)
  if (!schedule || schedule.times.length === 0) return null

  const nextDay = getNextWeekday(now)
  return { date: nextDay, firstTime: schedule.times[0] }
}
