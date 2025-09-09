import { getGamesByTitle_thumbnail, getGamesByTitle } from "@/lib/querys&actions/getGame";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const query = sp.get("name") || "";
  const wantAdmin = sp.get("include") === "admin"; // ?include=admin for richer data

  if (!wantAdmin) {
    const data = await getGamesByTitle_thumbnail(query);
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // getGamesByTitle includes developers & tags
    const data = await getGamesByTitle(query);
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
}
