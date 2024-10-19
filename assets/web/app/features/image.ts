import { Temporal } from "temporal-polyfill";
import {
  listImages as listDynamoImage,
  saveImage as saveDynamoImage,
} from "@/features/dynamodb/image";
import {
  saveImage as saveS3Image,
  getImage as getS3Image,
} from "@/features/s3/image";
import { fileTypeFromStream } from "file-type";
import { ulid } from "ulid";

export type SavedImage = {
  ownerId: string;
  body: File;
  createdAt: Temporal.Instant;
};

export type Image = {
  ownerId: string;
  key: string;
  createdAt: Temporal.Instant;
};

const allowedMimeTypes = ["image/jpeg", "image/png"];

export async function listImages(): Promise<Image[]> {
  return await listDynamoImage();
}

export async function saveImage(image: SavedImage): Promise<string> {
  const fileType = await fileTypeFromStream(image.body.stream());
  if (!fileType) {
    throw new Error("Invalid file type");
  }

  if (!allowedMimeTypes.includes(fileType.mime)) {
    throw new Error("Invalid mime type");
  }

  const id = ulid();
  const key = `${id}.${fileType.ext}`;
  await saveDynamoImage({
    key,
    ...image,
  });
  await saveS3Image({ key, body: image.body, mimeType: fileType.mime });

  return key;
}

export async function getImage(key: string) {
  return await getS3Image(key);
}
