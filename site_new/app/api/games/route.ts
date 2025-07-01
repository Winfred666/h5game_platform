import { getGamesByTitle_thumbnail } from "@/lib/actions/getGame";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const _query:unknown = searchParams.get("name");
  return new Response(
    JSON.stringify(await getGamesByTitle_thumbnail(_query)),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
