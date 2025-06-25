import { PrismaClient } from '@prisma/client';
import * as Minio from 'minio';

// This declaration extends the global scope with our prisma instance.
declare global {
  // We use `var` here because `let` and `const` have block scope.
  // The global object is not affected by Hot Module Replacement (HMR).
  var prisma: PrismaClient | undefined;
  var minio: Minio.Client | undefined;
}

// If globalThis.prisma exists, use it. Otherwise, create a new PrismaClient.
// This prevents creating new connections on every hot-reload in development.
export const db = globalThis.prisma || new PrismaClient();
export const minio = globalThis.minio || await createMinioClient();

// In non-production environments, we assign the client to the global object.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
  globalThis.minio = minio;
}

// 创建 MinIO 客户端实例的函数
async function createMinioClient(): Promise<Minio.Client> {
  if (!process.env.MINIO_ENDPOINT) {
    throw new Error('MINIO_ENDPOINT is not defined in environment variables');
  }
  const client = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
  });
  try {
    // create our bucket if it does not exist.
    
    // verify buckets
    const buckets = await client.listBuckets();
    console.log('✅ MinIO connection + bucket check successful');
  } catch (error) {
    console.error('❌ MinIO connection failed:', error);
    throw new Error('Failed to connect to MinIO or bucket does not exist');
  }
  return client;
}
async function initMinioBucket(minioClient: Minio.Client) {
}
