import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type {
  CloudFrontResponseEvent,
  CloudFrontResultResponse,
} from "aws-lambda";
import { default as sharp } from "sharp";

const PathPrefix = "/image";
const SplitPath = `${PathPrefix}/`;

const S3 = new S3Client({
  region: "ap-northeast-1",
});

// HACK: 環境変数的な機能があるならそちらに寄せたい
const Bucket = "blogblogdynamicasset0baa4ad78dcb44a194a0";

export function matchUrl(path: string, pathPrefix: string) {
  if (!path.startsWith(SplitPath)) {
    return undefined;
  }

  const imagePath = path.substring(SplitPath.length);

  const match = imagePath.match(
    /^([1-9][0-0]*)x([1-9][0-0]*)\/(webp|avif|png|jpeg)\/(.+)$/
  );
  if (!match) {
    return undefined;
  }

  const width = parseInt(match[1], 10);
  const height = parseInt(match[2], 10);
  const requiredFormat = match[3] as "webp" | "avif" | "png" | "jpeg";
  const imageKey = match[4];

  const objectPrefix = pathPrefix.substring(1);
  const originalObjectKey = `${objectPrefix}/original/${imageKey}`;
  // path.substring(1) と同じ
  const resizedObjectKey = `${objectPrefix}/${width}x${height}/${requiredFormat}/${imageKey}`;

  return {
    originalObjectKey,
    resizedObjectKey,
    width,
    height,
    requiredFormat,
  };
}

export async function handler(
  event: CloudFrontResponseEvent
): Promise<CloudFrontResultResponse> {
  const response = event.Records[0].cf.response;

  //check if image is not present
  if (response.status !== "404") {
    return response;
  }

  const request = event.Records[0].cf.request;

  // read the required path. Ex: uri /images/100x100/webp/image.jpg
  const path = request.uri;
  const matches = matchUrl(path, PathPrefix);
  if (!matches) {
    return response;
  }
  const { originalObjectKey, resizedObjectKey, width, height, requiredFormat } =
    matches;

  // get the source image file
  const command = new GetObjectCommand({
    Bucket: Bucket,
    Key: originalObjectKey,
  });
  const res = await S3.send(command);
  // perform the resize operation
  const originalImageBody = res.Body;
  if (!originalImageBody) {
    return response;
  }

  const originalImage = await originalImageBody.transformToByteArray();

  const buffer = await sharp(originalImage)
    .resize(width, height)
    .toFormat(requiredFormat)
    .toBuffer();

  const putCommand = new PutObjectCommand({
    Body: buffer,
    Bucket: Bucket,
    ContentType: path.substring(1),
    CacheControl: "max-age=604800",
    Key: resizedObjectKey,
    StorageClass: "STANDARD",
  });
  try {
    await S3.send(putCommand);
  } catch (err) {
    console.log("Exception while writing resized image to bucket");
  }

  return {
    status: "200",
    body: buffer.toString("base64"),
    bodyEncoding: "base64",
    headers: {
      ...response.headers,
      "content-type": [
        { key: "Content-Type", value: "image/" + requiredFormat },
      ],
    },
  };
}
