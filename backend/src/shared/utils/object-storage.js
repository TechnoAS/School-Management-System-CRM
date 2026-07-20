import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../../config/env.js';

function ensureR2Config() {
  const missing = [];
  if (!env.R2_ACCESS_KEY_ID) missing.push('R2_ACCESS_KEY_ID');
  if (!env.R2_SECRET_ACCESS_KEY) missing.push('R2_SECRET_ACCESS_KEY');
  if (!env.R2_BUCKET) missing.push('R2_BUCKET');
  if (!env.R2_PUBLIC_BASE_URL) missing.push('R2_PUBLIC_BASE_URL');

  if (missing.length > 0) {
    throw new Error(`Missing required R2 config: ${missing.join(', ')}`);
  }
}

function getR2Client() {
  ensureR2Config();

  const endpoint = env.R2_ENDPOINT || (env.R2_ACCOUNT_ID
    ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : null);

  if (!endpoint) {
    throw new Error('Missing R2 endpoint. Set R2_ENDPOINT or R2_ACCOUNT_ID.');
  }

  return new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

function buildObjectKey(folder, originalName) {
  const ext = path.extname(originalName || '').toLowerCase();
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const prefix = folder.replace(/\/$/, '');
  return `${prefix}/${yyyy}/${mm}/${randomUUID()}${ext}`;
}

export function isR2StorageEnabled() {
  return env.STORAGE_PROVIDER === 'r2';
}

export async function uploadFileToStorage(filePath, mimeType, originalName, folder) {
  if (!isR2StorageEnabled()) {
    return null;
  }

  ensureR2Config();
  const client = getR2Client();
  const key = buildObjectKey(folder, originalName);
  const body = fs.readFileSync(filePath);

  await client.send(new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: mimeType,
  }));

  const base = env.R2_PUBLIC_BASE_URL.replace(/\/$/, '');
  const url = `${base}/${key}`;

  return { key, url };
}

export async function uploadPhotoToStorage(filePath, mimeType, originalName) {
  return uploadFileToStorage(filePath, mimeType, originalName, 'students/photos');
}

export async function uploadDocumentToStorage(filePath, mimeType, originalName) {
  return uploadFileToStorage(filePath, mimeType, originalName, 'students/documents');
}

export async function uploadLogoToStorage(filePath, mimeType, originalName) {
  return uploadFileToStorage(filePath, mimeType, originalName, 'institute/logos');
}

export async function uploadCourseLogoToStorage(filePath, mimeType, originalName) {
  return uploadFileToStorage(filePath, mimeType, originalName, 'courses/logos');
}

export async function uploadCourseBannerToStorage(filePath, mimeType, originalName) {
  return uploadFileToStorage(filePath, mimeType, originalName, 'courses/banners');
}

export async function uploadCourseMaterialToStorage(filePath, mimeType, originalName) {
  return uploadFileToStorage(filePath, mimeType, originalName, 'courses/materials');
}

export function getStorageKeyFromPublicUrl(url) {
  if (!url) {
    return null;
  }

  const base = env.R2_PUBLIC_BASE_URL;
  if (!base) {
    return null;
  }

  const normalizedBase = base.replace(/\/$/, '');
  if (!url.startsWith(normalizedBase + '/')) {
    return null;
  }

  return url.slice(normalizedBase.length + 1) || null;
}

export async function deletePhotoFromStorageByKey(key) {
  if (!isR2StorageEnabled() || !key) {
    return;
  }

  ensureR2Config();
  const client = getR2Client();
  await client.send(new DeleteObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
  }));
}

export async function deleteStoredAssetByUrl(url) {
  if (!url) {
    return;
  }

  if (isR2StorageEnabled() && url.startsWith('http')) {
    const key = getStorageKeyFromPublicUrl(url);
    if (key) {
      await deletePhotoFromStorageByKey(key);
    }
    return;
  }

  if (url.startsWith('/uploads/')) {
    const filename = path.basename(url);
    const filePath = path.join(path.resolve(env.UPLOAD_DIR), filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
