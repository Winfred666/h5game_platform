import { NextRequest, NextResponse } from "next/server";
import { ALL_NAVPATH } from "./lib/clientConfig";

const createUrl = (path: string, baseUrlWithPath: string) => {
  // remove the '/' at the beginning of path if it exists
  if (path.startsWith("/")) {
    path = path.slice(1);
  }
  return new URL(path, baseUrlWithPath);
};

// WARNING: becaseu Edge env cannot use Node.js modules like bcrypt, only use fetch API to call auth services.
const middlewareAuth = async (
  request: NextRequest,
  baseUrlWithPath: string
) => {
  const authResponse = await fetch(
    createUrl("/api/auth/session", baseUrlWithPath),
    {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    }
  );
  if (!authResponse.ok) {
    throw new Error("Failed to fetch auth session");
  }
  const session = await authResponse.json();
  if (!session || !session.user) {
    throw new Error("No session or user found");
  }
  return session;
};

// ---- Simple per-path fixed-window limiter (per instance) ----
type Rule = { test: (p: string) => boolean; limit: number; windowMs: number };

// Order matters; first match wins
const RATE_RULES: Rule[] = [
  { test: (p) => p.startsWith("/api/auth/"), limit: 30, windowMs: 60_000 }, // strict
  { test: (p) => p.startsWith("/login"), limit: 100, windowMs: 60_000 },     // login UX
  { test: (p) => p.startsWith("/api/"), limit: 500, windowMs: 60_000 },     // other API
  { test: () => true, limit: 5_000, windowMs: 60_000 },                      // public pages (looser)
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
    return new NextResponse("Too Many Requests", { status: 429 });
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
      const session = await middlewareAuth(request, baseUrlWithPath);
      if (isAdminProtected && !session.user?.isAdmin) {
        // 4. If the route is admin protected, check if the user is an admin
        return NextResponse.redirect(
          createUrl(ALL_NAVPATH.not_found.href, baseUrlWithPath)
        );
      } else return NextResponse.next();
    } catch {
      // Auth check failed, redirect to login
      // redirect to login page
      const loginUrl = createUrl(
        ALL_NAVPATH.login.href(pathname),
        baseUrlWithPath
      );
      // console.error("Error fetching auth session:", error);
      return NextResponse.redirect(loginUrl);
    }
  } else if (pathname.startsWith("/login")) {
    try {
      // already login, do not enter login page
      const session = await middlewareAuth(request, baseUrlWithPath);
      if (session && session.user) {
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
