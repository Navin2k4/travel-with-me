"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { toast } from "sonner";
import { loginUserAction } from "@/lib/actions/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm({ inviteToken, nextPath }: { inviteToken?: string; nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = () => {
    startTransition(async () => {
      const result = await loginUserAction({ email, password, inviteToken });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Login failed.");
        return;
      }
      toast.success("Welcome back!");
      router.push((result.data.redirectTo || nextPath || "/") as Route);
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/90 backdrop-blur-xl rounded-[3rem] p-8 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.15)] border-[6px] border-white relative overflow-hidden">
      {/* Decorative glossy highlight gloss */}
      <div className="absolute top-0 left-1/4 right-1/4 h-6 rounded-b-[2rem] bg-gradient-to-b from-white to-transparent opacity-60 pointer-events-none" />
      
      <div className="mb-8 text-center relative z-10">
        <h2 className="text-4xl font-black uppercase text-[#393E46] tracking-tighter drop-shadow-md">Welcome Back</h2>
        <p className="text-[#00ADB5] font-black mt-2 uppercase text-sm tracking-widest bg-[#CBF1F5] inline-block px-4 py-1 rounded-full border-2 border-white shadow-sm">Sign in to continue</p>
      </div>

      <div className="grid gap-6 relative z-10">
        <div className="grid gap-2">
          <Label className="font-black text-xs uppercase tracking-widest text-[#71C9CE] ml-4 drop-shadow-sm">Email</Label>
          <Input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="player@example.com"
            className="h-16 rounded-full px-6 bg-[#EEEEEE] border-[3px] border-white shadow-inner focus-visible:ring-4 focus-visible:ring-[#00ADB5]/30 focus-visible:border-[#00ADB5] text-[#393E46] font-bold text-lg placeholder:text-slate-400"
          />
        </div>
        <div className="grid gap-2">
          <Label className="font-black text-xs uppercase tracking-widest text-[#71C9CE] ml-4 drop-shadow-sm">Password</Label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••"
            className="h-16 rounded-full px-6 bg-[#EEEEEE] border-[3px] border-white shadow-inner focus-visible:ring-4 focus-visible:ring-[#00ADB5]/30 focus-visible:border-[#00ADB5] text-[#393E46] font-bold text-lg placeholder:text-slate-400"
          />
        </div>
        <Button 
          onClick={onSubmit} 
          disabled={isPending || !email || !password}
          className="mt-4 w-full h-16 rounded-full bg-[#00ADB5] hover:bg-[#009299] text-white font-black text-xl uppercase tracking-widest border-b-[6px] border-[#393E46] active:border-b-0 active:translate-y-[6px] transition-all shadow-[0_6px_15px_rgba(0,173,181,0.4)] disabled:opacity-50 disabled:translate-y-[6px] disabled:border-b-0"
        >
          {isPending ? "Signing in..." : "Login"}
        </Button>
      </div>
    </div>
  );
}
