import type {
  CloudFrontHeaders,
  CloudFrontRequestEvent,
  CloudFrontRequestResult,
} from "aws-lambda";
import querystring, { type ParsedUrlQuery } from "node:querystring";

const PathPrefix = "/image";
const SplitPath = `${PathPrefix}/`;

// defines the allowed dimensions, default dimensions and how much variance from allowed
// dimension is allowed.

const allowedDimension = [
  { w: 64, h: 64 },
  { w: 100, h: 100 },
  { w: 200, h: 200 },
  { w: 300, h: 300 },
  { w: 400, h: 400 },
] as const;

const defaultDimension = { w: 200, h: 200 } as const;
const variance = 20 as const;

export function parseDimension(params: ParsedUrlQuery) {
  if (!params.d) return undefined;
  const dimensionValue = Array.isArray(params.d) ? params.d[0] : params.d;
  const dimensionMatch = dimensionValue.match(/^([1-9][0-9]*)x([1-9][0-9]*)$/);
  if (!dimensionMatch) return undefined;
  const w = Number(dimensionMatch[1]);
  const h = Number(dimensionMatch[2]);
  return { w, h };
}

/**
 * 指定されたヘッダーからサポートされている画像タイプを確認します。
 *
 * @param headers - CloudFrontHeadersオブジェクト。HTTPリクエストのヘッダーを含みます。
 * @param supportedImageTypes - サポートされている画像タイプの配列。例: ['jpeg', 'png', 'gif']。
 * @returns サポートされている画像タイプが見つかった場合、そのタイプを返します。見つからない場合はundefinedを返します。
 */
export function detectSupportedImageType(
  headers: CloudFrontHeaders,
  supportedImageFormats: string[]
) {
  const acceptHeader = headers["accept"] ? headers["accept"][0].value : "";
  const acceptedFormats = acceptHeader
    .split(",")
    .map((format) => format.trim());
  const mimeTypes = acceptedFormats.map((format) =>
    format.split(";")[0].trim().split("/")
  );
  const imageMimeTypes = mimeTypes.filter(
    (type) => type[0] === "image" && type?.[1] !== "*"
  );
  return supportedImageFormats.find((format) =>
    imageMimeTypes.find((type) => type[1] === format)
  );
}

export async function handler(
  event: CloudFrontRequestEvent
): Promise<CloudFrontRequestResult> {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  // fetch the uri of original image
  const uri = request.uri;
  if (!uri.startsWith(SplitPath)) {
    return {
      status: "400",
      statusDescription: "Bad Request",
      bodyEncoding: "text",
      body: "Bad Request",
    };
  }

  const imagePath = uri.substring(SplitPath.length);

  const params = querystring.parse(request.querystring);

  /** リサイズするサイズ */
  const dimension = parseDimension(params);
  if (!dimension) {
    request.uri = `${PathPrefix}/original/${imagePath}`;
    return request;
  }

  let width = dimension.w;

  // calculate the acceptable variance. If image dimension is 105 and is within acceptable
  // range, then in our case, the dimension would be corrected to 100.
  const variancePercent = variance / 100;

  /** リサイズ後の画像サイズ */
  let resizedDimension: undefined | { w: number; h: number };
  for (const dimension of allowedDimension) {
    const minWidth = dimension.w - dimension.w * variancePercent;
    const maxWidth = dimension.w + dimension.w * variancePercent;
    if (width >= minWidth && width <= maxWidth) {
      resizedDimension = dimension;
      break;
    }
  }

  // if no match is found from allowed dimension with variance then set to default
  //dimensions.
  if (!resizedDimension) {
    resizedDimension = defaultDimension;
  }

  const match = imagePath.match(/^.*\.([a-zA-Z0-9]*)$/);
  const extension = match ? match[1] : undefined;
  const defaultImageType = extension === "png" ? "png" : "jpeg";

  const imageType =
    detectSupportedImageType(headers, ["webp"]) ?? defaultImageType;

  // final modified url is of format /images/200x200/webp/image.jpg
  request.uri = `${PathPrefix}/${resizedDimension.w}x${resizedDimension.h}/${imageType}/${imagePath}`;
  return request;
}
