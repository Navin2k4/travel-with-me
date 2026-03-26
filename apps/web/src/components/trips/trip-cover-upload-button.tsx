"use client";

import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import { updateTripCoverImageAction } from "@/lib/actions/trips";

export function TripCoverUploadButton({ tripId }: { tripId: string }) {
  return (
    <UploadButton
      endpoint="tripCoverUploader"
      appearance={{
        button:
          "h-7 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 ut-uploading:cursor-not-allowed ut-uploading:bg-primary/80 ut-uploading:text-primary-foreground",
        allowedContent: "hidden",
      }}
      content={{
        button: () => "Update Image",
      }}
      onClientUploadComplete={async (files) => {
        const file = files?.[0];
        if (!file) return;
        const result = await updateTripCoverImageAction({
          tripId,
          coverImage: file.ufsUrl,
        });
        if (!result.ok) {
          toast.error(typeof result.error === "string" ? result.error : "Failed to update cover image.");
          return;
        }
        toast.success("Trip cover updated.");
      }}
      onUploadError={(error: Error) => {
        toast.error(error.message);
      }}
    />
  );
}
