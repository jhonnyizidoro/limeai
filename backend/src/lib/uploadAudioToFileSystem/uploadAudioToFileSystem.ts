import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

import env from "../../env.ts";
import { detectMimeType } from "../../utils/detectMimeType/index.ts";

const UPLOADS_DIR = "/uploads";

export async function uploadAudioToFileSystem(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const { ext } = detectMimeType(buffer);
  const filename = `${randomUUID()}.${ext}`;
  const dir = join(UPLOADS_DIR, "audio");

  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);

  if (!env.uploadsUrl) {
    throw new Error("You must set a UPLOADS_URL when using local storage");
  }

  return `${env.uploadsUrl}/audio/${filename}`;
}
