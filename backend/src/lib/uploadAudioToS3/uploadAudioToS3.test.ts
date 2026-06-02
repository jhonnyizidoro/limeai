import assert from "node:assert/strict";

import { beforeEach, describe, it, vi } from "vitest";

const mockSend = vi.hoisted(() => vi.fn(() => Promise.resolve({})));
const mockDetectMimeType = vi.hoisted(() => vi.fn(() => ({ mimeType: "audio/webm", ext: "webm" })));

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

vi.mock("../../utils/detectMimeType", () => ({
  detectMimeType: mockDetectMimeType,
}));

const { uploadAudioToS3 } = await import("./uploadAudioToS3.ts");

interface PutInput {
  Body: Buffer;
  ContentType: string;
  Key: string;
}

function getLastCmd() {
  const calls = mockSend.mock.calls as unknown as [{ input: PutInput }][];
  const cmd = calls.at(-1)?.[0];
  assert.ok(cmd);
  return cmd.input;
}

describe("uploadAudio", () => {
  beforeEach(() => {
    mockSend.mockClear();
    mockDetectMimeType.mockReturnValue({ mimeType: "audio/webm", ext: "webm" });
  });

  it("calls S3 and returns public URL", async () => {
    const base64 = Buffer.from("fake-audio").toString("base64");

    const url = await uploadAudioToS3(base64);

    assert.equal(mockSend.mock.calls.length, 1);
    assert.match(url, /^https:\/\/.+\.s3\..+\.amazonaws\.com\/audio\/.+/);
  });

  it("uses extension from detectMimeType in key and URL", async () => {
    mockDetectMimeType.mockReturnValue({ mimeType: "audio/mpeg", ext: "mp3" });
    const base64 = Buffer.from("fake-mp3").toString("base64");

    const url = await uploadAudioToS3(base64);

    assert.match(url, /\.mp3$/);
    assert.match(getLastCmd().Key, /\.mp3$/);
  });

  it("uses ContentType from detectMimeType", async () => {
    mockDetectMimeType.mockReturnValue({ mimeType: "audio/mpeg", ext: "mp3" });
    const base64 = Buffer.from("fake-mp3").toString("base64");

    await uploadAudioToS3(base64);

    assert.equal(getLastCmd().ContentType, "audio/mpeg");
  });

  it("decodes base64 before upload", async () => {
    const content = "hello world";
    const base64 = Buffer.from(content).toString("base64");

    await uploadAudioToS3(base64);

    assert.equal(getLastCmd().Body.toString(), content);
  });

  it("uses unique key per upload", async () => {
    const base64 = Buffer.from("data").toString("base64");
    const urls = await Promise.all([uploadAudioToS3(base64), uploadAudioToS3(base64)]);

    assert.notEqual(urls[0], urls[1]);
  });

  it("propagates S3 errors", async () => {
    mockSend.mockImplementationOnce(() => Promise.reject(new Error("S3 failure")));
    const base64 = Buffer.from("data").toString("base64");

    await assert.rejects(() => uploadAudioToS3(base64), /S3 failure/);
  });
});
