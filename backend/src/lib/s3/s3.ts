import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

import env from "../../env.ts";

const s3 = new S3Client({
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKey,
    secretAccessKey: env.aws.secretKey,
  },
});

export async function uploadAudio(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const key = `audio/${randomUUID()}.webm`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.aws.bucket,
      Key: key,
      Body: buffer,
      ContentType: "audio/webm",
    }),
  );

  return `https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;
}
