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

export const config = {
  matcher: [
    // only check the protected route
    "/user/me:path*",
    "/upload/:path*",
    "/admin_dashboard/:path*",
    "/login/:path*",
  ],
};

const userProtectedRoutes = ["/upload", "/user/me"];
const adminProtectedRoutes = ["/admin"];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const baseUrlWithPath =
    request.nextUrl.origin + request.nextUrl.basePath + "/"; // start with basepath

  const isUserProtected = userProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminProtected = adminProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  // If the route is protected, check authentication
  if (isUserProtected || isAdminProtected) {
    try {
      const session = await middlewareAuth(request, baseUrlWithPath);
      if (isAdminProtected && !session.user?.isAdmin) {
        // If the route is admin protected, check if the user is an admin
        return NextResponse.redirect(
          createUrl(ALL_NAVPATH.not_found.href, baseUrlWithPath)
        );
      } else return NextResponse.next();
    } catch (error) {
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
    } catch (error) {
      // console.error("Error fetching auth session:", error);
      return NextResponse.next();
    }
  } else {
    return NextResponse.next();
  }
}
