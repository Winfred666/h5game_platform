import { NextRequest, NextResponse } from "next/server";
import { ALL_NAVPATH } from "./lib/clientConfig";
import { getToken } from "next-auth/jwt";

const createUrl = (path: string, baseUrlWithPath: string) => {
  // remove the '/' at the beginning of path if it exists
  if (path.startsWith("/")) {
    path = path.slice(1);
  }
  return new URL(path, baseUrlWithPath);
};

// WARNING: becaseu Edge env cannot use Node.js modules like bcrypt, only use fetch API to call auth services.
// or to avoid extra self-fetch, Edge can call getToken because 
// NextAuth uses the Web Crypto API (SubtleCrypto) via the jose library, which is available in the Edge runtime. 
// It doesn’t use Node-only modules like bcrypt or crypto in middleware.

const middlewareAuth = async (request: NextRequest) => {
  const isHttps = request.nextUrl.protocol === "https:";
  const isProd = process.env.NODE_ENV === "production";

  // Match your custom NextAuth cookie names from authSQL.ts
  const cookieName = isProd && isHttps
    ? "__Secure-h5games.session-token"
    : "h5games.session-token";

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    cookieName,
    secureCookie: isHttps,
  });

  if (!token) throw new Error("No session or user found");
  return token; // contains your fields like id, isAdmin, name
};

// ---- Simple per-path fixed-window limiter (per instance) ----
type Rule = { test: (p: string) => boolean; limit: number; windowMs: number };

// Order matters; first match wins
const RATE_RULES: Rule[] = [
  { test: (p) => p.startsWith("/api/auth/session"), limit: 500, windowMs: 60_000 }, // relax
  { test: (p) => p.startsWith("/api/auth/"), limit: 100, windowMs: 60_000 }, // strict
  { test: (p) => p.startsWith("/login"), limit: 250, windowMs: 60_000 }, // login UX
  { test: (p) => p.startsWith("/api/"), limit: 500, windowMs: 60_000 }, // other API
  { test: () => true, limit: 10_000, windowMs: 60_000 }, // public pages (looser)
];

const buckets = new Map<string, { count: number; resetAt: number }>();

function pickRule(pathname: string): Rule {
  return RATE_RULES.find((r) => r.test(pathname))!;
}

// Return NextResponse 429 if limited, otherwise null
function rateLimitPerPath(pathname: string): NextResponse | null {
  const rule = pickRule(pathname);
  // key by rule + exact pathname (per page)
  const key = `${rule.limit}:${rule.windowMs}:${pathname}`;
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return null;
  }

  if (entry.count >= rule.limit) {
    // Reject without extra headers
    return NextResponse.json(
      { error: "too_many_requests", path: pathname },
      { status: 429 }
    );
  }

  entry.count += 1;
  return null;
}
// ---- end limiter ----

// not only check the protected route,
// as we need redirect to some non protected route like /login or /home.
export const config = {
  matcher: [
    "/",
    "/home",
    "/authors",
    "/user/update",
    "/user/self/:path*",
    "/upload/:path*",
    "/admin-dashboard/:path*",
    "/game/unaudit/:path*",

    "/login/:path*",
    "/api/auth/:path*", // ensure auth endpoints are limited too
  ],
};

const userProtectedRoutes = [
  "/authors",
  "/game/unaudit",
  "/upload",
  "/user/self",
  "/user/update",
];

const adminProtectedRoutes = ["/admin-dashboard", "/api/backup"];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const baseUrlWithPath =
    request.nextUrl.origin + request.nextUrl.basePath + "/"; // start with basepath

  // 1. Apply rate limit first; reject immediately on exceed
  const limited = rateLimitPerPath(pathname);
  if (limited) return limited;

  // console.log("Middleware processing for path:", pathname);

  // 2. for "common" home page like '/' or '/home' , redirect to valid home page /home/1.
  if (pathname === "/" || pathname === "/home") {
    return NextResponse.redirect(
      createUrl(ALL_NAVPATH.home.href(), baseUrlWithPath)
    );
  }

  const isUserProtected = userProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminProtected = adminProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  // 3. If the route is protected, check authentication
  if (isUserProtected || isAdminProtected) {
    try {
      const token = await middlewareAuth(request);
      if (isAdminProtected && !token.isAdmin) {
        return NextResponse.redirect(
          createUrl(ALL_NAVPATH.not_found.href, baseUrlWithPath)
        );
      }
      return NextResponse.next();
    } catch {
      // Auth check failed, redirect to login
      const loginUrl = createUrl(
        ALL_NAVPATH.login.href(pathname),
        baseUrlWithPath
      );
      // console.error("Error fetching auth session:", error);
      return NextResponse.redirect(loginUrl);
    }
  } else if (pathname.startsWith("/login")) {
    try {
      const token = await middlewareAuth(request);
      if (token) {
        const callback = request.nextUrl.searchParams.get("callback");
        return NextResponse.redirect(
          callback
            ? createUrl(callback, baseUrlWithPath)
            : createUrl("/", baseUrlWithPath)
        );
      }
    } catch {
      // console.error("Error fetching auth session:", error);
      return NextResponse.next();
    }
  } else {
    return NextResponse.next();
  }
}
