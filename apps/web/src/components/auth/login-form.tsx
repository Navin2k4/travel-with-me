"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { toast } from "sonner";
import { loginUserAction } from "@/lib/actions/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeSlash } from "@phosphor-icons/react";

export function LoginForm({ inviteToken, nextPath }: { inviteToken?: string; nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card/90 p-8 shadow-sm backdrop-blur-xl sm:p-10">
      <div className="relative z-10 mb-8 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Welcome Back</h2>
        <p className="mt-2 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium uppercase tracking-wider text-primary">
          Sign in to continue
        </p>
      </div>

      <div className="relative z-10 grid gap-6">
        <div className="grid gap-2">
          <Label className="ml-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</Label>
          <Input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="player@example.com"
            className="h-12 rounded-lg border-border bg-background px-4 text-base"
          />
        </div>
        <div className="grid gap-2">
          <Label className="ml-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 rounded-lg border-border bg-background px-4 pr-10 text-base"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <Button 
          onClick={onSubmit} 
          disabled={isPending || !email || !password}
          className="mt-2 h-11 w-full rounded-lg text-sm font-semibold uppercase tracking-wide"
        >
          {isPending ? "Signing In..." : "Login"}
        </Button>
      </div>
    </div>
  );
}
