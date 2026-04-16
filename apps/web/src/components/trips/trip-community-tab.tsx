"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState, useTransition } from "react";
import { ArrowBendDownRightIcon, ArrowFatDownIcon, ArrowFatUpIcon, ChatCircleDotsIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  createCommunityMessageAction,
  createCommunityThreadAction,
  deleteCommunityMessageAction,
  deleteCommunityThreadAction,
  editCommunityMessageAction,
  editCommunityThreadAction,
  voteCommunityThreadAction,
} from "@/lib/actions/community";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_USER_AVATAR_URL } from "@/lib/constants";

type CommunityThreadView = {
  id: string;
  body: string;
  isDeleted: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  votes: Array<{ userId: string; value: number }>;
  messages: Array<{
    id: string;
    body: string;
    isDeleted: boolean;
    createdAt: string;
    parentId: string | null;
    author: {
      id: string;
      name: string;
      avatar: string | null;
    };
  }>;
};

export function TripCommunityTab({
  tripId,
  currentUserId,
  threads,
}: {
  tripId: string;
  currentUserId?: string;
  threads: CommunityThreadView[];
}) {
  const [threadBody, setThreadBody] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingThreadBody, setEditingThreadBody] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageBody, setEditingMessageBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const canParticipate = Boolean(currentUserId);

  const sortedThreads = useMemo(
    () => [...threads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [threads],
  );

  const submitThread = () => {
    if (!canParticipate) {
      toast.error("Sign in to create a thread.");
      return;
    }
    if (!threadBody.trim()) return;
    startTransition(async () => {
      const result = await createCommunityThreadAction({
        tripId,
        body: threadBody.trim(),
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to create thread.");
        return;
      }
      setThreadBody("");
      toast.success("Message posted.");
    });
  };

  const submitReply = (threadId: string, parentId?: string) => {
    if (!canParticipate) {
      toast.error("Sign in to reply.");
      return;
    }
    const key = parentId ? `${threadId}:${parentId}` : threadId;
    const body = replyDrafts[key]?.trim();
    if (!body) return;

    startTransition(async () => {
      const result = await createCommunityMessageAction({
        tripId,
        threadId,
        body,
        ...(parentId ? { parentId } : {}),
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to post message.");
        return;
      }
      setReplyDrafts((current) => ({ ...current, [key]: "" }));
      toast.success("Message posted.");
    });
  };

  const castVote = (threadId: string, currentVote: number, nextVote: "UP" | "DOWN") => {
    if (!canParticipate) {
      toast.error("Sign in to vote.");
      return;
    }
    const vote = (nextVote === "UP" && currentVote === 1) || (nextVote === "DOWN" && currentVote === -1) ? "NONE" : nextVote;
    startTransition(async () => {
      const result = await voteCommunityThreadAction({ tripId, threadId, vote });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to vote.");
      }
    });
  };

  const startEditThread = (threadId: string, body: string) => {
    setEditingThreadId(threadId);
    setEditingThreadBody(body);
  };

  const saveEditThread = (threadId: string) => {
    if (!editingThreadBody.trim()) return;
    startTransition(async () => {
      const result = await editCommunityThreadAction({
        tripId,
        threadId,
        body: editingThreadBody.trim(),
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to edit message.");
        return;
      }
      setEditingThreadId(null);
      setEditingThreadBody("");
      toast.success("Message updated.");
    });
  };

  const removeThread = (threadId: string) => {
    startTransition(async () => {
      const result = await deleteCommunityThreadAction({ tripId, threadId });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to delete message.");
        return;
      }
      toast.success("Message deleted.");
    });
  };

  const startEditMessage = (messageId: string, body: string) => {
    setEditingMessageId(messageId);
    setEditingMessageBody(body);
  };

  const saveEditMessage = (threadId: string, messageId: string) => {
    if (!editingMessageBody.trim()) return;
    startTransition(async () => {
      const result = await editCommunityMessageAction({
        tripId,
        threadId,
        messageId,
        body: editingMessageBody.trim(),
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to edit reply.");
        return;
      }
      setEditingMessageId(null);
      setEditingMessageBody("");
      toast.success("Reply updated.");
    });
  };

  const removeMessage = (threadId: string, messageId: string) => {
    startTransition(async () => {
      const result = await deleteCommunityMessageAction({ tripId, threadId, messageId });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to delete reply.");
        return;
      }
      toast.success("Reply deleted.");
    });
  };

  return (
    <div className="grid gap-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Open Community Forum</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {!canParticipate ? (
            <p className="text-xs text-muted-foreground">
              Want to join the conversation?{" "}
              <Link href={`/login?next=${encodeURIComponent(`/trips/${tripId}/community`)}` as Route} className="text-primary underline underline-offset-2">
                Sign in
              </Link>
              .
            </p>
          ) : null}
          <Textarea
            placeholder="Share a thought, ask a question, or start a discussion..."
            value={threadBody}
            onChange={(event) => setThreadBody(event.target.value)}
            disabled={!canParticipate}
          />
          <div className="flex justify-end">
            <Button className="rounded-xl  border border-border bg-primary p-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90" onClick={submitThread} disabled={isPending || !canParticipate || !threadBody.trim()}>
              {isPending ? "Posting..." : "Post Message"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {sortedThreads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          No discussions yet. Be the first to start a thread for this trip.
        </div>
      ) : (
        sortedThreads.map((thread) => {
          const upvotes = thread.votes.filter((vote) => vote.value === 1).length;
          const downvotes = thread.votes.filter((vote) => vote.value === -1).length;
          const myVote = currentUserId ? thread.votes.find((vote) => vote.userId === currentUserId)?.value ?? 0 : 0;
          const topLevelMessages = thread.messages.filter((message) => !message.parentId);

          return (
            <Card key={thread.id} className="border-border">
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      By {thread.author.name} · {new Date(thread.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={myVote === 1 ? "text-primary" : ""}
                      disabled={!canParticipate}
                      onClick={() => castVote(thread.id, myVote, "UP")}
                    >
                      <ArrowFatUpIcon />
                    </Button>
                    <span className="min-w-10 text-center text-xs font-medium">{upvotes - downvotes}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={myVote === -1 ? "text-destructive" : ""}
                      disabled={!canParticipate}
                      onClick={() => castVote(thread.id, myVote, "DOWN")}
                    >
                      <ArrowFatDownIcon />
                    </Button>
                  </div>
                </div>
                {editingThreadId === thread.id ? (
                  <div className="grid gap-2">
                    <Textarea
                      value={editingThreadBody}
                      onChange={(event) => setEditingThreadBody(event.target.value)}
                      disabled={isPending}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingThreadId(null)} disabled={isPending}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveEditThread(thread.id)} disabled={isPending || !editingThreadBody.trim()}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : thread.isDeleted ? (
                  <p className="text-sm italic text-muted-foreground">This message was deleted.</p>
                ) : (
                  <div className="grid gap-2">
                    <p className="text-sm text-foreground/90">{thread.body}</p>
                    {canParticipate && currentUserId === thread.author.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-blue-500 hover:text-blue-600"
                          onClick={() => startEditThread(thread.id, thread.body)}
                          disabled={isPending}
                          title="Edit message"
                        >
                          <PencilSimpleIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => removeThread(thread.id)}
                          disabled={isPending}
                          title="Delete message"
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )}
              </CardHeader>
              <CardContent className="grid gap-3">
                {topLevelMessages.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No replies yet.</p>
                ) : (
                  topLevelMessages.map((message) => {
                    const replies = thread.messages.filter((item) => item.parentId === message.id);
                    const draftKey = `${thread.id}:${message.id}`;
                    return (
                      <div key={message.id} className="rounded-lg border border-border bg-muted/20 p-3">
                        <div className="flex items-start gap-2">
                          <img
                            src={message.author.avatar || DEFAULT_USER_AVATAR_URL}
                            alt={message.author.name}
                            className="h-7 w-7 rounded-full border border-border object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold text-foreground">{message.author.name}</p>
                                <p className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleString()}</p>
                              </div>
                              {canParticipate && currentUserId === message.author.id && !message.isDeleted ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-blue-500 hover:text-blue-600"
                                    onClick={() => startEditMessage(message.id, message.body)}
                                    disabled={isPending}
                                    title="Edit reply"
                                  >
                                    <PencilSimpleIcon />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => removeMessage(thread.id, message.id)}
                                    disabled={isPending}
                                    title="Delete reply"
                                  >
                                    <TrashIcon />
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                            {editingMessageId === message.id ? (
                              <div className="mt-1 grid gap-2">
                                <Input
                                  value={editingMessageBody}
                                  onChange={(event) => setEditingMessageBody(event.target.value)}
                                  disabled={isPending}
                                  className="h-8"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setEditingMessageId(null)} disabled={isPending}>
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => saveEditMessage(thread.id, message.id)}
                                    disabled={isPending || !editingMessageBody.trim()}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : message.isDeleted ? (
                              <p className="mt-1 text-xs italic text-muted-foreground">This message was deleted.</p>
                            ) : (
                              <p className="mt-1 text-sm text-foreground/90">{message.body}</p>
                            )}
                          </div>
                        </div>

                        {replies.length > 0 ? (
                          <div className="mt-3 grid gap-2 pl-4">
                            {replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2 rounded-md border border-border/60 bg-background/70 p-2">
                                <ArrowBendDownRightIcon className="mt-1 h-3.5 w-3.5 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="text-xs font-semibold text-foreground">{reply.author.name}</p>
                                      <p className="text-xs text-muted-foreground">{new Date(reply.createdAt).toLocaleString()}</p>
                                    </div>
                                    {canParticipate && currentUserId === reply.author.id && !reply.isDeleted ? (
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon-sm"
                                          className="text-blue-500 hover:text-blue-600"
                                          onClick={() => startEditMessage(reply.id, reply.body)}
                                          disabled={isPending}
                                          title="Edit reply"
                                        >
                                          <PencilSimpleIcon />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon-sm"
                                          className="text-red-500 hover:text-red-600"
                                          onClick={() => removeMessage(thread.id, reply.id)}
                                          disabled={isPending}
                                          title="Delete reply"
                                        >
                                          <TrashIcon />
                                        </Button>
                                      </div>
                                    ) : null}
                                  </div>
                                  {editingMessageId === reply.id ? (
                                    <div className="mt-1 grid gap-2">
                                      <Input
                                        value={editingMessageBody}
                                        onChange={(event) => setEditingMessageBody(event.target.value)}
                                        disabled={isPending}
                                        className="h-8"
                                      />
                                      <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setEditingMessageId(null)} disabled={isPending}>
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => saveEditMessage(thread.id, reply.id)}
                                          disabled={isPending || !editingMessageBody.trim()}
                                        >
                                          Save
                                        </Button>
                                      </div>
                                    </div>
                                  ) : reply.isDeleted ? (
                                    <p className="mt-0.5 text-xs italic text-muted-foreground">This message was deleted.</p>
                                  ) : (
                                    <p className="mt-0.5 text-xs text-foreground/90">{reply.body}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-3 flex items-center gap-2">
                          <Input
                            placeholder="Reply..."
                            value={replyDrafts[draftKey] ?? ""}
                            onChange={(event) =>
                              setReplyDrafts((current) => ({ ...current, [draftKey]: event.target.value }))
                            }
                            className="h-8"
                            disabled={!canParticipate}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPending || !canParticipate || !(replyDrafts[draftKey] ?? "").trim()}
                            onClick={() => submitReply(thread.id, message.id)}
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}

                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-2">
                  <ChatCircleDotsIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Add a message to this thread..."
                    value={replyDrafts[thread.id] ?? ""}
                    onChange={(event) =>
                      setReplyDrafts((current) => ({ ...current, [thread.id]: event.target.value }))
                    }
                    className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0"
                    disabled={!canParticipate}
                  />
                  <Button
                    size="sm"
                    disabled={isPending || !canParticipate || !(replyDrafts[thread.id] ?? "").trim()}
                    onClick={() => submitReply(thread.id)}
                    className="rounded-xl  border border-border bg-primary p-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
