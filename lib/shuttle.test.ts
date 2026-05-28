import { describe, it, expect } from "vitest"
import {
  isServiceDay,
  getNextWeekday,
  getNextShuttles,
  getNextServiceInfo,
} from "./shuttle"

function d(dateStr: string, timeStr?: string): Date {
  const [y, mo, day] = dateStr.split("-").map(Number)
  if (timeStr) {
    const [h, m] = timeStr.split(":").map(Number)
    return new Date(y, mo - 1, day, h, m, 0, 0)
  }
  return new Date(y, mo - 1, day, 0, 0, 0, 0)
}

describe("isServiceDay", () => {
  it("평일은 true", () => {
    // 2026-05-28 목요일
    expect(isServiceDay(d("2026-05-28"))).toBe(true)
  })

  it("토요일은 false", () => {
    // 2026-05-30 토요일
    expect(isServiceDay(d("2026-05-30"))).toBe(false)
  })

  it("일요일은 false", () => {
    // 2026-05-31 일요일
    expect(isServiceDay(d("2026-05-31"))).toBe(false)
  })

  it("공휴일(신정 2026-01-01)은 false", () => {
    expect(isServiceDay(d("2026-01-01"))).toBe(false)
  })
})

describe("getNextWeekday", () => {
  it("금요일 다음 평일은 월요일", () => {
    // 2026-05-29 금요일 → 2026-06-01 월요일
    const result = getNextWeekday(d("2026-05-29"))
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(5) // 6월 = index 5
    expect(result.getDate()).toBe(1)
  })

  it("목요일 다음 평일은 금요일", () => {
    // 2026-05-28 목요일 → 2026-05-29 금요일
    const result = getNextWeekday(d("2026-05-28"))
    expect(result.getDate()).toBe(29)
  })
})

describe("getNextShuttles", () => {
  it("평일 14:12 본관→연구동: 다음 3개 반환, 첫 번째 14:30 / 18분 후", () => {
    const results = getNextShuttles("bonkwan", "yeongu", d("2026-05-28", "14:12"))
    expect(results).toHaveLength(3)
    expect(results[0].departureTime).toBe("14:30")
    expect(results[0].minutesRemaining).toBe(18)
  })

  it("남은 시간 0분인 셔틀은 목록에 포함되고 minutesRemaining === 0", () => {
    const results = getNextShuttles("bonkwan", "yeongu", d("2026-05-28", "14:30"))
    expect(results[0].departureTime).toBe("14:30")
    expect(results[0].minutesRemaining).toBe(0)
  })

  it("마지막 셔틀 이후(23:00)는 빈 배열", () => {
    const results = getNextShuttles("bonkwan", "yeongu", d("2026-05-28", "23:00"))
    expect(results).toHaveLength(0)
  })

  it("주말(토요일)은 빈 배열", () => {
    const results = getNextShuttles("bonkwan", "yeongu", d("2026-05-30", "14:12"))
    expect(results).toHaveLength(0)
  })

  it("A→B와 B→A 시간표가 독립적으로 다름 (양방향 독립 불변 규칙)", () => {
    const ab = getNextShuttles("bonkwan", "yeongu", d("2026-05-28", "09:00"))
    const ba = getNextShuttles("yeongu", "bonkwan", d("2026-05-28", "09:00"))
    // bonkwan→yeongu 첫 셔틀: 09:00 (minutesRemaining=0)
    // yeongu→bonkwan 첫 셔틀: 09:30 (minutesRemaining=30)
    expect(ab[0].departureTime).toBe("09:00")
    expect(ba[0].departureTime).toBe("09:30")
    expect(ab[0].minutesRemaining).not.toBe(ba[0].minutesRemaining)
  })
})

describe("getNextServiceInfo", () => {
  it("목요일 23:00 → 다음 운행일 금요일, 첫 셔틀 09:00", () => {
    const info = getNextServiceInfo("bonkwan", "yeongu", d("2026-05-28", "23:00"))
    expect(info).not.toBeNull()
    expect(info!.date.getDate()).toBe(29) // 금요일
    expect(info!.firstTime).toBe("09:00")
  })

  it("금요일 23:00 → 다음 운행일 월요일(6/1)", () => {
    const info = getNextServiceInfo("bonkwan", "yeongu", d("2026-05-29", "23:00"))
    expect(info!.date.getMonth()).toBe(5) // 6월
    expect(info!.date.getDate()).toBe(1)  // 1일(월)
  })
})
