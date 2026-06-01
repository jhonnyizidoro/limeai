import assert from "node:assert/strict";

import { beforeEach, describe, it, vi } from "vitest";

const mockCreate = vi.hoisted(() => vi.fn(() => Promise.resolve({ text: "hello world" })));

vi.mock("openai", () => ({
  default: class {
    audio = {
      transcriptions: {
        create: mockCreate,
      },
    };
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

const { transcribeAudio } = await import("./transcribe.ts");

describe("transcribeAudio", () => {
  beforeEach(() => {
    mockCreate.mockClear();
  });

  it("returns transcription text", async () => {
    const base64 = Buffer.from("fake-audio").toString("base64");

    const result = await transcribeAudio(base64);

    assert.equal(result, "hello world");
    assert.equal(mockCreate.mock.calls.length, 1);
  });

  it("passes correct model to OpenAI", async () => {
    const base64 = Buffer.from("fake-audio").toString("base64");

    await transcribeAudio(base64);

    const calls = mockCreate.mock.calls as unknown as [{ model: string }][];
    const args = calls.at(0)?.[0];
    assert.ok(args);
    assert.equal(args.model, "whisper-1");
  });

  it("decodes base64 and passes as File", async () => {
    const base64 = Buffer.from("fake-audio").toString("base64");

    await transcribeAudio(base64);

    const calls = mockCreate.mock.calls as unknown as [{ file: File }][];
    const args = calls.at(0)?.[0];
    assert.ok(args);
    assert.ok(args.file instanceof File);
  });

  it("propagates OpenAI errors", async () => {
    mockCreate.mockImplementationOnce(() => Promise.reject(new Error("API failure")));
    const base64 = Buffer.from("data").toString("base64");

    await assert.rejects(() => transcribeAudio(base64), /API failure/);
  });
});
