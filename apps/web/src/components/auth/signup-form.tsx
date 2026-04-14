"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { toast } from "sonner";
import { registerUserAction } from "@/lib/actions/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeSlash } from "@phosphor-icons/react";

export function SignupForm({ inviteToken, nextPath }: { inviteToken?: string; nextPath?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit = () => {
    startTransition(async () => {
      const result = await registerUserAction({ name, email, password, inviteToken });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Signup failed.");
        return;
      }
      toast.success("Account created!");
      router.push((result.data.redirectTo || nextPath || "/") as Route);
    });
  };

  return (
    <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card/90 p-8 shadow-sm backdrop-blur-xl sm:p-10">
      <div className="relative z-10 mb-8 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Sign Up</h2>
        <p className="mt-2 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium uppercase tracking-wider text-primary">
          Create your account
        </p>
      </div>

      <div className="relative z-10 grid gap-5">
        <div className="grid gap-2">
          <Label className="ml-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Name</Label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Awesome Traveler"
            className="h-12 rounded-lg border-border bg-background px-4 text-base"
          />
        </div>
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
          disabled={isPending || !name || !email || !password}
          className="mt-2 h-11 w-full rounded-lg text-sm font-semibold uppercase tracking-wide"
        >
          {isPending ? "Creating..." : "Create Account"}
        </Button>
      </div>
    </div>
  );
}
