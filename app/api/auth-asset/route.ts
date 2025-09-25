// nginx will check whether this version is valid
// for a minio path. If valid, it will serve the file with a long cache time.
// The status code should match the auth_request status code:
// 200: OK, serve the file
// 403: denied

import { MINIO_BUCKETS } from "@/lib/clientConfig";
import { db } from "@/lib/dbInit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const version = searchParams.get("version");
    const assetPath = searchParams.get("path"); // e.g., "BucketName/cmfqand2t00158xvsii0fug6d/game.zip"
    if (!version || !assetPath) {
      return new NextResponse(null, { status: 401 }); // Unauthorized
    }

    // Extract the game ID from the path
    const bucketName = assetPath.split("/")[0];
    // Extract id right after bucket name, stopping at first '.' or next '/'
    const firstSlash = assetPath.indexOf("/");
    let thingId;
    if (firstSlash !== -1) {
      const withoutBucket = assetPath.slice(firstSlash + 1); // part after bucket/
      thingId = withoutBucket.split(/[./]/)[0] || undefined;
    }

    if (!bucketName || !thingId) {
      return new NextResponse(null, { status: 401 });
    }
    switch (bucketName) {
      case MINIO_BUCKETS.AVATAR:
        // get user's updatedAt from db
        const userUpdate = await db.user.findUnique({
          where: { id: thingId },
          select: { updatedAt: true },
        });
        if (
          !userUpdate ||
          userUpdate.updatedAt.getTime().toString() !== version
        ) {
          return new NextResponse(null, { status: 401 }); // Not Found
        }
        break;
      case MINIO_BUCKETS.IMAGE:
      case MINIO_BUCKETS.GAME:
      case MINIO_BUCKETS.UNAUDIT_GAME:
        const gameUpdate = await db.game.findUnique({
          where: { id: thingId },
          select: { updatedAt: true, isPrivate: true },
        });
        if (
          !gameUpdate ||
          gameUpdate.updatedAt.getTime().toString() !== version
        ) {
          return new NextResponse(null, { status: 401 }); // Not Found
        }
        if (bucketName === MINIO_BUCKETS.GAME && gameUpdate.isPrivate) {
          // private game with wrong access
          return new NextResponse(null, { status: 401 }); // Not Found
        }
        break;
      default:
        return new NextResponse(null, { status: 401 }); // Not Found
    }
    return new NextResponse(null, { status: 200 }); // OK, authorized
  } catch (error) {
    console.error("assets error:", error);
    return new NextResponse(null, { status: 403 }); // Error
  }
}
