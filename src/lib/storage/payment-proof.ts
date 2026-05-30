import { readEnv } from "@/lib/env";
import fs from "node:fs/promises";
import path from "node:path";

const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), ".uploads", "payment-proofs");

export type StoredPaymentProof = {
  buffer: Buffer;
  fileName: string;
  contentType: string;
};

function getS3Bucket(): string | undefined {
  return readEnv("S3_BUCKET_NAME");
}

function getAwsRegion(): string | undefined {
  return readEnv("AWS_REGION");
}

/** True when S3 env vars are set — used in AWS after local testing. */
export function isPaymentProofS3Configured(): boolean {
  return Boolean(getS3Bucket() && getAwsRegion());
}

function localFilePath(storageKey: string): string {
  return path.join(LOCAL_UPLOAD_ROOT, storageKey);
}

function sanitiseStorageKey(storageKey: string): string {
  return storageKey.replace(/^(\.\.(\/|\\|$))+/, "").replace(/^[/\\]+/, "");
}

/**
 * Persist payment proof bytes locally (dev) or to S3 (when configured).
 */
export async function storePaymentProof(
  file: File,
  storageKey: string,
): Promise<void> {
  const key = sanitiseStorageKey(storageKey);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isPaymentProofS3Configured()) {
    await uploadToS3(key, buffer, file.type || "application/octet-stream");
    return;
  }

  const target = localFilePath(key);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buffer);
}

/**
 * Load payment proof bytes for emailing or admin review.
 */
export async function readPaymentProof(
  storageKey: string,
  fileName: string,
): Promise<StoredPaymentProof | null> {
  const key = sanitiseStorageKey(storageKey);

  if (isPaymentProofS3Configured()) {
    return readFromS3(key, fileName);
  }

  try {
    const buffer = await fs.readFile(localFilePath(key));
    return {
      buffer,
      fileName,
      contentType: guessContentType(fileName),
    };
  } catch {
    return null;
  }
}

function guessContentType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

async function uploadToS3(
  storageKey: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const bucket = getS3Bucket()!;
  const region = getAwsRegion()!;

  const client = new S3Client({ region });
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      Body: body,
      ContentType: contentType,
    }),
  );
}

async function readFromS3(
  storageKey: string,
  fileName: string,
): Promise<StoredPaymentProof | null> {
  try {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const bucket = getS3Bucket()!;
    const region = getAwsRegion()!;

    const client = new S3Client({ region });
    const response = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: storageKey }),
    );
    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) return null;

    return {
      buffer: Buffer.from(bytes),
      fileName,
      contentType: response.ContentType ?? guessContentType(fileName),
    };
  } catch (error) {
    console.error("[storage] S3 read failed:", error);
    return null;
  }
}

export function buildProofStorageKey(
  flatId: string,
  splitId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `flats/${flatId}/splits/${splitId}/${safeName}`;
}
