"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createUserAction } from "@/lib/actions/users";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateUserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create User</CardTitle>
        <CardDescription>Create a user profile with optional avatar upload.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="user-name">Name</Label>
          <Input
            id="user-name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="user-password">Password</Label>
          <Input
            id="user-password"
            type="password"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label>Avatar (UploadThing)</Label>
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
                toast.success("Avatar uploaded.");
              }}
              onUploadError={(error: Error) => {
                toast.error(error.message);
              }}
            />
          </div>
          {avatar && (
            <div className="flex items-center gap-2 rounded border p-2">
              <img src={avatar} alt="Avatar preview" className="h-10 w-10 rounded-full object-cover" />
              <span className="text-xs text-muted-foreground">Uploaded avatar ready</span>
            </div>
          )}
        </div>
        <Button
          disabled={isPending || name.trim().length === 0 || !email || !password}
          onClick={() =>
            startTransition(async () => {
              const result = await createUserAction({ name, email, password, avatar });
              if (!result.ok) {
                toast.error("Failed to create user.");
                return;
              }
              toast.success("User created.");
              setName("");
              setEmail("");
              setPassword("");
              setAvatar("");
            })
          }
        >
          {isPending ? "Saving..." : "Create User"}
        </Button>
      </CardContent>
    </Card>
  );
}
