import "server-only";

import { PrismaClient } from "@prisma/client";
import * as Minio from "minio";
import { GameExtension, TagExtension, UserExtension } from "./dbExtensions";
import { createMinioClient } from "./dbInitUtils";

// This declaration extends the global scope with our prisma instance.
// type ModelRelationMap = Map<string, string[]>;
declare global {
  // We use `var` here because `let` and `const` have block scope.
  // The global object is not affected by Hot Module Replacement (HMR).
  var prisma: ReturnType<typeof createExtendedPrismaClient> | undefined;
  var minio: Minio.Client | undefined;
  var topGamesInitialized: boolean | undefined;
  var userViewBucket: Map<string, number> | undefined; // For tracking user views by IP
}

// If globalThis.prisma exists, use it. Otherwise, create a new PrismaClient.
// This prevents creating new connections on every hot-reload in development.
export const db = globalThis.prisma || createExtendedPrismaClient();

// Only initialize once using global flag
if (!globalThis.topGamesInitialized && process.env.NEXT_PHASE !== 'phase-production-build') {
  globalThis.topGamesInitialized = true;
  setTimeout(async () => {
    try {
      const { startAutoTopGamesCalc } = await import("./services/dailyTopGame");
      await startAutoTopGamesCalc();
    } catch (error) {
      console.error('❌ Failed to start top games calculation:', error);
      globalThis.topGamesInitialized = false; // Reset on failure
    }
  }, 3000);
}

// Add lazy minio getter
let _minioClient: Minio.Client | undefined;
export async function getMinio(): Promise<Minio.Client | undefined> {
  if (_minioClient) return _minioClient;
  if (globalThis.minio) {
    _minioClient = globalThis.minio;
    return _minioClient;
  }
  _minioClient = await createMinioClient();
  return _minioClient;
}


function createExtendedPrismaClient() {
  const prisma = new PrismaClient({
    omit: {
      user: {
        hash: true, // ALWAYS omit password hash
        qq: true, // omit qq number for security, only admin can see it
        isAdmin: true,
      },
      // need to expose game.isPrivate for smart URL gen.
      tag: {
        hide: true, // hide is only for admin
      }
    },
  })
    .$extends(GameExtension)
    .$extends(UserExtension)
    .$extends(TagExtension);
    
  // Fix: assign to global BEFORE returning
  globalThis.prisma = prisma;
  return prisma;
}
