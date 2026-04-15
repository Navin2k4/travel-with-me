import { NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { deleteUserFromClerk, upsertUserFromClerk } from "@/lib/auth/clerk-sync";

export async function POST(request: Request) {
  const signingSecret =
    process.env.CLERK_SIGNING_SECRET ?? process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!signingSecret) {
    return NextResponse.json(
      { error: "Missing Clerk signing secret." },
      { status: 500 }
    );
  }

  // Clerk expects CLERK_WEBHOOK_SIGNING_SECRET. Support CLERK_SIGNING_SECRET too.
  if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = signingSecret;
  }

  try {
    const event = await verifyWebhook(request as any);

    if (event.type === "user.created" || event.type === "user.updated") {
      await upsertUserFromClerk(event.data as Parameters<typeof upsertUserFromClerk>[0]);
      return NextResponse.json({ ok: true, action: "upserted" });
    }

    if (event.type === "user.deleted") {
      const clerkId = typeof event.data.id === "string" ? event.data.id : "";
      if (clerkId) {
        await deleteUserFromClerk(clerkId);
      }
      return NextResponse.json({ ok: true, action: "deleted" });
    }

    return NextResponse.json({ ok: true, action: "ignored", eventType: event.type });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid Clerk webhook signature." },
      { status: 400 }
    );
  }
}
