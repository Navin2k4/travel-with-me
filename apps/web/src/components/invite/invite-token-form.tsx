"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteTokenForm() {
  const router = useRouter();
  const [token, setToken] = useState("");

  const submit = () => {
    const trimmed = token.trim();
    if (!trimmed) return;
    router.push((`/invite/${trimmed}`) as Route);
  };

  return (
    <div className="grid gap-6 w-full">
      <div className="grid gap-2 text-left">
        <Label htmlFor="invite-token" className="font-black text-xs uppercase tracking-widest text-[#71C9CE] ml-4 drop-shadow-sm">
          Invite Token
        </Label>
        <Input
          id="invite-token"
          placeholder="Paste trip code to join 🎉"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="h-16 rounded-full px-6 bg-[#EEEEEE] border-[3px] border-white shadow-inner focus-visible:ring-4 focus-visible:ring-[#00ADB5]/30 focus-visible:border-[#00ADB5] text-[#393E46] font-bold text-lg placeholder:text-slate-400"
        />
      </div>
      <Button 
        onClick={submit} 
        disabled={!token.trim()}
        className="mt-2 w-full h-16 rounded-full bg-[#00ADB5] hover:bg-[#009299] text-white font-black text-xl uppercase tracking-widest border-b-[6px] border-[#393E46] active:border-b-0 active:translate-y-[6px] transition-all shadow-[0_6px_15px_rgba(0,173,181,0.4)] disabled:opacity-50 disabled:translate-y-[6px] disabled:border-b-0"
      >
        Open Invite
      </Button>
    </div>
  );
}
