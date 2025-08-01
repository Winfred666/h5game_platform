import "server-only";

import JSZip from "jszip";
import { MINIO_BUCKETS } from "../clientConfig";
import { MINIO_CONCURRENT_WORKERS } from "../serverConfig";
import { lookup } from "mime-types";
import { minio } from "../dbInit";
import { Readable } from "stream";

// Shared function to load ZIP once
const loadZipFromFile = async (file: File): Promise<JSZip> => {
  const arrayBuffer = await file.arrayBuffer();
  return await JSZip.loadAsync(arrayBuffer);
};

// Check whether zip has index.html at root (for HTML games)
export const checkZipHasIndexHtml = async (file: File): Promise<JSZip> => {
  // Check for index.html specifically at root level
  const zip = await loadZipFromFile(file);
  const valid = zip.files["index.html"] !== undefined;
  if (!valid) throw new Error("在ZIP根目录未检测到index.html，无法在线游玩");
  return zip;
};

// Get MIME type for file
const getMimeType = (filename: string): string => {
  const mimeType = lookup(filename);
  return mimeType || "application/octet-stream";
};

// Upload ZIP contents to MinIO
const uploadZipContents = async (
  game: { id: number; isPrivate: boolean },
  zip: JSZip
) => {
  // 1. Get a clean list of all file objects to be uploaded (excluding directories)
  const filesToUpload = Object.values(zip.files).filter((file) => !file.dir);

  if (filesToUpload.length === 0) {
    console.log("No files to upload in the ZIP archive.");
    return;
  }

  console.log(
    `Preparing to upload ${filesToUpload.length} files with ${MINIO_CONCURRENT_WORKERS} concurrent workers.`
  );

  const bucketName = game.isPrivate
    ? MINIO_BUCKETS.UNAUDIT_GAME
    : MINIO_BUCKETS.GAME;

  // 2. Split the work into chunks (batches)
  const concurrentChunks: JSZip.JSZipObject[][] = [];
  for (let i = 0; i < filesToUpload.length; i += MINIO_CONCURRENT_WORKERS) {
    concurrentChunks.push(filesToUpload.slice(i, i + MINIO_CONCURRENT_WORKERS));
  }

  // 3. Process each chunk sequentially, but files within a chunk run in parallel
  let uploadedCount = 0;
  for (const chunk of concurrentChunks) {
    const uploadPromises = chunk.map(async (file) => {
      try {
        if (!minio) throw new Error("MinIO client not available");
        // --- STREAMING CHANGE ---
        // Get a readable stream instead of a buffer
        const nodeStream = Readable.fromWeb(file.nodeStream() as any);
        const contentType = getMimeType(file.name);
        const objectName = `${game.id}/${file.name}`;

        // The MinIO client can directly accept a stream.
        await minio.putObject(
          bucketName,
          objectName,
          nodeStream, // Pass the converted Node.js stream
          (file as any)._data.uncompressedSize,
          {
            "Content-Type": contentType,
          }
        );
        // --- END OF STREAMING CHANGE ---
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw error;
      }
    });

    await Promise.all(uploadPromises);
    uploadedCount += chunk.length;
    console.log(`Uploaded ${uploadedCount} / ${filesToUpload.length} files...`);
  }

  console.log(
    `All ${filesToUpload.length} files have been uploaded successfully.`
  );
};

// Main function to upload game ZIP package
export const uploadGameFolder = async (
  game: { id: number; isPrivate: boolean },
  file: File,
  zip?: JSZip // if zip is already loaded, means it is an online game with HTML
): Promise<void> => {
  if (!minio) throw new Error("MinIO client not available");

  try {
    // 0. Validate HTML in ZIP for online games (not here)
    // 1. Load ZIP once from file
    const isOnline = zip === undefined;
    if (!zip) {
      zip = await loadZipFromFile(file);
    }

    // 2. Upload original ZIP file
    const arrayBuffer = await file.arrayBuffer();
    const zipBuffer = Buffer.from(arrayBuffer);
    const originalZipName = `${game.id}/game.zip`; // follow the gen id rule
    const bucket = game.isPrivate
      ? MINIO_BUCKETS.UNAUDIT_GAME
      : MINIO_BUCKETS.GAME;

    await minio.putObject(
      bucket,
      originalZipName,
      zipBuffer,
      zipBuffer.length,
      {
        "Content-Type": "application/zip",
      }
    );

    console.log(`DEBUG: Uploaded original ZIP: ${originalZipName}`);

    // 3. Extract and upload ZIP contents (reuse loaded ZIP)
    if (isOnline) {
      await uploadZipContents(game, zip);
    }

    console.log(
      `DEBUG: Game package uploaded successfully for game ${game.id}`
    );
  } catch (error) {
    console.error(
      `DEBUG: Failed to upload game package for game ${game.id}:`,
      error
    );
    throw error;
  }
};

// Helper function to delete game folder (for updates)
export const deleteGameFolder = async (game: {
  id: number;
  isPrivate: boolean;
}): Promise<void> => {
  try {
    if (!minio) throw new Error("MinIO client not available");
    const bucket = game.isPrivate
      ? MINIO_BUCKETS.UNAUDIT_GAME
      : MINIO_BUCKETS.GAME;

    const objectsList: string[] = [];
    const objectsStream = minio.listObjects(
      MINIO_BUCKETS.GAME,
      `${game.id}/`,
      true
    );
    // Collect all object names
    await new Promise<void>((resolve, reject) => {
      objectsStream.on("data", (obj) => {
        if (obj.name) objectsList.push(obj.name);
      });

      objectsStream.on("end", resolve);
      objectsStream.on("error", reject);
    });

    // Delete all objects
    if (objectsList.length > 0) {
      // WARNING: MINIO removeObjects could handle up to 1000 objects at once
      const apiBatchSize = 1000;
      const apiBatches: string[][] = [];
      for (let i = 0; i < objectsList.length; i += apiBatchSize) {
        apiBatches.push(objectsList.slice(i, i + apiBatchSize));
      }

      const concurrentChunks: string[][][] = [];
      for (let i = 0; i < apiBatches.length; i += MINIO_CONCURRENT_WORKERS) {
        concurrentChunks.push(
          apiBatches.slice(i, i + MINIO_CONCURRENT_WORKERS)
        );
      }

      for (const chunk of concurrentChunks) {
        // Inside a chunk, all API batches run in parallel.
        const deletionPromises = chunk.map(async (batch) => {
          if (!minio) throw new Error("MinIO client not available");
          return minio.removeObjects(bucket, batch).catch((err) => {
            console.error(`Failed to delete a batch of objects:`, err);
            throw err; // Ensure the Promise.all fails if a single batch fails
          });
        });
        // Wait for the current set of parallel operations to complete.
        await Promise.all(deletionPromises);
      }
      console.log(
        `DEBUG: Deleted ${objectsList.length} objects for game ${game.id}`
      );
    }
  } catch (error) {
    console.error(
      `DEBUG: Failed to delete game folder for game ${game.id}:`,
      error
    );
    throw error;
  }
};

export const switchBucketGameFolder = async (game: {
  id: number;
  isPrivate: boolean;
}) => {
  if (!minio) throw new Error("MinIO client not available");
  const oldBucket = game.isPrivate
    ? MINIO_BUCKETS.UNAUDIT_GAME
    : MINIO_BUCKETS.GAME;
  const newBucket = game.isPrivate
    ? MINIO_BUCKETS.GAME
    : MINIO_BUCKETS.UNAUDIT_GAME;

  const objectsList: string[] = [];
  const objectsStream = minio.listObjects(oldBucket, `${game.id}/`, true);
  // Collect all object names
  await new Promise<void>((resolve, reject) => {
    objectsStream.on("data", (obj) => {
      if (obj.name) objectsList.push(obj.name);
    });
    objectsStream.on("end", resolve);
    objectsStream.on("error", reject);
  });
  
  // split to chunks of 10 workers each
  const concurrentChunks: string[][] = [];
  for (let i = 0; i < objectsList.length; i += MINIO_CONCURRENT_WORKERS) {
    concurrentChunks.push(objectsList.slice(i, i + MINIO_CONCURRENT_WORKERS));
  }

  let uploadedCount = 0;
  for (const chunk of concurrentChunks) {
    // Inside a chunk, all copy + delete operations run in parallel.
    const movePromises = chunk.map(async (objectName) => {
      if (!minio) throw new Error("MinIO client not available");
      await minio.copyObject(newBucket, objectName, `${oldBucket}/${objectName}`);
      await minio.removeObject(oldBucket, objectName);
    });
    await Promise.all(movePromises);
    uploadedCount += chunk.length;
  }
  console.log(
    `DEBUG: Moved ${uploadedCount} objects from ${oldBucket} to ${newBucket} for game ${game.id}`
  );
}