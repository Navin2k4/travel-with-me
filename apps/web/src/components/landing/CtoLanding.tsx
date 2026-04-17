"use client";

import React from "react";

export function CtoLanding() {
    return (
        <section className="w-full py-20 px-6 flex justify-center items-center relative z-20">
            <div className="w-full max-w-7xl rounded-[2.5rem] border-t-primary border-t-4  py-20 px-6 md:px-12 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                {/* Subtle top glow overlay */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[30%] bg-white/5 blur-[120px] rounded-[100%] pointer-events-none" />

                <div className="relative z-10 max-w-4xl flex flex-col items-center">
                    <h2 className="text-3xl md:text-[70px] font-bold text-white mb-6 md:mb-5 tracking-tight leading-tight">
                        Plan your next adventure together.
                    </h2>

                    <p className="text-[#a1a1aa] text-xl md:text-2xl leading-relaxed mb-10">
                        Join thousands of travelers and experience the best way to travel in groups. Start for free today.
                    </p>

                    <button className="px-8 py-3.5 md:py-4 bg-[#b4f039] hover:bg-[#a3df28] text-[#050505] font-bold rounded-2xl text-[14px] md:text-[15px] transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(180,240,57,0.15)] hover:shadow-[0_0_30px_rgba(180,240,57,0.25)]">
                        Start Planning Your Trip
                    </button>
                </div>
            </div>
        </section>
    );
}
