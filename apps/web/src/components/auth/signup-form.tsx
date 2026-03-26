"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { toast } from "sonner";
import { registerUserAction } from "@/lib/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SignupForm({ inviteToken, nextPath }: { inviteToken?: string; nextPath?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create your account to join trips.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button onClick={onSubmit} disabled={isPending || !name || !email || !password}>
          {isPending ? "Creating..." : "Create account"}
        </Button>
      </CardContent>
    </Card>
  );
}
