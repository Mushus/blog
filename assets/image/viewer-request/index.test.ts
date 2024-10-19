import { describe, expect, it } from "vitest";
import { detectSupportedImageType, handler, parseDimension } from ".";
import type { CloudFrontRequest } from "aws-lambda";
import { CloudFrontResponse } from "hono/lambda-edge";

describe("parseDimension", () => {
  it("未指定", () => {
    const result = parseDimension({});
    expect(result).toBeUndefined();
  });
  it("一つ指定", () => {
    const result = parseDimension({ d: "100x100" });
    expect(result).toEqual({ w: 100, h: 100 });
  });
  it("複数指定", () => {
    const result = parseDimension({ d: ["100x100", "200x200"] });
    expect(result).toEqual({ w: 100, h: 100 });
  });
  it("一部値の欠落", () => {
    const result = parseDimension({ d: "100x" });
    expect(result).toBeUndefined();
  });
  it("指数", () => {
    const result = parseDimension({ d: "exe" });
    expect(result).toBeUndefined();
  });
  it("次元が多すぎる100x100x100", () => {
    const result = parseDimension({ d: "1100x100x100" });
    expect(result).toBeUndefined();
  });
  it("マイナス値100x-100", () => {
    const result = parseDimension({ d: "-100x-100" });
    expect(result).toBeUndefined();
  });
  it("不正な桁", () => {
    const result = parseDimension({ d: "001x001" });
    expect(result).toBeUndefined();
  });
  it("ゼロ", () => {
    const result = parseDimension({ d: "0x0" });
    expect(result).toBeUndefined();
  });
  it("少数", () => {
    const result = parseDimension({ d: "0.1x0" });
    expect(result).toBeUndefined();
  });
});

describe("detectSupportedImageType", () => {
  it("サポートされている画像タイプが見つかる", () => {
    const headers = {
      accept: [{ value: "image/webp,image/apng,image/*,*/*;q=0.8" }],
    };
    const supportedImageFormats = ["webp", "jpeg", "png"];
    const result = detectSupportedImageType(headers, supportedImageFormats);
    expect(result).toBe("webp");
  });

  it("サポートされている画像タイプが見つからない", () => {
    const headers = {
      accept: [{ value: "image/avif,image/apng,image/*,*/*;q=0.8" }],
    };
    const supportedImageFormats = ["webp", "jpeg", "png"];
    const result = detectSupportedImageType(headers, supportedImageFormats);
    expect(result).toBeUndefined();
  });

  it("acceptヘッダーが存在しない", () => {
    const headers = {};
    const supportedImageFormats = ["webp", "jpeg", "png"];
    const result = detectSupportedImageType(
      headers as any,
      supportedImageFormats
    );
    expect(result).toBeUndefined();
  });

  it("acceptヘッダーが空", () => {
    const headers = {
      accept: [{ value: "" }],
    };
    const supportedImageFormats = ["webp", "jpeg", "png"];
    const result = detectSupportedImageType(headers, supportedImageFormats);
    expect(result).toBeUndefined();
  });

  it("サポートされている画像タイプが複数見つかる", () => {
    const headers = {
      accept: [{ value: "image/jpeg,image/png,image/webp" }],
    };
    const supportedImageFormats = ["webp", "jpeg", "png"];
    const result = detectSupportedImageType(headers, supportedImageFormats);
    expect(result).toBe("webp"); // First match in the supportedImageFormats array
  });
});

describe("handler", () => {
  it("dクエリ未指定", async () => {
    const event = {
      Records: [
        {
          cf: { request: { uri: "/image/original.png" } },
        },
      ],
    };
    const result = await handler(event as any);
    expect((result as CloudFrontRequest)?.uri).toBe(
      "/image/original/original.png"
    );
  });
  it("prefixなし", async () => {
    const event = {
      Records: [
        {
          cf: { request: { uri: "/original.png" } },
        },
      ],
    };
    const result = await handler(event as any);
    expect((result as CloudFrontResponse)?.status).toBe("400");
  });
  it("複雑なディレクトリ構造", async () => {
    const event = {
      Records: [
        {
          cf: { request: { uri: "/image/path/to/image/original.png" } },
        },
      ],
    };
    const result = await handler(event as any);
    expect((result as CloudFrontRequest)?.uri).toBe(
      "/image/original/path/to/image/original.png"
    );
  });
  it("d指定あり", async () => {
    const event = {
      Records: [
        {
          cf: {
            request: {
              uri: "/image/original.png",
              querystring: "d=100x100",
              headers: {},
            },
          },
        },
      ],
    };
    const result = await handler(event as any);
    expect((result as CloudFrontRequest)?.uri).toBe(
      "/image/100x100/png/original.png"
    );
  });
  it("拡張子が尊重されること", async () => {
    const event = {
      Records: [
        {
          cf: {
            request: {
              uri: "/image/original.jpg",
              querystring: "d=100x100",
              headers: {},
            },
          },
        },
      ],
    };
    const result = await handler(event as any);
    expect((result as CloudFrontRequest)?.uri).toBe(
      "/image/100x100/jpeg/original.jpg"
    );
  });
  it("acceptヘッダーから形式を判定すること", async () => {
    const event = {
      Records: [
        {
          cf: {
            request: {
              uri: "/image/original.jpg",
              querystring: "d=100x100",
              headers: {
                accept: [{ value: "image/webp,image/apng,image/*,*/*;q=0.8" }],
              },
            },
          },
        },
      ],
    };
    const result = await handler(event as any);
    expect((result as CloudFrontRequest)?.uri).toBe(
      "/image/100x100/webp/original.jpg"
    );
  });
});
