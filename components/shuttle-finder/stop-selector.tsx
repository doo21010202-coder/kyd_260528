"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STOPS } from "@/config/schedule"
import type { StopId } from "@/types/shuttle"

interface StopSelectorProps {
  label: string
  value: StopId | ""
  onChange: (value: StopId) => void
  allowedIds?: StopId[]
}

export function StopSelector({
  label,
  value,
  onChange,
  allowedIds,
}: StopSelectorProps) {
  const visibleStops = allowedIds
    ? STOPS.filter((s) => allowedIds.includes(s.id))
    : STOPS

  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1.5">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`${label} 선택`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {visibleStops.map((stop) => (
              <SelectItem key={stop.id} value={stop.id}>
                {stop.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
