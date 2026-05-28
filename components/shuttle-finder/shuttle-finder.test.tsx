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
  it("출발 '복지관뒤' 선택 후 도착 드롭다운의 '복지관뒤' 항목이 aria-disabled", () => {
    render(<ShuttleFinder now={WEEKDAY} />)

    const [departureTrigger] = screen.getAllByRole("combobox")
    fireEvent.click(departureTrigger)
    const option = screen.getByRole("option", { name: "복지관뒤" })
    fireEvent.click(option)

    const [, arrivalTrigger] = screen.getAllByRole("combobox")
    fireEvent.click(arrivalTrigger)

    const allOptions = screen.getAllByRole("option", { name: "복지관뒤" })
    const arrivalOption = allOptions[allOptions.length - 1]
    expect(arrivalOption).toHaveAttribute("aria-disabled", "true")
  })

  it("도착 'SAC연구동1' 선택 후 출발 드롭다운의 'SAC연구동1' 항목이 aria-disabled", () => {
    render(<ShuttleFinder now={WEEKDAY} />)

    const [, arrivalTrigger] = screen.getAllByRole("combobox")
    fireEvent.click(arrivalTrigger)
    const option = screen.getByRole("option", { name: "SAC연구동1" })
    fireEvent.click(option)

    const [departureTrigger] = screen.getAllByRole("combobox")
    fireEvent.click(departureTrigger)

    const allOptions = screen.getAllByRole("option", { name: "SAC연구동1" })
    const deptOption = allOptions[allOptions.length - 1]
    expect(deptOption).toHaveAttribute("aria-disabled", "true")
  })
})
