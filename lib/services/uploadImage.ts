import "server-only";

import { MINIO_BUCKETS } from "../clientConfig";
import { getMinio } from "../dbInit";

import sharp from "sharp";

export async function uploadImage(
  bucketName: MINIO_BUCKETS,
  objectName: string,
  file: File | Response,
  compressed: boolean = true
) {
  const minio = await getMinio();
  if (!minio) throw new Error("MinIO client is not initialized.");

  // 1. Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  if (file.type === "image/gif") {
    // 2. for .gif, do not convert to webp, just upload directly
    const buffer = Buffer.from(arrayBuffer);
    await minio.putObject(bucketName, objectName, buffer, buffer.length, {
      "Content-Type": "image/gif", // Set the correct content type for GIF
    });
    return;
  } else {
    // 3. Convert the image buffer to WebP format using Sharp
    let webpSharp: sharp.Sharp;
    
    if (!compressed) {
      webpSharp = sharp(arrayBuffer).webp({lossless: true});
    } else if (bucketName === MINIO_BUCKETS.AVATAR) {
      webpSharp = sharp(arrayBuffer)
        .resize(200, 200, {
          fit: "cover",
          position: "center",
        })
        .webp({ quality: 70 });
    } else {
      webpSharp = sharp(arrayBuffer).webp({ quality: 80 }); // std quality for WebP
    }

    const webpBuffer = await webpSharp.toBuffer();

    // 4. Upload the WebP buffer to MinIO
    await minio.putObject(bucketName, objectName, webpBuffer, undefined, {
      "Content-Type": "image/webp", // Set the correct content type for WebP
    });
  }
}


export async function uploadImageFromWebURL(
  bucketName: MINIO_BUCKETS,
  objectName: string,
  imageUrl: string,
  compressed: boolean = true
) {
  if(imageUrl.trim() === "") return;
  const minio = await getMinio();
  if (!minio) throw new Error("MinIO client is not initialized.");

  // Download the image from the web URL
  const response = await fetch(imageUrl);
  // console.log(response);
  if (!response.ok) throw new Error("Failed to download image");

  // Upload the image buffer to MinIO
  await uploadImage(bucketName, objectName, response, compressed);
}

// delete image from minio
export async function deleteImage(
  bucketName: MINIO_BUCKETS,
  objectName: string
) {
  const minio = await getMinio();
  if (!minio) throw new Error("MinIO client is not initialized.");
  await minio.removeObject(bucketName, objectName);
}

export async function deleteImageFolder(
  bucketName: MINIO_BUCKETS,
  folderName: string
) {
  const minio = await getMinio();
  if (!minio) throw new Error("MinIO client is not initialized.");
  // List all objects in the specified folder
  const objectsStream = minio.listObjects(bucketName, folderName, true);
  // Collect all object names
  const objectNames: string[] = [];
  for await (const obj of objectsStream) {
    objectNames.push(obj.name);
  }
  // Remove each object
  for (const objectName of objectNames) {
    await minio.removeObject(bucketName, objectName);
  }
}

// rename image in minio
export async function renameImage(
  bucketName: MINIO_BUCKETS,
  oldObjectName: string,
  newObjectName: string
) {
  const minio = await getMinio();
  if (!minio) throw new Error("MinIO client is not initialized.");
  // Copy the object to the new name
  await minio.copyObject(
    bucketName,
    newObjectName,
    `${bucketName}/${oldObjectName}`
  );
  // Delete the old object
  await minio.removeObject(bucketName, oldObjectName);
}
