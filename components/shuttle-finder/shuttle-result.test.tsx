import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { ShuttleResult } from "./shuttle-result"

function d(dateStr: string, timeStr: string): Date {
  const [y, mo, day] = dateStr.split("-").map(Number)
  const [h, m] = timeStr.split(":").map(Number)
  return new Date(y, mo - 1, day, h, m, 0, 0)
}

// 평일 10:10 기준 정문→SAC연구동1 다음 3개: 10:12(2분), 10:42(32분), 11:12(62분)
const WEEKDAY_MORNING = d("2026-05-28", "10:10")
// 평일 08:12 정각 → 첫 셔틀 minutesRemaining=0 (곧 출발)
const WEEKDAY_SOON = d("2026-05-28", "08:12")
// 평일 19:00 → 마지막 셔틀 이후
const WEEKDAY_AFTER_LAST = d("2026-05-28", "19:00")

describe("ShuttleResult — Scenario 1: 정상 조회", () => {
  it("다음 셔틀 3개 표시, 출발 시각과 남은 분 포함", () => {
    render(<ShuttleResult from="jeongmun" to="sac1" now={WEEKDAY_MORNING} />)
    expect(screen.getByText("10:12")).toBeInTheDocument()
    expect(screen.getByText("2분 후")).toBeInTheDocument()
    expect(screen.getByText("10:42")).toBeInTheDocument()
    expect(screen.getByText("11:12")).toBeInTheDocument()
  })

  it("남은 시간 0분 셔틀은 '곧 출발' 표시 (N분 후 아님)", () => {
    render(<ShuttleResult from="jeongmun" to="sac1" now={WEEKDAY_SOON} />)
    expect(screen.getByText("곧 출발")).toBeInTheDocument()
    expect(screen.queryByText("0분 후")).not.toBeInTheDocument()
  })
})

describe("ShuttleResult — Scenario 2: 오늘 운행 종료", () => {
  it("운행 종료 메시지 + 다음 운행일 첫 셔틀 표시", () => {
    render(<ShuttleResult from="jeongmun" to="sac1" now={WEEKDAY_AFTER_LAST} />)
    expect(screen.getByText(/오늘 운행이 종료되었습니다/)).toBeInTheDocument()
    expect(screen.getByText(/다음 운행일/)).toBeInTheDocument()
    expect(screen.getByText("08:12")).toBeInTheDocument()
  })
})

describe("ShuttleResult — Scenario 3: 주말·공휴일", () => {
  it("토요일 — 비운행 안내 표시", () => {
    const saturday = d("2026-05-30", "10:00")
    render(<ShuttleResult from="jeongmun" to="sac1" now={saturday} />)
    expect(screen.getByText(/오늘은 운행하지 않습니다/)).toBeInTheDocument()
    expect(screen.getByText(/다음 운행일/)).toBeInTheDocument()
  })
})
