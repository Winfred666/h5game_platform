import "server-only";

import JSZip from "jszip";
import { MAX_ZIP_SIZE, MINIO_BUCKETS } from "../clientConfig";
import { MINIO_CONCURRENT_WORKERS } from "../serverConfig";
import { lookup } from "mime-types";
import { getMinio } from "../dbInit";

// Shared function to load ZIP once
const loadZipFromFile = async (file: File): Promise<JSZip> => {
  if (file.size > MAX_ZIP_SIZE) throw new Error("上传的ZIP文件过大，无法处理");
  const arrayBuffer = await file.arrayBuffer();
  return await JSZip.loadAsync(arrayBuffer);
};

// Check whether zip has index.html at root (for HTML games)
export const checkZipHasIndexHtml = async (file: File): Promise<JSZip> => {
  // Check for index.html specifically at root level
  const zip = await loadZipFromFile(file);
  // 1. if there exist index.html at root, it's valid and do nothing
  // 2. if there exist unique XXX.html at root, copy it to index.html and remove the original (JSZip has no rename)
  if (!zip.files["index.html"]) {
    const rootHtmlFiles = Object.keys(zip.files).filter(
      (name) => name.endsWith(".html") && !name.includes("/")
    );
    if (rootHtmlFiles.length === 1) {
      const sourceName = rootHtmlFiles[0];
      const source = zip.file(sourceName);
      if (source) {
        const content = await source.async("arraybuffer");
        zip.file("index.html", content);
        zip.remove(sourceName);
      }
    } else if (rootHtmlFiles.length > 1) throw new Error("在ZIP根目录检测到多个HTML文件，请指定一个作为启动 index.html");
    else throw new Error("在ZIP根目录未检测到index.html，无法在线游玩");
  }
  return zip;
};

// Get MIME type for file
const getMimeType = (filename: string): string => {
  const mimeType = lookup(filename);
  return mimeType || "application/octet-stream";
};

// Upload ZIP contents to MinIO
const uploadZipContents = async (
  game: { id: string; isPrivate: boolean },
  zip: JSZip
) => {
  const minio = await getMinio();
  // 1. Get a clean list of all file objects to be uploaded (excluding directories)
  // console.log("Try upload zip content!");
  const filesToUpload = Object.values(zip.files).filter((file) => !file.dir);
  // console.log(zip.name, `has ${filesToUpload.length} files to upload.`);

  if (filesToUpload.length === 0) {
    console.log("No files to upload in the ZIP archive.");
    return;
  }

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
        const nodeStream = file.nodeStream() as any;
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
    if (process.env.NODE_ENV !== "production")
      console.log(`Uploaded ${uploadedCount} / ${filesToUpload.length} files...`);
  }

  console.log(
    `All ${filesToUpload.length} files have been uploaded successfully.`
  );
};

// Main function to upload game ZIP package
export const uploadGameFolder = async (
  game: { id: string; isPrivate: boolean },
  file: File,
  zip?: JSZip // if zip is already loaded, means it is an online game with HTML
): Promise<void> => {
  const minio = await getMinio();
  if (!minio) throw new Error("MinIO client not available");

  try {
    // 0. Validate HTML in ZIP for online games (not here)
    // 1. Load ZIP once from file
    const isOnline = zip !== undefined;
    // if (!zip) {
    //   zip = await loadZipFromFile(file);
    // }

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

    // 3. Extract and upload ZIP contents (reuse loaded ZIP)
    if (isOnline) {
      await uploadZipContents(game, zip);
    }
    
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
  id: string;
  isPrivate: boolean;
}): Promise<void> => {
  try {
    const minio = await getMinio();
    if (!minio) throw new Error("MinIO client not available");
    const bucket = game.isPrivate
      ? MINIO_BUCKETS.UNAUDIT_GAME
      : MINIO_BUCKETS.GAME;

    const objectsList: string[] = [];
    const objectsStream = minio.listObjects(
      bucket,
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
  id: string;
  isPrivate: boolean;
}) => {
  const minio = await getMinio();
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
      await minio.copyObject(newBucket, objectName, `/${oldBucket}/${objectName}`);
      await minio.removeObject(oldBucket, objectName);
    });
    await Promise.all(movePromises);
    uploadedCount += chunk.length;
  }
  console.log(
    `Moved ${uploadedCount} objects from ${oldBucket} to ${newBucket} for game ${game.id}`
  );
}