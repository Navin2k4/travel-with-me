"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createInviteLinkAction, disableInviteAction, regenerateInviteAction } from "@/lib/actions/invites";

type Invite = {
  id: string;
  token: string;
  usedCount: number;
  maxUses: number | null;
  expiresAt: string | null;
  isActive: boolean;
};

export function InviteManager({ tripId, invites }: { tripId: string; invites: Invite[] }) {
  const [isPending, startTransition] = useTransition();

  const createInvite = () => {
    startTransition(async () => {
      const result = await createInviteLinkAction({ tripId });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to create invite.");
        return;
      }
      const absolute = `${window.location.origin}${result.data.path}`;
      await navigator.clipboard.writeText(absolute);
      toast.success("Invite created and copied.");
    });
  };

  const disableInvite = (inviteId: string) => {
    startTransition(async () => {
      const result = await disableInviteAction({ tripId, inviteId });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to disable invite.");
        return;
      }
      toast.success("Invite disabled.");
    });
  };

  const regenerateInvite = (inviteId: string) => {
    startTransition(async () => {
      const result = await regenerateInviteAction({ tripId, inviteId });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to regenerate invite.");
        return;
      }
      const absolute = `${window.location.origin}${result.data.path}`;
      await navigator.clipboard.writeText(absolute);
      toast.success("New invite generated and copied.");
    });
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Trip Invites</h3>
        <Button type="button" onClick={createInvite} disabled={isPending}>
          Invite
        </Button>
      </div>
      <div className="grid gap-2">
        {invites.length === 0 ? (
          <div className="rounded border border-dashed p-3 text-xs text-muted-foreground">No active invites.</div>
        ) : (
          invites.map((invite) => (
            <div key={invite.id} className="rounded border p-3 text-xs">
              <div className="break-all font-mono">{invite.token}</div>
              <div className="mt-1 text-muted-foreground">
                used {invite.usedCount}
                {invite.maxUses ? ` / ${invite.maxUses}` : ""}
                {invite.expiresAt ? ` • expires ${new Date(invite.expiresAt).toLocaleString()}` : ""}
              </div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => regenerateInvite(invite.id)} disabled={isPending}>
                  Regenerate
                </Button>
                <Button size="sm" variant="destructive" onClick={() => disableInvite(invite.id)} disabled={isPending}>
                  Disable
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
