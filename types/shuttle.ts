export type StopId = string

export interface Stop {
  id: StopId
  name: string
  lat?: number
  lng?: number
}

// 순환 노선의 한 회차 — 정류장 순서대로 시각 기록 (null = 해당 회차 미정차)
export interface Run {
  runNumber: number
  times: (string | null)[] // ROUTE_STOP_ORDER와 인덱스 일치
}

export interface ShuttleResult {
  departureTime: string // "HH:mm"
  minutesRemaining: number // 0 = "곧 출발"
}

export interface NextServiceInfo {
  date: Date
  firstTime: string // "HH:mm"
}
