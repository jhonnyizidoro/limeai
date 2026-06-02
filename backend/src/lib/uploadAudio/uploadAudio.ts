import env from "../../env.ts";
import { uploadAudioToFileSystem } from "../uploadAudioToFileSystem/uploadAudioToFileSystem.ts";
import { uploadAudioToS3 } from "../uploadAudioToS3/index.ts";

export async function uploadAudio(base64: string): Promise<string> {
  if (env.storageType === "local") {
    return uploadAudioToFileSystem(base64);
  }
  return uploadAudioToS3(base64);
}
