"use client";

import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const chartData = [
    { name: "Accommodation", value: 335, fill: "#b4f039" },
    { name: "Food", value: 151, fill: "#d9f99d" },
    { name: "Transport", value: 85, fill: "#ecfccb" },
    { name: "Activities", value: 51, fill: "#e4e4e7" },
];

const chartConfig = {
    Accommodation: {
        label: "Accommodation",
        color: "#b4f039",
    },
    Food: {
        label: "Food",
        color: "#d9f99d",
    },
    Transport: {
        label: "Transport",
        color: "#ecfccb",
    },
    Activities: {
        label: "Activities",
        color: "#e4e4e7",
    },
} satisfies ChartConfig;

export function MoneyManageComponent() {
    return (
        <section className="relative w-full bg-[#050505] py-24 flex items-center justify-center p-6 md:p-12 overflow-hidden">
            {/* Background container for the feature section */}
            <div className="relative max-w-7xl mx-auto w-full rounded-[2.5rem] p-8 md:p-16 flex flex-col md:flex-row gap-16 lg:gap-24 items-center overflow-hidden">
                {/* Left Side: Mockup Cards */}
                <div className="w-full md:w-1/2 flex justify-center relative">

                    <div className="relative w-full max-w-xs md:max-w-[340px] lg:scale-110 xl:scale-125 z-10">
                        {/* Card 3 (back) */}
                        <div className="absolute -top-6 left-6 right-6 h-full bg-[#1a1a1c] border border-zinc-800 rounded-2xl shadow-xl opacity-30" />
                        {/* Card 2 (middle) */}
                        <div className="absolute -top-3 left-3 right-3 h-full bg-[#1a1a1c] border border-zinc-800 rounded-2xl shadow-xl opacity-60" />

                        {/* Main Card (front) */}
                        <div className="relative bg-[#1a1a1c] border border-[#303033] rounded-2xl p-6 shadow-2xl z-10 w-full overflow-hidden">
                            {/* Header */}
                            {/* Tabs */}
                            <div className="flex gap-5 border-b border-zinc-800/60 mb-6 pb-2.5">
                                <div className="text-xs font-semibold text-[#b4f039] relative">
                                    Categories
                                    <div className="absolute -bottom-[11px] left-0 right-0 h-0.5 bg-[#b4f039]" />
                                </div>
                                <div className="text-xs font-medium text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors">Dates</div>
                                <div className="text-xs font-medium text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors">Spenders</div>
                            </div>

                            {/* Chart + Legend */}
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-[100px] h-[100px] shrink-0 relative flex items-center justify-center">
                                    {/* Background Track */}
                                    <svg viewBox="0 0 100 100" className="w-[90px] h-[90px] absolute inset-0 m-auto pointer-events-none z-0">
                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#27272a" strokeWidth="16" />
                                    </svg>
                                    {/* Shadcn Pie Chart */}
                                    <ChartContainer config={chartConfig} className="w-full h-full absolute inset-0 z-10 scale-[1.3] [&_.recharts-pie]:outline-none">
                                        <PieChart>
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent hideLabel indicator="dot" />}
                                            />
                                            <Pie
                                                data={chartData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={22}
                                                outerRadius={38}
                                                strokeWidth={0}
                                                startAngle={90}
                                                endAngle={-270}
                                                paddingAngle={5}
                                                cornerRadius={2}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} className="stroke-[#1a1a1c] stroke-[3px]" />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ChartContainer>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#b4f039] mt-0.5 shrink-0" />
                                        <div className="flex flex-col leading-none gap-1">
                                            <span className="text-[10px] font-medium text-zinc-400">Accommodation</span>
                                            <span className="text-[11px] font-semibold text-white tracking-wide">£335.00</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#d9f99d] mt-0.5 shrink-0" />
                                        <div className="flex flex-col leading-none gap-1">
                                            <span className="text-[10px] font-medium text-zinc-400">Food</span>
                                            <span className="text-[11px] font-semibold text-white tracking-wide">£151.00</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#ecfccb] mt-0.5 shrink-0" />
                                        <div className="flex flex-col leading-none gap-1">
                                            <span className="text-[10px] font-medium text-zinc-400">Transport</span>
                                            <span className="text-[11px] font-semibold text-white tracking-wide">£85.00</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#e4e4e7] mt-0.5 shrink-0" />
                                        <div className="flex flex-col leading-none gap-1">
                                            <span className="text-[10px] font-medium text-zinc-400">Activities</span>
                                            <span className="text-[11px] font-semibold text-white tracking-wide">£51.00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Split Summary */}
                            <div>
                                <h4 className="text-[11px] font-bold text-white mb-3">Split Summary</h4>
                                <div className="space-y-3.5">
                                    {/* Row 1 */}
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-[22px] h-[22px] rounded-full bg-[#b4f039] flex items-center justify-center text-[10px] text-black font-extrabold group-hover:scale-105 transition-transform">Y</div>
                                            <span className="text-[11px] font-medium text-zinc-300">Accommodation</span>
                                        </div>
                                        <span className="text-[11px] text-[#b4f039] font-semibold">+335.00</span>
                                    </div>
                                    {/* Row 2 */}
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-[22px] h-[22px] rounded-full bg-[#27272a] flex items-center justify-center text-[10px] text-zinc-400 font-bold border border-zinc-700/50 group-hover:border-zinc-500 transition-colors">F</div>
                                            <span className="text-[11px] font-medium text-zinc-300">Food</span>
                                        </div>
                                        <span className="text-[11px] text-red-400 font-semibold">-331.00</span>
                                    </div>
                                    {/* Row 3 */}
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-[22px] h-[22px] rounded-full bg-[#27272a] flex items-center justify-center text-[10px] text-zinc-400 font-bold border border-zinc-700/50 group-hover:border-zinc-500 transition-colors">T</div>
                                            <span className="text-[11px] font-medium text-zinc-300">Transport</span>
                                        </div>
                                        <span className="text-[11px] text-red-400 font-semibold">-51.00</span>
                                    </div>
                                    {/* Row 4 */}
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-[22px] h-[22px] rounded-full bg-[#27272a] flex items-center justify-center text-[10px] text-zinc-400 font-bold border border-zinc-700/50 group-hover:border-zinc-500 transition-colors">A</div>
                                            <span className="text-[11px] font-medium text-zinc-300">Activities</span>
                                        </div>
                                        <span className="text-[11px] text-[#b4f039] font-semibold">+51.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Side: Text Highlights */}
                <div className="w-full md:w-1/2 flex flex-col justify-center max-w-lg z-10">
                    <h2 className="text-4xl md:text-5xl lg:text-[54px] tracking-tight font-bold text-[#b4f039] mb-8 lg:mb-10 leading-[1.05]">
                        Expense Engine
                    </h2>
                    <ul className="space-y-6">
                        <li className="flex items-start gap-4">
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
                            <p className="text-zinc-300 text-sm md:text-base leading-relaxed tracking-wide">
                                Split bills equally, by exact amount, or percentage.
                            </p>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
                            <p className="text-zinc-300 text-sm md:text-base leading-relaxed tracking-wide">
                                Supports multiple currencies with real-time conversion.
                            </p>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
                            <p className="text-zinc-300 text-sm md:text-base leading-relaxed tracking-wide">
                                Settle up easily with integrated payment options.
                            </p>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
                            <p className="text-zinc-300 text-sm md:text-base leading-relaxed tracking-wide">
                                Download detailed expense reports.
                            </p>
                        </li>
                    </ul>
                </div>

            </div>
        </section>
    );
}
