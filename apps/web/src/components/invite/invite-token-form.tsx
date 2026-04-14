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
    <div className="grid w-full gap-6">
      <div className="grid gap-2 text-left">
        <Label htmlFor="invite-token" className="ml-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Invite Token
        </Label>
        <Input
          id="invite-token"
          placeholder="Paste trip code to join"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="h-12 rounded-lg border-border bg-background px-4 text-base"
        />
      </div>
      <Button 
        onClick={submit} 
        disabled={!token.trim()}
        className="mt-2 h-11 w-full rounded-lg text-sm font-semibold uppercase tracking-wide"
      >
        Open Invite
      </Button>
    </div>
  );
}
