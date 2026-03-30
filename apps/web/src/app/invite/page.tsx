import { InviteTokenForm } from "@/components/invite/invite-token-form";

export default function InviteLandingPage() {
    return (
        <main className="min-h-[calc(100vh-56px)] w-full relative flex items-center justify-center p-4 bg-gradient-to-br from-[#FFB703] to-[#FB8500] overflow-hidden">
            {/* Soft backdrop lighting */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#00ADB5]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-xl mx-auto bg-white/90 backdrop-blur-xl rounded-[3rem] p-8 sm:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.15)] border-[6px] border-white overflow-hidden text-center">
                <div className="absolute top-0 left-1/4 right-1/4 h-6 rounded-b-[2rem] bg-gradient-to-b from-white to-transparent opacity-60 pointer-events-none" />
                
                <h2 className="text-4xl font-black uppercase text-[#393E46] tracking-tighter drop-shadow-md">Join Trip</h2>
                <p className="text-[#00ADB5] font-black mt-2 mb-8 uppercase text-sm tracking-widest bg-[#CBF1F5] inline-block px-4 py-1 rounded-full border-2 border-white shadow-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                    Enter token to join
                </p>
                
                <InviteTokenForm />
            </div>
        </main>
    );
}