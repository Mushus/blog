import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const Bucket = process.env.IMAGES_BUCKET_NAME;
const ObjectPrefix = process.env.IMAGES_OBJECT_PREFIX;

const s3 = new S3Client({});

export type SavedImage = {
  key: string;
  body: File;
  mimeType: string;
};

export async function saveImage(props: SavedImage) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket,
      Key: `${ObjectPrefix}/${props.key}`,
      Body: props.body.stream(),
      ContentType: props.mimeType,
    },
  });
  await upload.done();
}

export async function getImage(id: string) {
  const command = new GetObjectCommand({
    Bucket,
    Key: `${ObjectPrefix}/${id}`,
  });
  const res = await s3.send(command);
  if (!res.Body) {
    throw new Error("No body");
  }

  if (!res.ContentType) {
    throw new Error("No content type");
  }

  return {
    body: res.Body,
    mimeType: res.ContentType,
  };
}
