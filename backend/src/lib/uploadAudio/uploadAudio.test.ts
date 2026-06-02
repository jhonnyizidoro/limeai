import assert from "node:assert/strict";

import { beforeEach, describe, it, vi } from "vitest";

const mockEnv = vi.hoisted(() => ({
  storageType: "local" as "local" | "s3",
  uploadsUrl: "http://localhost:8080",
}));

const mockUploadToS3 = vi.hoisted(() => vi.fn(() => Promise.resolve("https://s3.example.com/audio/file.webm")));
const mockUploadToFileSystem = vi.hoisted(() =>
  vi.fn(() => Promise.resolve("http://localhost:8080/audio/file.webm")),
);

vi.mock("../../env.ts", () => ({ default: mockEnv }));
vi.mock("../uploadAudioToS3/index.ts", () => ({ uploadAudioToS3: mockUploadToS3 }));
vi.mock("../uploadAudioToFileSystem/uploadAudioToFileSystem.ts", () => ({
  uploadAudioToFileSystem: mockUploadToFileSystem,
}));

const { uploadAudio } = await import("./uploadAudio.ts");

describe("uploadAudio", () => {
  beforeEach(() => {
    mockUploadToS3.mockClear();
    mockUploadToFileSystem.mockClear();
    mockEnv.storageType = "local";
  });

  it("calls uploadAudioToFileSystem when storageType is local", async () => {
    mockEnv.storageType = "local";
    const base64 = Buffer.from("data").toString("base64");

    await uploadAudio(base64);

    assert.equal(mockUploadToFileSystem.mock.calls.length, 1);
    assert.equal(mockUploadToS3.mock.calls.length, 0);
  });

  it("calls uploadAudioToS3 when storageType is s3", async () => {
    mockEnv.storageType = "s3";
    const base64 = Buffer.from("data").toString("base64");

    await uploadAudio(base64);

    assert.equal(mockUploadToS3.mock.calls.length, 1);
    assert.equal(mockUploadToFileSystem.mock.calls.length, 0);
  });

  it("passes base64 to the correct handler", async () => {
    mockEnv.storageType = "local";
    const base64 = Buffer.from("hello").toString("base64");

    await uploadAudio(base64);

    assert.equal((mockUploadToFileSystem.mock.calls as unknown[][])[0]?.[0], base64);
  });

  it("returns URL from handler", async () => {
    mockEnv.storageType = "local";
    mockUploadToFileSystem.mockResolvedValueOnce("http://localhost:8080/audio/test.webm");

    const url = await uploadAudio(Buffer.from("data").toString("base64"));

    assert.equal(url, "http://localhost:8080/audio/test.webm");
  });

  it("propagates handler errors", async () => {
    mockEnv.storageType = "local";
    mockUploadToFileSystem.mockImplementationOnce(() => Promise.reject(new Error("write failed")));

    await assert.rejects(() => uploadAudio(Buffer.from("data").toString("base64")), /write failed/);
  });
});
