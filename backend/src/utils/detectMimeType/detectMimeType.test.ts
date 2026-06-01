import assert from "node:assert/strict";

import { describe, it } from "vitest";

import { detectMimeType } from "./detectMimeType.ts";

function buf(...bytes: number[]) {
  return Buffer.from(bytes);
}

describe("detectMimeType", () => {
  it("detects MP3 by ID3 header", () => {
    const result = detectMimeType(buf(0x49, 0x44, 0x33));
    assert.deepEqual(result, { mimeType: "audio/mpeg", ext: "mp3" });
  });

  it("detects MP3 by sync header", () => {
    const result = detectMimeType(buf(0xff, 0xfb));
    assert.deepEqual(result, { mimeType: "audio/mpeg", ext: "mp3" });
  });

  it("detects WAV", () => {
    const result = detectMimeType(buf(0x52, 0x49, 0x46, 0x46));
    assert.deepEqual(result, { mimeType: "audio/wav", ext: "wav" });
  });

  it("detects OGG", () => {
    const result = detectMimeType(buf(0x4f, 0x67, 0x67, 0x53));
    assert.deepEqual(result, { mimeType: "audio/ogg", ext: "ogg" });
  });

  it("detects FLAC", () => {
    const result = detectMimeType(buf(0x66, 0x4c, 0x61, 0x43));
    assert.deepEqual(result, { mimeType: "audio/flac", ext: "flac" });
  });

  it("detects WebM by EBML header", () => {
    const result = detectMimeType(buf(0x1a, 0x45, 0xdf, 0xa3));
    assert.deepEqual(result, { mimeType: "audio/webm", ext: "webm" });
  });

  it("falls back to webm for unknown bytes", () => {
    const result = detectMimeType(buf(0x00, 0x00, 0x00, 0x00));
    assert.deepEqual(result, { mimeType: "audio/webm", ext: "webm" });
  });

  it("handles empty buffer", () => {
    const result = detectMimeType(Buffer.alloc(0));
    assert.deepEqual(result, { mimeType: "audio/webm", ext: "webm" });
  });
});
