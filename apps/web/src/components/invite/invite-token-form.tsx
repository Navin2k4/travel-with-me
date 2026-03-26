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
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label htmlFor="invite-token">Invite Token</Label>
        <Input
          id="invite-token"
          placeholder="Paste trip code to join 🎉"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>
      <Button onClick={submit} disabled={!token.trim()}>
        Open Invite
      </Button>
    </div>
  );
}
