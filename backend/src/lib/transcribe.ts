import OpenAI from "openai";

import env from "../env.ts";

const openai = new OpenAI({ apiKey: env.openAiKey });

function detectMimeType(buf: Buffer): { mimeType: string; ext: string } {
  const b = (i: number) => buf[i] ?? 0;

  if (b(0) === 0x49 && b(1) === 0x44 && b(2) === 0x33)
    return { mimeType: "audio/mpeg", ext: "mp3" };
  if (b(0) === 0xff && (b(1) & 0xe0) === 0xe0) return { mimeType: "audio/mpeg", ext: "mp3" };
  if (b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46)
    return { mimeType: "audio/wav", ext: "wav" };
  if (b(0) === 0x4f && b(1) === 0x67 && b(2) === 0x67 && b(3) === 0x53)
    return { mimeType: "audio/ogg", ext: "ogg" };
  if (b(0) === 0x66 && b(1) === 0x4c && b(2) === 0x61 && b(3) === 0x43)
    return { mimeType: "audio/flac", ext: "flac" };
  if (b(0) === 0x1a && b(1) === 0x45 && b(2) === 0xdf && b(3) === 0xa3)
    return { mimeType: "audio/webm", ext: "webm" };

  return { mimeType: "audio/webm", ext: "webm" };
}

export async function transcribeAudio(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const { mimeType, ext } = detectMimeType(buffer);
  const file = new File([buffer], `audio.${ext}`, { type: mimeType });

  const result = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
  });

  return result.text;
}
