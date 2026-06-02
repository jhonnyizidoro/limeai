import assert from "node:assert/strict";

import { beforeEach, describe, it, vi } from "vitest";

const mockMkdir = vi.hoisted(() => vi.fn(() => Promise.resolve(undefined)));
const mockWriteFile = vi.hoisted(() => vi.fn(() => Promise.resolve(undefined)));
const mockDetectMimeType = vi.hoisted(() => vi.fn(() => ({ mimeType: "audio/webm", ext: "webm" })));

vi.mock("fs/promises", () => ({
  mkdir: mockMkdir,
  writeFile: mockWriteFile,
}));

vi.mock("../../env.ts", () => ({
  default: {
    storageType: "local",
    uploadsUrl: "http://localhost:8080",
    openAiKey: "test",
    aws: { accessKey: "placeholder", secretKey: "placeholder", bucket: "placeholder", region: "placeholder" },
    db: { user: "test", password: "test", name: "test", port: "5432", host: "localhost" },
  },
}));

vi.mock("../../utils/detectMimeType/index.ts", () => ({
  detectMimeType: mockDetectMimeType,
}));

const { uploadAudioToFileSystem } = await import("./uploadAudioToFileSystem.ts");

describe("uploadAudioToFileSystem", () => {
  beforeEach(() => {
    mockMkdir.mockClear();
    mockWriteFile.mockClear();
    mockDetectMimeType.mockReturnValue({ mimeType: "audio/webm", ext: "webm" });
  });

  it("creates audio directory and writes file", async () => {
    const base64 = Buffer.from("fake-audio").toString("base64");

    await uploadAudioToFileSystem(base64);

    assert.equal(mockMkdir.mock.calls.length, 1);
    assert.equal(mockMkdir.mock.calls[0]?.[0], "/uploads/audio");
    assert.equal(mockWriteFile.mock.calls.length, 1);
  });

  it("returns URL with uploadsUrl base and correct extension", async () => {
    const base64 = Buffer.from("fake-audio").toString("base64");

    const url = await uploadAudioToFileSystem(base64);

    assert.match(url, /^http:\/\/localhost:8080\/audio\/.+\.webm$/);
  });

  it("uses extension from detectMimeType", async () => {
    mockDetectMimeType.mockReturnValue({ mimeType: "audio/mpeg", ext: "mp3" });
    const base64 = Buffer.from("fake-mp3").toString("base64");

    const url = await uploadAudioToFileSystem(base64);

    assert.match(url, /\.mp3$/);
  });

  it("decodes base64 before writing", async () => {
    const content = "hello world";
    const base64 = Buffer.from(content).toString("base64");

    await uploadAudioToFileSystem(base64);

    const written = mockWriteFile.mock.calls[0]?.[1] as Buffer;
    assert.equal(written.toString(), content);
  });

  it("generates unique filename per upload", async () => {
    const base64 = Buffer.from("data").toString("base64");
    const [url1, url2] = await Promise.all([uploadAudioToFileSystem(base64), uploadAudioToFileSystem(base64)]);

    assert.notEqual(url1, url2);
  });

  it("propagates write errors", async () => {
    mockWriteFile.mockImplementationOnce(() => Promise.reject(new Error("disk full")));
    const base64 = Buffer.from("data").toString("base64");

    await assert.rejects(() => uploadAudioToFileSystem(base64), /disk full/);
  });
});
