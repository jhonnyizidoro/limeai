import OpenAI from "openai";

import env from "../../env.ts";
import { detectMimeType } from "../../utils/detectMimeType";

const openai = new OpenAI({ apiKey: env.openAiKey });

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
