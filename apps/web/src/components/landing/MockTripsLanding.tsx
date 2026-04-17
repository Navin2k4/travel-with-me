"use client";

import React from "react";

const tripData = [
    {
        id: 1,
        title: "Iceland Trip",
        image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=600&auto=format&fit=crop",
        isActive: true,
        avatars: [],
    },
    {
        id: 2,
        title: "Japan Tour",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop",
        isActive: false,
        avatars: [
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
        ],
    },
    {
        id: 3,
        title: "French Colony",
        image: "https://v9yf76d320.ufs.sh/f/lt6UaJXpxmve6eY5VMcFGPov0SBuyTHJwfgs2DRWLIhbz8QC",
        isActive: false,
        avatars: [
            "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=100&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=100&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=100&auto=format&fit=crop",
        ],
    },
    {
        id: 4,
        title: "Varkala Kayak",
        image: "https://v9yf76d320.ufs.sh/f/lt6UaJXpxmveJjitmxPR8wQlVCkjN7TKtqAzZO01GaP6unSd",
        isActive: false,
        avatars: [
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
        ],
    },
];

export function MockTripsLanding() {
    return (
        <section className="w-full bg-[#050505] mt-20  flex flex-col items-center overflow-hidden">
            {/* Header */}
            <div className="text-center mb-14 space-y-4 px-6 relative z-10">
                <h2 className="text-4xl md:text-5xl lg:text-[54px] font-bold text-white tracking-tight leading-[1.1]">
                    Get Inspired by Recent Trips
                </h2>
                <p className="text-zinc-400 text-sm md:text-lg max-w-xl mx-auto">
                    Explore real trips planned by the community.
                </p>
            </div>

            {/* Grid container */}
            <div className="flex flex-nowrap overflow-x-auto pb-12 pt-4 px-6 md:px-12 w-full max-w-[1300px] gap-6 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden justify-start xl:justify-center relative z-10">
                {tripData.map((trip) => (
                    <div
                        key={trip.id}
                        className={`
              relative shrink-0 w-[260px] md:w-[280px] h-[380px] md:h-[420px] rounded-[24px] overflow-hidden snap-center group cursor-pointer transition-all duration-500 ease-out
              ${trip.isActive
                                ? "ring-[2px] ring-[#b4f039] ring-offset-[6px] ring-offset-[#050505] scale-[1.03] z-10 shadow-[0_0_40px_rgba(180,240,57,0.15)]"
                                : "hover:scale-[1.02] hover:ring-1 hover:ring-zinc-700 hover:ring-offset-[4px] hover:ring-offset-[#050505]"
                            }
            `}
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={trip.image}
                                alt={trip.title.replace("\n", " ")}
                                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                            />
                            {/* Gradient Overlay */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-t ${trip.isActive ? 'from-[#050505] via-[#050505]/60 to-transparent/20' : 'from-[#050505]/95 via-[#050505]/40 to-transparent'}`}
                            />
                        </div>

                        {/* Card Content */}
                        <div
                            className={`absolute bottom-0 left-0 right-0 p-6 flex flex-col ${trip.isActive ? "gap-5" : "gap-4"
                                }`}
                        >
                            <h3 className="text-2xl font-bold text-white leading-tight whitespace-pre-line drop-shadow-md">
                                {trip.title}
                            </h3>

                            {trip.isActive ? (
                                <div className="flex flex-col gap-3 mt-1">
                                    <button className="w-full py-3 bg-[#b4f039] hover:bg-[#a3df28] hover:scale-[1.02] active:scale-[0.98] text-black font-bold rounded-xl text-[13px] transition-all shadow-[0_0_20px_rgba(180,240,57,0.3)]">
                                        Join Trip
                                    </button>
                                    <button className="w-full py-3 bg-[#111113]/80 backdrop-blur-md hover:bg-[#1a1a1c] border border-zinc-700/50 hover:border-zinc-500 text-zinc-300 font-semibold rounded-xl text-[13px] transition-all">
                                        View Story
                                    </button>
                                </div>
                            ) : (
                                <div className="flex -space-x-2 mt-1">
                                    {trip.avatars.map((avatar, idx) => (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            key={idx}
                                            src={avatar}
                                            alt="avatar"
                                            className="w-8 h-8 rounded-full border-2 border-[#050505] object-cover ring-1 ring-zinc-800/50 shadow-sm"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
