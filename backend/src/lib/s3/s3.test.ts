import assert from "node:assert/strict";

import { beforeEach, describe, it, vi } from "vitest";

const mockSend = vi.hoisted(() => vi.fn(() => Promise.resolve({})));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = mockSend;
  },
  PutObjectCommand: class {
    constructor(public input: unknown) {}
  },
}));

vi.mock("../../env.ts", () => ({
  default: {
    isProd: false,
    openAiKey: "test",
    aws: { accessKey: "test", secretKey: "test", bucket: "test-bucket", region: "us-east-1" },
    db: { user: "test", password: "test", name: "test", port: "5432", host: "localhost" },
  },
}));

const { uploadAudio } = await import("./s3.ts");

describe("uploadAudio", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("calls S3 and returns public URL", async () => {
    const base64 = Buffer.from("fake-audio").toString("base64");

    const url = await uploadAudio(base64);

    assert.equal(mockSend.mock.calls.length, 1);
    assert.match(url, /^https:\/\/.+\.s3\..+\.amazonaws\.com\/audio\/.+\.webm$/);
  });

  it("decodes base64 before upload", async () => {
    const content = "hello world";
    const base64 = Buffer.from(content).toString("base64");

    await uploadAudio(base64);

    const calls = mockSend.mock.calls as unknown as [{ input: { Body: Buffer } }][];
    const cmd = calls.at(0)?.[0];
    assert.ok(cmd);
    assert.equal(cmd.input.Body.toString(), content);
  });

  it("uses unique key per upload", async () => {
    const base64 = Buffer.from("data").toString("base64");
    const urls = await Promise.all([uploadAudio(base64), uploadAudio(base64)]);

    assert.notEqual(urls[0], urls[1]);
  });

  it("propagates S3 errors", async () => {
    mockSend.mockImplementationOnce(() => Promise.reject(new Error("S3 failure")));
    const base64 = Buffer.from("data").toString("base64");

    await assert.rejects(() => uploadAudio(base64), /S3 failure/);
  });
});
