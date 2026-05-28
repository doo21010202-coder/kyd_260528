import { BusIcon } from "lucide-react"
import { ShuttleFinder } from "@/components/shuttle-finder/shuttle-finder"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-sm mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b">
          <BusIcon className="size-5" />
          <h1 className="font-bold text-base">셔틀 조회</h1>
        </div>
        <ShuttleFinder />
      </div>
    </main>
  )
}
