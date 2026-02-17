import { DailyBriefingCard } from "@/components/DailyBriefingCard"
import { ActiveTradesTable } from "@/components/ActiveTradesTable"
import { PnLChart } from "@/components/PnLChart"
import { WinLossChart } from "@/components/WinLossChart"
import { FearMeter } from "@/components/FearMeter"
import { HypeCloud } from "@/components/HypeCloud"
import { MarketOverviewTable } from "@/components/MarketOverviewTable"

export function Home() {
    return (
        <div className="space-y-6 pb-10 max-w-[1600px] mx-auto p-4 md:p-8 pt-6 min-h-screen animate-in fade-in duration-500">
            {/* 1. HERO SECTION: Daily Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DailyBriefingCard />
                </div>
                <div className="space-y-6">
                    <FearMeter sentiment={40} /> {/* Dynamic prop later */}
                    <HypeCloud />
                </div>
            </div>

            {/* 2. PERFORMANCE CENTER */}
            <h2 className="text-xl font-bold tracking-tight text-white/80 border-l-4 border-indigo-500 pl-3 mt-8">
                Strategist Performance Center
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[300px]">
                    <PnLChart />
                </div>
                <div className="h-[300px]">
                     <WinLossChart />
                </div>
            </div>

            {/* 3. ACTIVE MISSIONS */}
            <h2 className="text-xl font-bold tracking-tight text-white/80 border-l-4 border-emerald-500 pl-3 mt-8">
                Live Scout Missions
            </h2>
            <div className="min-h-[300px]">
                <ActiveTradesTable />
            </div>

            {/* 4. MARKET OVERVIEW */}
            <div className="pt-8">
                <MarketOverviewTable />
            </div>
        </div>
    )
}
