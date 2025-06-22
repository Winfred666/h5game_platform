import { PrismaClient } from '@prisma/client';

// This declaration extends the global scope with our prisma instance.
declare global {
  // We use `var` here because `let` and `const` have block scope.
  // The global object is not affected by Hot Module Replacement (HMR).
  var prisma: PrismaClient | undefined;
}

// If globalThis.prisma exists, use it. Otherwise, create a new PrismaClient.
// This prevents creating new connections on every hot-reload in development.
export const db = globalThis.prisma || new PrismaClient();

// In non-production environments, we assign the client to the global object.
// This ensures that the same instance is reused. (no need for production because code run only once)
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}