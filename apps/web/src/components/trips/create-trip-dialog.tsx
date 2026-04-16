"use client";

import { useState } from "react";
import { CreateTripForm } from "@/components/trips/create-trip-form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type UserOption = {
  id: string;
  name: string;
  email: string;
  hasTripHistory: boolean;
};

export function CreateTripDialog({
  currentUser,
  users,
}: {
  currentUser: { id: string; name: string; email: string };
  users: UserOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 font-bold rounded-xl border border-border bg-primary px-4 text-xs  uppercase tracking-wider text-black transition-colors hover:bg-primary/90">
          Create Trip
        </Button>
      </DialogTrigger>
      <DialogContent className=" min-w-2xl md:min-w-4xl p-0" showCloseButton>
        <ScrollArea className="max-h-[90vh]">
          <DialogHeader className="px-4 pt-4 md:px-6 md:pt-6">
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div className="p-4 pt-0 md:p-6 md:pt-0">
            <CreateTripForm currentUser={currentUser} users={users} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
