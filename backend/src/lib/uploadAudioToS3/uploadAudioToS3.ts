import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

import env from "../../env.ts";
import { detectMimeType } from "../../utils/detectMimeType/index.ts";

const s3 = new S3Client({
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKey,
    secretAccessKey: env.aws.secretKey,
  },
});

export async function uploadAudioToS3(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const { mimeType, ext } = detectMimeType(buffer);
  const key = `audio/${randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.aws.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  return `https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;
}
