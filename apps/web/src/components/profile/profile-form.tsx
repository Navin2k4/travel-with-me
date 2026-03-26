"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateCurrentUserProfileAction } from "@/lib/actions/auth";
import { UploadButton } from "@/lib/uploadthing";

export function ProfileForm({
  initial,
}: {
  initial: { name: string; email: string; avatar: string | null };
}) {
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [avatar, setAvatar] = useState(initial.avatar ?? "");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const result = await updateCurrentUserProfileAction({ name, email, avatar, password });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to update profile.");
        return;
      }
      toast.success("Profile updated.");
      setPassword("");
    });
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your account details for this travel workspace.</CardDescription>
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
          <Label>Profile Picture (UploadThing)</Label>
          <div className="rounded-lg border bg-muted/30 p-3">
            <UploadButton
              endpoint="avatarUploader"
              appearance={{
                button:
                  "h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 ut-uploading:cursor-not-allowed ut-uploading:bg-primary/80 ut-uploading:text-primary-foreground",
                allowedContent: "text-xs text-muted-foreground",
              }}
              content={{
                button: () => (avatar ? "Update Image" : "Upload Image"),
                allowedContent: () => "PNG, JPG, WEBP up to 2MB",
              }}
              onClientUploadComplete={(files) => {
                const file = files?.[0];
                if (!file) return;
                setAvatar(file.ufsUrl);
                toast.success("Profile picture uploaded.");
              }}
              onUploadError={(error: Error) => {
                toast.error(error.message);
              }}
            />
          </div>
          {avatar && (
            <div className="flex items-center gap-2 rounded border p-2">
              <img src={avatar} alt="Profile preview" className="h-10 w-10 rounded-full object-cover" />
              <span className="text-xs text-muted-foreground">Uploaded image will be used as your profile picture</span>
            </div>
          )}
        </div>
        <div className="grid gap-2">
          <Label>New Password (optional)</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button onClick={save} disabled={isPending || !name || !email}>
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}
