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
    expect(isServiceDay(d("2026-05-28"))).toBe(true)
  })
  it("토요일은 false", () => {
    expect(isServiceDay(d("2026-05-30"))).toBe(false)
  })
  it("일요일은 false", () => {
    expect(isServiceDay(d("2026-05-31"))).toBe(false)
  })
  it("공휴일(신정 2026-01-01)은 false", () => {
    expect(isServiceDay(d("2026-01-01"))).toBe(false)
  })
})

describe("getNextWeekday", () => {
  it("금요일 다음 평일은 월요일(6/1)", () => {
    const result = getNextWeekday(d("2026-05-29"))
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(5)
    expect(result.getDate()).toBe(1)
  })
  it("목요일 다음 평일은 금요일", () => {
    const result = getNextWeekday(d("2026-05-28"))
    expect(result.getDate()).toBe(29)
  })
})

describe("getNextShuttles — 실제 시간표", () => {
  it("평일 08:10 정문→SAC연구동1: 다음 3개 반환, 첫 번째 08:12 / 2분 후", () => {
    const results = getNextShuttles("jeongmun", "sac1", d("2026-05-28", "08:10"))
    expect(results).toHaveLength(3)
    expect(results[0].departureTime).toBe("08:12")
    expect(results[0].minutesRemaining).toBe(2)
  })

  it("남은 시간 0분인 셔틀은 목록에 포함되고 minutesRemaining === 0", () => {
    const results = getNextShuttles("jeongmun", "sac1", d("2026-05-28", "08:12"))
    expect(results[0].departureTime).toBe("08:12")
    expect(results[0].minutesRemaining).toBe(0)
  })

  it("마지막 셔틀 이후(19:00)는 빈 배열", () => {
    const results = getNextShuttles("jeongmun", "sac1", d("2026-05-28", "19:00"))
    expect(results).toHaveLength(0)
  })

  it("주말(토요일)은 빈 배열", () => {
    const results = getNextShuttles("jeongmun", "sac1", d("2026-05-30", "08:10"))
    expect(results).toHaveLength(0)
  })

  it("역방향(SAC연구동1→정문)은 빈 배열 (단방향 노선)", () => {
    const results = getNextShuttles("sac1", "jeongmun", d("2026-05-28", "08:00"))
    expect(results).toHaveLength(0)
  })

  it("복지관뒤 미정차 회차(9회차 13:10 정문출발)는 복지관뒤 출발로 포함되지 않음", () => {
    // 9회차: 복지관뒤 null, 정문 13:10
    // 복지관뒤→sac1 조회 시 9회차 제외
    const results = getNextShuttles("bokji-dwi", "sac1", d("2026-05-28", "13:05"))
    // 다음 가능 회차: 10회차 복지관뒤 13:40
    expect(results[0].departureTime).toBe("13:40")
  })
})

describe("getNextServiceInfo", () => {
  it("목요일 23:00 → 다음 운행일 금요일, 첫 셔틀 08:12(정문 기준)", () => {
    const info = getNextServiceInfo("jeongmun", "sac1", d("2026-05-28", "23:00"))
    expect(info).not.toBeNull()
    expect(info!.date.getDate()).toBe(29)
    expect(info!.firstTime).toBe("08:12")
  })

  it("금요일 23:00 → 다음 운행일 월요일(6/1)", () => {
    const info = getNextServiceInfo("jeongmun", "sac1", d("2026-05-29", "23:00"))
    expect(info!.date.getMonth()).toBe(5)
    expect(info!.date.getDate()).toBe(1)
  })
})
