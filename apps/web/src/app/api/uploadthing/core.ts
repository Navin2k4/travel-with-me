import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const uploadRouter = {
  avatarUploader: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),
  tripCoverUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),
  placeImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 6,
    },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
