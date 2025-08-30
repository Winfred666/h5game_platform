import "server-only";
import { exec } from "child_process";
import { promisify } from "util";
import { byteToMB } from "../utils";
import { existsSync, statSync, writeFileSync, readFileSync } from "fs";
import JSZip from "jszip";
import { getMinio } from "../dbInit";
import { MINIO_BUCKETS } from "../clientConfig";

const execAsync = promisify(exec);

// Extract all objects from a MinIO bucket into a zip file
async function extractBucketToZip(bucketName: string): Promise<Buffer | null> {
  try {
    const minio = await getMinio();
    if (!minio)
      throw Error(
        `⚠️ MinIO client not available, skipping bucket: ${bucketName}`
      );

    // console.log(`📦 Extracting bucket: ${bucketName}`);
    const zip = new JSZip();
    let objectCount = 0;

    // List all objects in the bucket
    const objectsList: { name: string; size?: number }[] = [];
    const objectsStream = minio.listObjects(bucketName, "", true);

    // Collect all object names
    await new Promise<void>((resolve, reject) => {
      objectsStream.on("data", (obj) => {
        if (obj.name) {
          objectsList.push({ name: obj.name, size: obj.size });
        }
      });
      objectsStream.on("end", resolve);
      objectsStream.on("error", reject);
    });

    if (objectsList.length === 0) {
      console.log(`📭 Bucket ${bucketName} is empty`);
      return null;
    }

    // Download and add each object to zip
    for (const obj of objectsList) {
      try {
        const objectStream = await minio.getObject(bucketName, obj.name);
        const chunks: Buffer[] = [];

        // Collect all chunks from the stream
        await new Promise<void>((resolve, reject) => {
          objectStream.on("data", (chunk) => chunks.push(chunk));
          objectStream.on("end", resolve);
          objectStream.on("error", reject);
        });

        const buffer = Buffer.concat(chunks);
        zip.file(obj.name, buffer);
        objectCount++;
        if (objectCount % 100 === 0) {
          console.log(
            `📁 Processed ${objectCount}/${objectsList.length} objects from ${bucketName}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Failed to extract object ${obj.name} from ${bucketName}:`,
          error
        );
        // Continue with other objects instead of failing completely
      }
    }
    console.log(
      `✅ Successfully extracted ${objectCount} objects from ${bucketName}`
    );
    if (objectCount === 0) return null;

    return await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    });
  } catch (error) {
    console.error(`❌ Failed to extract bucket ${bucketName}:`, error);
    return null;
  }
}

// Create a complete backup with database and all MinIO buckets
async function createCompleteBackup(backupPath: string): Promise<void> {
  const mainZip = new JSZip();
  // 1. Add database files
  try {
    const dbPath = "/data/db/prod.db";
    const dbBuffer = readFileSync(dbPath);
    mainZip.file("db/prod.db", dbBuffer);
    console.log("✅ Added database to backup");
  } catch (error) {
    console.error("❌ Failed to add database to backup:", error);
  }

  // 2. Extract each MinIO bucket to separate zip files
  for (const bucketName of [
    MINIO_BUCKETS.GAME,
    MINIO_BUCKETS.UNAUDIT_GAME,
    MINIO_BUCKETS.IMAGE,
  ]) {
    try {
      const bucketZip = await extractBucketToZip(bucketName);
      if (bucketZip) {
        mainZip.file(`minio/${bucketName}.zip`, bucketZip);
        // console.log(`✅ Added bucket ${bucketName} to backup`);
      }
    } catch (error) {
      console.error(`❌ Failed to backup bucket ${bucketName}:`, error);
    }
  }

  // 3. Generate final backup file
  const finalBuffer = await mainZip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }, // Balance between size and speed
  });
  writeFileSync(backupPath, finalBuffer);
}

// WARNING: only for deploy mode in container.
export async function createOrReuseBackupZip(): Promise<{
  backupPath: string;
  fileName: string;
  size: number;
}> {
  // no timestamp, only one backup file.
  const fileName = `h5game_backup.zip`;
  const backupPath = `/tmp/${fileName}`;
  let shouldCreateNew = true;
  let size = 0;

  // Check if backup file exists and is recent (within 10 minutes)
  if (existsSync(backupPath)) {
    const stats = statSync(backupPath);
    size = stats.size;
    const fileAge = Date.now() - stats.mtime.getTime();
    const tenMinutesInMs = 30 * 60 * 1000;

    if (fileAge < tenMinutesInMs) {
      console.log(
        `📦 Using existing backup file (${Math.round(fileAge / 1000)}s old)`
      );
      shouldCreateNew = false;
    } else {
      console.log(
        `🔄 Backup file is ${Math.round(
          fileAge / 60000
        )} minutes old, creating new one`
      );
      // Remove old backup file
      await execAsync(`rm -f ${backupPath}`);
    }
  } else {
    console.log("🔄 No existing backup file, creating new one");
  }

  if (shouldCreateNew) {
    // Use the new complete backup function that extracts MinIO buckets
    await createCompleteBackup(backupPath);
    // Verify the backup was created
    if (!existsSync(backupPath)) {
      throw new Error("Backup file was not created");
    }
    const stats = statSync(backupPath);
    console.log(
      `✅ Complete backup created: ${fileName} (${byteToMB(stats.size)})`
    );
    size = stats.size;
  }
  return { backupPath, fileName, size };
}
