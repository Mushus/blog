import { describe, expect, it, vi } from "vitest";
import { matchUrl, handler } from "./index.js";
import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("sharp");
const s3Mock = mockClient(S3Client as any);

describe("matchUrl", () => {
    it("正常系", () => {
        expect(matchUrl("/image/100x100/jpeg/original.png", "/image")).toEqual({
            originalObjectKey: "image/original/original.png",
            resizedObjectKey: "image/100x100/jpeg/original.png",
            width: 100,
            height: 100,
            requiredFormat: "jpeg",
        });
    });
    it("prefixが一致しない", () => {
        expect(
            matchUrl("/foo/100x100/jpeg/original.png", "/image")
        ).toBeUndefined();
    });
    it("サイズ不正", () => {
        expect(
            matchUrl("/image/1100x100/jpeg/original.png", "/image")
        ).toBeUndefined();
    });
    it("フォーマット不正", () => {
        expect(
            matchUrl("/image/100x100/jpg/original.png", "/image")
        ).toBeUndefined();
    });
});

describe("handler", () => {
    it("オリジンのステータスコードが200ならそのまま返す", async () => {
        const event = {
            Records: [
                {
                    cf: {
                        response: {
                            status: "200",
                        },
                    },
                },
            ],
        };
        const result = await handler(event as any);
        expect((result as any).status).toBe("200");
    });
    it("オリジンから画像が帰らなかったら生成処理を行う", async () => {
        s3Mock
            .on(GetObjectCommand as any)
            .resolves({ Body: { transformToByteArray() {} } } as any);
        const event = {
            Records: [
                {
                    cf: {
                        request: {
                            uri: "/image/100x100/jpeg/original.png",
                        },
                        response: {
                            status: "404",
                        },
                    },
                },
            ],
        };
        const result = await handler(event as any);
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand as any, {
            Key: "image/original/original.png",
        });
        expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand as any, {
            Key: "image/100x100/jpeg/original.png",
        });
        expect(result).toEqual({
            body: "",
            bodyEncoding: "base64",
            headers: {
                "content-type": [
                    {
                        key: "Content-Type",
                        value: "image/jpeg",
                    },
                ],
            },
            status: "200",
        });
    });
});
