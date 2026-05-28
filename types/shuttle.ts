export type StopId = string

export interface Stop {
  id: StopId
  name: string
}

export interface ScheduleEntry {
  from: StopId
  to: StopId
  times: string[] // "HH:mm" 24시간 형식
}

export interface ShuttleResult {
  departureTime: string // "HH:mm"
  minutesRemaining: number // 0 = "곧 출발"
}

export interface NextServiceInfo {
  date: Date
  firstTime: string // "HH:mm"
}
