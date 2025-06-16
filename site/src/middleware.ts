import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ALL_NAVPATH } from "@/services/router_info";

const createUrl = (path: string, baseUrlWithPath: string) => {
  // remove the '/' at the beginning of path if it exists
  if (path.startsWith("/")) {
    path = path.slice(1);
  }
  return new URL(path, baseUrlWithPath);
}


export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const baseUrlWithPath = request.nextUrl.origin + request.nextUrl.basePath + "/"; // start with basepath
  
  // first check if the user is logged in when matcher meet.
  const access_token = request.cookies.get("access_token")?.value;
  const my_id = request.cookies.get("userid")?.value;

  if (pathname.startsWith(ALL_NAVPATH.admin.href)) { // for admin route.
    // need figure out the privilege of the user
    if (access_token && my_id) {
      try { // get user info from backend, check if the user is admin
        let my_info: any = await fetch(
          process.env.NEXT_PUBLIC_SERVER_URL + `/user?id=${my_id}`
        );
        my_info = await my_info.json();
        if (my_info[0] && my_info[0].is_admin) {
          return NextResponse.next();
        }
      } catch (error) {
        return NextResponse.redirect(
          createUrl(ALL_NAVPATH.not_found.href, baseUrlWithPath)
        );
      }
    }
    // if is not admin, redirect to not found page
    return NextResponse.redirect(
      createUrl(ALL_NAVPATH.not_found.href, baseUrlWithPath)
    );
    
  } else if (pathname.startsWith(ALL_NAVPATH.login.name)) { // already login, do not enter login page
    if (access_token && my_id) {
      const callback = request.nextUrl.searchParams.get("callback");
      return NextResponse.redirect(
        callback
          ? createUrl(callback, baseUrlWithPath)
          : createUrl(ALL_NAVPATH.home.href, baseUrlWithPath)
      );
    }
  } else { // for other user route.
    // need to check if the user is logged in (just cookie of access_token)
    if (access_token && my_id) {
      // no problem, move on, if begin with /me, replace with /user/id
      if (pathname.startsWith(ALL_NAVPATH.user_id.href("me"))) {
        const newUrl = request.nextUrl.clone();
        newUrl.pathname = ALL_NAVPATH.user_id.href(my_id);
        newUrl.searchParams.set("me", "true");
        return NextResponse.redirect(newUrl);
      }
      return NextResponse.next();
    }
    // if is not logged in, redirect to login page
    const loginUrl = createUrl(ALL_NAVPATH.login.href(pathname), baseUrlWithPath);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    // only check the protected route
    "/user/me:path*",
    "/upload/:path*",
    "/admin_dashboard/:path*",
    "/login/:path*",
  ],
};
