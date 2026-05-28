import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { ShuttleFinder } from "./shuttle-finder"

const WEEKDAY = new Date(2026, 4, 28, 10, 0)  // 목요일
const SATURDAY = new Date(2026, 4, 30, 10, 0) // 토요일
const HOLIDAY = new Date(2026, 0, 1, 10, 0)   // 신정

describe("ShuttleFinder — 미선택 상태 (Scenario 4)", () => {
  it("두 정류장 모두 미선택 시 안내 문구 표시", () => {
    render(<ShuttleFinder now={WEEKDAY} />)
    expect(
      screen.getByText(/출발지와 도착지를 선택하면/)
    ).toBeInTheDocument()
  })
})

describe("ShuttleFinder — 주말·공휴일 (Scenario 3)", () => {
  it("토요일 접속 시 비운행 안내 표시, 드롭다운 없음", () => {
    render(<ShuttleFinder now={SATURDAY} />)
    expect(screen.getByText(/오늘은 운행하지 않습니다/)).toBeInTheDocument()
    expect(screen.queryByText("출발 정류장")).not.toBeInTheDocument()
  })

  it("공휴일 접속 시 비운행 안내 표시", () => {
    render(<ShuttleFinder now={HOLIDAY} />)
    expect(screen.getByText(/오늘은 운행하지 않습니다/)).toBeInTheDocument()
  })
})

describe("StopSelector — 동일 정류장 방지 (Scenario 5)", () => {
  it("출발 '본관' 선택 후 도착 드롭다운의 '본관' 항목이 aria-disabled", () => {
    render(<ShuttleFinder now={WEEKDAY} />)

    // 출발 정류장 선택 (첫 번째 combobox)
    const [departureTrigger] = screen.getAllByRole("combobox")
    fireEvent.click(departureTrigger)
    const bonkwanOption = screen.getByRole("option", { name: "본관" })
    fireEvent.click(bonkwanOption)

    // 도착 드롭다운 열기 (두 번째 combobox)
    const [, arrivalTrigger] = screen.getAllByRole("combobox")
    fireEvent.click(arrivalTrigger)

    // 도착 드롭다운의 "본관" 항목은 aria-disabled
    const allBonkwanOptions = screen.getAllByRole("option", { name: "본관" })
    const arrivalBonkwan = allBonkwanOptions[allBonkwanOptions.length - 1]
    expect(arrivalBonkwan).toHaveAttribute("aria-disabled", "true")
  })

  it("도착 '연구동' 선택 후 출발 드롭다운의 '연구동' 항목이 aria-disabled", () => {
    render(<ShuttleFinder now={WEEKDAY} />)

    // 도착 정류장 먼저 선택 (두 번째 combobox)
    const [, arrivalTrigger] = screen.getAllByRole("combobox")
    fireEvent.click(arrivalTrigger)
    const yeongOption = screen.getByRole("option", { name: "연구동" })
    fireEvent.click(yeongOption)

    // 출발 드롭다운 열기
    const [departureTrigger] = screen.getAllByRole("combobox")
    fireEvent.click(departureTrigger)

    const allYeongOptions = screen.getAllByRole("option", { name: "연구동" })
    const departureYeong = allYeongOptions[allYeongOptions.length - 1]
    expect(departureYeong).toHaveAttribute("aria-disabled", "true")
  })
})
